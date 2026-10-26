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
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { HttpStatusCode } from "@angular/common/http";

import { UserStore } from "./user.store";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { makeUser } from "./user.factories";
import { ResetService } from "@tenzu/repository/base/reset.service";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { SessionStep } from "@tenzu/repository/auth/session/session-machine";

describe("UserStore", () => {
  let httpMock: HttpTestingController;
  let apiUrl: string;
  const stepMock = signal<SessionStep>("loggedOut");
  const sessionLifecycleServiceMock = { step: stepMock, endSession: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    stepMock.set("loggedOut");
    sessionLifecycleServiceMock.endSession.mockReset();
    TestBed.configureTestingModule({
      providers: [testingProviders, { provide: SessionLifecycleService, useValue: sessionLifecycleServiceMock }],
    });
    httpMock = TestBed.inject(HttpTestingController);
    apiUrl = TestBed.inject(ConfigAppService).apiUrl();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  const failRequest = (request: TestRequest): void =>
    request.flush(null, { status: HttpStatusCode.InternalServerError, statusText: "Server Error" });

  const loggedInStore = (): UserStore => {
    stepMock.set("loggedIn");
    const store = TestBed.inject(UserStore);
    TestBed.tick();
    return store;
  };

  it("step loggedIn sets myUser to the user of GET /users/me", () => {
    const store = loggedInStore();
    const myUser = makeUser();

    httpMock.expectOne(`${apiUrl}/users/me`).flush({ data: myUser });

    expect(store.myUser()).toEqual(myUser);
  });

  it("step loggedOut does not request GET /users/me", () => {
    TestBed.inject(UserStore);
    TestBed.tick();

    httpMock.expectNone(`${apiUrl}/users/me`);
  });

  it("deleteUser calls sessionLifecycleService.endSession with accountDeleted after the DELETE request succeeds", async () => {
    const store = TestBed.inject(UserStore);

    const deletion = store.deleteUser();
    httpMock.expectOne(`${apiUrl}/users/me`).flush(null);
    await deletion;

    expect(sessionLifecycleServiceMock.endSession).toHaveBeenCalledWith({ reason: "accountDeleted" });
  });

  it("deleteUser does not call sessionLifecycleService.endSession when the DELETE request fails", async () => {
    const store = TestBed.inject(UserStore);

    const deletion = store.deleteUser().catch(() => undefined);
    failRequest(httpMock.expectOne(`${apiUrl}/users/me`));
    await deletion;

    expect(sessionLifecycleServiceMock.endSession).not.toHaveBeenCalled();
  });

  it("deleteUser rejects with the error when the DELETE request fails", async () => {
    const store = TestBed.inject(UserStore);

    const deletion = store.deleteUser();
    failRequest(httpMock.expectOne(`${apiUrl}/users/me`));

    await expect(deletion).rejects.toMatchObject({ status: HttpStatusCode.InternalServerError });
  });

  it("changePassword calls sessionLifecycleService.endSession with passwordChanged after the PUT request succeeds", async () => {
    const store = TestBed.inject(UserStore);

    const change = store.changePassword("new-password");
    httpMock.expectOne({ method: "PUT", url: `${apiUrl}/users/me` }).flush({ data: makeUser() });
    await change;

    expect(sessionLifecycleServiceMock.endSession).toHaveBeenCalledExactlyOnceWith({ reason: "passwordChanged" });
  });

  it("changePassword does not call sessionLifecycleService.endSession when the PUT request fails", async () => {
    const store = TestBed.inject(UserStore);

    const change = store.changePassword("new-password").catch(() => undefined);
    failRequest(httpMock.expectOne({ method: "PUT", url: `${apiUrl}/users/me` }));
    await change;

    expect(sessionLifecycleServiceMock.endSession).not.toHaveBeenCalled();
  });

  it("drops the profile when the session is reset", () => {
    const store = loggedInStore();
    httpMock.expectOne(`${apiUrl}/users/me`).flush({ data: makeUser() });

    TestBed.inject(ResetService).reset();

    expect(store.myUser()).toEqual({});
  });

  it("getMe does not persist the profile to localStorage", () => {
    loggedInStore();

    httpMock.expectOne(`${apiUrl}/users/me`).flush({ data: makeUser() });

    expect(localStorage.getItem("user")).toBeNull();
  });
});
