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
import { ZodError } from "zod/v4";

import { UpdateUserProfilePayload, updateUserProfilePayloadSchema, USER_FULL_NAME_MAX_LENGTH } from "./user.model";
import { makeUpdateUserProfilePayload } from "./user.factories";

describe("updateUserProfilePayloadSchema", () => {
  it("parses a conforming payload", () => {
    const raw = makeUpdateUserProfilePayload({ avatar: new File(["avatar"], "avatar.png", { type: "image/png" }) });

    const parsed: UpdateUserProfilePayload = updateUserProfilePayloadSchema.parse(raw);

    expect(parsed).toEqual(raw);
  });

  it("throws ZodError when fullName is empty", () => {
    const raw = makeUpdateUserProfilePayload({ fullName: "" });

    expect(() => updateUserProfilePayloadSchema.parse(raw)).toThrow(ZodError);
  });

  it("throws ZodError when fullName exceeds USER_FULL_NAME_MAX_LENGTH", () => {
    const raw = makeUpdateUserProfilePayload({ fullName: "x".repeat(USER_FULL_NAME_MAX_LENGTH + 1) });

    expect(() => updateUserProfilePayloadSchema.parse(raw)).toThrow(ZodError);
  });
});
