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

import { ExitKey, SchemaResult } from "./types";

export const EXIT_CODE: Record<ExitKey, 0 | 1 | 2> = { ok: 0, drift: 1, error: 2 };

export function toExitCode(results: SchemaResult[]): ExitKey {
  if (results.some((r) => r.kind === "error")) return "error";
  if (results.some((r) => r.kind === "drift")) return "drift";
  return "ok";
}
