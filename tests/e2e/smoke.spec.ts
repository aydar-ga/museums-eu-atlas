import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("loads index and all museum cards", async ({ page }) => {
  await expect(page.getByTestId("app-title")).toHaveText("Europe's Top 50 Art Museums Atlas");
  await expect(page.getByTestId("museum-card")).toHaveCount(50);
  await expect(page.getByTestId("progress-text")).toContainText("0 of 50");
  await expect(page.getByTestId("popularity-filter")).toHaveCount(0);
  await expect(page.getByTestId("family-filter")).toHaveCount(0);
  await expect(page.getByTestId("online-filter")).toHaveCount(0);
});

test("filters by search country and category", async ({ page }) => {
  await page.getByTestId("search-input").fill("Van Gogh Museum");
  await expect(page.locator("[data-testid='museum-card']:visible")).toHaveCount(1);
  await expect(page.getByTestId("museum-card").filter({ hasText: "Van Gogh" })).toBeVisible();

  await page.getByTestId("reset-filters").click();
  await page.getByTestId("country-filter").selectOption("France");
  await page.getByTestId("category-filter").selectOption("Fine Art");

  await expect(page.locator("[data-testid='museum-card']:visible")).toHaveCount(4);
  await expect(page.getByTestId("museum-card").filter({ hasText: "Louvre" })).toBeVisible();

  await page.getByTestId("search-input").fill("zzzz-no-match");
  await expect(page.getByTestId("no-results-copy")).toContainText("great galleries are still waiting");
});

test("switches light and dark modes and persists preference", async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByTestId("theme-light").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByTestId("theme-light")).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => localStorage.getItem("museumsEuAtlasTheme"))).toBe("light");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.getByTestId("theme-dark").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("persists planned and visited state with matching filters", async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const planButton = page.getByTestId("plan-toggle-louvre-museum");
  await planButton.click();
  await expect(planButton).toHaveAttribute("aria-pressed", "true");
  await expect(planButton).toHaveText("Planned");

  const louvreButton = page.getByTestId("visit-toggle-louvre-museum");
  await louvreButton.click();
  await expect(louvreButton).toHaveAttribute("aria-pressed", "true");
  await expect(louvreButton).toHaveText("Visited");
  await expect(page.getByTestId("milestone-message")).toContainText("First museum marked");

  await page.getByTestId("visited-filter").check();
  await expect(page.locator("[data-testid='museum-card']:visible")).toHaveCount(1);
  await page.getByTestId("visited-filter").uncheck();
  await page.getByTestId("planned-filter").check();
  await expect(page.locator("[data-testid='museum-card']:visible")).toHaveCount(1);

  await page.reload();
  await expect(page.getByTestId("visit-toggle-louvre-museum")).toHaveText("Visited");
  await expect(page.getByTestId("plan-toggle-louvre-museum")).toHaveText("Planned");
});

test("migrates legacy localStorage ids", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("visitedMuseums", JSON.stringify(["0"]));
  });
  await page.reload();

  await expect(page.getByTestId("visit-toggle-louvre-museum")).toHaveText("Visited");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("visitedMuseums") || "[]")[0])).toBe("louvre-museum");
});

test("navigates to detail page", async ({ page }) => {
  await page.getByTestId("details-link-louvre-museum").click();

  await expect(page).toHaveURL(/\/museums\/louvre-museum\/?$/);
  await expect(page.getByTestId("detail-title")).toHaveText("Louvre Museum");
  await expect(page.getByTestId("museum-detail")).toContainText("Why visit");
  await expect(page.getByTestId("breadcrumb-all-museums")).toBeVisible();
  await expect(page.getByTestId("breadcrumb-all-museums")).toContainText("All museums");
});

test("runs magic link signup flow", async ({ page }) => {
  await page.getByTestId("login-link").click();
  await expect(page.getByTestId("side-panel")).toBeVisible();
  await expect(page.getByTestId("app-stage")).toHaveAttribute("data-panel-open", "true");
  await expect(page.getByTestId("museum-card").first()).toBeVisible();
  await expect(page.getByTestId("auth-title")).toHaveText("Magic link sign up");

  await page.getByTestId("auth-submit").click();
  await expect(page.getByTestId("auth-error-summary")).toHaveText("Enter a valid email address.");

  await page.getByTestId("auth-email").fill("e2e@example.com");
  await page.getByTestId("auth-submit").click();
  await expect(page.getByTestId("magic-link-sent")).toBeVisible();

  await page.getByTestId("magic-link-open").click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByTestId("account-email")).toHaveText("e2e@example.com");
});

test("handles fallback image behavior", async ({ page }) => {
  const image = page.getByTestId("museum-image-louvre-museum");
  await image.evaluate((img) => {
    img.setAttribute("src", "/images/not-found.jpg");
    img.dispatchEvent(new Event("error"));
  });
  await expect(image).toHaveAttribute("src", "/images/fallback_museum.svg");
});
