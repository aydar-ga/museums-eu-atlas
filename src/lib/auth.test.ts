import { afterEach, describe, expect, it, vi } from "vitest";

import { consumeDevMagicToken, createDevMagicToken, isValidEmail, requestMagicLink } from "./auth";

describe("auth helpers", () => {
  it("validates email shape", () => {
    expect(isValidEmail("visitor@example.com")).toBe(true);
    expect(isValidEmail("not-email")).toBe(false);
  });

  it("round-trips local dev magic tokens", () => {
    const token = createDevMagicToken("Visitor@Example.com");
    expect(consumeDevMagicToken(token)).toBe("visitor@example.com");
  });

  describe("requestMagicLink", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("surfaces the server's error instead of inventing a local link", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () =>
          new Response(JSON.stringify({ error: "Email sign-in isn't available yet." }), {
            status: 503,
            headers: { "Content-Type": "application/json" }
          })
        )
      );

      await expect(requestMagicLink("visitor@example.com")).rejects.toThrow("Email sign-in isn't available yet.");
    });
  });
});
