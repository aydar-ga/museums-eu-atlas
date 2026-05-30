import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 0));
});

test("shows saved routes panel for signed-in test user", async ({ page }) => {
  await page.goto("/account?testUser=e2e%40example.com", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("saved-routes-panel")).toBeVisible();
  await expect(page.getByTestId("save-route-submit")).toBeVisible();
  await expect(page.getByTestId("account-sync-status")).toBeVisible();
});

test("utility rail host stays fixed while scrolling", async ({ page }) => {
  await page.goto("/");
  const before = await page.getByTestId("utility-rail-host").boundingBox();
  await page.evaluate(() => window.scrollTo(0, 2400));
  const after = await page.getByTestId("utility-rail-host").boundingBox();
  expect(before?.y).toBeCloseTo(after?.y ?? 0, 0);
});
