import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: "e2e",

  // Serial: the tests share one storageState and a refresh token is single-use.
  fullyParallel: false,
  workers: 1,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env["CI"],

  // Retry on CI only.
  retries: process.env["CI"] ? 2 : 0,

  // Reporter to use
  reporter: "html",

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: "https://local-tenzu.biru.ovh",

    // Collect trace when retrying the failed test.
    trace: "on-first-retry",
  },
  // Configure projects for major browsers.
  projects: [
    // Setup project
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
  // Run your local dev server before starting the tests.
  webServer: {
    command: "npm run start",
    url: "https://local-tenzu.biru.ovh",
    reuseExistingServer: !process.env["CI"],
  },
});
