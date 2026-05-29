import { expect, test } from "@playwright/test";

async function gridColumnCount(page: import("@playwright/test").Page) {
  return page.locator(".museum-list").evaluate((element) => {
    return window.getComputedStyle(element).gridTemplateColumns.split(" ").length;
  });
}

test("mobile layout does not overflow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("app-title")).toBeVisible();
  await expect(page.locator("[data-testid='museum-card']:visible").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test("stacks filters and uses a single-column museum grid on narrow phones", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");

  await expect(page.getByTestId("search-input")).toBeVisible();
  await expect(page.getByTestId("country-filter")).toBeVisible();

  const toolbar = page.locator(".toolbar-row-search");
  const toolbarBox = await toolbar.boundingBox();
  const searchBox = await page.getByTestId("search-input").boundingBox();
  expect(toolbarBox && searchBox).toBeTruthy();
  if (toolbarBox && searchBox) {
    expect(searchBox.width).toBeGreaterThanOrEqual(toolbarBox.width * 0.9);
  }

  expect(await gridColumnCount(page)).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test("uses two museum columns on small tablets and keeps header visible", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto("/");

  expect(await gridColumnCount(page)).toBe(2);
  await expect(page.getByTestId("theme-dark")).toBeVisible();
  await expect(page.getByTestId("login-link")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test("expands to three columns on medium screens", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1024 });
  await page.goto("/");

  expect(await gridColumnCount(page)).toBe(3);
});

test("uses four columns on large tablet widths", async ({ page }) => {
  await page.setViewportSize({ width: 980, height: 1024 });
  await page.goto("/");

  expect(await gridColumnCount(page)).toBe(4);
});

test("uses five columns on desktop widths", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  expect(await gridColumnCount(page)).toBe(5);
  await expect(page.locator("[data-testid='museum-card']:visible")).toHaveCount(50);
});
