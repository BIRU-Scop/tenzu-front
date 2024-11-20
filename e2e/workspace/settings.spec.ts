import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  const firstWorkspaceLink = page.locator("css=.mat-mdc-card").first().getByRole("link");
  await expect(firstWorkspaceLink).toBeVisible();
  await firstWorkspaceLink.click();
  await page.getByTestId("settings-link").click();
  await expect(page.locator("button[type=submit]")).toBeVisible();
});

test.describe("Workspace settings", () => {
  test("should not have any automatically detectable accessibility issues", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
