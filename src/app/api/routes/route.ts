import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedEmail } from "@/server/auth-request";
import { maxRouteNameLength, parseMuseumSlugList, parseRouteName, readJsonBody } from "@/server/payloads";
import { createSavedRoute, listSavedRoutes } from "@/server/routes";
import { getDb } from "@/db";

export async function GET(request: NextRequest) {
  const email = getAuthenticatedEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!getDb()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const routes = await listSavedRoutes(email);
  return NextResponse.json({ routes });
}

export async function POST(request: NextRequest) {
  const email = getAuthenticatedEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!getDb()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await readJsonBody(request);
  const name = parseRouteName(body?.name);
  const museumSlugs = parseMuseumSlugList(body?.museumSlugs);
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
