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

import { describe, expect, it, vi } from "vitest";
import { ResetService } from "./reset.service";

describe(ResetService.name, () => {
  it("reset calls every beforeReset before any resetAll", () => {
    const resetService = new ResetService();
    const first = { beforeReset: vi.fn(), resetAll: vi.fn() };
    const second = { resetAll: vi.fn() };
    resetService.register(first);
    resetService.register(second);

    resetService.reset();

    expect(first.beforeReset.mock.invocationCallOrder[0]).toBeLessThan(first.resetAll.mock.invocationCallOrder[0]);
    expect(first.beforeReset.mock.invocationCallOrder[0]).toBeLessThan(second.resetAll.mock.invocationCallOrder[0]);
    expect(second.resetAll).toHaveBeenCalledOnce();
  });
});
