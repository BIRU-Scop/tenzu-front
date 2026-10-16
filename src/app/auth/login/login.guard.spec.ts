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

import { loginGuard } from "./login.guard";
import { TokenRepositoryService } from "@tenzu/repository/auth/token/token-repository.service";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { mockService } from "@tenzu/utils/testing/mocks";

describe("loginGuard", () => {
  const tokenRepositoryServiceMock = { getAccessToken: vi.fn<() => Promise<string | null>>() };
  const sessionLifecycleServiceMock = mockService(SessionLifecycleService);
  let router: Router;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        testingProviders,
        { provide: TokenRepositoryService, useValue: tokenRepositoryServiceMock },
        { provide: SessionLifecycleService, useValue: sessionLifecycleServiceMock },
      ],
    });
    router = TestBed.inject(Router);
  });

  const runGuard = (requestedUrl: string): Promise<boolean | UrlTree> =>
    TestBed.runInInjectionContext(() =>
      loginGuard({} as ActivatedRouteSnapshot, { url: requestedUrl } as RouterStateSnapshot),
    ) as Promise<boolean | UrlTree>;

  const serialized = (urlTree: boolean | UrlTree): string => router.serializeUrl(urlTree as UrlTree);

  it("loginGuard returns true when tokenRepositoryService.getAccessToken resolves an access token", async () => {
    tokenRepositoryServiceMock.getAccessToken.mockResolvedValue("access-token");

    expect(await runGuard("/workspace/w1/projects")).toBe(true);
  });

  it("loginGuard returns the /login UrlTree with next equal to state.url when tokenRepositoryService.getAccessToken resolves null", async () => {
    tokenRepositoryServiceMock.getAccessToken.mockResolvedValue(null);

    const decision = await runGuard("/workspace/w1/project/p1/story/42");

    expect(serialized(decision)).toBe(
      serialized(router.createUrlTree(["/login"], { queryParams: { next: "/workspace/w1/project/p1/story/42" } })),
    );
  });

  it("loginGuard returns the /login UrlTree without next when state.url is the homepage", async () => {
    tokenRepositoryServiceMock.getAccessToken.mockResolvedValue(null);

    expect(serialized(await runGuard("/"))).toBe("/login");
  });

  it("loginGuard returns the /login UrlTree without next when state.url is an auth route", async () => {
    tokenRepositoryServiceMock.getAccessToken.mockResolvedValue(null);

    expect(serialized(await runGuard("/signup"))).toBe("/login");
  });

  it("loginGuard does not call sessionLifecycleService.endSession when tokenRepositoryService.getAccessToken resolves null", async () => {
    tokenRepositoryServiceMock.getAccessToken.mockResolvedValue(null);

    await runGuard("/workspace/w1/projects");

    expect(sessionLifecycleServiceMock.endSession).not.toHaveBeenCalled();
  });
});
