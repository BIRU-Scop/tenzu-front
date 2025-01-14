import { expect, test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  const responsePromise = page.waitForResponse("/api/v1/auth/token");
  await page.getByTestId("username-input").fill("1user");
  await page.getByTestId("password-input").fill("123123");
  await page.locator("button[type=submit]").click();
  const response = await responsePromise;
  expect(response.status()).toEqual(200);
  await expect(page).toHaveURL("/");
  await page.context().storageState({ path: authFile });
});
