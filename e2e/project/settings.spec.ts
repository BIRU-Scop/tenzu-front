import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  const firstProjectLink = page.locator("css=.mat-mdc-card").nth(1).getByRole("link");
  await expect(firstProjectLink).toBeVisible();
  await firstProjectLink.click();
  await page.getByTestId("settings-link").click();
  await expect(page.getByTestId("project-name-input")).toBeVisible();
});

test.describe("Project Settings", () => {
  test("should not have any automatically detectable accessibility issues", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
