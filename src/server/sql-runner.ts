import type { SQL } from "drizzle-orm";

import { getDb, type Db } from "@/db";
import { isVercelDeployment } from "@/lib/env";

type Rows = Record<string, unknown>[];

/** The SQL surface the guards need. Neon in the app; PGlite in tests. */
export type SqlRunner = {
  execute(query: SQL): Promise<{ rows: Rows }>;
  /** Runs the statements in order inside one transaction and returns each statement's rows. */
  transaction(queries: SQL[]): Promise<Rows[]>;
};

export function neonSqlRunner(db: Db): SqlRunner {
  return {
    execute: (query) => db.execute(query),
    async transaction(queries) {
      // neon-http sends a batch as one HTTP request that runs in a single transaction.
      const statements = queries.map((query) => db.execute(query));
      const results = (await db.batch(statements as [(typeof statements)[number], ...typeof statements])) as {
        rows: Rows;
      }[];
      return results.map((result) => result.rows);
    }
  };
}

/**
 * The shared Postgres runner for durable limits. Off Vercel without a database (local dev, e2e) it returns
 * null and callers use a per-process fallback. On a Vercel deployment a missing database throws, so every
 * caller fails closed.
 */
export function durableSqlRunner(): SqlRunner | null {
  const db = getDb();
  if (db) {
    return neonSqlRunner(db);
  }
  if (isVercelDeployment()) {
    throw new Error("Database is not configured.");
  }
  return null;
}
