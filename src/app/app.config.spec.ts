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

import { beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";
import { TokenRepositoryService } from "@tenzu/repository/auth/token/token-repository.service";
import { JWT_OPTIONS } from "@auth0/angular-jwt";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

describe("JWT wiring", () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [testingProviders] });
  });

  it("feeds the JWT module from the token store", () => {
    TestBed.inject(TokenRepositoryService).set(makeTokens({ access: "access-token" }));
    const jwtOptions = TestBed.inject(JWT_OPTIONS) as { tokenGetter: () => string | null };
    expect(jwtOptions.tokenGetter()).toBe("access-token");
  });
});
