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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";

import { unloggedOnlyGuard } from "./unlogged-only.guard";
import { TokenRepositoryService } from "@tenzu/repository/auth/token/token-repository.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

describe("unloggedOnlyGuard", () => {
  const tokenRepositoryServiceMock = { getAccessToken: vi.fn<() => Promise<string | null>>() };
  let router: Router;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [testingProviders, { provide: TokenRepositoryService, useValue: tokenRepositoryServiceMock }],
    });
    router = TestBed.inject(Router);
  });

  const runGuard = (): Promise<boolean | UrlTree> =>
    TestBed.runInInjectionContext(() =>
      unloggedOnlyGuard({} as ActivatedRouteSnapshot, { url: "/login" } as RouterStateSnapshot),
    ) as Promise<boolean | UrlTree>;

  it("unloggedOnlyGuard returns true when tokenRepositoryService.getAccessToken resolves null", async () => {
    tokenRepositoryServiceMock.getAccessToken.mockResolvedValue(null);

    expect(await runGuard()).toBe(true);
  });

  it("unloggedOnlyGuard returns the / UrlTree when tokenRepositoryService.getAccessToken resolves an access token", async () => {
    tokenRepositoryServiceMock.getAccessToken.mockResolvedValue("access-token");

    expect(router.serializeUrl((await runGuard()) as UrlTree)).toBe("/");
  });
});
