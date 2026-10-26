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
import { TusUploadLockService } from "./tus-upload-lock.service";

describe(TusUploadLockService.name, () => {
  let tusUploadLockService: TusUploadLockService;

  beforeEach(() => {
    tusUploadLockService = new TusUploadLockService();
  });

  const heldNames = async (): Promise<string[]> =>
    ((await navigator.locks.query()).held ?? []).map((lock) => lock.name ?? "");
  const pendingNames = async (): Promise<string[]> =>
    ((await navigator.locks.query()).pending ?? []).map((lock) => lock.name ?? "");

  it("waitForLock holds a free lock", async () => {
    expect(await heldNames()).not.toContain("tus-upload:free");

    await tusUploadLockService.waitForLock("free");

    expect(await heldNames()).toContain("tus-upload:free");
  });

  it("lockRelease releases the lock", async () => {
    const lockRelease = await tusUploadLockService.waitForLock("released");
    await lockRelease();
    expect(await heldNames()).not.toContain("tus-upload:released");
  });

  it("waitForLock waits until the holder releases", async () => {
    // the owner
    const holderLockRelease = await tusUploadLockService.waitForLock("shared");
    let isMirrorGranted = false;
    // waits for the lock; `then` runs once the lock is acquired
    const mirror = tusUploadLockService.waitForLock("shared").then(() => (isMirrorGranted = true));

    expect(await pendingNames()).toContain("tus-upload:shared");
    // the mirror does not have the lock
    expect(isMirrorGranted).toBe(false);
    // we release the lock
    await holderLockRelease();
    // the mirror is granted the lock
    await mirror;
    // the mirror got the lock and could run its `then`
    expect(isMirrorGranted).toBe(true);
  });

  it("takeLockIfFree returns null when the lock is held", async () => {
    await tusUploadLockService.waitForLock("held");

    expect(await tusUploadLockService.takeLockIfFree("held")).toBeNull();
  });

  it("takeLockIfFree holds a free lock", async () => {
    expect(await heldNames()).not.toContain("tus-upload:free-to-try");

    await tusUploadLockService.takeLockIfFree("free-to-try");

    expect(await heldNames()).toContain("tus-upload:free-to-try");
  });
});
