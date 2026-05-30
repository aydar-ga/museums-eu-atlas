import { describe, expect, it } from "vitest";

import { createSessionToken, verifySessionToken } from "./sessions";

describe("session tokens", () => {
  it("round-trips signed session tokens", () => {
    const token = createSessionToken("Visitor@Example.com");
    expect(verifySessionToken(token)).toBe("visitor@example.com");
  });
});
