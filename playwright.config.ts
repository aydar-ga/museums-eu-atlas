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
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.02,
      pathTemplate: "{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}"
    }
  },
  use: {
    baseURL,
    trace: "retain-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      testIgnore: /visual\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "visual",
      testMatch: /visual\.spec\.ts/,
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
        // A production build, as shipped. NEXT_PUBLIC_E2E_TEST_MODE keeps the ?testUser= shortcut in it.
        command: "npm run build:app && npm run start",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        // The app has no fallback signing key; this throwaway one exists only for the server Playwright starts.
        env: { AUTH_SECRET: "playwright-e2e-only-not-a-secret", NEXT_PUBLIC_E2E_TEST_MODE: "1" },
        timeout: 600_000,
        stdout: "pipe",
        stderr: "pipe"
      }
});
