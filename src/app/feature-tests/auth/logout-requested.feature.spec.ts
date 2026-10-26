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

import { loggedInSession } from "./session-harness";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";
import { Tokens } from "@tenzu/repository/auth/auth.model";
import { TOKENS_KEY } from "@tenzu/repository/auth/token/token-repository.service";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { queryByRole } from "@tenzu/utils/testing/aria-role";

describe("logout requested", () => {
  const tokens: Tokens = makeTokens({ username: "1user" });

  const requestLogout = (): void => TestBed.inject(SessionLifecycleService).endSession({ reason: "logoutRequested" });

  it("endSession with logoutRequested navigates to /login without an alert", async () => {
    const { fixture, navigatedTo } = await loggedInSession({ tokens });

    requestLogout();
    await navigatedTo("/login");

    expect(queryByRole(fixture.nativeElement, "alert")).toBeNull();
  });

  it("endSession with logoutRequested removes TOKENS_KEY", async () => {
    await loggedInSession({ tokens });

    requestLogout();

    expect(localStorage.getItem(TOKENS_KEY)).toBeNull();
  });

  it("endSession with logoutRequested calls wsService.command with signout_local", async () => {
    const { wsServiceMock } = await loggedInSession({ tokens });

    requestLogout();

    expect(wsServiceMock.command).toHaveBeenCalledWith({ command: "signout_local" });
  });

  it("endSession with logoutRequested posts the refresh to /auth/blacklist", async () => {
    const { httpMock, apiUrl } = await loggedInSession({ tokens });

    requestLogout();

    expect(httpMock.expectOne({ method: "POST", url: `${apiUrl}/auth/blacklist` }).request.body).toEqual({
      refresh: tokens.refresh,
    });
  });
});
