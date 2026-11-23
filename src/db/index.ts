import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { databaseUrl } from "@/lib/env";
import * as schema from "./schema";

export function getDatabaseUrl(): string | null {
  return databaseUrl();
}

export function getDb() {
  const url = getDatabaseUrl();
  if (!url) {
    return null;
  }

  return drizzle(neon(url), { schema });
}

export type Db = NonNullable<ReturnType<typeof getDb>>;
