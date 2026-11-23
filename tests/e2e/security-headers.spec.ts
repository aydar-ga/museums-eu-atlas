import { expect, test } from "@playwright/test";

const expectedHeaders: Record<string, RegExp> = {
  "strict-transport-security": /^max-age=63072000; includeSubDomains$/,
  "x-content-type-options": /^nosniff$/,
  "referrer-policy": /^strict-origin-when-cross-origin$/,
  "permissions-policy": /^camera=\(\), microphone=\(\), geolocation=\(\)$/,
  "x-frame-options": /^DENY$/,
  // Enforced: framing only. The full policy is report-only until it has run clean in production.
  "content-security-policy": /^frame-ancestors 'none'$/,
  "content-security-policy-report-only": /default-src 'self';.*object-src 'none';.*base-uri 'self';.*frame-ancestors 'none'/
};

for (const path of ["/", "/museums/louvre-museum", "/api/healthz"]) {
  test(`sends the security headers on ${path}`, async ({ request }) => {
    const response = await request.get(path);
    const headers = response.headers();

    for (const [name, pattern] of Object.entries(expectedHeaders)) {
      expect(headers[name], name).toMatch(pattern);
    }
    expect(headers["x-powered-by"]).toBeUndefined();
  });
}

test("pages raise no Content-Security-Policy violations", async ({ page }) => {
  await page.addInitScript(() => {
    const violations: string[] = [];
    Object.assign(window, { cspViolations: violations });
    document.addEventListener("securitypolicyviolation", (event) => {
      violations.push(`${event.effectiveDirective} ${event.blockedURI}`);
    });
  });

  for (const path of ["/", "/museums/louvre-museum", "/account"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const violations = await page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations);
    expect(violations, path).toEqual([]);
  }
});
