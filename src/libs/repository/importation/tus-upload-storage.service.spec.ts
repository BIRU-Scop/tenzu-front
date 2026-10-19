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
import { TusUploadStorage } from "./tus-upload-storage.service";
import { makeTusUploadState } from "./tus-upload.factories";
import { TusUploadState } from "./tus-upload.model";

describe(TusUploadStorage.name, () => {
  let tusUploadStorage: TusUploadStorage;
  const file = new File(["{}"], "backup.json", { type: "application/json" });

  beforeEach(async () => {
    await deleteDB("tenzu");
    tusUploadStorage = new TusUploadStorage();
  });

  it("list returns the uploads of a user", async () => {
    await tusUploadStorage.save(makeTusUploadState({ id: "1", userId: "userA" }), file);
    await tusUploadStorage.save(makeTusUploadState({ id: "2", userId: "userB" }), file);

    const tusUploadStates = await tusUploadStorage.list("userA");

    expect(tusUploadStates).toEqual([makeTusUploadState({ id: "1", userId: "userA" })]);
  });

  it("list throws ZodError when a stored upload does not match the schema", async () => {
    await tusUploadStorage.save(makeTusUploadState({ id: "1", userId: "userA" }), file);
    const database = await openDB("tenzu", 1);
    await database.put("tusUploads", { ...makeTusUploadState({ id: "2" }), userId: undefined });
    database.close();

    await expect(tusUploadStorage.list("userA")).rejects.toThrow(ZodError);
  });

  it("readFile returns the saved file", async () => {
    const tusUploadState = makeTusUploadState();
    await tusUploadStorage.save(tusUploadState, new File(["abc"], "backup.json", { type: "application/json" }));

    const savedFile = await tusUploadStorage.readFile(tusUploadState.id);

    expect(savedFile?.name).toBe("backup.json");
    expect(savedFile?.size).toBe(3);
  });

  it("readFile returns null when the file is missing", async () => {
    const savedFile = await tusUploadStorage.readFile("unknown");

    expect(savedFile).toBeNull();
  });

  it("update persists the metadata", async () => {
    const tusUploadState = makeTusUploadState();
    await tusUploadStorage.save(tusUploadState, file);

    await tusUploadStorage.update({ ...tusUploadState, bytesSent: 42 });

    const tusUploadStates = await tusUploadStorage.list(tusUploadState.userId);
    expect(tusUploadStates).toEqual([{ ...tusUploadState, bytesSent: 42 }]);
  });

  it("delete removes the upload and its file", async () => {
    const tusUploadState = makeTusUploadState();
    await tusUploadStorage.save(tusUploadState, file);

    await tusUploadStorage.delete(tusUploadState.id);

    expect(await tusUploadStorage.list(tusUploadState.userId)).toEqual([]);
    expect(await tusUploadStorage.readFile(tusUploadState.id)).toBeNull();
  });

  it("deleteFile removes the file and keeps the upload", async () => {
    const tusUploadState = makeTusUploadState();
    await tusUploadStorage.save(tusUploadState, file);

    await tusUploadStorage.deleteFile(tusUploadState.id);

    expect(await tusUploadStorage.list(tusUploadState.userId)).toEqual([tusUploadState]);
    expect(await tusUploadStorage.readFile(tusUploadState.id)).toBeNull();
  });

  it("save keeps the upload when the file cannot be stored", async () => {
    const tusUploadState = makeTusUploadState();

    const unstorable = (() => undefined) as unknown as File;

    await expect(tusUploadStorage.save(tusUploadState, unstorable)).rejects.toThrow();

    expect(await tusUploadStorage.list(tusUploadState.userId)).toEqual([tusUploadState]);
    expect(await tusUploadStorage.readFile(tusUploadState.id)).toBeNull();
  });

  it("save throws ZodError when the upload does not match the schema", async () => {
    const rawTusUpload = { ...makeTusUploadState(), userId: undefined } as unknown as TusUploadState;

    await expect(tusUploadStorage.save(rawTusUpload, file)).rejects.toThrow(ZodError);

    expect(await tusUploadStorage.list("user-1")).toEqual([]);
  });

  it("update throws ZodError when the upload does not match the schema", async () => {
    const tusUploadState = makeTusUploadState();
    await tusUploadStorage.save(tusUploadState, file);
    const rawTusUpload = { ...tusUploadState, bytesSent: "42" } as unknown as TusUploadState;

    await expect(tusUploadStorage.update(rawTusUpload)).rejects.toThrow(ZodError);

    expect(await tusUploadStorage.list(tusUploadState.userId)).toEqual([tusUploadState]);
  });

  it("deleteExpired removes the expired uploads of every user", async () => {
    const now = "2026-10-06T00:00:00.000Z";
    const expiredOfUserA = makeTusUploadState({ id: "1", userId: "userA", expiresAt: "2026-10-05T14:30:00.000Z" });
    const expiredOfUserB = makeTusUploadState({ id: "2", userId: "userB", expiresAt: "2026-10-05T14:30:00.000Z" });
    const validOfUserA = makeTusUploadState({ id: "3", userId: "userA", expiresAt: "2026-10-07T14:30:00.000Z" });
    await tusUploadStorage.save(expiredOfUserA, file);
    await tusUploadStorage.save(expiredOfUserB, file);
    await tusUploadStorage.save(validOfUserA, file);

    await tusUploadStorage.deleteExpired(now);

    expect(await tusUploadStorage.list("userA")).toEqual([validOfUserA]);
    expect(await tusUploadStorage.list("userB")).toEqual([]);
    expect(await tusUploadStorage.readFile(expiredOfUserA.id)).toBeNull();
    expect(await tusUploadStorage.readFile(expiredOfUserB.id)).toBeNull();
  });

  it("deleteExpired returns the removed uploads", async () => {
    const now = "2026-10-06T00:00:00.000Z";
    const expiredOfUserA = makeTusUploadState({ id: "1", userId: "userA", expiresAt: "2026-10-05T14:30:00.000Z" });
    const expiredOfUserB = makeTusUploadState({ id: "2", userId: "userB", expiresAt: "2026-10-05T14:30:00.000Z" });
    const validOfUserA = makeTusUploadState({ id: "3", userId: "userA", expiresAt: "2026-10-07T14:30:00.000Z" });
    await tusUploadStorage.save(expiredOfUserA, file);
    await tusUploadStorage.save(expiredOfUserB, file);
    await tusUploadStorage.save(validOfUserA, file);

    const expired = await tusUploadStorage.deleteExpired(now);

    expect(expired).toEqual([expiredOfUserA, expiredOfUserB]);
  });
});
