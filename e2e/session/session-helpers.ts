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

import { Browser, BrowserContext, expect, Locator, Page, test as base } from "@playwright/test";

export const TOKENS_KEY = "tenzu:session:tokens";
export const TOKEN_URL = "/api/v1/auth/token";

export type Account = { username: string; password: string };
export type Session = { context: BrowserContext; page: Page };

export const USER: Account = { username: "1user", password: "123123" };
export const OTHER_USER: Account = { username: "2user", password: "123123" };

export const test = base.extend<{ freshSession: (account?: Account) => Promise<Session> }>({
  freshSession: async ({ browser }, use) => {
    const contexts: BrowserContext[] = [];
    await use(async (account = USER) => {
      const session = await openSession(browser, account);
      contexts.push(session.context);
      return session;
    });
    for (const context of contexts) {
      await context.close();
    }
  },
});

export async function clearTokensFrom(tab: Page): Promise<void> {
  await tab.evaluate((key) => localStorage.removeItem(key), TOKENS_KEY);
}

export async function logIn(page: Page, account: Account): Promise<void> {
  const tokenResponse = page.waitForResponse(TOKEN_URL);
  await page.getByRole("textbox", { name: /email or username/i }).fill(account.username);
  await page.getByRole("textbox", { name: /password/i }).fill(account.password);
  await page.getByRole("button", { name: /log in/i }).click();
  expect((await tokenResponse).status()).toBe(200);
}

export async function logOut(page: Page): Promise<void> {
  await page.getByRole("button", { name: /user menu/i }).click();
  await page.getByRole("menuitem", { name: /log ?out/i }).click();
}

export function firstWorkspaceLink(page: Page): Locator {
  return page.locator('a[href^="/workspace/"]').first();
}

export async function firstWorkspaceUrl(page: Page): Promise<string> {
  const link = firstWorkspaceLink(page);
  await expect(link).toBeVisible();
  return (await link.getAttribute("href")) as string;
}

export async function tokensOf(
  page: Page,
  account: Account,
): Promise<{ access: string; refresh: string; username: string }> {
  const response = await page.request.post(TOKEN_URL, { data: account });
  expect(response.status()).toBe(200);
  const { access, refresh } = (await response.json()) as { access: string; refresh: string };
  return { access, refresh, username: account.username };
}

async function openSession(browser: Browser, account: Account): Promise<Session> {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.goto("/login");
  await logIn(page, account);
  await expect(page).toHaveURL("/");
  return { context, page };
}
