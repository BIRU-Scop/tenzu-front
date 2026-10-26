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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { lastValueFrom, of } from "rxjs";
import { AuthService } from "@tenzu/repository/auth/auth.service";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";

import { LoginService } from "./login.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

describe("LoginService", () => {
  let loginService: LoginService;
  const tokens = makeTokens({ username: "alice" });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...testingProviders] });
    loginService = TestBed.inject(LoginService);
    vi.spyOn(TestBed.inject(AuthService), "login").mockReturnValue(of(tokens));
    vi.spyOn(TestBed.inject(SessionLifecycleService), "sessionStarted").mockImplementation(() => undefined);
  });

  it("login calls sessionLifecycleService.sessionStarted with the tokens and next when next is usable", async () => {
    await lastValueFrom(loginService.login({ username: "alice", password: "123123" }, "/workspace/1/projects"));

    expect(TestBed.inject(SessionLifecycleService).sessionStarted).toHaveBeenCalledExactlyOnceWith(
      tokens,
      "/workspace/1/projects",
    );
  });

  it("login calls sessionLifecycleService.sessionStarted with the tokens and null when next is not usable", async () => {
    await lastValueFrom(loginService.login({ username: "alice", password: "123123" }, "//bad.url.site"));

    expect(TestBed.inject(SessionLifecycleService).sessionStarted).toHaveBeenCalledExactlyOnceWith(tokens, null);
  });
});
