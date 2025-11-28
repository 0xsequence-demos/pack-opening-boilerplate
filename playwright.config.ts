import { defineConfig, devices } from "@playwright/test";

// Default to running against Wrangler so functions are available.
// Set USE_VITE_E2E=1 to opt back into the Vite dev server.
import { config } from "dotenv";
config();
const useWrangler = process.env.USE_VITE_E2E === "1" ? false : true;
const host = process.env.PLAYWRIGHT_HOST ?? process.env.HOST ?? "localhost";
const port = Number(process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? "4444");
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://${host}:${port}`;
const storageState = undefined; // persistent userDataDir is the source of truth

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    video: "retain-on-failure",
    storageState,
  },
  webServer: {
    command: useWrangler
      ? `HOME=${process.cwd()} MINIFLARE_DISABLE_FILE_WATCH=1 pnpm run build && HOME=${process.cwd()} MINIFLARE_DISABLE_FILE_WATCH=1 wrangler pages dev dist --port ${port} --ip ${host} --log-level warn`
      : `PORT=${port} pnpm run dev:vite -- --host ${host} --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
