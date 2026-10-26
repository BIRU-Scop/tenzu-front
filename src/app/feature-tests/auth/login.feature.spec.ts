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

import { sessionHarness } from "./session-harness";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";
import { TOKENS_KEY } from "@tenzu/repository/auth/token/token-repository.service";
import { NEXT_KEY, RememberedNextStore } from "@tenzu/repository/auth/stores/remembered-next.store";
import { UserStore } from "@tenzu/repository/user/user.store";
import { makeUser } from "@tenzu/repository/user/user.factories";

describe("login", () => {
  it("submitting the login form lands on next", async () => {
    const { submitLoginForm, router } = await sessionHarness({ url: "/login?next=/workspace/w1" });

    await submitLoginForm("1user");

    expect(router.url).toBe("/workspace/w1");
  });

  it("submitting the login form writes the tokens under TOKENS_KEY", async () => {
    const { submitLoginForm } = await sessionHarness({ url: "/login?next=/workspace/w1" });

    const tokens = await submitLoginForm("1user");

    expect(JSON.parse(localStorage.getItem(TOKENS_KEY) ?? "null")).toEqual(tokens);
  });

  it("submitting the login form sets userStore.myUser to the user of GET /users/me", async () => {
    const { submitLoginForm } = await sessionHarness({ url: "/login" });

    await submitLoginForm("1user");

    expect(TestBed.inject(UserStore).myUser()).toEqual(makeUser({ username: "1user" }));
  });

  it("submitting the login form calls wsService.command with signin and the access token", async () => {
    const { submitLoginForm, wsServiceMock } = await sessionHarness({ url: "/login" });

    const tokens = await submitLoginForm("1user");

    expect(wsServiceMock.command).toHaveBeenCalledWith({ command: "signin", token: tokens.access });
  });

  it("submitting the login form as another user lands on /", async () => {
    const { submitLoginForm, router } = await sessionHarness({ url: "/login" });
    TestBed.inject(RememberedNextStore).remember("/workspace/w1", "2user");

    await submitLoginForm("1user");

    expect(router.url).toBe("/");
  });

  it("submitting the login form as another user removes NEXT_KEY", async () => {
    const { submitLoginForm } = await sessionHarness({ url: "/login" });
    TestBed.inject(RememberedNextStore).remember("/workspace/w1", "2user");

    await submitLoginForm("1user");

    expect(sessionStorage.getItem(NEXT_KEY)).toBeNull();
  });

  it("submitting the login form as the same user after tokensCleared lands on next", async () => {
    const { submitLoginForm, router, anotherTab, navigatedTo } = await sessionHarness({
      tokens: makeTokens({ username: "1user" }),
      url: "/workspace/w1",
    });
    anotherTab.clearTokens();
    await navigatedTo("/login");

    await submitLoginForm("1user");

    expect(router.url).toBe("/workspace/w1");
  });
});
