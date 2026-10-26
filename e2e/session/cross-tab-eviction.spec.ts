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
import { clearTokensFrom, TOKENS_KEY } from "./session-helpers";

test.describe("cross-tab eviction", () => {
  test("removing the tokens in another tab shows the signed-out banner on the login page", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");

    const otherTab = await context.newPage();
    await otherTab.goto("/");
    await clearTokensFrom(otherTab);

    await expect(page).toHaveURL(/\/login/);
    const banner = page.getByRole("alert");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/you were signed out\./i);
    expect(await page.evaluate((key) => localStorage.getItem(key), TOKENS_KEY)).toBeNull();
  });

  test("a reload of the login page removes the banner", async ({ page, context }) => {
    await page.goto("/");
    const otherTab = await context.newPage();
    await otherTab.goto("/");

    await clearTokensFrom(otherTab);

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("alert")).toBeVisible();

    await page.reload();

    await expect(page.getByRole("textbox", { name: /email or username/i })).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
});
