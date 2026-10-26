/*
 * Copyright (C) 2026 BIRU
 *
 * This file is part of Tenzu.
 *
 * Tenzu is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * You can contact BIRU at ask@biru.sh
 *
 */

import { effect, inject, Service, untracked } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import {
  TusClientCreateOptions,
  TusClientService,
  TusClientUpload,
  tusResponseBody,
  tusResponseStatus,
} from "@tenzu/utils/services/tus-client/tus-client.service";
import { NotificationService } from "@tenzu/utils/services/notification";
import { getLocError } from "@tenzu/utils/functions/errors";
import { debug } from "@tenzu/utils/functions/logging";
import { UserStore } from "../user/user.store";
import { WorkspaceSummary } from "../workspace/workspace.model";
import { ProjectImportationType } from "./importation.model";
import { ProjectImportationApiService } from "./project-importation-api.service";
import { TusUploadState } from "./tus-upload.model";
import { TusUploadStorageService } from "./tus-upload-storage.service";
import { TusUploadStore } from "./tus-upload.store";
import { TusUploadLockService, TusUploadLockRelease } from "./tus-upload-lock.service";
import { TusUploadChannelService } from "./tus-upload-channel.service";
import { CanReset, ResetService } from "../base/reset.service";

const STATUS_KEY = "project.new_project.upload.status";
const NOTIFICATION_KEY = "project.new_project.upload.notifications";

@Service()
export class TusUploadRepositoryService implements CanReset {
  private readonly tusUploadStore = inject(TusUploadStore);
  private readonly tusClientService = inject(TusClientService);
  private readonly projectImportationApiService = inject(ProjectImportationApiService);
  private readonly userStore = inject(UserStore);
  private readonly tusUploadStorageService = inject(TusUploadStorageService);
  private readonly notificationService = inject(NotificationService);
  private readonly tusUploadLockService = inject(TusUploadLockService);
  private readonly tusUploadChannelService = inject(TusUploadChannelService);
  private readonly resetService = inject(ResetService);
  private readonly tusClientUploads = new Map<string, TusClientUpload>();

  private readonly lockReleases = new Map<string, Promise<TusUploadLockRelease>>();

  readonly entities = this.tusUploadStore.entities;
  readonly entityMap = this.tusUploadStore.entityMap;

  constructor() {
    this.resetService.register(this);
    effect(() => {
      if (this.userStore.myUser().id) {
        untracked(async () => this.restore().then()).then();
      }
    });

    this.tusUploadChannelService.state$.pipe(takeUntilDestroyed()).subscribe((tusUploadState) => {
      if (tusUploadState.userId === this.userStore.myUser().id) {
        this.tusUploadStore.setEntity(tusUploadState);
      }
    });

    this.tusUploadChannelService.removed$.pipe(takeUntilDestroyed()).subscribe((id) => {
      if (!this.tusClientUploads.has(id) && this.entityMap()[id]) {
        this.tusUploadStore.deleteEntity(id);
      }
    });

    this.tusUploadChannelService.stop$.pipe(takeUntilDestroyed()).subscribe((userId) => {
      if (userId === this.userStore.myUser().id) {
        this.pauseOwned().then();
      }
    });

    this.tusUploadChannelService.command$.pipe(takeUntilDestroyed()).subscribe(({ type, id }) => {
      if (this.tusClientUploads.has(id) && this.entityMap()[id]?.userId === this.userStore.myUser().id) {
        this[type](id)?.then();
      }
    });
  }

  start(params: {
    file: File;
    workspaceId: WorkspaceSummary["id"];
    originType: ProjectImportationType;
  }): Promise<void> {
    const userId = this.userStore.myUser().id;
    let tusUploadId = "";
    const callbacks = this.callbacks(() => tusUploadId, params.file);
    return new Promise((resolve, reject) => {
      const tusClientUpload = this.tusClientService.create(params.file, {
        userId,
        endpoint: this.projectImportationApiService.createUrl({ workspaceId: params.workspaceId }),
        metadata: {
          filename: params.file.name,
          filetype: params.file.type,
          originType: params.originType,
        },
        onUrl: (id, expiresAt) => {
          tusUploadId = id;
          const tusUploadState: TusUploadState = {
            id,
            userId,
            workspaceId: params.workspaceId,
            fileName: params.file.name,
            fileSize: params.file.size,
            fileType: params.file.type,
            fileLastModified: params.file.lastModified,
            originType: params.originType,
            bytesSent: 0,
            status: "uploading",
            createdAt: new Date().toISOString(),
            expiresAt,
          };
          this.tusClientUploads.set(id, tusClientUpload);
          this.lock(id).then();
          this.tusUploadStore.addEntity(tusUploadState);
          this.tusUploadChannelService.publishState(tusUploadState);
          this.tusUploadStorageService
            .save(tusUploadState, params.file)
            .catch((error) => debug("tus-upload", `save of ${id} failed`, error));
          resolve();
        },
        ...callbacks,

        onError: (error) => (tusUploadId ? callbacks.onError(error) : reject(error)),
      });
      tusClientUpload.start();
    });
  }

  private persist(id: string): void {
    const tusUploadState = this.entityMap()[id];
    this.tusUploadChannelService.publishState(tusUploadState);
    this.tusUploadStorageService
      .update(tusUploadState)
      .catch((error) => debug("tus-upload", `update of ${id} failed`, error));
  }

  private remove(id: string): void {
    this.tusClientUploads.delete(id);
    this.unlock(id);
    this.tusUploadStore.deleteEntity(id);
    this.tusUploadChannelService.publishRemoved(id);
    this.tusUploadStorageService.delete(id).then();
  }
  private lock(id: string): Promise<TusUploadLockRelease> {
    let lockRelease = this.lockReleases.get(id);
    if (!lockRelease) {
      lockRelease = this.tusUploadLockService.waitForLock(id);
      this.lockReleases.set(id, lockRelease);
    }
    return lockRelease;
  }

  private unlock(id: string): void {
    const lockRelease = this.lockReleases.get(id);
    this.lockReleases.delete(id);
    lockRelease?.then((release) => release()).then();
  }

  async pause(id: string): Promise<void> {
    const tusClientUpload = this.tusClientUploads.get(id);
    if (!tusClientUpload) {
      this.tusUploadChannelService.sendCommand("pause", id);
      return;
    }
    await tusClientUpload.pause();
    this.tusUploadStore.updateEntity(id, { status: "paused" });
    this.persist(id);
  }

  resume(id: string): void {
    const tusClientUpload = this.tusClientUploads.get(id);
    if (!tusClientUpload) {
      this.tusUploadChannelService.sendCommand("resume", id);
      return;
    }
    this.tusUploadStore.updateEntity(id, { status: "resuming" });
    tusClientUpload.start();
  }

  async cancel(id: string): Promise<void> {
    const tusClientUpload = this.tusClientUploads.get(id);
    if (!tusClientUpload) {
      if (this.entityMap()[id]?.status === "interrupted") {
        this.remove(id);
        return;
      }
      this.tusUploadChannelService.sendCommand("cancel", id);
      return;
    }
    this.tusUploadStore.updateEntity(id, { status: "canceling" });
    try {
      await tusClientUpload.cancel();
    } catch (error) {
      debug("tus-upload", `client cancel of ${id} failed`, error);
    }
    this.remove(id);
  }

  retry(id: string): void {
    const tusClientUpload = this.tusClientUploads.get(id);
    if (!tusClientUpload) {
      this.tusUploadChannelService.sendCommand("retry", id);
      return;
    }
    this.tusUploadStore.updateEntity(id, { status: "resuming", errorKey: undefined, errorMessage: undefined });
    tusClientUpload.start();
  }

  close(id: string): void {
    this.remove(id);
  }

  async resumeWith(id: string, file: File): Promise<void> {
    const tusUploadState = this.entityMap()[id];
    if (!matches(tusUploadState, file)) {
      this.notificationService.error({
        title: `${NOTIFICATION_KEY}.file_mismatch`,
        translocoTitle: true,
        translocoTitleParams: { fileName: tusUploadState.fileName },
      });
      return;
    }

    const lockRelease = await this.tusUploadLockService.takeLockIfFree(id);
    if (!lockRelease) {
      return;
    }
    this.lockReleases.set(id, Promise.resolve(lockRelease));
    this.tusUploadStore.updateEntity(id, { status: "resuming" });
    await this.tusUploadStorageService
      .save(this.entityMap()[id], file)
      .catch((error) => debug("tus-upload", `save of ${id} failed`, error));
    this.createClientUpload(tusUploadState, file).start();
  }

  async restore(): Promise<void> {
    const userId = this.userStore.myUser().id;
    const expired = await this.tusUploadStorageService.deleteExpired(new Date().toISOString());
    for (const tusUploadState of expired.filter((tusUploadState) => tusUploadState.userId === userId)) {
      this.notificationService.error({
        title: `${NOTIFICATION_KEY}.expired`,
        translocoTitle: true,
        translocoTitleParams: { fileName: tusUploadState.fileName },
      });
    }
    const tusUploadStates = await this.tusUploadStorageService.list(userId);

    this.tusUploadStore.setEntities(tusUploadStates);

    await Promise.all(
      tusUploadStates
        .filter(({ id }) => !this.lockReleases.has(id))
        .map(async ({ id }) => {
          await this.lock(id);
          await this.restoreUpload(this.entityMap()[id]);
        }),
    );
  }

  private async restoreUpload(tusUploadState: TusUploadState): Promise<void> {
    const file = await this.tusUploadStorageService.readFile(tusUploadState.id);
    if (!file) {
      this.interrupt(tusUploadState);
      return;
    }
    const tusClientUpload = this.createClientUpload(tusUploadState, file);
    if (tusUploadState.status === "uploading" || tusUploadState.status === "retrying") {
      this.tusUploadStore.updateEntity(tusUploadState.id, { status: "resuming" });
      tusClientUpload.start();
      this.notificationService.info({
        title: `${NOTIFICATION_KEY}.resumed`,
        translocoTitle: true,
        translocoTitleParams: { fileName: tusUploadState.fileName },
      });
    }
  }

  private interrupt(tusUploadState: TusUploadState): void {
    this.unlock(tusUploadState.id);
    this.tusUploadStore.updateEntity(tusUploadState.id, { status: "interrupted" });
    this.persist(tusUploadState.id);
    this.notificationService.error({
      title: `${NOTIFICATION_KEY}.interrupted`,
      translocoTitle: true,
      translocoTitleParams: { fileName: tusUploadState.fileName },
    });
  }

  private createClientUpload(tusUploadState: TusUploadState, file: File): TusClientUpload {
    const tusClientUpload = this.tusClientService.create(file, {
      userId: tusUploadState.userId,
      tusUploadId: tusUploadState.id,
      ...this.callbacks(() => tusUploadState.id, file),
    });
    this.tusClientUploads.set(tusUploadState.id, tusClientUpload);
    return tusClientUpload;
  }

  private callbacks(tusUploadId: () => string, file: File): Omit<TusClientCreateOptions, "userId" | "onUrl"> {
    return {
      onProgress: (bytesSent: number) => {
        this.tusUploadStore.updateEntity(tusUploadId(), { bytesSent, status: "uploading" });
        this.persist(tusUploadId());
      },
      onRetry: () => {
        this.tusUploadStore.updateEntity(tusUploadId(), { status: "retrying" });
      },
      onSuccess: () => {
        this.remove(tusUploadId());
      },
      onError: (error: Error) => {
        const id = tusUploadId();
        const status = tusResponseStatus(error);
        if (status === HttpStatusCode.NotFound) {
          const isFullySent = this.entityMap()[id].bytesSent === file.size;
          this.remove(id);
          if (!isFullySent) {
            this.notificationService.error({
              title: `${NOTIFICATION_KEY}.expired`,
              translocoTitle: true,
              translocoTitleParams: { fileName: file.name },
            });
          }
          return;
        }
        const failureState = toFailureState(error);
        this.tusUploadStore.updateEntity(id, failureState);
        this.persist(id);
        if (failureState.status === "rejected") {
          this.tusUploadStorageService
            .deleteFile(id)
            .catch((deleteError) => debug("tus-upload", `deleteFile of ${id} failed`, deleteError));
        }
      },
      onForbidden: () => this.pause(tusUploadId()),
    };
  }

  beforeReset(): void {
    const userId = this.userStore.myUser().id;
    for (const [id, tusClientUpload] of this.tusClientUploads) {
      tusClientUpload.pause().then();
      this.tusUploadStorageService
        .update({ ...this.entityMap()[id], status: "paused" })
        .catch((error) => debug("tus-upload", `update of ${id} failed`, error));
      this.unlock(id);
    }
    this.tusClientUploads.clear();
    if (userId) {
      this.tusUploadChannelService.publishStop(userId);
    }
  }

  resetAll(): void {
    this.tusUploadStore.setAllEntities([]);
  }

  private async pauseOwned(): Promise<void> {
    await Promise.all([...this.tusClientUploads.keys()].map((id) => this.pause(id)));
  }
}

function matches(tusUploadState: TusUploadState, file: File): boolean {
  return (
    file.name === tusUploadState.fileName &&
    file.size === tusUploadState.fileSize &&
    file.lastModified === tusUploadState.fileLastModified &&
    file.type === tusUploadState.fileType
  );
}

type TusUploadFailureState = Pick<TusUploadState, "status" | "errorKey" | "errorMessage">;

function toFailureState(error: Error): TusUploadFailureState {
  const status = tusResponseStatus(error);
  if (status === HttpStatusCode.Unauthorized) {
    return { status: "failed", errorKey: `${STATUS_KEY}.session_expired`, errorMessage: undefined };
  }
  if (status === HttpStatusCode.Forbidden) {
    return { status: "rejected", errorKey: `${STATUS_KEY}.forbidden`, errorMessage: undefined };
  }
  if (status === HttpStatusCode.UnprocessableEntity) {
    const errorResponse = new HttpErrorResponse({ status, error: JSON.parse(tusResponseBody(error) ?? "null") });
    return {
      status: "rejected",
      errorKey: `${STATUS_KEY}.file_refused`,
      errorMessage: getLocError(errorResponse, "file"),
    };
  }
  return { status: "failed", errorKey: `${STATUS_KEY}.server_not_responding`, errorMessage: undefined };
}
