// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { databaseUrl, emailDelivery, isProductionDeployment, serverEnv } from "./env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("serverEnv", () => {
  it("treats empty and whitespace-only values as unset", () => {
    vi.stubEnv("RESEND_API_KEY", "   ");
    vi.stubEnv("PUBLIC_APP_URL", "");
    const env = serverEnv();
    expect(env.RESEND_API_KEY).toBeUndefined();
    expect(env.PUBLIC_APP_URL).toBeUndefined();
  });

  it("normalises PUBLIC_APP_URL without a trailing slash", () => {
    vi.stubEnv("PUBLIC_APP_URL", "https://artmuse.app//");
    expect(serverEnv().PUBLIC_APP_URL).toBe("https://artmuse.app");
  });

  it("fails at access time, naming the variable but not its value, when a value is malformed", () => {
    vi.stubEnv("PUBLIC_APP_URL", "javascript:alert(1)");
    expect(() => serverEnv()).toThrow("Server configuration is invalid: PUBLIC_APP_URL.");
    expect(() => isProductionDeployment()).toThrow(/PUBLIC_APP_URL/);
  });
});

describe("accessors", () => {
  it("prefers DATABASE_URL, then POSTGRES_URL, then POSTGRES_PRISMA_URL", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("POSTGRES_URL", "");
    vi.stubEnv("POSTGRES_PRISMA_URL", "postgresql://prisma.test/db");
    expect(databaseUrl()).toBe("postgresql://prisma.test/db");
    vi.stubEnv("POSTGRES_URL", "postgresql://vercel.test/db");
    expect(databaseUrl()).toBe("postgresql://vercel.test/db");
    vi.stubEnv("DATABASE_URL", "postgresql://explicit.test/db");
    expect(databaseUrl()).toBe("postgresql://explicit.test/db");
  });

  it("returns no database URL when none is configured", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("POSTGRES_URL", "");
    vi.stubEnv("POSTGRES_PRISMA_URL", "");
    expect(databaseUrl()).toBeNull();
  });

  it("configures email delivery only when both Resend variables are set", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("AUTH_EMAIL_FROM", "");
    expect(emailDelivery()).toBeNull();
    vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <noreply@example.com>");
    expect(emailDelivery()).toEqual({ apiKey: "re_test", from: "ArtMuse <noreply@example.com>" });
  });
});
