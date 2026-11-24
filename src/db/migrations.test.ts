// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const folder = path.resolve(import.meta.dirname, "../../drizzle");
const journal = JSON.parse(readFileSync(path.join(folder, "meta/_journal.json"), "utf8")) as {
  entries: { idx: number; when: number; tag: string }[];
};

// Drizzle applies a migration only when its `when` is newer than the newest one already applied. An entry that
// is older than its predecessor is skipped silently on every existing database, while fresh test databases
// still get it, so the suite stays green.
describe("drizzle migration journal", () => {
  it("has strictly increasing timestamps", () => {
    for (let i = 1; i < journal.entries.length; i += 1) {
      const [previous, current] = [journal.entries[i - 1]!, journal.entries[i]!];
      expect(current.when, `${current.tag} must be newer than ${previous.tag}`).toBeGreaterThan(previous.when);
    }
  });

  it("has a SQL file for every entry", () => {
    for (const entry of journal.entries) {
      expect(existsSync(path.join(folder, `${entry.tag}.sql`)), entry.tag).toBe(true);
    }
  });
});
