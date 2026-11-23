import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { getDatabaseUrl, getDb } from "@/db";
import { serverEnv } from "@/lib/env";

const startedAt = Date.now();

export async function GET() {
  const env = serverEnv();
  const databaseUrl = getDatabaseUrl();
  const payload = {
    status: "ok" as "ok" | "degraded",
    service: "museums-eu-atlas",
    version: env.npm_package_version ?? "unknown",
    commit: env.VERCEL_GIT_COMMIT_SHA ?? env.GIT_COMMIT ?? "local",
    environment: env.VERCEL_ENV ?? env.NODE_ENV ?? "development",
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    database: databaseUrl ? "checking" : ("not_configured" as const),
    checks: {
      database: databaseUrl ? "checking" : ("not_configured" as const)
    }
  };

  if (!databaseUrl) {
    return NextResponse.json(payload);
  }

  try {
    const db = getDb();
    await db?.execute(sql`select 1`);
    return NextResponse.json({
      ...payload,
      database: "connected",
      checks: { database: "connected" }
    });
  } catch {
    return NextResponse.json(
      {
        ...payload,
        status: "degraded",
        database: "unavailable",
        checks: { database: "unavailable" }
      },
      { status: 503 }
    );
  }
}
