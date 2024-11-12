import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByTestId("username-input")).toBeVisible();
  await expect(page.getByTestId("password-input")).toBeVisible();
});

test.describe("login", () => {
  test("should not have any automatically detectable accessibility issues", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  test("should authenticate", async ({ page }) => {
    const responsePromise = page.waitForResponse("/api/v2/auth/token");
    await page.getByTestId("username-input").fill("1user");
    await page.getByTestId("password-input").fill("123123");
    await page.locator("button[type=submit]").click();
    const response = await responsePromise;
    expect(response.status()).toEqual(200);
    await expect(page).toHaveURL("/");
  });
  test("should display required email error", async ({ page }) => {
    await page.getByTestId("password-input").fill("123123");
    await page.locator("button[type=submit]").click();
    await expect(page.getByTestId("username-required-error")).toBeVisible();
  });
  test("should display required password error", async ({ page }) => {
    await page.getByTestId("username-input").fill("1user");
    await page.locator("button[type=submit]").click();
    await expect(page.getByTestId("password-required-error")).toBeVisible();
  });
  test("should display 401 error", async ({ page }) => {
    const responsePromise = page.waitForResponse("/api/v2/auth/token");
    await page.getByTestId("username-input").fill("unknown");
    await page.getByTestId("password-input").fill("123123");
    await page.locator("button[type=submit]").click();
    const response = await responsePromise;
    expect(response.status()).toEqual(401);
    await expect(page.getByTestId("login-401")).toBeVisible();
  });
});
