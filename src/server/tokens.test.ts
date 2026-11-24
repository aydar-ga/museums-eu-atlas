// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { isProductionDeployment, requireAuthSecret } from "@/lib/env";
import { createMagicToken, verifyMagicToken } from "./magicTokens";

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
    expect(() => createMagicToken("visitor@example.com")).toThrow(/AUTH_SECRET/);
  });
});

describe("magic-link tokens", () => {
  it("rejects tampered and foreign tokens with the same message", () => {
    const token = createMagicToken("visitor@example.com");
    const [payload] = token.split(".");
    const forged = `${Buffer.from(JSON.stringify({ typ: "magic", email: "x@example.com", exp: Date.now() + 60_000 })).toString("base64url")}.${token.split(".")[1]}`;
    expect(verifyMagicToken(token)).toBe("visitor@example.com");
    expect(() => verifyMagicToken(forged)).toThrow("Magic link is invalid or expired.");
    expect(() => verifyMagicToken(`${payload}.`)).toThrow("Magic link is invalid or expired.");
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
