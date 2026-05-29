import { describe, expect, it } from "vitest";

import { getDatabaseUrl, getDb } from "./index";

describe("db client", () => {
  it("returns null without DATABASE_URL", () => {
    const previousDatabaseUrl = process.env.DATABASE_URL;
    const previousPostgresUrl = process.env.POSTGRES_URL;
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_URL;

    expect(getDatabaseUrl()).toBeNull();
    expect(getDb()).toBeNull();

    process.env.DATABASE_URL = previousDatabaseUrl;
    process.env.POSTGRES_URL = previousPostgresUrl;
  });

  it("prefers DATABASE_URL and falls back to POSTGRES_URL", () => {
    const previousDatabaseUrl = process.env.DATABASE_URL;
    const previousPostgresUrl = process.env.POSTGRES_URL;

    delete process.env.DATABASE_URL;
    process.env.POSTGRES_URL = "postgresql://example.test/neondb";
    expect(getDatabaseUrl()).toBe("postgresql://example.test/neondb");

    process.env.DATABASE_URL = previousDatabaseUrl;
    process.env.POSTGRES_URL = previousPostgresUrl;
  });
});
