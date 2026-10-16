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
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import { lastValueFrom, Observable, of, throwError } from "rxjs";

import { verifyEmailGuard } from "./verify-email.guard";
import { UserService } from "@tenzu/repository/user/user.service";
import { makeVerificationInfo } from "@tenzu/repository/user/user.factories";
import { makeProjectLinkNested } from "@tenzu/repository/project/project.factories";
import { makeWorkspaceLinkNested } from "@tenzu/repository/workspace/workspace.factories";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { SessionStep } from "@tenzu/repository/auth/session/session-machine";
import { InvitationStatus } from "@tenzu/repository/membership/invitation-status.model";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { mockService } from "@tenzu/utils/testing/mocks";

describe("verifyEmailGuard", () => {
  const userServiceMock = mockService(UserService);
  const stepMock = signal<SessionStep>("loggedOut");
  const sessionLifecycleServiceMock = { step: stepMock, endSession: vi.fn(), sessionStarted: vi.fn() };
  let router: Router;

  beforeEach(() => {
    vi.resetAllMocks();
    stepMock.set("loggedOut");
    TestBed.configureTestingModule({
      providers: [
        testingProviders,
        { provide: UserService, useValue: userServiceMock },
        { provide: SessionLifecycleService, useValue: sessionLifecycleServiceMock },
      ],
    });
    router = TestBed.inject(Router);
    vi.spyOn(router, "navigate").mockResolvedValue(true);
  });

  const runGuard = (): Promise<boolean> =>
    lastValueFrom(
      TestBed.runInInjectionContext(() =>
        verifyEmailGuard({ params: { token: "t1" } } as unknown as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      ) as Observable<boolean>,
    );

  const failWith = (status: HttpStatusCode): HttpErrorResponse => {
    const error = new HttpErrorResponse({ status });
    userServiceMock.verifyUser.mockReturnValue(throwError(() => error));
    return error;
  };

  it("verifyEmailGuard emits false when userService.verifyUser succeeds", async () => {
    userServiceMock.verifyUser.mockReturnValue(of(makeVerificationInfo()));

    expect(await runGuard()).toBe(false);
  });

  it("verifyEmailGuard calls sessionLifecycleService.sessionStarted with verification.auth and the workspace projects url for a workspace invitation", async () => {
    const verification = makeVerificationInfo({
      workspaceInvitation: { workspace: makeWorkspaceLinkNested({ id: "w1" }), status: InvitationStatus.PENDING },
    });
    userServiceMock.verifyUser.mockReturnValue(of(verification));

    await runGuard();

    expect(sessionLifecycleServiceMock.sessionStarted).toHaveBeenCalledExactlyOnceWith(
      verification.auth,
      "/workspace/w1/projects",
    );
  });

  it("verifyEmailGuard calls sessionLifecycleService.sessionStarted with verification.auth and the project url for a project invitation", async () => {
    const verification = makeVerificationInfo({
      projectInvitation: {
        project: makeProjectLinkNested({ id: "p1", workspaceId: "w1" }),
        status: InvitationStatus.PENDING,
      },
    });
    userServiceMock.verifyUser.mockReturnValue(of(verification));

    await runGuard();

    expect(sessionLifecycleServiceMock.sessionStarted).toHaveBeenCalledExactlyOnceWith(
      verification.auth,
      "/workspace/w1/project/p1",
    );
  });

  it("verifyEmailGuard calls sessionLifecycleService.sessionStarted with verification.auth and null without invitation", async () => {
    const verification = makeVerificationInfo();
    userServiceMock.verifyUser.mockReturnValue(of(verification));

    await runGuard();

    expect(sessionLifecycleServiceMock.sessionStarted).toHaveBeenCalledExactlyOnceWith(verification.auth, null);
  });

  it("verifyEmailGuard calls sessionLifecycleService.endSession with logoutRequested when step is loggedIn", async () => {
    stepMock.set("loggedIn");
    userServiceMock.verifyUser.mockReturnValue(of(makeVerificationInfo()));

    await runGuard();

    expect(sessionLifecycleServiceMock.endSession).toHaveBeenCalledExactlyOnceWith({ reason: "logoutRequested" });
  });

  it("verifyEmailGuard does not call sessionLifecycleService.endSession when step is loggedOut", async () => {
    userServiceMock.verifyUser.mockReturnValue(of(makeVerificationInfo()));

    await runGuard();

    expect(sessionLifecycleServiceMock.endSession).not.toHaveBeenCalled();
  });

  it.each([
    { status: HttpStatusCode.NotFound, url: "/signup" },
    { status: HttpStatusCode.BadRequest, url: "/login" },
  ])("verifyEmailGuard navigates to $url when userService.verifyUser fails with $status", async ({ status, url }) => {
    failWith(status);

    await runGuard().catch(() => undefined);

    expect(router.navigate).toHaveBeenCalledExactlyOnceWith([url]);
  });

  it("verifyEmailGuard does not navigate when userService.verifyUser fails with InternalServerError", async () => {
    failWith(HttpStatusCode.InternalServerError);

    await runGuard().catch(() => undefined);

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("verifyEmailGuard rejects with the error when userService.verifyUser fails", async () => {
    const error = failWith(HttpStatusCode.InternalServerError);

    await expect(runGuard()).rejects.toBe(error);
  });
});
