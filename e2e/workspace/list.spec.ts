import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("css=.mat-mdc-card").nth(0)).toBeVisible();
  await expect(page.locator("css=.mat-mdc-card").nth(1)).toBeVisible();
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
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.getByTestId("name-input").fill(workspaceName);
    await page.getByTestId("enter-name-submit").click();
    // should close the dialog
    await expect(dialog).not.toBeVisible();
    // should display the new workspace in list
    const firstCard = page.locator("css=.mat-mdc-card").first();
    await expect(firstCard.locator("css=.mat-mdc-card-title")).toHaveText(workspaceName);
    await expect(firstCard.locator("css=.avatar").first()).toHaveText(workspaceInitials);
  });
  test("should display required name error", async ({ page }) => {
    await page.getByTestId("create-workspace-open").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByTestId("enter-name-submit").click();
    await expect(page.getByTestId("name-required-error")).toBeVisible();
  });
});
