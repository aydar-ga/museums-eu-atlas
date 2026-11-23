// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { createMagicToken, verifyMagicToken } from "./magicTokens";
import { authSecret, isProductionDeployment } from "./secret";
import { createSessionToken, verifySessionToken } from "./sessions";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("authSecret", () => {
  it("uses AUTH_SECRET when set", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("AUTH_SECRET", "s3cret");
    expect(authSecret()).toBe("s3cret");
  });

  it("falls back to a development secret outside production", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("AUTH_SECRET", "");
    expect(isProductionDeployment()).toBe(false);
    expect(authSecret()).toBe("local-development-secret-change-me");
  });

  it("fails closed in production when AUTH_SECRET is missing", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("AUTH_SECRET", "  ");
    expect(isProductionDeployment()).toBe(true);
    expect(() => authSecret()).toThrow(/AUTH_SECRET/);
    expect(() => createSessionToken("visitor@example.com")).toThrow(/AUTH_SECRET/);
    expect(() => createMagicToken("visitor@example.com")).toThrow(/AUTH_SECRET/);
  });
});

describe("token types", () => {
  it("rejects a magic-link token used as a session token, and the reverse", () => {
    const magicToken = createMagicToken("visitor@example.com");
    const sessionToken = createSessionToken("visitor@example.com");

    expect(verifyMagicToken(magicToken)).toBe("visitor@example.com");
    expect(verifySessionToken(sessionToken)).toBe("visitor@example.com");
    expect(() => verifySessionToken(magicToken)).toThrow();
    expect(() => verifyMagicToken(sessionToken)).toThrow();
  });

  it("keeps accepting session tokens issued before token types existed", () => {
    const payload = Buffer.from(
      JSON.stringify({ email: "visitor@example.com", exp: Date.now() + 60_000 })
    ).toString("base64url");
    // Sign the legacy payload exactly as the old code did.
    const legacy = `${payload}.${createLegacySignature(payload)}`;
    expect(verifySessionToken(legacy)).toBe("visitor@example.com");
    expect(() => verifyMagicToken(legacy)).toThrow();
  });

  it("expires magic-link tokens after 10 minutes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-23T12:00:00Z"));
    const token = createMagicToken("visitor@example.com");
    vi.setSystemTime(new Date("2026-11-23T12:09:59Z"));
    expect(verifyMagicToken(token)).toBe("visitor@example.com");
    vi.setSystemTime(new Date("2026-11-23T12:10:01Z"));
    expect(() => verifyMagicToken(token)).toThrow(/expired/);
  });
});

import { createHmac } from "node:crypto";

function createLegacySignature(payload: string): string {
  return createHmac("sha256", authSecret()).update(payload).digest("base64url");
}
