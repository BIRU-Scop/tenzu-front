import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Create from workspace page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("css=.mat-mdc-card").nth(0)).toBeVisible();
    await expect(page.locator("css=.mat-mdc-card").nth(1)).toBeVisible();
    const firstWorkspace = page.locator("css=.mat-mdc-card").first();
    await firstWorkspace.getByRole("button").click();
    await expect(page.getByTestId("project-name-input")).toBeVisible();
  });
  test("should not have any automatically detectable accessibility issues", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  test("should create a project", async ({ page }) => {
    const [projectName, projectInitials] = [`Test Project`, `TP`];
    const responsePromise = page.waitForResponse("/api/v2/projects");
    await page.getByTestId("project-name-input").fill(projectName);
    await expect(page.locator("css=.avatar-lg")).toHaveText(projectInitials);
    await page.getByTestId("new-project-submit").click();
    const response = await responsePromise;
    expect(response.status()).toEqual(200);
    // should delete created project
    await page.getByTestId("settings-link").click();
    await page.locator("css=.error-button").click();
    await page.getByRole("dialog").locator("css=.error-button").click();
    await expect(page).toHaveURL("/");
  });
  test("should display required name error", async ({ page }) => {
    await page.getByTestId("new-project-submit").click();
    await expect(page.getByTestId("project-name-required-error")).toBeVisible();
  });
});
