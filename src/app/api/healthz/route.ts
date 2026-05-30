import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { getDatabaseUrl, getDb } from "@/db";

const startedAt = Date.now();

export async function GET() {
  const databaseUrl = getDatabaseUrl();
  const payload = {
    status: "ok" as "ok" | "degraded",
    service: "museums-eu-atlas",
    version: process.env.npm_package_version ?? "unknown",
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT ?? "local",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
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
