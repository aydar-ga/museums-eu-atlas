import { NextRequest, NextResponse } from "next/server";

import { readJsonBody, requireSession, requireWriteSession } from "@/server/api-guard";
import { progressPayload } from "@/server/payloads";
import { readUserProgress, writeUserProgress } from "@/server/progress";
import { getDb } from "@/db";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session.ok) {
    return session.response;
  }
  const email = session.value;
  if (!getDb()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const progress = await readUserProgress(email);
  return NextResponse.json(progress ?? { planned: [], visited: [] });
}

export async function PUT(request: NextRequest) {
  const session = await requireWriteSession(request);
  if (!session.ok) {
    return session.response;
  }
  const email = session.value;
  if (!getDb()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const parsed = await readJsonBody(request, progressPayload, "Invalid progress payload");
  if (!parsed.ok) {
    return parsed.response;
  }
  const { planned, visited } = parsed.value;

  await writeUserProgress(email, { planned, visited });
  return NextResponse.json({ planned, visited });
}
