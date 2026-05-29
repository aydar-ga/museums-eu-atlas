import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export function getDatabaseUrl(): string | null {
  const url = process.env.DATABASE_URL?.trim();
  return url ? url : null;
}

export function getDb() {
  const url = getDatabaseUrl();
  if (!url) {
    return null;
  }

  return drizzle(neon(url), { schema });
}

export type Db = NonNullable<ReturnType<typeof getDb>>;
