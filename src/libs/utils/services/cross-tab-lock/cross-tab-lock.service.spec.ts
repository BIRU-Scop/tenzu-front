/*
 * Copyright (C) 2024-2026 BIRU
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

import { describe, expect, it } from "vitest";
import { CrossTabLockService } from "./cross-tab-lock.service";

describe("CrossTabLockService", () => {
  it("run starts the second work only after the first work returned", async () => {
    const service = new CrossTabLockService();
    const order: string[] = [];

    const first = service.run("tenzu-test-lock", async () => {
      order.push("first in");
      await new Promise((resolve) => setTimeout(resolve, 10));
      order.push("first out");
    });
    const second = service.run("tenzu-test-lock", async () => {
      order.push("second in");
    });
    await Promise.all([first, second]);

    expect(order).toEqual(["first in", "first out", "second in"]);
  });

  it("run resolves with what the work returned", async () => {
    const service = new CrossTabLockService();

    expect(await service.run("tenzu-test-lock", async () => "rotated")).toBe("rotated");
  });
});
