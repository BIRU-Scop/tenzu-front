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

import { describe, expect, it } from "vitest";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatInputHarness } from "@angular/material/input/testing";

import { SessionHarness, sessionHarness } from "./session-harness";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";
import { Tokens } from "@tenzu/repository/auth/auth.model";
import { TOKENS_KEY } from "@tenzu/repository/auth/token/token-repository.service";
import { makeUser } from "@tenzu/repository/user/user.factories";
import { translation } from "@tenzu/utils/testing/translation";
import { buttonFilterByText } from "@tenzu/utils/testing/button-harness";
import { callsTo } from "@tenzu/utils/testing/http";

describe("reset password", () => {
  const resetPasswordPage = async (): Promise<SessionHarness> => {
    const harness = await sessionHarness({ url: "/reset-password/t1" });
    (await callsTo(harness.httpMock, `${harness.apiUrl}/users/reset-password/t1/verify`))[0].flush(true);
    return harness;
  };

  const submitResetPasswordForm = async ({ fixture, httpMock, apiUrl }: SessionHarness): Promise<Tokens> => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    for (const passwordInput of await loader.getAllHarnesses(MatInputHarness.with({ selector: '[type="password"]' }))) {
      await passwordInput.setValue("Str0ng-Password");
    }
    await (await loader.getHarness(buttonFilterByText(translation("resetPassword.change_password")))).click();
    const tokens = makeTokens({ username: "1user" });
    (await callsTo(httpMock, `${apiUrl}/users/reset-password/t1`))[0].flush(tokens);
    (await callsTo(httpMock, `${apiUrl}/users/me`))[0].flush({ data: makeUser({ username: "1user" }) });
    return tokens;
  };

  it("submitting the reset password form lands on /", async () => {
    const harness = await resetPasswordPage();

    await submitResetPasswordForm(harness);
    await harness.navigatedTo("/");

    expect(harness.router.url).toBe("/");
  });

  it("submitting the reset password form writes the tokens under TOKENS_KEY", async () => {
    const harness = await resetPasswordPage();

    const tokens = await submitResetPasswordForm(harness);
    await harness.navigatedTo("/");

    expect(JSON.parse(localStorage.getItem(TOKENS_KEY) ?? "null")).toEqual(tokens);
  });
});
