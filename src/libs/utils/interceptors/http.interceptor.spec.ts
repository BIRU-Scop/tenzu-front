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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { lastValueFrom } from "rxjs";

import { httpInterceptor } from "./http.interceptor";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { TokenRepositoryService } from "@tenzu/repository/auth/token/token-repository.service";
import { callsTo } from "@tenzu/utils/testing/http";
import { mockService } from "@tenzu/utils/testing/mocks";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { HttpStatusCode } from "@angular/common/http";

describe("httpInterceptor", () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let BASE: string;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        testingProviders,
        provideHttpClient(withInterceptors([httpInterceptor])),
        provideHttpClientTesting(),
        { provide: SessionLifecycleService, useValue: mockService(SessionLifecycleService) },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    BASE = TestBed.inject(ConfigAppService).apiUrl();
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const unauthorized = { status: HttpStatusCode.Unauthorized, statusText: "Unauthorized" };
  const serverError = new HttpErrorResponse({ status: HttpStatusCode.InternalServerError });
  const rotated = { access: "access-token-2", refresh: "refresh-token-2", username: "1user" };

  it("an Unauthorized response on a url outside /auth/ calls tokenRepositoryService.rotate once", async () => {
    TestBed.inject(TokenRepositoryService).set(makeTokens());
    const rotate = vi.spyOn(TestBed.inject(TokenRepositoryService), "rotate");

    const call = lastValueFrom(http.get(`${BASE}/stories/1`));
    httpMock.expectOne(`${BASE}/stories/1`).flush(null, unauthorized);
    (await callsTo(httpMock, `${BASE}/auth/token/refresh`))[0].flush(rotated);
    (await callsTo(httpMock, `${BASE}/stories/1`))[0].flush({ id: "1" });
    await call;

    expect(rotate).toHaveBeenCalledOnce();
  });

  it("an Unauthorized response on a url outside /auth/ replays the request after rotate resolves", async () => {
    TestBed.inject(TokenRepositoryService).set(makeTokens());

    const call = lastValueFrom(http.get(`${BASE}/stories/1`));
    httpMock.expectOne(`${BASE}/stories/1`).flush(null, unauthorized);
    (await callsTo(httpMock, `${BASE}/auth/token/refresh`))[0].flush(rotated);
    const [replay] = await callsTo(httpMock, `${BASE}/stories/1`);
    replay.flush({ id: "1" });

    expect(TestBed.inject(TokenRepositoryService).tokens()?.access).toBe("access-token-2");
    expect(await call).toEqual({ id: "1" });
  });

  it("two concurrent Unauthorized responses replay both requests", async () => {
    TestBed.inject(TokenRepositoryService).set(makeTokens());

    const firstCall = lastValueFrom(http.get(`${BASE}/stories/1`));
    const secondCall = lastValueFrom(http.get(`${BASE}/stories/2`));
    httpMock.expectOne(`${BASE}/stories/1`).flush(null, unauthorized);
    httpMock.expectOne(`${BASE}/stories/2`).flush(null, unauthorized);
    (await callsTo(httpMock, `${BASE}/auth/token/refresh`))[0].flush(rotated);
    (await callsTo(httpMock, `${BASE}/stories/1`))[0].flush({ id: "1" });
    (await callsTo(httpMock, `${BASE}/stories/2`))[0].flush({ id: "2" });

    expect(await firstCall).toEqual({ id: "1" });
    expect(await secondCall).toEqual({ id: "2" });
  });

  it("an Unauthorized response on a url containing auth outside /auth/ calls tokenRepositoryService.rotate once", async () => {
    TestBed.inject(TokenRepositoryService).set(makeTokens());
    const rotate = vi.spyOn(TestBed.inject(TokenRepositoryService), "rotate");

    const call = lastValueFrom(http.get(`${BASE}/projects/p1/authors`));
    httpMock.expectOne(`${BASE}/projects/p1/authors`).flush(null, unauthorized);
    (await callsTo(httpMock, `${BASE}/auth/token/refresh`))[0].flush(rotated);
    (await callsTo(httpMock, `${BASE}/projects/p1/authors`))[0].flush([{ id: "author-1" }]);
    await call;

    expect(rotate).toHaveBeenCalledOnce();
  });

  it("an Unauthorized response on an /auth/ url does not call tokenRepositoryService.rotate", async () => {
    TestBed.inject(TokenRepositoryService).set(makeTokens());
    const rotate = vi.spyOn(TestBed.inject(TokenRepositoryService), "rotate");

    const call = lastValueFrom(http.post(`${BASE}/auth/token/refresh`, { refresh: "refresh-token-1" }));
    httpMock.expectOne(`${BASE}/auth/token/refresh`).flush(null, unauthorized);
    await call.catch(() => undefined);

    expect(rotate).not.toHaveBeenCalled();
  });

  it("an Unauthorized response on an /auth/ url propagates the error", async () => {
    TestBed.inject(TokenRepositoryService).set(makeTokens());

    const call = lastValueFrom(http.post(`${BASE}/auth/token/refresh`, { refresh: "refresh-token-1" }));
    httpMock.expectOne(`${BASE}/auth/token/refresh`).flush(null, unauthorized);

    await expect(call).rejects.toMatchObject({ status: HttpStatusCode.Unauthorized });
  });

  it("an Unauthorized response propagates the Unauthorized error when tokenRepositoryService.rotate rejects", async () => {
    TestBed.inject(TokenRepositoryService).set(makeTokens());

    const call = lastValueFrom(http.get(`${BASE}/stories/1`));
    httpMock.expectOne(`${BASE}/stories/1`).flush(null, unauthorized);
    (await callsTo(httpMock, `${BASE}/auth/token/refresh`))[0].flush(null, serverError);

    await expect(call).rejects.toMatchObject({ status: HttpStatusCode.Unauthorized, url: `${BASE}/stories/1` });
  });

  it("an Unauthorized response does not call sessionLifecycleService.endSession when tokenRepositoryService.rotate rejects", async () => {
    TestBed.inject(TokenRepositoryService).set(makeTokens());
    const call = lastValueFrom(http.get(`${BASE}/stories/1`)).catch(() => undefined);
    httpMock.expectOne(`${BASE}/stories/1`).flush(null, unauthorized);
    (await callsTo(httpMock, `${BASE}/auth/token/refresh`))[0].flush(null, unauthorized);
    await call;

    expect(TestBed.inject(SessionLifecycleService).endSession).not.toHaveBeenCalled();
  });

  it("an Unauthorized response on a url outside /auth/ completes without a value when the refresh is not usable", async () => {
    const values: unknown[] = [];
    let isCompleted = false;

    http
      .get(`${BASE}/stories/1`)
      .subscribe({ next: (value) => values.push(value), complete: () => (isCompleted = true) });
    httpMock.expectOne(`${BASE}/stories/1`).flush(null, unauthorized);
    await vi.waitFor(() => expect(isCompleted).toBe(true));

    expect(values).toEqual([]);
    httpMock.expectNone(`${BASE}/auth/token/refresh`);
  });

  it("a Forbidden response does not call tokenRepositoryService.rotate", async () => {
    TestBed.inject(TokenRepositoryService).set(makeTokens());
    const rotate = vi.spyOn(TestBed.inject(TokenRepositoryService), "rotate");

    const call = lastValueFrom(http.get(`${BASE}/stories/1`)).catch(() => undefined);
    httpMock.expectOne(`${BASE}/stories/1`).flush(null, { status: HttpStatusCode.Forbidden, statusText: "Forbidden" });
    await call;

    expect(rotate).not.toHaveBeenCalled();
  });

  it("a Forbidden response propagates the error", async () => {
    TestBed.inject(TokenRepositoryService).set(makeTokens());

    const call = lastValueFrom(http.get(`${BASE}/stories/1`));
    httpMock.expectOne(`${BASE}/stories/1`).flush(null, { status: HttpStatusCode.Forbidden, statusText: "Forbidden" });

    await expect(call).rejects.toMatchObject({ status: HttpStatusCode.Forbidden });
  });
});
