import { describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({
  getDb: vi.fn(() => null)
}));

import { recordUserSignIn } from "./users";

describe("recordUserSignIn", () => {
  it("no-ops when database is not configured", async () => {
    await expect(recordUserSignIn("visitor@example.com")).resolves.toBeUndefined();
  });
});
