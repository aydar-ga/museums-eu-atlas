import { NextRequest, NextResponse } from "next/server";

import { requireWriteSession } from "@/server/api-guard";
import { isUuid } from "@/server/payloads";
import { deleteSavedRoute } from "@/server/routes";
import { getDb } from "@/db";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await requireWriteSession(request);
  if (!session.ok) {
    return session.response;
  }
  const email = session.value;
  if (!getDb()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  // Route ids are UUIDs; anything else cannot exist, and Postgres would reject it with a 500.
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  }
  const deleted = await deleteSavedRoute(email, id);
  if (!deleted) {
    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
