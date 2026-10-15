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

import { Service } from "@angular/core";
import { DBSchema, openDB } from "idb";
import { TusUploadState, tusUploadStateSchema } from "./tus-upload.model";

const DATABASE_NAME = "tenzu";

interface TenzuDatabase extends DBSchema {
  tusUploads: { key: string; value: TusUploadState };
  tusUploadFiles: { key: string; value: File };
}

@Service()
export class TusUploadStorageService {
  async save(tusUploadState: TusUploadState, file: File): Promise<void> {
    const parsedTusUploadState = tusUploadStateSchema.parse(tusUploadState);
    const database = await openDatabase();
    try {
      await database.put("tusUploads", parsedTusUploadState);
      await database.put("tusUploadFiles", file, tusUploadState.id);
    } finally {
      database.close();
    }
  }

  async update(tusUploadState: TusUploadState): Promise<void> {
    const parsedTusUploadState = tusUploadStateSchema.parse(tusUploadState);
    const database = await openDatabase();
    try {
      await database.put("tusUploads", parsedTusUploadState);
    } finally {
      database.close();
    }
  }

  async list(userId: string): Promise<TusUploadState[]> {
    const database = await openDatabase();
    try {
      const tusUploadStates = await database.getAll("tusUploads");
      return tusUploadStates
        .map((tusUploadState) => tusUploadStateSchema.parse(tusUploadState))
        .filter((tusUploadState) => tusUploadState.userId === userId);
    } finally {
      database.close();
    }
  }

  async readFile(id: string): Promise<File | null> {
    const database = await openDatabase();
    try {
      const file = await database.get("tusUploadFiles", id);
      return file && (await readable(file)) ? file : null;
    } finally {
      database.close();
    }
  }

  async delete(id: string): Promise<void> {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(["tusUploads", "tusUploadFiles"], "readwrite");
      await Promise.all([
        transaction.objectStore("tusUploads").delete(id),
        transaction.objectStore("tusUploadFiles").delete(id),
        transaction.done,
      ]);
    } finally {
      database.close();
    }
  }

  async deleteFile(id: string): Promise<void> {
    const database = await openDatabase();
    try {
      await database.delete("tusUploadFiles", id);
    } finally {
      database.close();
    }
  }

  async deleteExpired(before: string): Promise<TusUploadState[]> {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(["tusUploads", "tusUploadFiles"], "readwrite");
      const tusUploads = transaction.objectStore("tusUploads");
      const tusUploadFiles = transaction.objectStore("tusUploadFiles");
      const expired = (await tusUploads.getAll())
        .map((tusUploadState) => tusUploadStateSchema.parse(tusUploadState))
        .filter((tusUploadState) => new Date(tusUploadState.expiresAt) < new Date(before));
      await Promise.all([
        ...expired.flatMap((tusUploadState) => [
          tusUploads.delete(tusUploadState.id),
          tusUploadFiles.delete(tusUploadState.id),
        ]),
        transaction.done,
      ]);
      return expired;
    } finally {
      database.close();
    }
  }
}

function openDatabase() {
  return openDB<TenzuDatabase>(DATABASE_NAME, 1, {
    upgrade(database) {
      database.createObjectStore("tusUploads", { keyPath: "id" });
      database.createObjectStore("tusUploadFiles");
    },
  });
}

// Safari stores a reference to the file, not a copy: `get` still returns it after the file was
// moved, and reading it throws NotFoundError. Chromium and Firefox copy, so this always passes there.
async function readable(file: File): Promise<boolean> {
  try {
    await file.slice(0, 1).arrayBuffer();
    return true;
  } catch {
    return false;
  }
}
