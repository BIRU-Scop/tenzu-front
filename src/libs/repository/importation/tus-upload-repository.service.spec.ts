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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signal } from "@angular/core";
import { HttpStatusCode } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { mockService } from "@tenzu/utils/testing/mocks";
import {
  TusClientService,
  TusClientUpload,
  TusClientCreateOptions,
} from "@tenzu/utils/services/tus-client/tus-client.service";
import { makeTusError } from "@tenzu/utils/services/tus-client/tus-client.factories";
import { UserStore } from "@tenzu/repository/user/user.store";
import { makeUser } from "@tenzu/repository/user/user.factories";
import { User } from "@tenzu/repository/user/user.model";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ProjectImportationType } from "./importation.model";
import { TusUploadStorageService } from "./tus-upload-storage.service";
import { TusUploadState } from "./tus-upload.model";
import { TusUploadLockService, TusUploadLockRelease } from "./tus-upload-lock.service";
import { TusChannelCommandMessage, TusUploadChannelService } from "./tus-upload-channel.service";
import { makeTusUploadState } from "./tus-upload.factories";
import { TusUploadRepositoryService } from "./tus-upload-repository.service";
import { ResetService } from "../base/reset.service";

describe(TusUploadRepositoryService.name, () => {
  let tusUploadRepositoryService: TusUploadRepositoryService;
  const tusClientServiceMock = mockService(TusClientService);
  const tusUploadStorageServiceMock = mockService(TusUploadStorageService);
  const notificationServiceMock = mockService(NotificationService);
  const tusUploadLockServiceMock = mockService(TusUploadLockService);
  const tusUploadChannelServiceMock = {
    state$: new Subject<TusUploadState>(),
    command$: new Subject<TusChannelCommandMessage>(),
    stop$: new Subject<string>(),
    removed$: new Subject<string>(),
    publishState: vi.fn(),
    publishRemoved: vi.fn(),
    sendCommand: vi.fn(),
    publishStop: vi.fn(),
  };
  const userStoreMock = { myUser: signal(makeUser({ id: "user-1" })) };
  const file = new File(["{}"], "backup.json", { type: "application/json", lastModified: 1_700_000_000_000 });
  const expiresAt = "2026-10-05T14:30:00.000Z";

  const makeTusClientUpload = (): TusClientUpload => ({
    start: vi.fn(),
    pause: vi.fn(() => Promise.resolve()),
    cancel: vi.fn(() => Promise.resolve()),
  });

  const tusClientCreateOptions = (): TusClientCreateOptions => {
    const [, options] = tusClientServiceMock.create.mock.lastCall ?? [];
    if (!options) {
      throw new Error("start() was not called");
    }
    return options;
  };

  // A client call that never settles, to observe the repository while it waits on it.
  const neverSettles = () => new Promise<never>(() => undefined);

  const afterChannelHandlers = () => new Promise((resolve) => setTimeout(resolve, 20));
  const tusClientUpload = (): TusClientUpload => {
    // results.at(-1) => retrieve last result (no such function exists in vitest)
    const created = tusClientServiceMock.create.mock.results.at(-1)?.value;
    if (!created) {
      throw new Error("start() was not called");
    }
    return created;
  };
  const trigger = {
    onUrl: (tusUploadId: string) => tusClientCreateOptions().onUrl?.(tusUploadId, expiresAt),
    onProgress: (bytesSent: number) => tusClientCreateOptions().onProgress(bytesSent),
    onRetry: () => tusClientCreateOptions().onRetry(),
    onSuccess: () => tusClientCreateOptions().onSuccess(),
    onError: (error: Error) => tusClientCreateOptions().onError(error),
    onForbidden: () => tusClientCreateOptions().onForbidden(),
  };
  const startUpload = async (tusUploadId = "abc"): Promise<TusUploadState> => {
    const started = tusUploadRepositoryService.start({
      file,
      workspaceId: "workspace-1",
      originType: ProjectImportationType.TAIGA,
    });
    trigger.onUrl(tusUploadId);
    await started;
    const tusUploadState = tusUploadRepositoryService.entityMap()[tusUploadId];
    if (!tusUploadState) {
      throw new Error(`upload ${tusUploadId} was not stored`);
    }
    return tusUploadState;
  };

  const restoreInterrupted = async (): Promise<TusUploadState> => {
    const tusUploadState = makeTusUploadState({
      id: "abc",
      userId: "user-1",
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileLastModified: file.lastModified,
    });
    tusUploadStorageServiceMock.list.mockResolvedValue([tusUploadState]);
    tusUploadStorageServiceMock.readFile.mockResolvedValue(null);
    await tusUploadRepositoryService.restore();
    return tusUploadRepositoryService.entityMap()[tusUploadState.id];
  };

  const receiveStateFromOwner = async (): Promise<TusUploadState> => {
    const tusUploadState = makeTusUploadState({ id: "mirror", userId: "user-1" });
    tusUploadChannelServiceMock.state$.next(tusUploadState);
    await vi.waitFor(() => expect(tusUploadRepositoryService.entityMap()["mirror"]).toEqual(tusUploadState));
    return tusUploadState;
  };

  const expectRemoved = (tusUploadState: TusUploadState) => {
    expect(tusUploadRepositoryService.entityMap()[tusUploadState.id]).toBeUndefined();
    expect(tusUploadStorageServiceMock.delete).toHaveBeenCalledExactlyOnceWith(tusUploadState.id);
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.resetAllMocks();
    tusClientServiceMock.create.mockImplementation(makeTusClientUpload);
    tusUploadStorageServiceMock.delete.mockResolvedValue(undefined);
    tusUploadStorageServiceMock.save.mockResolvedValue(undefined);
    tusUploadStorageServiceMock.update.mockResolvedValue(undefined);
    tusUploadStorageServiceMock.deleteFile.mockResolvedValue(undefined);
    tusUploadStorageServiceMock.list.mockResolvedValue([]);
    tusUploadStorageServiceMock.readFile.mockResolvedValue(null);
    tusUploadStorageServiceMock.deleteExpired.mockResolvedValue([]);
    tusUploadLockServiceMock.waitForLock.mockResolvedValue(vi.fn(() => Promise.resolve()));
    tusUploadLockServiceMock.takeLockIfFree.mockResolvedValue(vi.fn(() => Promise.resolve()));
    userStoreMock.myUser.set(makeUser({ id: "user-1" }));
    TestBed.configureTestingModule({
      providers: [
        ...testingProviders,
        { provide: TusClientService, useValue: tusClientServiceMock },
        { provide: TusUploadStorageService, useValue: tusUploadStorageServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: TusUploadLockService, useValue: tusUploadLockServiceMock },
        { provide: TusUploadChannelService, useValue: tusUploadChannelServiceMock },
        { provide: UserStore, useValue: userStoreMock },
      ],
    });
    tusUploadRepositoryService = TestBed.inject(TusUploadRepositoryService);
  });

  it("start resolves on onUrl", async () => {
    let isStarted = false;
    const started = tusUploadRepositoryService
      .start({ file, workspaceId: "workspace-1", originType: ProjectImportationType.TAIGA })
      .then(() => (isStarted = true));
    await Promise.resolve();
    expect(isStarted).toBe(false);

    trigger.onUrl("abc");
    await started;

    expect(isStarted).toBe(true);
  });

  it("start stores the upload of the current user", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-03T14:30:00.000Z") });
    userStoreMock.myUser.set(makeUser({ id: "user-1" }));

    await startUpload();

    expect(tusUploadRepositoryService.entities()).toEqual([
      {
        id: "abc",
        userId: "user-1",
        workspaceId: "workspace-1",
        fileName: "backup.json",
        fileSize: 2,
        fileType: "application/json",
        fileLastModified: 1_700_000_000_000,
        originType: ProjectImportationType.TAIGA,
        bytesSent: 0,
        status: "uploading",
        createdAt: "2026-10-03T14:30:00.000Z",
        expiresAt,
      },
    ]);
  });

  it("start saves the upload state and the file to the storage", async () => {
    const tusUploadState = await startUpload();

    expect(tusUploadStorageServiceMock.save).toHaveBeenCalledExactlyOnceWith(tusUploadState, file);
  });

  it("start calls waitForLock with the upload id", async () => {
    const tusUploadState = await startUpload();
    expect(tusUploadLockServiceMock.waitForLock).toHaveBeenCalledExactlyOnceWith(tusUploadState.id);
  });

  it("start call publishState with the tusUploadState", async () => {
    const tusUploadState = await startUpload();

    expect(tusUploadChannelServiceMock.publishState).toHaveBeenCalledExactlyOnceWith(tusUploadState);
  });

  it("start throws the error reported by onError", async () => {
    const started = tusUploadRepositoryService.start({
      file,
      workspaceId: "workspace-1",
      originType: ProjectImportationType.TAIGA,
    });
    const error = new Error("tus: unexpected response while creating upload");

    trigger.onError(error);

    await expect(started).rejects.toBe(error);
  });

  it("start stores nothing when onError reports an error", async () => {
    const started = tusUploadRepositoryService.start({
      file,
      workspaceId: "workspace-1",
      originType: ProjectImportationType.TAIGA,
    });

    trigger.onError(new Error("tus: unexpected response while creating upload"));

    await started.catch(() => undefined);
    expect(tusUploadRepositoryService.entities()).toEqual([]);
  });

  it("onProgress updates bytesSent", async () => {
    await startUpload();
    expect(tusUploadRepositoryService.entities()[0].bytesSent).toBe(0);
    trigger.onProgress(42);

    expect(tusUploadRepositoryService.entities()[0].bytesSent).toBe(42);
  });

  it("onProgress persists bytesSent", async () => {
    const tusUploadState = await startUpload();

    trigger.onProgress(42);

    expect(tusUploadStorageServiceMock.update).toHaveBeenCalledExactlyOnceWith({ ...tusUploadState, bytesSent: 42 });
  });

  it("onProgress call publishState with the updated tusUploadState", async () => {
    const tusUploadState = await startUpload();

    trigger.onProgress(42);

    expect(tusUploadChannelServiceMock.publishState).toHaveBeenLastCalledWith({ ...tusUploadState, bytesSent: 42 });
  });

  it("pause calls pause on the client upload", async () => {
    const tusUploadState = await startUpload();

    await tusUploadRepositoryService.pause(tusUploadState.id);

    expect(tusClientUpload().pause).toHaveBeenCalledOnce();
  });

  it("pause sets the status to paused in the store", async () => {
    const tusUploadState = await startUpload();

    await tusUploadRepositoryService.pause(tusUploadState.id);

    expect(tusUploadRepositoryService.entityMap()[tusUploadState.id].status).toBe("paused");
  });

  it("pause persists the status", async () => {
    const tusUploadState = await startUpload();

    await tusUploadRepositoryService.pause(tusUploadState.id);

    expect(tusUploadStorageServiceMock.update).toHaveBeenCalledExactlyOnceWith({ ...tusUploadState, status: "paused" });
  });

  it("pause calls pause on the client upload while retrying", async () => {
    const tusUploadState = await startUpload();
    trigger.onRetry();

    await tusUploadRepositoryService.pause(tusUploadState.id);

    expect(tusClientUpload().pause).toHaveBeenCalledOnce();
  });

  it("resume calls start on the client upload", async () => {
    const tusUploadState = await startUpload();
    expect(tusClientUpload().start).toHaveBeenCalledTimes(1);
    await tusUploadRepositoryService.pause(tusUploadState.id);

    tusUploadRepositoryService.resume(tusUploadState.id);
    expect(tusClientUpload().start).toHaveBeenCalledTimes(2);
  });

  it("resume sets the status to resuming in the store until the next progress", async () => {
    const tusUploadState = await startUpload();
    await tusUploadRepositoryService.pause(tusUploadState.id);

    tusUploadRepositoryService.resume(tusUploadState.id);
    expect(tusUploadRepositoryService.entityMap()[tusUploadState.id].status).toBe("resuming");

    trigger.onProgress(10);
    expect(tusUploadRepositoryService.entityMap()[tusUploadState.id].status).toBe("uploading");
  });

  it("cancel calls cancel on the client upload", async () => {
    const tusUploadState = await startUpload();

    await tusUploadRepositoryService.cancel(tusUploadState.id);

    expect(tusClientUpload().cancel).toHaveBeenCalledOnce();
  });

  it("cancel sets the status to canceling in the store while the client cancel is pending", async () => {
    const tusUploadState = await startUpload();
    tusClientUpload().cancel = vi.fn(neverSettles);

    void tusUploadRepositoryService.cancel(tusUploadState.id);

    expect(tusUploadRepositoryService.entityMap()[tusUploadState.id].status).toBe("canceling");
  });

  it("cancel removes the upload from the store and the storage", async () => {
    const tusUploadState = await startUpload();

    await tusUploadRepositoryService.cancel(tusUploadState.id);

    expectRemoved(tusUploadState);
  });

  it("cancel removes the upload from the store and the storage even when the client cancel rejects", async () => {
    const tusUploadState = await startUpload();
    tusClientUpload().cancel = vi.fn(() => Promise.reject(makeTusError(HttpStatusCode.ServiceUnavailable)));

    await tusUploadRepositoryService.cancel(tusUploadState.id);

    expectRemoved(tusUploadState);
  });

  it("cancel removes an interrupted upload from the store and the storage", async () => {
    const tusUploadState = await restoreInterrupted();

    await tusUploadRepositoryService.cancel(tusUploadState.id);

    expectRemoved(tusUploadState);
    expect(tusUploadChannelServiceMock.sendCommand).not.toHaveBeenCalled();
  });

  it("close removes the upload from the store and the storage after a 403", async () => {
    const tusUploadState = await startUpload();
    trigger.onError(makeTusError(HttpStatusCode.Forbidden));

    tusUploadRepositoryService.close(tusUploadState.id);

    expectRemoved(tusUploadState);
  });

  it("close does not call cancel on the client upload after a 403", async () => {
    const tusUploadState = await startUpload();
    trigger.onError(makeTusError(HttpStatusCode.Forbidden));

    tusUploadRepositoryService.close(tusUploadState.id);

    expect(tusClientUpload().cancel).not.toHaveBeenCalled();
  });

  it("retry calls start on the client upload", async () => {
    const tusUploadState = await startUpload();
    trigger.onError(makeTusError(HttpStatusCode.ServiceUnavailable));

    tusUploadRepositoryService.retry(tusUploadState.id);
    expect(tusClientUpload().start).toHaveBeenCalledTimes(2);
  });

  it("retry sets the status to resuming in the store after a 503", async () => {
    const tusUploadState = await startUpload();
    trigger.onError(makeTusError(HttpStatusCode.ServiceUnavailable));

    tusUploadRepositoryService.retry(tusUploadState.id);

    expect(tusUploadRepositoryService.entityMap()[tusUploadState.id].status).toBe("resuming");
  });

  it("retry clears the errorKey in the store after a 503", async () => {
    const tusUploadState = await startUpload();
    trigger.onError(makeTusError(HttpStatusCode.ServiceUnavailable));
    expect(tusUploadRepositoryService.entityMap()[tusUploadState.id].errorKey).toBe(
      "project.new_project.upload.status.server_not_responding",
    );

    tusUploadRepositoryService.retry(tusUploadState.id);

    expect(tusUploadRepositoryService.entityMap()[tusUploadState.id].errorKey).toBeUndefined();
  });

  it.each(["pause", "resume", "cancel", "retry"] as const)(
    "%s sends the command on the channel for a mirrored upload",
    async (command) => {
      const tusUploadState = await receiveStateFromOwner();

      await tusUploadRepositoryService[command](tusUploadState.id);

      expect(tusUploadChannelServiceMock.sendCommand).toHaveBeenCalledExactlyOnceWith(command, tusUploadState.id);
    },
  );

  it.each(["pause", "resume", "cancel", "retry"] as const)(
    "%s does not create a client upload for a mirrored upload",
    async (command) => {
      const tusUploadState = await receiveStateFromOwner();

      await tusUploadRepositoryService[command](tusUploadState.id);

      expect(tusClientServiceMock.create).not.toHaveBeenCalled();
    },
  );

  it("a pause command from the channel calls pause on the owned client upload", async () => {
    const tusUploadState = await startUpload();

    tusUploadChannelServiceMock.command$.next({ type: "pause", id: tusUploadState.id });

    await vi.waitFor(() => expect(tusClientUpload().pause).toHaveBeenCalledOnce());
    expect(tusUploadChannelServiceMock.sendCommand).not.toHaveBeenCalled();
  });

  it("a command from the channel is ignored for an upload of another user", async () => {
    const tusUploadState = await startUpload();
    userStoreMock.myUser.set(makeUser({ id: "user-2" }));

    tusUploadChannelServiceMock.command$.next({ type: "cancel", id: tusUploadState.id });
    await afterChannelHandlers();

    expect(tusClientUpload().cancel).not.toHaveBeenCalled();
  });

  it("a state message from the channel updates the mirrored upload without writing storage", async () => {
    const tusUploadState = makeTusUploadState({ id: "mirror", userId: "user-1", bytesSent: 42 });

    tusUploadChannelServiceMock.state$.next(tusUploadState);

    await vi.waitFor(() => expect(tusUploadRepositoryService.entityMap()["mirror"]).toEqual(tusUploadState));
    expect(tusUploadStorageServiceMock.update).not.toHaveBeenCalled();
    expect(tusUploadStorageServiceMock.save).not.toHaveBeenCalled();
  });

  it("a state message of another user is ignored", async () => {
    tusUploadChannelServiceMock.state$.next(makeTusUploadState({ id: "of-other", userId: "user-2" }));
    await afterChannelHandlers();

    expect(tusUploadRepositoryService.entityMap()["of-other"]).toBeUndefined();
  });

  it("close publishes the removal on the channel after a 403", async () => {
    const tusUploadState = await startUpload();
    trigger.onError(makeTusError(HttpStatusCode.Forbidden));

    tusUploadRepositoryService.close(tusUploadState.id);

    expect(tusUploadChannelServiceMock.publishRemoved).toHaveBeenCalledExactlyOnceWith(tusUploadState.id);
  });

  it("a removed message from the channel removes the mirrored upload from the store only", async () => {
    const tusUploadState = await receiveStateFromOwner();

    tusUploadChannelServiceMock.removed$.next(tusUploadState.id);

    await vi.waitFor(() => expect(tusUploadRepositoryService.entityMap()[tusUploadState.id]).toBeUndefined());
    expect(tusUploadStorageServiceMock.delete).not.toHaveBeenCalled();
  });

  it("a stop message from the channel calls pause on the owned client uploads of that user", async () => {
    await startUpload("first");
    await startUpload("second");

    tusUploadChannelServiceMock.stop$.next("user-1");

    const ownedUploads = tusClientServiceMock.create.mock.results.map(({ value }) => value as TusClientUpload);
    for (const ownedUpload of ownedUploads) {
      await vi.waitFor(() => expect(ownedUpload.pause).toHaveBeenCalledOnce());
    }
    expect(tusUploadStorageServiceMock.delete).not.toHaveBeenCalled();
    expect(tusUploadChannelServiceMock.publishStop).not.toHaveBeenCalled();
  });

  it("onRetry sets the status to retrying in the store until the next progress", async () => {
    await startUpload();

    trigger.onRetry();
    expect(tusUploadRepositoryService.entities()[0].status).toBe("retrying");

    trigger.onProgress(10);
    expect(tusUploadRepositoryService.entities()[0].status).toBe("uploading");
  });

  it("onError marks the upload failed on 503", async () => {
    await startUpload();

    trigger.onError(makeTusError(HttpStatusCode.ServiceUnavailable));

    expect(tusUploadRepositoryService.entities()[0]).toMatchObject({
      status: "failed",
      errorKey: "project.new_project.upload.status.server_not_responding",
      errorMessage: undefined,
    });
  });

  it("onError marks the upload failed on 401", async () => {
    await startUpload();

    trigger.onError(makeTusError(HttpStatusCode.Unauthorized));

    expect(tusUploadRepositoryService.entities()[0]).toMatchObject({
      status: "failed",
      errorKey: "project.new_project.upload.status.session_expired",
    });
  });

  it("onError marks the upload rejected on 403", async () => {
    await startUpload();

    trigger.onError(makeTusError(HttpStatusCode.Forbidden));

    expect(tusUploadRepositoryService.entities()[0]).toMatchObject({
      status: "rejected",
      errorKey: "project.new_project.upload.status.forbidden",
    });
  });

  it("onError marks the upload rejected with the backend message on 422", async () => {
    await startUpload();

    trigger.onError(
      makeTusError(
        HttpStatusCode.UnprocessableEntity,
        JSON.stringify({
          error: {
            code: "validation-error",
            detail: [{ loc: ["file"], msg: "Suspicious file, try to shorten the file name" }],
            msg: "Validation error",
          },
        }),
      ),
    );
    expect(tusUploadRepositoryService.entities()[0]).toMatchObject({
      status: "rejected",
      errorKey: "project.new_project.upload.status.file_refused",
      errorMessage: "Suspicious file, try to shorten the file name",
    });
  });

  it("onError deletes the file when the upload is forbidden", async () => {
    const tusUploadState = await startUpload();

    trigger.onError(makeTusError(HttpStatusCode.Forbidden));

    expect(tusUploadStorageServiceMock.deleteFile).toHaveBeenCalledExactlyOnceWith(tusUploadState.id);
    expect(tusUploadStorageServiceMock.delete).not.toHaveBeenCalled();
  });

  it("onError removes the upload from the store and the storage with a notification on 404", async () => {
    const tusUploadState = await startUpload();

    trigger.onError(makeTusError(HttpStatusCode.NotFound));

    expectRemoved(tusUploadState);
    expect(notificationServiceMock.error).toHaveBeenCalledExactlyOnceWith({
      title: "project.new_project.upload.notifications.expired",
      translocoTitle: true,
      translocoTitleParams: { fileName: tusUploadState.fileName },
    });
  });

  it("onError removes the upload from the store and the storage without notification on 404 after the last byte", async () => {
    const tusUploadState = await startUpload();
    trigger.onProgress(tusUploadState.fileSize);

    trigger.onError(makeTusError(HttpStatusCode.NotFound));

    expectRemoved(tusUploadState);
    expect(notificationServiceMock.error).not.toHaveBeenCalled();
  });

  it("onSuccess removes the upload from the store and the storage", async () => {
    const tusUploadState = await startUpload();

    trigger.onSuccess();

    expectRemoved(tusUploadState);
  });

  it("restore runs when the current user becomes known", async () => {
    userStoreMock.myUser.set({} as User);
    TestBed.tick();
    expect(tusUploadStorageServiceMock.list).not.toHaveBeenCalled();

    userStoreMock.myUser.set(makeUser({ id: "u1" }));
    TestBed.tick();
    await vi.waitFor(() => expect(tusUploadStorageServiceMock.list).toHaveBeenCalledExactlyOnceWith("u1"));
  });

  it("restore loads the uploads of the current user", async () => {
    userStoreMock.myUser.set(makeUser({ id: "u1" }));
    tusUploadStorageServiceMock.list.mockResolvedValue([
      makeTusUploadState({ id: "first", userId: "u1" }),
      makeTusUploadState({ id: "second", userId: "u1" }),
    ]);

    await tusUploadRepositoryService.restore();

    expect(tusUploadStorageServiceMock.list).toHaveBeenCalledExactlyOnceWith("u1");
    expect(tusUploadRepositoryService.entities().map(({ id }) => id)).toEqual(["first", "second"]);
  });

  it("restore restores an upload only once its lock is granted", async () => {
    const tusUploadState = makeTusUploadState({ id: "abc", userId: "user-1", status: "uploading" });
    tusUploadStorageServiceMock.list.mockResolvedValue([tusUploadState]);
    tusUploadStorageServiceMock.readFile.mockResolvedValue(file);
    const grant = Promise.withResolvers<TusUploadLockRelease>();
    tusUploadLockServiceMock.waitForLock.mockReturnValue(grant.promise);

    const restored = tusUploadRepositoryService.restore();
    await vi.waitFor(() => expect(tusUploadLockServiceMock.waitForLock).toHaveBeenCalledExactlyOnceWith("abc"));
    expect(tusClientServiceMock.create).not.toHaveBeenCalled();

    grant.resolve(vi.fn(() => Promise.resolve()));
    await restored;

    expect(tusClientServiceMock.create).toHaveBeenCalledOnce();
  });

  it("restore resumes an uploading upload", async () => {
    const tusUploadState = makeTusUploadState({
      id: "abc",
      userId: "user-1",
      fileName: "backup.json",
      status: "uploading",
    });
    tusUploadStorageServiceMock.list.mockResolvedValue([tusUploadState]);
    tusUploadStorageServiceMock.readFile.mockResolvedValue(file);

    await tusUploadRepositoryService.restore();

    expect(tusClientServiceMock.create).toHaveBeenCalledExactlyOnceWith(
      file,
      expect.objectContaining({ userId: "user-1", tusUploadId: "abc" }),
    );
    expect(tusClientUpload().start).toHaveBeenCalledOnce();
  });

  it("restore keeps a paused upload paused", async () => {
    const tusUploadState = makeTusUploadState({ id: "abc", userId: "user-1", status: "paused" });
    tusUploadStorageServiceMock.list.mockResolvedValue([tusUploadState]);
    tusUploadStorageServiceMock.readFile.mockResolvedValue(file);

    await tusUploadRepositoryService.restore();

    expect(tusClientServiceMock.create).toHaveBeenCalledOnce();
    expect(tusClientUpload().start).not.toHaveBeenCalled();
    expect(tusUploadRepositoryService.entityMap()["abc"].status).toBe("paused");
  });

  it("restore marks the upload interrupted when its file is unreadable", async () => {
    const tusUploadState = makeTusUploadState({
      id: "abc",
      userId: "user-1",
      fileName: "backup.json",
      status: "uploading",
    });
    tusUploadStorageServiceMock.list.mockResolvedValue([tusUploadState]);
    tusUploadStorageServiceMock.readFile.mockResolvedValue(null);

    await tusUploadRepositoryService.restore();

    expect(tusUploadRepositoryService.entityMap()["abc"].status).toBe("interrupted");
    expect(tusUploadStorageServiceMock.update).toHaveBeenCalledExactlyOnceWith({
      ...tusUploadState,
      status: "interrupted",
    });
  });

  it("restore deletes the expired uploads", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-06T00:00:00.000Z") });
    tusUploadStorageServiceMock.deleteExpired.mockResolvedValue([
      makeTusUploadState({ id: "expired-of-user", userId: "user-1" }),
      makeTusUploadState({ id: "expired-of-other", userId: "user-2" }),
    ]);

    await tusUploadRepositoryService.restore();

    expect(tusUploadStorageServiceMock.deleteExpired).toHaveBeenCalledExactlyOnceWith("2026-10-06T00:00:00.000Z");

    expect(tusUploadStorageServiceMock.deleteExpired.mock.invocationCallOrder[0]).toBeLessThan(
      tusUploadStorageServiceMock.list.mock.invocationCallOrder[0],
    );
    expect(tusUploadRepositoryService.entities()).toEqual([]);
  });

  it("restore notifies one expiration per expired upload of the current user", async () => {
    userStoreMock.myUser.set(makeUser({ id: "u1" }));
    tusUploadStorageServiceMock.deleteExpired.mockResolvedValue([
      makeTusUploadState({ id: "first-of-u1", userId: "u1", fileName: "first.json" }),
      makeTusUploadState({ id: "second-of-u1", userId: "u1", fileName: "second.json" }),
      makeTusUploadState({ id: "of-u2", userId: "u2", fileName: "other.json" }),
    ]);

    await tusUploadRepositoryService.restore();

    expect(notificationServiceMock.error.mock.calls.map(([message]) => message)).toEqual([
      expect.objectContaining({ translocoTitleParams: { fileName: "first.json" } }),
      expect.objectContaining({ translocoTitleParams: { fileName: "second.json" } }),
    ]);
  });

  it("resumeWith rejects a different file", async () => {
    const tusUploadState = await restoreInterrupted();
    const otherFile = new File(["{}{}"], "backup.json", { type: "application/json", lastModified: file.lastModified });

    await tusUploadRepositoryService.resumeWith(tusUploadState.id, otherFile);

    expect(notificationServiceMock.error).toHaveBeenCalledWith({
      title: "project.new_project.upload.notifications.file_mismatch",
      translocoTitle: true,
      translocoTitleParams: { fileName: "backup.json" },
    });
    expect(tusUploadRepositoryService.entityMap()[tusUploadState.id].status).toBe("interrupted");
    expect(tusClientServiceMock.create).not.toHaveBeenCalled();
  });

  it("resumeWith resumes the upload ", async () => {
    const tusUploadState = await restoreInterrupted();

    await tusUploadRepositoryService.resumeWith(tusUploadState.id, file);

    expect(tusUploadStorageServiceMock.save).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ id: tusUploadState.id, status: "resuming" }),
      file,
    );
    expect(tusClientServiceMock.create).toHaveBeenCalledExactlyOnceWith(
      file,
      expect.objectContaining({ userId: "user-1", tusUploadId: tusUploadState.id }),
    );
    expect(tusClientUpload().start).toHaveBeenCalledOnce();
    expect(tusUploadRepositoryService.entityMap()[tusUploadState.id].status).toBe("resuming");
  });

  it("resumeWith resumes the upload even when the file cannot be stored", async () => {
    const tusUploadState = await restoreInterrupted();
    tusUploadStorageServiceMock.save.mockRejectedValue(new DOMException("quota", "QuotaExceededError"));

    await tusUploadRepositoryService.resumeWith(tusUploadState.id, file);

    expect(tusClientUpload().start).toHaveBeenCalledOnce();
    expect(tusUploadRepositoryService.entityMap()[tusUploadState.id].status).toBe("resuming");
  });

  it("resumeWith does nothing when the lock is held", async () => {
    const tusUploadState = await restoreInterrupted();
    tusUploadLockServiceMock.takeLockIfFree.mockResolvedValue(null);

    await tusUploadRepositoryService.resumeWith(tusUploadState.id, file);

    expect(tusClientServiceMock.create).not.toHaveBeenCalled();
    expect(tusUploadRepositoryService.entityMap()[tusUploadState.id].status).toBe("interrupted");
  });

  it("ResetService.reset calls pause on the owned client uploads", async () => {
    await startUpload();

    TestBed.inject(ResetService).reset();

    expect(tusClientUpload().pause).toHaveBeenCalledOnce();
  });

  it("beforeReset calls pause on the owned client uploads", async () => {
    await startUpload("first");
    await startUpload("second");

    tusUploadRepositoryService.beforeReset();

    const ownedUploads = tusClientServiceMock.create.mock.results.map(({ value }) => value as TusClientUpload);
    expect(ownedUploads).toHaveLength(2);
    for (const ownedUpload of ownedUploads) {
      expect(ownedUpload.pause).toHaveBeenCalledOnce();
    }
  });

  it("beforeReset writes the uploads as paused to the storage", async () => {
    const tusUploadState = await startUpload();

    tusUploadRepositoryService.beforeReset();

    expect(tusUploadStorageServiceMock.update).toHaveBeenCalledExactlyOnceWith({ ...tusUploadState, status: "paused" });
  });

  it("beforeReset releases the locks of the uploads", async () => {
    const lockRelease = vi.fn(() => Promise.resolve());
    tusUploadLockServiceMock.waitForLock.mockResolvedValue(lockRelease);
    await startUpload();

    tusUploadRepositoryService.beforeReset();

    await vi.waitFor(() => expect(lockRelease).toHaveBeenCalledOnce());
  });

  it("beforeReset publishes stop on the channel for the current user", async () => {
    userStoreMock.myUser.set(makeUser({ id: "user-1" }));
    await startUpload();

    tusUploadRepositoryService.beforeReset();

    expect(tusUploadChannelServiceMock.publishStop).toHaveBeenCalledExactlyOnceWith("user-1");
  });

  it("beforeReset publishes nothing on the channel without a current user", () => {
    userStoreMock.myUser.set({} as User);

    tusUploadRepositoryService.beforeReset();

    expect(tusUploadChannelServiceMock.publishStop).not.toHaveBeenCalled();
  });

  it("beforeReset does not call delete on the storage", async () => {
    await startUpload();

    tusUploadRepositoryService.beforeReset();

    expect(tusUploadStorageServiceMock.delete).not.toHaveBeenCalled();
  });

  it("resetAll empties the store", async () => {
    await startUpload();

    tusUploadRepositoryService.resetAll();

    expect(tusUploadRepositoryService.entities()).toEqual([]);
  });
});
