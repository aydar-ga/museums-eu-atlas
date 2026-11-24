import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.APP_PORT ?? 5001);
const baseURL =
  process.env.APP_BASE_URL?.replace(/\/$/, "") ?? `http://127.0.0.1:${port}`;
const isExternalTarget = baseURL !== `http://127.0.0.1:${port}`;
// A Chromium to use instead of Playwright's own download (set by scripts/e2e-local.mjs where the download is blocked).
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

// The server Playwright starts must never reach real data or send real email, whatever .env.local holds:
// Next.js does not override a variable that is already set, even to "".
const noSecrets = {
  DATABASE_URL: "",
  POSTGRES_URL: "",
  POSTGRES_PRISMA_URL: "",
  RESEND_API_KEY: "",
  AUTH_EMAIL_ENABLED: "false",
  OWNER_ALERT_EMAIL: "",
  CRON_SECRET: ""
};

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
    // Video needs Playwright's own ffmpeg download; local runs that cannot get it keep traces only.
    video: process.env.PW_VIDEO === "off" ? "off" : "retain-on-failure",
    launchOptions: { executablePath }
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
        // A server already running (e.g. `npm run dev` with .env.local) may hold production secrets; reuse only on request.
        reuseExistingServer: !process.env.CI && process.env.PW_REUSE_SERVER === "1",
        // The app has no fallback signing key; this throwaway one exists only for the server Playwright starts.
        env: { ...noSecrets, AUTH_SECRET: "playwright-e2e-only-not-a-secret", NEXT_PUBLIC_E2E_TEST_MODE: "1" },
        timeout: 600_000,
        stdout: "pipe",
        stderr: "pipe"
      }
});
