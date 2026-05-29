import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { getDatabaseUrlFromEnv } from "@/lib/vercel-build";
import * as schema from "./schema";

export function getDatabaseUrl(): string | null {
  return getDatabaseUrlFromEnv(process.env);
}

export function getDb() {
  const url = getDatabaseUrl();
  if (!url) {
    return null;
  }

  return drizzle(neon(url), { schema });
}

export type Db = NonNullable<ReturnType<typeof getDb>>;
