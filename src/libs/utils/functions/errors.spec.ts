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

import { describe, expect, it } from "vitest";
import { HttpErrorResponse } from "@angular/common/http";
import { getLocError } from "./errors";

function buildError(detail: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ error: { error: { detail } } });
}

describe("getLocError", () => {
  it("returns the message matching the requested location", () => {
    const error = buildError([
      { ctx: {}, msg: "Email already used", type: "value_error", loc: ["body", "email"] },
      { ctx: {}, msg: "Too short", type: "value_error", loc: ["body", "password"] },
    ]);
    expect(getLocError(error, "email")).toBe("Email already used");
    expect(getLocError(error, "password")).toBe("Too short");
  });

  it("returns undefined when no detail matches the location", () => {
    const error = buildError([{ ctx: {}, msg: "Too short", type: "value_error", loc: ["body", "password"] }]);
    expect(getLocError(error, "email")).toBeUndefined();
  });

  it("returns undefined when the error shape is unexpected", () => {
    expect(getLocError(new HttpErrorResponse({ error: null }), "email")).toBeUndefined();
    expect(getLocError(new HttpErrorResponse({ error: { error: {} } }), "email")).toBeUndefined();
  });
});
