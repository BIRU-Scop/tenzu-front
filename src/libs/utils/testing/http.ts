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

import { HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { vi } from "vitest";

export function callsTo(
  httpMock: HttpTestingController,
  target: string | { url: string; method: string },
): Promise<TestRequest[]> {
  const { url, method } = typeof target === "string" ? { url: target, method: undefined } : target;
  return vi.waitFor(() => {
    const matches = httpMock.match(
      (request) => request.url === url && (method === undefined || request.method === method),
    );
    if (matches.length === 0) {
      throw new Error(`no call made to ${method ?? ""} ${url}`.replace("  ", " "));
    }
    return matches;
  });
}
