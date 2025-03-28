import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  const firstWorkspaceLink = page.locator("css=.mat-mdc-card").nth(0).getByRole("link");
  await expect(firstWorkspaceLink).toBeVisible();
  await firstWorkspaceLink.click();
  await page.getByTestId("projects-link").click();
  await expect(page.getByRole("heading")).toBeVisible();
});

test.describe("Project list", () => {
  test("should not have any automatically detectable accessibility issues", async ({ page }) => {
    await page.getByTestId("projects-link").click();
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
