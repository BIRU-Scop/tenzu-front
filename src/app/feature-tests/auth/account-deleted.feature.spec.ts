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
import { HttpStatusCode } from "@angular/common/http";
import { TestRequest } from "@angular/common/http/testing";

import { loggedInSession, SessionHarness } from "./session-harness";
import { TOKENS_KEY } from "@tenzu/repository/auth/token/token-repository.service";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { UserStore } from "@tenzu/repository/user/user.store";
import { translation } from "@tenzu/utils/testing/translation";
import { callsTo } from "@tenzu/utils/testing/http";
import { RETRY_COUNT } from "@tenzu/repository/base/utils";

describe("account deleted", () => {
  const pendingDeleteRequest = async ({ httpMock, apiUrl }: SessionHarness): Promise<TestRequest> => {
    const [request] = await callsTo(httpMock, { url: `${apiUrl}/users/me`, method: "DELETE" });
    return request;
  };

  const deleteUser = async (harness: SessionHarness): Promise<void> => {
    const deletion = TestBed.inject(UserStore).deleteUser();
    (await pendingDeleteRequest(harness)).flush(null, { status: HttpStatusCode.NoContent, statusText: "No Content" });
    await deletion;
  };

  const failDeleteUser = async (harness: SessionHarness): Promise<void> => {
    const deletion = TestBed.inject(UserStore)
      .deleteUser()
      .catch(() => undefined);
    for (let attempt = 0; attempt < 1 + RETRY_COUNT; attempt++) {
      (await pendingDeleteRequest(harness)).flush(null, {
        status: HttpStatusCode.InternalServerError,
        statusText: "Server Error",
      });
    }
    await deletion;
  };

  it("deleteUser navigates to /login with the accountDeleted message", async () => {
    const harness = await loggedInSession();

    await deleteUser(harness);
    await harness.navigatedTo("/login");

    expect(harness.alertText()).toBe(translation("auth.login.exit_reason.accountDeleted"));
  });

  it("deleteUser removes TOKENS_KEY", async () => {
    const harness = await loggedInSession();

    await deleteUser(harness);
    await harness.navigatedTo("/login");

    expect(localStorage.getItem(TOKENS_KEY)).toBeNull();
  });

  it("deleteUser keeps step loggedIn when the DELETE request fails", async () => {
    const harness = await loggedInSession();

    await failDeleteUser(harness);

    expect(TestBed.inject(SessionLifecycleService).step()).toBe("loggedIn");
  });

  it("deleteUser keeps TOKENS_KEY when the DELETE request fails", async () => {
    const harness = await loggedInSession();

    await failDeleteUser(harness);

    expect(localStorage.getItem(TOKENS_KEY)).not.toBeNull();
  });

  it("deleteUser keeps the router on /workspace/w1 when the DELETE request fails", async () => {
    const harness = await loggedInSession();

    await failDeleteUser(harness);

    expect(harness.router.url).toBe("/workspace/w1");
  });
});
