import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/reset-password");
  await expect(page.getByTestId("email-input")).toBeVisible();
});

test.describe("reset-password", () => {
  test("should disable submit button if mail is incorrect", async ({ page }) => {
    await page.getByTestId("email-input").fill("SuperRandomText");
    await expect(await page.getByTestId("submitCreateAccount-button")).toBeDisabled();
  });

  test("should show confirmation once form is submit", async ({ page }) => {
    await page.getByTestId("email-input").fill("myTestEmail@superCompany.com");
    await page.getByTestId("submitCreateAccount-button").click();
    await expect(await page.getByTestId("goBackToLogin-button")).toBeVisible();
    await expect(await page.getByText("Create a new account")).toBeVisible();
  });

  test("should catch malformed token", async ({ page }) => {
    await page.goto("/reset-password/weirdTokenNotWorking");
    await expect(page.getByText("Invalid or malformed token")).toBeVisible();
  });
});
