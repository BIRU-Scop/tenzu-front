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

import { beforeEach, describe, expect, it } from "vitest";
import { deleteDB, openDB } from "idb";
import { ZodError } from "zod/v4";
import { TusUploadStorageService } from "./tus-upload-storage.service";
import { makeTusUploadState } from "./tus-upload.factories";
import { TusUploadState } from "./tus-upload.model";

describe(TusUploadStorageService.name, () => {
  let tusUploadStorageService: TusUploadStorageService;
  const file = new File(["{}"], "backup.json", { type: "application/json" });

  beforeEach(async () => {
    await deleteDB("tenzu");
    tusUploadStorageService = new TusUploadStorageService();
  });

  it("list returns the uploads of a user", async () => {
    await tusUploadStorageService.save(makeTusUploadState({ id: "1", userId: "userA" }), file);
    await tusUploadStorageService.save(makeTusUploadState({ id: "2", userId: "userB" }), file);

    const tusUploadStates = await tusUploadStorageService.list("userA");

    expect(tusUploadStates).toEqual([makeTusUploadState({ id: "1", userId: "userA" })]);
  });

  it("list throws ZodError when a stored upload does not match the schema", async () => {
    await tusUploadStorageService.save(makeTusUploadState({ id: "1", userId: "userA" }), file);
    const database = await openDB("tenzu", 1);
    await database.put("tusUploads", { ...makeTusUploadState({ id: "2" }), userId: undefined });
    database.close();

    await expect(tusUploadStorageService.list("userA")).rejects.toThrow(ZodError);
  });

  it("readFile returns the saved file", async () => {
    const tusUploadState = makeTusUploadState();
    await tusUploadStorageService.save(tusUploadState, new File(["abc"], "backup.json", { type: "application/json" }));

    const savedFile = await tusUploadStorageService.readFile(tusUploadState.id);

    expect(savedFile?.name).toBe("backup.json");
    expect(savedFile?.size).toBe(3);
  });

  it("readFile returns null when the file is missing", async () => {
    const savedFile = await tusUploadStorageService.readFile("unknown");

    expect(savedFile).toBeNull();
  });

  it("update persists the metadata", async () => {
    const tusUploadState = makeTusUploadState();
    await tusUploadStorageService.save(tusUploadState, file);

    await tusUploadStorageService.update({ ...tusUploadState, bytesSent: 42 });

    const tusUploadStates = await tusUploadStorageService.list(tusUploadState.userId);
    expect(tusUploadStates).toEqual([{ ...tusUploadState, bytesSent: 42 }]);
  });

  it("delete removes the upload and its file", async () => {
    const tusUploadState = makeTusUploadState();
    await tusUploadStorageService.save(tusUploadState, file);

    await tusUploadStorageService.delete(tusUploadState.id);

    expect(await tusUploadStorageService.list(tusUploadState.userId)).toEqual([]);
    expect(await tusUploadStorageService.readFile(tusUploadState.id)).toBeNull();
  });

  it("deleteFile removes the file and keeps the upload", async () => {
    const tusUploadState = makeTusUploadState();
    await tusUploadStorageService.save(tusUploadState, file);

    await tusUploadStorageService.deleteFile(tusUploadState.id);

    expect(await tusUploadStorageService.list(tusUploadState.userId)).toEqual([tusUploadState]);
    expect(await tusUploadStorageService.readFile(tusUploadState.id)).toBeNull();
  });

  it("save keeps the upload when the file cannot be stored", async () => {
    const tusUploadState = makeTusUploadState();

    const unstorable = (() => undefined) as unknown as File;

    await expect(tusUploadStorageService.save(tusUploadState, unstorable)).rejects.toThrow();

    expect(await tusUploadStorageService.list(tusUploadState.userId)).toEqual([tusUploadState]);
    expect(await tusUploadStorageService.readFile(tusUploadState.id)).toBeNull();
  });

  it("save throws ZodError when the upload does not match the schema", async () => {
    const rawTusUpload = { ...makeTusUploadState(), userId: undefined } as unknown as TusUploadState;

    await expect(tusUploadStorageService.save(rawTusUpload, file)).rejects.toThrow(ZodError);

    expect(await tusUploadStorageService.list("user-1")).toEqual([]);
  });

  it("update throws ZodError when the upload does not match the schema", async () => {
    const tusUploadState = makeTusUploadState();
    await tusUploadStorageService.save(tusUploadState, file);
    const rawTusUpload = { ...tusUploadState, bytesSent: "42" } as unknown as TusUploadState;

    await expect(tusUploadStorageService.update(rawTusUpload)).rejects.toThrow(ZodError);

    expect(await tusUploadStorageService.list(tusUploadState.userId)).toEqual([tusUploadState]);
  });

  it("deleteExpired removes the expired uploads of every user", async () => {
    const now = "2026-10-06T00:00:00.000Z";
    const expiredOfUserA = makeTusUploadState({ id: "1", userId: "userA", expiresAt: "2026-10-05T14:30:00.000Z" });
    const expiredOfUserB = makeTusUploadState({ id: "2", userId: "userB", expiresAt: "2026-10-05T14:30:00.000Z" });
    const validOfUserA = makeTusUploadState({ id: "3", userId: "userA", expiresAt: "2026-10-07T14:30:00.000Z" });
    await tusUploadStorageService.save(expiredOfUserA, file);
    await tusUploadStorageService.save(expiredOfUserB, file);
    await tusUploadStorageService.save(validOfUserA, file);

    await tusUploadStorageService.deleteExpired(now);

    expect(await tusUploadStorageService.list("userA")).toEqual([validOfUserA]);
    expect(await tusUploadStorageService.list("userB")).toEqual([]);
    expect(await tusUploadStorageService.readFile(expiredOfUserA.id)).toBeNull();
    expect(await tusUploadStorageService.readFile(expiredOfUserB.id)).toBeNull();
  });

  it("deleteExpired returns the removed uploads", async () => {
    const now = "2026-10-06T00:00:00.000Z";
    const expiredOfUserA = makeTusUploadState({ id: "1", userId: "userA", expiresAt: "2026-10-05T14:30:00.000Z" });
    const expiredOfUserB = makeTusUploadState({ id: "2", userId: "userB", expiresAt: "2026-10-05T14:30:00.000Z" });
    const validOfUserA = makeTusUploadState({ id: "3", userId: "userA", expiresAt: "2026-10-07T14:30:00.000Z" });
    await tusUploadStorageService.save(expiredOfUserA, file);
    await tusUploadStorageService.save(expiredOfUserB, file);
    await tusUploadStorageService.save(validOfUserA, file);

    const expired = await tusUploadStorageService.deleteExpired(now);

    expect(expired).toEqual([expiredOfUserA, expiredOfUserB]);
  });
});
