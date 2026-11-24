import { expect, test } from "@playwright/test";

// The gold foil may only show while its wipe animation plays. Where animations do not run (screenshot tools,
// browsers or settings that stop them), its resting style must already be fully wiped.
test("the scratch-off foil never covers the image when animations are off", async ({ page }) => {
  await page.goto("/");
  await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; }" });
  await page.getByTestId("visit-toggle-louvre-museum").click();

  const foil = page.getByTestId("scratch-foil-louvre-museum");
  await expect(foil).toBeAttached();
  expect(await foil.evaluate((element) => getComputedStyle(element).clipPath)).toBe("inset(0px 0px 0px 100%)");
});
