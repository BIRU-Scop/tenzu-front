import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach("Load Email signup form", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByTestId("showEmailSignupForm-button")).toBeVisible();
  await page.getByTestId("showEmailSignupForm-button").click();
  await expect(page.getByTestId("fullName-input")).toBeVisible();
  await expect(page.getByTestId("email-input")).toBeVisible();
  await expect(page.getByTestId("password-input")).toBeVisible();
  await expect(page.getByTestId("submitCreateAccount-button")).toBeVisible();
});

test.describe("Signup", () => {
  test("should not have any automatically detectable accessibility issues", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  test("Happy Path: All values are valid and submit redirects to email notification", async ({ page }) => {
    const emailStr = "valid.email@mail.com";
    await page.getByTestId("fullName-input").fill("John Doe");
    await page.getByTestId("email-input").fill(emailStr);
    await page.getByTestId("password-input").fill("diversity3VALID");
    await page.getByTestId("submitCreateAccount-button").click();
    await expect(page.getByTestId("sentEmail-block")).toContainText(emailStr);
    await expect(page.getByTestId("resendMail-button")).toBeVisible();
  });
  test("Should display required fullName error", async ({ page }) => {
    await page.getByTestId("email-input").fill("valid@ourmail.com");
    await page.getByTestId("password-input").fill("Valid123");
    await page.getByTestId("submitCreateAccount-button").click();
    await expect(page.getByTestId("fullName-required-error")).toBeVisible();
  });
  test("Should display required email error", async ({ page }) => {
    await page.getByTestId("fullName-input").fill("My Fullname");
    await page.getByTestId("password-input").fill("Valid123");
    await page.getByTestId("submitCreateAccount-button").click();
    await expect(page.getByTestId("email-required-error")).toBeVisible();
  });
  test("Should display required password error", async ({ page }) => {
    await page.getByTestId("fullName-input").fill("My Fullname");
    await page.getByTestId("email-input").fill("valid@ourmail.com");
    await page.getByTestId("submitCreateAccount-button").click();
    await expect(page.getByTestId("password-required-error")).toBeVisible();
  });
});
