import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/reset-password");
  await expect(page.getByTestId("email-input")).toBeVisible();
});

test.describe("reset-password", () => {
  test("should not have any automatically detectable accessibility issues", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  test("should catch malformed token", async ({ page }) => {
    await page.goto("/reset-password/weirdTokenNotWorking");
    await expect(page.getByText("Invalid or malformed token")).toBeVisible();
  });
});

test.describe("reset-password:confirmation", () => {
  test("should not have any automatically detectable accessibility issues", async ({ page }) => {
    await page.getByTestId("email-input").fill("myTestEmail@superCompany.com");
    await page.getByTestId("submitResetPassword-button").click();
    await expect(await page.getByTestId("goBackToLogin-button")).toBeVisible();
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});