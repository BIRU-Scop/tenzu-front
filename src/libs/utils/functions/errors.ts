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

import { HttpErrorResponse } from "@angular/common/http";

export function getLocError(errorResponse: HttpErrorResponse, location: string): string | undefined {
  // Parse an HttpErrorResponse to the expected format to retrieve
  // the error message on the chosen field location if there is one
  try {
    return errorResponse.error?.detail?.find((detail: { ctx: object; msg: string; type: string; loc: Array<string> }) =>
      detail?.loc?.some((loc) => loc === location),
    )?.msg;
  } catch (e) {
    if (e instanceof TypeError) {
      return undefined;
    }
    throw e;
  }
}
