import { describe, expect, it } from "vitest";

import { getDatabaseUrlFromEnv, shouldRunMigrations } from "./vercel-build";

describe("vercel-build helpers", () => {
  it("detects when migrations should run on Vercel", () => {
    expect(
      shouldRunMigrations({
        VERCEL: "1",
        DATABASE_URL: "postgresql://example.test/neondb"
      })
    ).toBe(true);
    expect(shouldRunMigrations({ VERCEL: "1" })).toBe(false);
  });

  it("accepts Vercel Neon POSTGRES_URL", () => {
    expect(
      getDatabaseUrlFromEnv({
        POSTGRES_URL: "postgresql://example.test/neondb"
      })
    ).toBe("postgresql://example.test/neondb");
  });
});
