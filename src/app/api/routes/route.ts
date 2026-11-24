import { NextRequest, NextResponse } from "next/server";

import { readJsonObject, requireSession, requireWriteSession } from "@/server/api-guard";
import { maxRouteNameLength, parseMuseumSlugList, parseRouteName } from "@/server/payloads";
import { createSavedRoute, listSavedRoutes } from "@/server/routes";
import { getDb } from "@/db";

export async function GET(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) {
    return session.response;
  }
  const email = session.value;
  if (!getDb()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const routes = await listSavedRoutes(email);
  return NextResponse.json({ routes });
}

export async function POST(request: NextRequest) {
  const session = await requireWriteSession(request);
  if (!session.ok) {
    return session.response;
  }
  const email = session.value;
  if (!getDb()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const parsed = await readJsonObject(request);
  if (!parsed.ok) {
    return parsed.response;
  }
  const name = parseRouteName(parsed.value.name);
  const museumSlugs = parseMuseumSlugList(parsed.value.museumSlugs);
  if (!name || !museumSlugs || museumSlugs.length === 0) {
    return NextResponse.json(
      {
        error: `Route name (1-${maxRouteNameLength} characters) and at least one known museum are required`
      },
      { status: 400 }
    );
  }

  const route = await createSavedRoute(email, name, museumSlugs);
  if (!route) {
    return NextResponse.json({ error: "Unable to save route" }, { status: 500 });
  }

  return NextResponse.json({ route }, { status: 201 });
}
