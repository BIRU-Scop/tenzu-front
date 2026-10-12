import { execSync } from "node:child_process";

if (!process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD) {
  execSync("playwright install chromium", { stdio: "inherit" });
}
