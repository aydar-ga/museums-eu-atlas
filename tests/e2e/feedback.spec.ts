import { expect, test } from "@playwright/test";

// The API is stubbed: the route itself is tested against a real Postgres in src/app/api/feedback/route.test.ts,
// and e2e runs must never write visitor messages to a shared database.
test("a visitor reaches the feedback form from the footer and sends a message without seeing the owner's email", async ({ page }) => {
  let posted: Record<string, unknown> | null = null;
  await page.route("**/api/feedback", async (route) => {
    posted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });

  await page.goto("/");
  const link = page.getByTestId("footer-feedback-link");
  await link.click();
  const dialog = page.getByRole("dialog", { name: "Feedback" });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(dialog.getByRole("heading", { level: 2, name: "Say hello" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("@gmail.com");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(link).toBeFocused();
  await link.click();

  await page.getByTestId("feedback-kind-bug").check();
  await page.getByTestId("feedback-submit").click();
  await expect(page.getByTestId("feedback-error")).toContainText("at least 5 characters");

  await page.getByTestId("feedback-message").fill("The Prado card image does not load on my phone.");
  await page.getByTestId("feedback-email").fill("visitor@example.com");
  await page.getByTestId("feedback-submit").click();

  await expect(page.getByTestId("feedback-sent")).toContainText("Thank you");
  expect(posted).toMatchObject({ kind: "bug", message: "The Prado card image does not load on my phone.", email: "visitor@example.com", website: "" });
});

test("a one-click 'I'd like more' needs no message", async ({ page }) => {
  await page.route("**/api/feedback", (route) => route.fulfill({ status: 200, contentType: "application/json", body: "{\"ok\":true}" }));
  await page.goto("/feedback");
  await page.getByTestId("feedback-submit").click();
  await expect(page.getByTestId("feedback-sent")).toBeVisible();
});
