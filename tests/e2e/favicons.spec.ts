import { expect, test } from "@playwright/test";

test("exposes favicon, apple, and manifest head tags", async ({ page, request }) => {
  await page.goto("/");

  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/favicons/manifest.json");
  await expect(page.locator('link[rel="icon"]')).not.toHaveCount(0);
  await expect(page.locator('link[rel="apple-touch-icon"]')).not.toHaveCount(0);

  for (const asset of [
    "/favicons/favicon.ico",
    "/favicons/favicon-32x32.png",
    "/favicons/apple-icon.png",
    "/favicons/android-icon-192x192.png",
    "/favicons/manifest.json",
    "/favicons/museum-icon.svg",
    "/icon.svg"
  ]) {
    const response = await request.get(asset);
    expect(response.ok(), `${asset} should be reachable`).toBeTruthy();
  }
});

test("serves the minimal museum svg favicon", async ({ request }) => {
  const response = await request.get("/icon.svg");
  const body = await response.text();

  expect(body).toContain('aria-label="Museum"');
  expect(body).toContain('viewBox="0 0 32 32"');
});
