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

import { expect, test } from "@playwright/test";
import { OTHER_USER, TOKENS_KEY, tokensOf } from "./session-helpers";

test.describe("account switched", () => {
  test("another account's tokens written by another tab show the account-switched banner on the login page", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    const otherTab = await context.newPage();
    await otherTab.goto("/");
    const otherAccountTokens = await tokensOf(otherTab, OTHER_USER);

    await otherTab.evaluate(([key, tokens]) => localStorage.setItem(key, JSON.stringify(tokens)), [
      TOKENS_KEY,
      otherAccountTokens,
    ] as const);

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("alert")).toContainText(/another account/i);
    expect(await otherTab.evaluate((key) => localStorage.getItem(key), TOKENS_KEY)).toContain(OTHER_USER.username);
  });
});
