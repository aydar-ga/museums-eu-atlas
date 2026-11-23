// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => {
  const state = { deleteAwaitedDirectly: false, insertedRows: [] as unknown[] };
  const deleteQuery = {
    kind: "delete",
    then(resolve: (value: unknown) => void) {
      state.deleteAwaitedDirectly = true;
      resolve([]);
    }
  };
  const insertQuery = { kind: "insert" };
  const db = {
    select: () => ({ from: () => ({ where: () => ({ limit: async () => [{ id: "user-1" }] }) }) }),
    delete: () => ({ where: () => deleteQuery }),
    insert: () => ({
      values: (rows: unknown[]) => {
        state.insertedRows = rows;
        return insertQuery;
      }
    }),
    batch: vi.fn(async () => [])
  };
  return { state, db, deleteQuery, insertQuery };
});

vi.mock("@/db", () => ({ getDb: () => fake.db }));

import { writeUserProgress } from "./progress";

describe("writeUserProgress", () => {
  beforeEach(() => {
    fake.state.deleteAwaitedDirectly = false;
    fake.state.insertedRows = [];
    fake.db.batch.mockClear();
  });

  it("replaces progress in one batch so a failed insert cannot wipe it", async () => {
    await writeUserProgress("visitor@example.com", { planned: ["louvre-museum"], visited: ["louvre-museum", "british-museum"] });

    expect(fake.db.batch).toHaveBeenCalledTimes(1);
    expect(fake.db.batch).toHaveBeenCalledWith([fake.deleteQuery, fake.insertQuery]);
    expect(fake.state.deleteAwaitedDirectly).toBe(false);
    expect(fake.state.insertedRows).toEqual([
      expect.objectContaining({ userId: "user-1", museumSlug: "louvre-museum", planned: true, visited: true }),
      expect.objectContaining({ userId: "user-1", museumSlug: "british-museum", planned: false, visited: true })
    ]);
  });

  it("clears progress with one delete when the snapshot is empty", async () => {
    await writeUserProgress("visitor@example.com", { planned: [], visited: [] });

    expect(fake.db.batch).not.toHaveBeenCalled();
    expect(fake.state.deleteAwaitedDirectly).toBe(true);
  });
});
