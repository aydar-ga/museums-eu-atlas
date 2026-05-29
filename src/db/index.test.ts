import { describe, expect, it } from "vitest";

import { getDatabaseUrl, getDb } from "./index";

describe("db client", () => {
  it("returns null without DATABASE_URL", () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    expect(getDatabaseUrl()).toBeNull();
    expect(getDb()).toBeNull();

    process.env.DATABASE_URL = previous;
  });
});
