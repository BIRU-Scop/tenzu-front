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
import { TestBed } from "@angular/core/testing";

import { loggedInSession, SessionHarness } from "./session-harness";
import { TOKENS_KEY } from "@tenzu/repository/auth/token/token-repository.service";
import { UserStore } from "@tenzu/repository/user/user.store";
import { makeUser } from "@tenzu/repository/user/user.factories";
import { translation } from "@tenzu/utils/testing/translation";
import { callsTo } from "@tenzu/utils/testing/http";

describe("password changed", () => {
  const changePassword = async ({ httpMock, apiUrl }: SessionHarness): Promise<void> => {
    const change = TestBed.inject(UserStore).changePassword("new-password");
    const [request] = await callsTo(httpMock, { url: `${apiUrl}/users/me`, method: "PUT" });
    request.flush({ data: makeUser({ username: "1user" }) });
    await change;
  };

  it("changePassword navigates to /login with the passwordChanged message", async () => {
    const harness = await loggedInSession();

    await changePassword(harness);
    await harness.navigatedTo("/login");

    expect(harness.alertText()).toBe(translation("auth.login.exit_reason.passwordChanged"));
  });

  it("changePassword removes TOKENS_KEY", async () => {
    const harness = await loggedInSession();

    await changePassword(harness);
    await harness.navigatedTo("/login");

    expect(localStorage.getItem(TOKENS_KEY)).toBeNull();
  });
});
