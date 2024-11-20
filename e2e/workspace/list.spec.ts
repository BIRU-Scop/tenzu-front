import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("css=.mat-mdc-card").nth(0)).toBeVisible();
});

test.describe("workspace list", () => {
  test("should not have any automatically detectable accessibility issues", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe("workspace create", () => {
  test("should open/close the create dialog", async ({ page }) => {
    await page.getByTestId("create-workspace-open").click();
    await page.getByTestId("close-dialog").click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
  test("should create a workspace", async ({ page }) => {
    const randomPrefix = new Date().getSeconds().toString();
    const randomSuffix = new Date().getMinutes().toString();
    const [workspaceName, workspaceInitials] = [
      `${randomPrefix} ${randomSuffix}`,
      `${randomPrefix.substring(0, 1)}${randomSuffix.substring(0, 1)}`,
    ];
    // should open the dialog
    await page.getByTestId("create-workspace-open").click();
    // should fill and submit form
    const dialogName = page.getByRole("dialog");
    await expect(dialogName).toBeVisible();
    await dialogName.getByTestId("name-input").fill(workspaceName);
    await dialogName.getByTestId("enter-name-submit").click();
    // should close the dialog
    await expect(dialogName).not.toBeVisible();
    // should display the new workspace in list
    const firstCard = page.locator("css=.mat-mdc-card").first();
    await expect(firstCard.locator("css=.mat-mdc-card-title")).toHaveText(workspaceName);
    await expect(firstCard.locator("css=.avatar").first()).toHaveText(workspaceInitials);
    // delete the created workspace
    await firstCard.getByRole("link").click();
    await page.getByTestId("settings-link").click();
    await page.locator("css=.error-button").click();
    await page.getByRole("dialog").locator("css=.error-button").click();
    await expect(page).toHaveURL("/");
  });
  test("should display required name error", async ({ page }) => {
    await page.getByTestId("create-workspace-open").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByTestId("enter-name-submit").click();
    await expect(page.getByTestId("name-required-error")).toBeVisible();
  });
});
