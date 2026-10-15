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

import { defer, map, Observable, switchMap, timer } from "rxjs";

export const MAX_TIMER_DELAY_MS = 2 ** 31 - 1;

export function timerAt(date: Date): Observable<void> {
  return defer(() => {
    if (date.getTime() - Date.now() > MAX_TIMER_DELAY_MS) {
      return timer(MAX_TIMER_DELAY_MS).pipe(switchMap(() => timerAt(date)));
    }
    return timer(date).pipe(map(() => undefined));
  });
}
