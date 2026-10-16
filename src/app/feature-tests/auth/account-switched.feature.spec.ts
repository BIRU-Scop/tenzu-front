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

import { loggedInSession } from "./session-harness";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";
import { TOKENS_KEY } from "@tenzu/repository/auth/token/token-repository.service";
import { NEXT_KEY } from "@tenzu/repository/auth/stores/remembered-next.store";
import { translation } from "@tenzu/utils/testing/translation";

describe("account switched", () => {
  const otherTokens = makeTokens({ username: "2user" });

  it("writeTokens of another username from another tab navigates to /login with the accountSwitched message", async () => {
    const { anotherTab, navigatedTo, alertText } = await loggedInSession();

    anotherTab.writeTokens(otherTokens);
    await navigatedTo("/login");

    expect(alertText()).toBe(translation("auth.login.exit_reason.accountSwitched"));
  });

  it("writeTokens of another username from another tab keeps TOKENS_KEY equal to the written tokens", async () => {
    const { anotherTab, navigatedTo } = await loggedInSession();

    anotherTab.writeTokens(otherTokens);
    await navigatedTo("/login");

    expect(JSON.parse(localStorage.getItem(TOKENS_KEY) ?? "null")).toEqual(otherTokens);
  });

  it("writeTokens of another username from another tab removes NEXT_KEY", async () => {
    const { anotherTab, navigatedTo } = await loggedInSession();

    anotherTab.writeTokens(otherTokens);
    await navigatedTo("/login");

    expect(sessionStorage.getItem(NEXT_KEY)).toBeNull();
  });
});
