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

export type TusUploadLockRelease = () => Promise<void>;

@Service()
export class TusUploadLock {
  waitForLock(id: string): Promise<TusUploadLockRelease> {
    return this.request(id, false);
  }

  takeLockIfFree(id: string): Promise<TusUploadLockRelease | null> {
    return this.request(id, true);
  }

  private request(id: string, ifAvailable: false): Promise<TusUploadLockRelease>;
  private request(id: string, ifAvailable: true): Promise<TusUploadLockRelease | null>;
  private request(id: string, ifAvailable: boolean): Promise<TusUploadLockRelease | null> {
    // granted, held, released is the vocabulary of Web Locks API
    const granted = Promise.withResolvers<TusUploadLockRelease | null>();
    const held = Promise.withResolvers<void>();
    const released = navigator.locks.request(name(id), { mode: "exclusive", ifAvailable }, (lock) => {
      if (!lock) {
        granted.resolve(null);
        return undefined;
      }
      granted.resolve(async () => {
        held.resolve();
        await released;
      });
      return held.promise;
    });
    return granted.promise;
  }
}

function name(id: string): string {
  return `tus-upload:${id}`;
}
