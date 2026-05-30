import { expect, test } from "@playwright/test";

const visualViewport = { width: 1280, height: 900 };

async function stabilizePage(page: import("@playwright/test").Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
        font-family: Arial, Helvetica, sans-serif !important;
      }
    `
  });
  await page.locator(".hero").waitFor({ state: "visible" });
  await page.waitForFunction(() => document.fonts.ready);
}

test.describe("visual regression", () => {
  test.use({ viewport: visualViewport });

  test("home hero dark theme", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await stabilizePage(page);
    await expect(page.locator(".hero")).toHaveScreenshot("home-hero-dark.png");
  });

  test("home hero light theme", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByTestId("theme-light").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await stabilizePage(page);
    await expect(page.locator(".hero")).toHaveScreenshot("home-hero-light.png");
  });

  test("utility rail signed-out dark theme", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await stabilizePage(page);
    await expect(page.locator(".utility-rail")).toHaveScreenshot("utility-rail-signed-out-dark.png");
  });

  test("signed-in account panel", async ({ page }) => {
    await page.goto("/account?testUser=e2e%40example.com", { waitUntil: "domcontentloaded" });
    await stabilizePage(page);
    await expect(page.getByTestId("side-panel")).toHaveScreenshot("account-panel-signed-in.png");
    await expect(page.locator(".utility-rail")).toHaveScreenshot("utility-rail-signed-in-dark.png");
  });

  test("museum card planned and visited states", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByTestId("plan-toggle-louvre-museum").click();
    await page.getByTestId("visit-toggle-louvre-museum").click();
    await stabilizePage(page);
    await expect(page.getByTestId("museum-card").filter({ hasText: "Louvre Museum" })).toHaveScreenshot(
      "museum-card-louvre-planned-visited-dark.png"
    );
  });
});
