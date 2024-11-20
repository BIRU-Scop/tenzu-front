import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  const firstProjectLink = page.locator("css=.mat-mdc-card").nth(1).getByRole("link");
  await expect(firstProjectLink).toBeVisible();
  await firstProjectLink.click();
  await expect(page.locator(".kanban-viewport")).toBeVisible();
  // create a story
  const storyName = "Story test";
  const dialog = page.getByRole("dialog");
  await page.locator("css=.primary-button").last().click();
  await page.getByTestId("name-input").fill(storyName);
  await page.getByTestId("enter-name-submit").click();
  // should close the dialog
  await expect(dialog).not.toBeVisible();
  // should display the new story in list
  const firstStory = page.locator("css=.mat-mdc-card").last();
  expect(await firstStory.locator("css=.mat-mdc-card-title").innerHTML()).toMatch(storyName);
  // open new story
  await firstStory.getByRole("link").click();
  await expect(page.locator(".codex-editor")).toBeVisible();
});

test.describe("Story", () => {
  test("should not have any automatically detectable accessibility issues", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
