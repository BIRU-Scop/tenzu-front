import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/settings/delete");
  await page.getByTestId("navigation.delete").click();
  await expect(page.locator(".mdc-checkbox")).toBeVisible();
});

test.describe("delete", () => {
  test("should not have any automatically detectable accessibility issues", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
