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
import { NEXT_KEY } from "@tenzu/repository/auth/stores/remembered-next.store";
import { translation } from "@tenzu/utils/testing/translation";

describe("tokens cleared", () => {
  it("clearTokens from another tab navigates to /login with the tokensCleared message", async () => {
    const { anotherTab, navigatedTo, alertText } = await loggedInSession();

    anotherTab.clearTokens();
    await navigatedTo("/login");

    expect(alertText()).toBe(translation("auth.login.exit_reason.tokensCleared"));
  });

  it("clearTokens from another tab remembers /workspace/w1 as next for 1user", async () => {
    const { anotherTab, navigatedTo } = await loggedInSession();

    anotherTab.clearTokens();
    await navigatedTo("/login");

    expect(JSON.parse(sessionStorage.getItem(NEXT_KEY) ?? "null")).toEqual({
      next: "/workspace/w1",
      username: "1user",
    });
  });
});
