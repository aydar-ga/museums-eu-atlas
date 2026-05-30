import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedEmail } from "@/server/auth-request";
import { createSavedRoute, listSavedRoutes } from "@/server/routes";
import { getDb } from "@/db";

function parseSlugList(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.filter((item) => typeof item === "string" && item.trim()).map(String);
}

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

  const body = (await request.json().catch(() => ({}))) as {
    name?: unknown;
    museumSlugs?: unknown;
  };
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const museumSlugs = parseSlugList(body.museumSlugs);
  if (!name || !museumSlugs || museumSlugs.length === 0) {
    return NextResponse.json({ error: "Route name and museum list are required" }, { status: 400 });
  }

  const route = await createSavedRoute(email, name, museumSlugs);
  if (!route) {
    return NextResponse.json({ error: "Unable to save route" }, { status: 500 });
  }

  return NextResponse.json({ route }, { status: 201 });
}
