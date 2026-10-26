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
import { HttpClient, HttpStatusCode } from "@angular/common/http";

import { SessionHarness, sessionHarness } from "./session-harness";
import { HOUR_MS, makeTokens } from "@tenzu/repository/auth/auth.factories";
import { TOKENS_KEY } from "@tenzu/repository/auth/token/token-repository.service";
import { translation } from "@tenzu/utils/testing/translation";
import { callsTo } from "@tenzu/utils/testing/http";

describe("refresh refused", () => {
  const loggedInSessionWithExpiredAccess = (): Promise<SessionHarness> =>
    sessionHarness({
      tokens: makeTokens({ username: "1user", accessExp: new Date(Date.now() - HOUR_MS) }),
      url: "/",
    });

  const unauthorized = { status: HttpStatusCode.Unauthorized, statusText: "Unauthorized" };

  const refuseTheRefresh = async ({ httpMock, apiUrl }: SessionHarness): Promise<void> => {
    TestBed.inject(HttpClient)
      .get(`${apiUrl}/workspaces`)
      .subscribe({ error: () => undefined });
    (await callsTo(httpMock, `${apiUrl}/workspaces`))[0].flush(null, unauthorized);
    (await callsTo(httpMock, `${apiUrl}/auth/token/refresh`))[0].flush(null, unauthorized);
  };

  it("an Unauthorized response to /auth/token/refresh navigates to /login with the refreshRefused message", async () => {
    const harness = await loggedInSessionWithExpiredAccess();

    await refuseTheRefresh(harness);
    await harness.navigatedTo("/login");

    expect(harness.alertText()).toBe(translation("auth.login.exit_reason.refreshRefused"));
  });

  it("an Unauthorized response to /auth/token/refresh removes TOKENS_KEY", async () => {
    const harness = await loggedInSessionWithExpiredAccess();

    await refuseTheRefresh(harness);
    await harness.navigatedTo("/login");

    expect(localStorage.getItem(TOKENS_KEY)).toBeNull();
  });
});
