import { describe, expect, it } from "vitest";

import { consumeDevMagicToken, createDevMagicToken, isValidEmail } from "./auth";

describe("auth helpers", () => {
  it("validates email shape", () => {
    expect(isValidEmail("visitor@example.com")).toBe(true);
    expect(isValidEmail("not-email")).toBe(false);
  });

  it("round-trips local dev magic tokens", () => {
    const token = createDevMagicToken("Visitor@Example.com");
    expect(consumeDevMagicToken(token)).toBe("visitor@example.com");
  });
});
