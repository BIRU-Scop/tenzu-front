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

import { isDevMode } from "@angular/core";

export function debug(type: string, message: string, data?: unknown): void {
  const runtimeDebug =
    typeof window !== "undefined" &&
    (((window as { __TENZU_DEBUG__?: boolean }).__TENZU_DEBUG__ ?? false) ||
      window.localStorage?.getItem("tenzu.debug") === "1");
  if (isDevMode() || runtimeDebug) {
    const date = new Date();
    console.debug(
      `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()})  [${type}] ${message}`,
      data || "",
    );
  }
}
