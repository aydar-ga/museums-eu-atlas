import { expect, test } from "@playwright/test";

test("home declares artmuse.app as canonical", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://artmuse.app");
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "ArtMuse");
  await expect(page).toHaveTitle("ArtMuse — Europe's Top 50 Art Museums Atlas");
});

test("museum page has its own canonical URL", async ({ page }) => {
  await page.goto("/museums/louvre-museum");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://artmuse.app/museums/louvre-museum");
  await expect(page).toHaveTitle("Louvre Museum — ArtMuse");
});

test("serves robots.txt and sitemap.xml", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap: https://artmuse.app/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("<loc>https://artmuse.app/museums/louvre-museum</loc>");
});
