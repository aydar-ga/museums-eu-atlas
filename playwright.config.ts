import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.APP_PORT ?? 5001);
const baseURL =
  process.env.APP_BASE_URL?.replace(/\/$/, "") ?? `http://127.0.0.1:${port}`;
const isExternalTarget = baseURL !== `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["github"], ["junit", { outputFile: "reports/e2e.xml" }]]
    : [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "mobile",
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices["Pixel 5"] }
    }
  ],
  webServer: isExternalTarget
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        stdout: "pipe",
        stderr: "pipe"
      }
});
