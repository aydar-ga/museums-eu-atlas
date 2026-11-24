import { sql } from "drizzle-orm";

import type { SqlRunner } from "./sql-runner";

export type SignedInUser = { userId: string; isNew: boolean };

/** Upserts the account on sign-in. `isNew` is true when this sign-in created it. Without a database: null. */
export async function recordUserSignIn(runner: SqlRunner | null, email: string, nowMs = Date.now()): Promise<SignedInUser | null> {
  if (!runner) {
    return null;
  }
  const now = new Date(nowMs).toISOString();
  const { rows } = await runner.execute(sql`insert into users (email, created_at, last_sign_in_at)
    values (${email}, ${now}::timestamptz, ${now}::timestamptz)
    on conflict (email) do update set last_sign_in_at = excluded.last_sign_in_at
    returning id, (xmax = 0) as is_new`);
  const row = rows[0];
  return row ? { userId: String(row.id), isNew: row.is_new === true } : null;
}
