import { expect, test } from "@playwright/test";

// The server Playwright starts must never reach real data, whatever .env.local holds (see playwright.config.ts).
test("the e2e server runs without a database", async ({ request }) => {
  test.skip(Boolean(process.env.APP_BASE_URL), "only meaningful for the server Playwright starts");
  const response = await request.get("/api/healthz");
  const body = (await response.json()) as { database?: string };
  expect(body.database).toBe("not_configured");
});
