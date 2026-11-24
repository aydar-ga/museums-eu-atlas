import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

import type { SqlRunner } from "@/server/sql-runner";

type Rows = Record<string, unknown>[];

/** An in-process Postgres with every migration in drizzle/ applied, for testing real SQL. */
export async function createTestDatabase() {
  const client = new PGlite();
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: path.resolve(import.meta.dirname, "../../drizzle") });

  const runner: SqlRunner = {
    execute: async (query) => ({ rows: (await db.execute(query)).rows as Rows }),
    transaction: (queries) =>
      db.transaction(async (tx) => {
        const results: Rows[] = [];
        for (const query of queries) {
          results.push((await tx.execute(query)).rows as Rows);
        }
        return results;
      })
  };

  return {
    runner,
    query: async (text: string) => (await client.query<Record<string, unknown>>(text)).rows,
    reset: () => client.exec("truncate auth_events, magic_link_tokens, auth_rate_limits, users cascade"),
    close: () => client.close()
  };
}

export type TestDatabase = Awaited<ReturnType<typeof createTestDatabase>>;

/** A runner whose every query fails, to prove callers fail closed. */
export const failingRunner: SqlRunner = {
  execute: async () => {
    throw new Error("database is down");
  },
  transaction: async () => {
    throw new Error("database is down");
  }
};
