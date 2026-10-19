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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { createEnvironmentInjector, EnvironmentInjector, signal } from "@angular/core";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { mockService } from "@tenzu/utils/testing/mocks";
import { TusClientService, TusClientUpload } from "@tenzu/utils/services/tus-client/tus-client.service";
import { NotificationService } from "@tenzu/utils/services/notification";
import { UserStore } from "@tenzu/repository/user/user.store";
import { makeUser } from "@tenzu/repository/user/user.factories";
import { TusUploadRepositoryService } from "./tus-upload-repository.service";
import { TusUploadStorage } from "./tus-upload-storage.service";
import { TusUploadStore } from "./tus-upload.store";
import { TusUploadChannel } from "./tus-upload-channel.service";
import { TusUploadLock } from "./tus-upload-lock.service";
import { ProjectImportationType } from "./importation.model";

describe("TusUploadRepositoryService lock integration", () => {
  let owner: TusUploadRepositoryService;
  let mirror: TusUploadRepositoryService;
  const tusClientServiceMock = mockService(TusClientService);
  const tusUploadStorageMock = mockService(TusUploadStorage);
  const userStoreMock = { myUser: signal(makeUser({ id: "user-1" })) };
  const file = new File(["{}"], "backup.json", { type: "application/json", lastModified: 1_700_000_000_000 });
  const makeTusClientUpload = (): TusClientUpload => ({
    start: vi.fn(),
    pause: vi.fn(() => Promise.resolve()),
    cancel: vi.fn(() => Promise.resolve()),
  });

  beforeEach(() => {
    vi.resetAllMocks();
    tusClientServiceMock.create.mockImplementation(makeTusClientUpload);
    tusUploadStorageMock.save.mockResolvedValue(undefined);
    tusUploadStorageMock.update.mockResolvedValue(undefined);
    tusUploadStorageMock.delete.mockResolvedValue(undefined);
    tusUploadStorageMock.list.mockResolvedValue([]);
    tusUploadStorageMock.deleteExpired.mockResolvedValue([]);
    TestBed.configureTestingModule({
      providers: [
        testingProviders,
        { provide: TusClientService, useValue: tusClientServiceMock },
        { provide: TusUploadStorage, useValue: tusUploadStorageMock },
        { provide: NotificationService, useValue: mockService(NotificationService) },
        { provide: UserStore, useValue: userStoreMock },
      ],
    });
    owner = TestBed.inject(TusUploadRepositoryService);
    mirror = createEnvironmentInjector(
      [TusUploadRepositoryService, TusUploadStore, TusUploadChannel, TusUploadLock],
      TestBed.inject(EnvironmentInjector),
    ).get(TusUploadRepositoryService);
  });

  const startOn = async (repository: TusUploadRepositoryService, tusUploadId: string): Promise<TusClientUpload> => {
    const started = repository.start({ file, workspaceId: "workspace-1", originType: ProjectImportationType.TAIGA });
    const [, options] = tusClientServiceMock.create.mock.lastCall ?? [];
    options?.onUrl?.(tusUploadId, "2026-10-05T14:30:00.000Z");
    await started;
    return tusClientServiceMock.create.mock.results.at(-1)?.value as TusClientUpload;
  };

  it("onProgress on the owner sets bytesSent in the mirror store", async () => {
    const tusUploadId = "abc";
    await startOn(owner, tusUploadId);
    const [, options] = tusClientServiceMock.create.mock.lastCall ?? [];

    options?.onProgress(42);

    await vi.waitFor(() => expect(mirror.entityMap()[tusUploadId]?.bytesSent).toBe(42));
    owner.close(tusUploadId);
  });

  it("pause on the mirror calls pause on the owner's client upload", async () => {
    const tusUploadId = "def";
    const ownedUpload = await startOn(owner, tusUploadId);
    await vi.waitFor(() => expect(mirror.entityMap()[tusUploadId]).toBeDefined());

    await mirror.pause(tusUploadId);

    await vi.waitFor(() => expect(ownedUpload.pause).toHaveBeenCalledOnce());
    owner.close(tusUploadId);
  });

  it("pause on the mirror sets the status to paused in the mirror store", async () => {
    const tusUploadId = "ghi";
    await startOn(owner, tusUploadId);
    await vi.waitFor(() => expect(mirror.entityMap()[tusUploadId]).toBeDefined());

    await mirror.pause(tusUploadId);

    await vi.waitFor(() => expect(mirror.entityMap()[tusUploadId]?.status).toBe("paused"));
    owner.close(tusUploadId);
  });
});
