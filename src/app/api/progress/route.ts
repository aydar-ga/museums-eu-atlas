import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedEmail } from "@/server/auth-request";
import { parseMuseumSlugList, readJsonBody } from "@/server/payloads";
import { readUserProgress, writeUserProgress } from "@/server/progress";
import { getDb } from "@/db";

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

  const body = await readJsonBody(request);
  const planned = parseMuseumSlugList(body?.planned);
  const visited = parseMuseumSlugList(body?.visited);
  if (!planned || !visited) {
    return NextResponse.json({ error: "Invalid progress payload" }, { status: 400 });
  }

  await writeUserProgress(email, { planned, visited });
  return NextResponse.json({ planned, visited });
}
