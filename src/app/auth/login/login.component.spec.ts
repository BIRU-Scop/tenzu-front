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
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import { of, throwError } from "rxjs";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatInputHarness } from "@angular/material/input/testing";

import LoginComponent from "./login.component";
import { LoginService } from "./login.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { mockService } from "@tenzu/utils/testing/mocks";
import { translation } from "@tenzu/utils/testing/translation";
import { getTextByRole, queryByRole } from "@tenzu/utils/testing/aria-role";
import { buttonFilterByText } from "@tenzu/utils/testing/button-harness";
import { ExitReasonStore } from "@tenzu/repository/auth/stores/exit-reason.store";
import { ExitReason } from "@tenzu/repository/auth/session/session-machine";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";

const REASONS_WITH_MESSAGE = [
  "passwordChanged",
  "tokensCleared",
  "accountSwitched",
  "refreshRefused",
  "refreshExpired",
  "accountDeleted",
] as const satisfies readonly ExitReason[];

describe("LoginComponent", () => {
  let fixture: ComponentFixture<LoginComponent>;
  let exitReasonStore: ExitReasonStore;
  const loginServiceMock = mockService(LoginService);
  const routeMock = { snapshot: { queryParamMap: convertToParamMap({}), queryParams: {} }, queryParams: of({}) };

  beforeEach(async () => {
    loginServiceMock.login.mockReset().mockReturnValue(of(makeTokens()));
    routeMock.snapshot = { queryParamMap: convertToParamMap({}), queryParams: {} };
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        testingProviders,
        { provide: LoginService, useValue: loginServiceMock },
        { provide: ActivatedRoute, useValue: routeMock },
      ],
    }).compileComponents();
    exitReasonStore = TestBed.inject(ExitReasonStore);
    fixture = TestBed.createComponent(LoginComponent);
    await fixture.whenStable();
  });

  const submitLoginForm = async (): Promise<void> => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    await (await loader.getHarness(MatInputHarness.with({ selector: '[autocomplete="username"]' }))).setValue("1user");
    await (await loader.getHarness(MatInputHarness.with({ selector: '[type="password"]' }))).setValue("123123");
    await (await loader.getHarness(buttonFilterByText(translation("auth.login.action")))).click();
    await fixture.whenStable();
  };

  it("the login page renders no element with role alert when ExitReasonStore holds null", () => {
    expect(queryByRole(fixture.nativeElement, "alert")).toBeNull();
  });

  it.each(REASONS_WITH_MESSAGE)(
    "the login page renders the element with role alert with the %s message",
    async (reason) => {
      exitReasonStore.remember(reason, false);
      await fixture.whenStable();

      expect(getTextByRole(fixture.nativeElement, "alert")).toBe(translation(`auth.login.exit_reason.${reason}`));
    },
  );

  it.each(REASONS_WITH_MESSAGE)(
    "the login page renders the element with role alert with the %s message when fromChannel is true",
    async (reason) => {
      exitReasonStore.remember(reason, true);
      await fixture.whenStable();

      expect(getTextByRole(fixture.nativeElement, "alert")).toBe(translation(`auth.login.exit_reason.${reason}`));
    },
  );

  it("the login page renders the element with role alert with the from_another_tab message for logoutRequested with fromChannel", async () => {
    exitReasonStore.remember("logoutRequested", true);
    await fixture.whenStable();

    expect(getTextByRole(fixture.nativeElement, "alert")).toBe(translation("auth.login.exit_reason.from_another_tab"));
  });

  it("the login page renders no element with role alert for logoutRequested without fromChannel", async () => {
    exitReasonStore.remember("logoutRequested", false);
    await fixture.whenStable();

    expect(queryByRole(fixture.nativeElement, "alert")).toBeNull();
  });

  it("submitting the form that fails client validation leaves exit unchanged", async () => {
    exitReasonStore.remember("refreshExpired", false);
    const loader = TestbedHarnessEnvironment.loader(fixture);

    await (await loader.getHarness(buttonFilterByText(translation("auth.login.action")))).click();
    await fixture.whenStable();

    expect(exitReasonStore.exit()).toEqual({ reason: "refreshExpired", fromChannel: false });
  });

  it("submitting the form whose login request fails sets exit to null", async () => {
    exitReasonStore.remember("refreshExpired", false);
    loginServiceMock.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: HttpStatusCode.Unauthorized })),
    );

    await submitLoginForm();

    expect(exitReasonStore.exit()).toBeNull();
  });

  it("submitting the form calls loginService.login with the credentials and the next of the url", async () => {
    routeMock.snapshot = { queryParamMap: convertToParamMap({ next: "/workspace/w1" }), queryParams: {} };

    await submitLoginForm();

    expect(loginServiceMock.login).toHaveBeenCalledExactlyOnceWith(
      { username: "1user", password: "123123" },
      "/workspace/w1",
    );
  });

  it("submitting the form calls loginService.login with the credentials and / when the url carries no next", async () => {
    await submitLoginForm();

    expect(loginServiceMock.login).toHaveBeenCalledExactlyOnceWith({ username: "1user", password: "123123" }, "/");
  });
});
