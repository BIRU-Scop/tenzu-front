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

import { expect, Page } from "@playwright/test";
import { clearTokensFrom, firstWorkspaceUrl, logIn, OTHER_USER, test, USER } from "./session-helpers";

async function goToAWorkspacePageUrl(page: Page): Promise<string> {
  await page.goto("/");
  await page.goto(await firstWorkspaceUrl(page));
  await expect(page).toHaveURL(/\/workspace\/[^/]+\/.+/);
  return new URL(page.url()).pathname;
}

test.describe("reconnection landing", () => {
  test("reconnecting as the same user after an eviction lands on the page that was left", async ({ freshSession }) => {
    const { context, page } = await freshSession();
    const previousPageUrl = await goToAWorkspacePageUrl(page);
    const otherTab = await context.newPage();
    await otherTab.goto("/");
    await clearTokensFrom(otherTab);
    await expect(page).toHaveURL(/\/login/);

    await logIn(page, USER);

    await expect(page).toHaveURL(previousPageUrl);
  });

  test("reconnecting as another user after an eviction lands on the homepage", async ({ freshSession }) => {
    const { context, page } = await freshSession();
    await goToAWorkspacePageUrl(page);
    const otherTab = await context.newPage();
    await otherTab.goto("/");
    await clearTokensFrom(otherTab);
    await expect(page).toHaveURL(/\/login/);

    await logIn(page, OTHER_USER);

    await expect(page).toHaveURL("/");
  });
});
