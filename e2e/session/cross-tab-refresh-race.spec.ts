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
import { firstWorkspaceLink, test, TOKENS_KEY } from "./session-helpers";

function base64Url(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function expiredAccessToken(): string {
  const header = base64Url({ alg: "HS256", typ: "JWT" });
  const payload = base64Url({ token_type: "access", exp: Math.floor(Date.now() / 1000) - 60 });
  return `${header}.${payload}.signature-is-never-checked-by-the-local-expiry-test`;
}

async function expireTheAccessToken(page: Page): Promise<void> {
  await page.evaluate(
    ([key, access]) => {
      const tokens = JSON.parse(localStorage.getItem(key) ?? "null");
      localStorage.setItem(key, JSON.stringify({ ...tokens, access }));
    },
    [TOKENS_KEY, expiredAccessToken()],
  );
}

test.describe("cross-tab refresh race", () => {
  test("navigating in two tabs with an expired access token refreshes once", async ({ freshSession }) => {
    const { context, page } = await freshSession();
    const otherTab = await context.newPage();
    await otherTab.goto("/");
    await expect(firstWorkspaceLink(page)).toBeVisible();
    await expect(firstWorkspaceLink(otherTab)).toBeVisible();

    const refreshStatuses: number[] = [];
    for (const tab of [page, otherTab]) {
      tab.on("response", (response) => {
        if (response.url().includes("/auth/token/refresh")) {
          refreshStatuses.push(response.status());
        }
      });
    }

    await expireTheAccessToken(page);
    await Promise.all([firstWorkspaceLink(page).click(), firstWorkspaceLink(otherTab).click()]);

    await expect(page).toHaveURL(/\/workspace\//);
    await expect(otherTab).toHaveURL(/\/workspace\//);
    expect(refreshStatuses).toEqual([200]);
  });
});
