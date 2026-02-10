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

import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import * as Sentry from "@sentry/angular";
import { debug as d } from "./logging";

export function handleHttpError(error: unknown, router: Router, debug?: { context: string; message: string }): void {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 404 || error.status === 422) {
      router.navigate(["/404"]).then();
    } else if (error.status === 403) {
      router.navigate(["/"]).then();
    }
  }
  Sentry.captureException(error);

  d(debug?.context || "error", debug?.message || "request failed", error);
}
