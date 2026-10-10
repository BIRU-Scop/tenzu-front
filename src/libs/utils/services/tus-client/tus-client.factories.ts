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

import { vi } from "vitest";
import type * as tus from "tus-js-client";

export function makeTusResponse(headers: Record<string, string> = {}, status = 201, body = ""): tus.HttpResponse {
  return {
    getStatus: () => status,
    getHeader: (header: string) => headers[header],
    getBody: () => body,
    getUnderlyingObject: vi.fn(),
  };
}

export function makeTusRequest(url: string, method = "PATCH") {
  return {
    getURL: () => url,
    getMethod: () => method,
    setHeader: vi.fn(),
    getHeader: vi.fn(),
    setProgressHandler: vi.fn(),
    send: vi.fn(),
    abort: vi.fn(),
    getUnderlyingObject: vi.fn(),
  } satisfies tus.HttpRequest;
}

export function makeTusError(status: number | null, body = ""): tus.DetailedError {
  const error = new Error("tus: failed because of a request error") as tus.DetailedError;
  error.originalRequest = makeTusRequest("http://localhost/api/v1/upload/abc");
  error.originalResponse = status === null ? null : makeTusResponse({}, status, body);
  error.causingError = null;
  return error;
}
