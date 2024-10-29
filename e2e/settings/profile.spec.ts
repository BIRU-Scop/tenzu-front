import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByTestId("fullName-input")).toBeVisible();
  await expect(page.getByTestId("lang-select")).toBeVisible();
});

test.describe("profile", () => {
  test("should not have any automatically detectable accessibility issues", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  test("should modify the profile", async ({ page }) => {
    const responsePromise = page.waitForResponse("/api/v2/my/user");
    await page.getByTestId("fullName-input").fill("Toto");
    await page.getByTestId("saveProfileSettings-button").click();
    let response = await responsePromise;
    expect(response.status()).toEqual(200);
    expect(await page.getByTestId("fullName-input").inputValue()).toEqual("Toto");
    await page.getByTestId("fullName-input").fill("1user");
    await page.getByTestId("saveProfileSettings-button").click();
    response = await responsePromise;
    expect(response.status()).toEqual(200);
    expect(await page.getByTestId("fullName-input").inputValue()).toEqual("1user");
  });
});
