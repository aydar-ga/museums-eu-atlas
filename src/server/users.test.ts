// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createTestDatabase, type TestDatabase } from "@/test/pglite";
import { recordUserSignIn } from "./users";

let database: TestDatabase;
beforeAll(async () => {
  database = await createTestDatabase();
});
afterAll(async () => {
  await database.close();
});

describe("recordUserSignIn", () => {
  it("no-ops when database is not configured", async () => {
    await expect(recordUserSignIn(null, "visitor@example.com")).resolves.toBeNull();
  });

  it("reports a new account once, then returning sign-ins", async () => {
    const first = await recordUserSignIn(database.runner, "visitor@example.com");
    const second = await recordUserSignIn(database.runner, "visitor@example.com");
    expect(first?.isNew).toBe(true);
    expect(second).toEqual({ userId: first?.userId, isNew: false });
  });
});
