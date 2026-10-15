/*
 * Copyright (C) 2025-2026 BIRU
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

import { afterEach, describe, expect, it, vi } from "vitest";
import { Observable, take } from "rxjs";

import { timerAt } from "./timers";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

describe("timerAt", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // Fake time between the subscription and the first emission, `null` when nothing was emitted within `withinMs`.
  function emissionDelay(source: Observable<unknown>, withinMs: number): number | null {
    const start = Date.now();
    let delay: number | null = null;
    source.pipe(take(1)).subscribe(() => (delay = Date.now() - start));
    vi.advanceTimersByTime(withinMs);
    return delay;
  }

  it("timerAt emits at the date it was given", () => {
    vi.useFakeTimers();

    const delay = emissionDelay(timerAt(new Date(Date.now() + ONE_DAY_MS)), ONE_DAY_MS);

    expect(delay).toBe(ONE_DAY_MS);
  });

  it("timerAt does not emit before the date it was given", () => {
    vi.useFakeTimers();

    const delay = emissionDelay(timerAt(new Date(Date.now() + ONE_DAY_MS)), ONE_DAY_MS - 1);

    expect(delay).toBeNull();
  });

  it("timerAt emits at a date beyond the 32-bit ceiling instead of at once", () => {
    vi.useFakeTimers();
    const beyondCeilingMs = 30 * ONE_DAY_MS;

    const delay = emissionDelay(timerAt(new Date(Date.now() + beyondCeilingMs)), beyondCeilingMs);

    expect(delay).toBe(beyondCeilingMs);
  });
});
