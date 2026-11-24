// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { createMagicToken, verifyMagicToken } from "./magicTokens";
import { isProductionDeployment, requireAuthSecret } from "@/lib/env";
import { createSessionToken, verifySessionToken } from "./sessions";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("requireAuthSecret", () => {
  it("uses AUTH_SECRET exactly as stored, so existing signatures stay valid", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("AUTH_SECRET", " s3cret ");
    expect(requireAuthSecret()).toBe(" s3cret ");
  });

  it.each(["production", "preview", ""])("fails closed when AUTH_SECRET is missing (VERCEL_ENV=%j)", (vercelEnv) => {
    vi.stubEnv("VERCEL_ENV", vercelEnv);
    vi.stubEnv("AUTH_SECRET", "  ");
    expect(isProductionDeployment()).toBe(vercelEnv === "production");
    expect(() => requireAuthSecret()).toThrow(/AUTH_SECRET/);
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

  it("expires magic-link tokens after 15 minutes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-23T12:00:00Z"));
    const token = createMagicToken("visitor@example.com");
    vi.setSystemTime(new Date("2026-11-23T12:14:59Z"));
    expect(verifyMagicToken(token)).toBe("visitor@example.com");
    vi.setSystemTime(new Date("2026-11-23T12:15:01Z"));
    expect(() => verifyMagicToken(token)).toThrow(/expired/);
  });

  it("issues a unique token every time, even for the same email and instant", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-23T12:00:00Z"));
    expect(createMagicToken("visitor@example.com")).not.toBe(createMagicToken("visitor@example.com"));
  });
});

import { createHmac } from "node:crypto";

function createLegacySignature(payload: string): string {
  return createHmac("sha256", requireAuthSecret()).update(payload).digest("base64url");
}
