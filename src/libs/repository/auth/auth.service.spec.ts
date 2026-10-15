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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { lastValueFrom } from "rxjs";
import { ZodError } from "zod/v4";

import { AuthService } from "./auth.service";
import { ConfigAppService } from "../config-app/config-app.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

describe(AuthService.name, () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let BASE: string;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [testingProviders] });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    BASE = TestBed.inject(ConfigAppService).apiUrl();
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("refreshTokens posts the refresh to /auth/token/refresh", async () => {
    const refreshed = lastValueFrom(service.refreshTokens("refresh-token-1"));

    const request = httpMock.expectOne(`${BASE}/auth/token/refresh`);
    expect(request.request.body).toEqual({ refresh: "refresh-token-1" });
    request.flush({ access: "access-token-2", refresh: "refresh-token-2" });
    await refreshed;
  });

  it("refreshTokens return the tokens parsed by rotatedTokensSchema", async () => {
    const refreshed = lastValueFrom(service.refreshTokens("refresh-token-1"));
    httpMock.expectOne(`${BASE}/auth/token/refresh`).flush({ access: "access-token-2", refresh: "refresh-token-2" });

    expect(await refreshed).toEqual({ access: "access-token-2", refresh: "refresh-token-2" });
  });

  it("refreshTokens throws ZodError when the response does not match rotatedTokensSchema", async () => {
    const refreshed = lastValueFrom(service.refreshTokens("refresh-token-1"));
    httpMock.expectOne(`${BASE}/auth/token/refresh`).flush({ access: "access-token-2" });

    await expect(refreshed).rejects.toBeInstanceOf(ZodError);
  });

  it("blacklistRefreshToken posts the refresh to /auth/blacklist", async () => {
    const revoked = lastValueFrom(service.blacklistRefreshToken("refresh-token-1"));

    const request = httpMock.expectOne(`${BASE}/auth/blacklist`);
    expect(request.request.body).toEqual({ refresh: "refresh-token-1" });
    request.flush({});
    await revoked;
  });

  it("login return  the tokens parsed by tokensSchema", async () => {
    const tokens = { access: "access-token", refresh: "refresh-token", username: "1user" };
    const loginPromise = lastValueFrom(service.login({ username: "1user", password: "123123" }));

    httpMock.expectOne(`${BASE}/auth/token`).flush(tokens);

    expect(await loginPromise).toEqual(tokens);
  });

  it("login throws ZodError when the response does not match tokensSchema", async () => {
    const raw = { access: 123, refresh: "refresh-token", username: "1user" };
    const loginPromise = lastValueFrom(service.login({ username: "1user", password: "123123" }));

    httpMock.expectOne(`${BASE}/auth/token`).flush(raw);

    await expect(loginPromise).rejects.toThrow();
  });

  it("initConfig sets providers to the providers of the parsed config", async () => {
    const provider = { id: "google", name: "Google", clientId: "client-123" };
    const initPromise = service.initConfig();

    httpMock.expectOne(`${BASE}/auth/config`).flush({ data: { socialaccount: { providers: [provider] } } });
    await initPromise;

    expect(service.providers()).toEqual([provider]);
  });

  it("continueSignup call the callback parsed by providerCallbackSchema", async () => {
    const callback = {
      fromSignup: true,
      access: "access-token",
      refresh: "refresh-token",
      username: "1user",
      projectInvitationToken: "invitation-token",
      acceptProjectInvitation: true,
      email: "user@example.com",
      next: "/home",
    };
    const signupPromise = lastValueFrom(
      service.continueSignup({
        socialSessionKey: "session-key",
        acceptTermsOfService: true,
        acceptPrivacyPolicy: true,
      }),
    );

    httpMock.expectOne(`${BASE}/auth/provider/continue_signup`).flush(callback);

    expect(await signupPromise).toEqual(callback);
  });
});
