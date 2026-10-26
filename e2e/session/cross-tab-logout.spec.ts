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

import { expect } from "@playwright/test";
import { logOut, test } from "./session-helpers";

test.describe("cross-tab logout", () => {
  test("logout in one tab shows the from-another-tab banner on the login page of the other tab", async ({
    freshSession,
  }) => {
    const { context, page } = await freshSession();
    const otherTab = await context.newPage();
    await otherTab.goto("/");
    await expect(otherTab).toHaveURL("/");

    await logOut(page);

    await expect(page).toHaveURL(/\/login/);
    await expect(otherTab).toHaveURL(/\/login/);
    await expect(otherTab.getByRole("alert")).toContainText(/from another tab/i);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("logout in one tab leaves the session of another device untouched", async ({ freshSession }) => {
    const thisDevice = await freshSession();
    const otherDevice = await freshSession();

    await logOut(thisDevice.page);
    await expect(thisDevice.page).toHaveURL(/\/login/);

    await otherDevice.page.reload();
    await expect(otherDevice.page).toHaveURL("/");
    await expect(otherDevice.page.getByRole("alert")).toHaveCount(0);
  });
});
