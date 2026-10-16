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
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from "@angular/router";
import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import { submit } from "@angular/forms/signals";
import { BehaviorSubject, of, throwError } from "rxjs";

import ResetPasswordFormComponent from "./reset-password-form.component";
import { UserService } from "@tenzu/repository/user/user.service";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";
import { NotificationService } from "@tenzu/utils/services/notification";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { mockService } from "@tenzu/utils/testing/mocks";

describe("ResetPasswordFormComponent", () => {
  let fixture: ComponentFixture<ResetPasswordFormComponent>;
  let router: Router;
  const userServiceMock = mockService(UserService);
  const sessionLifecycleServiceMock = { sessionStarted: vi.fn() };
  let paramMap: BehaviorSubject<ParamMap>;
  const tokens = makeTokens({ username: "1user" });

  beforeEach(() => {
    vi.resetAllMocks();
    paramMap = new BehaviorSubject(convertToParamMap({ token: "t1" }));
    userServiceMock.verifyResetTokenPassword.mockReturnValue(of(true));
    userServiceMock.resetPassword.mockReturnValue(of(tokens));
    TestBed.configureTestingModule({
      providers: [
        testingProviders,
        { provide: UserService, useValue: userServiceMock },
        { provide: SessionLifecycleService, useValue: sessionLifecycleServiceMock },
        { provide: NotificationService, useValue: mockService(NotificationService) },
        { provide: ActivatedRoute, useValue: { paramMap } },
      ],
    });
    router = TestBed.inject(Router);
    vi.spyOn(router, "navigateByUrl").mockResolvedValue(true);
    fixture = TestBed.createComponent(ResetPasswordFormComponent);
  });

  const submitForm = async (): Promise<void> => {
    fixture.componentInstance.passwordModel.set({ newPassword: "Str0ng-Password", repeatPassword: "Str0ng-Password" });
    await submit(fixture.componentInstance.resetPasswordForm);
  };

  const failReset = (): void => {
    userServiceMock.resetPassword.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: HttpStatusCode.BadRequest, error: { error: { detail: "token-expired" } } }),
      ),
    );
  };

  it("submitting the form calls sessionLifecycleService.sessionStarted with the tokens of the reset when a token is set", async () => {
    await submitForm();

    expect(sessionLifecycleServiceMock.sessionStarted).toHaveBeenCalledExactlyOnceWith(tokens);
  });

  it("submitting the form does not call userService.resetPassword without a token", async () => {
    paramMap.next(convertToParamMap({}));

    await submitForm();

    expect(userServiceMock.resetPassword).not.toHaveBeenCalled();
  });

  it("submitting the form sets isTokenExpired to true when userService.resetPassword fails", async () => {
    failReset();

    await submitForm();

    expect(fixture.componentInstance.isTokenExpired()).toBe(true);
  });

  it("submitting the form navigates to /reset-password when userService.resetPassword fails", async () => {
    failReset();

    await submitForm();

    expect(router.navigateByUrl).toHaveBeenCalledExactlyOnceWith("/reset-password");
  });
});
