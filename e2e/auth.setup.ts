import { expect, test as setup } from "@playwright/test";
import { logIn, USER } from "./session/session-helpers";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await logIn(page, USER);
  await expect(page).toHaveURL("/");
  await page.context().storageState({ path: authFile });
});
