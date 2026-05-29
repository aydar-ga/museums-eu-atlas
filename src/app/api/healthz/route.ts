import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { getDatabaseUrl, getDb } from "@/db";

export async function GET() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    return NextResponse.json({ status: "ok", database: "not_configured" });
  }

  try {
    const db = getDb();
    await db?.execute(sql`select 1`);
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch {
    return NextResponse.json({ status: "degraded", database: "unavailable" }, { status: 503 });
  }
}
