import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedEmail } from "@/server/auth-request";
import { readUserProgress, writeUserProgress } from "@/server/progress";
import { getDb } from "@/db";

function parseSlugList(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.map(String);
}

export async function GET(request: NextRequest) {
  const email = getAuthenticatedEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!getDb()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const progress = await readUserProgress(email);
  return NextResponse.json(progress ?? { planned: [], visited: [] });
}

export async function PUT(request: NextRequest) {
  const email = getAuthenticatedEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!getDb()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    planned?: unknown;
    visited?: unknown;
  };
  const planned = parseSlugList(body.planned);
  const visited = parseSlugList(body.visited);
  if (!planned || !visited) {
    return NextResponse.json({ error: "Invalid progress payload" }, { status: 400 });
  }

  await writeUserProgress(email, { planned, visited });
  return NextResponse.json({ planned, visited });
}
