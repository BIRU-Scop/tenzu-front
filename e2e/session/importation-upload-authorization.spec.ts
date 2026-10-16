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

test.describe("importation upload authorization", () => {
  test("a project importation upload sends the Authorization header", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /more/i }).first().click();
    await page.getByRole("menuitem", { name: /project/i }).click();
    await expect(page.getByTestId("project-name-input")).toBeVisible();

    const tusCreation = page.waitForRequest(
      (request) => request.method() === "POST" && request.headers()["tus-resumable"] !== undefined,
    );
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles({
        name: "export.json",
        mimeType: "application/json",
        buffer: Buffer.from("{}"),
      });

    const request = await tusCreation;
    expect(request.headers()["authorization"]).toMatch(/^Bearer .+/);
  });
});
