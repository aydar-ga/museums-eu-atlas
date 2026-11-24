import { NextRequest, NextResponse } from "next/server";

import { serverEnv } from "@/lib/env";
import { maxJsonBodyBytes, writeLimitPerUser } from "./abuse-limits";
import { getAuthenticatedEmail } from "./auth-request";
import { checkRateLimits, rateLimitKey, rateLimitStoreFor } from "./rateLimit";
import { durableSqlRunner } from "./sql-runner";

/** The only place that builds a 401. */
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function temporarilyUnavailable(): NextResponse {
  return NextResponse.json({ error: "Temporarily unavailable. Try again later." }, { status: 503 });
}

export function tooManyRequests(message = "Too many requests. Try again later."): NextResponse {
  return NextResponse.json({ error: message }, { status: 429 });
}

type Guarded<T> = { ok: true; value: T } | { ok: false; response: NextResponse };

/** Reads the session user from `Authorization: Bearer`, or answers 401. */
export function requireSession(request: NextRequest): Guarded<string> {
  const email = getAuthenticatedEmail(request);
  return email ? { ok: true, value: email } : { ok: false, response: unauthorized() };
}

/** A session plus the per-user durable write cap. A failed counter refuses the write (503). */
export async function requireWriteSession(request: NextRequest): Promise<Guarded<string>> {
  const session = requireSession(request);
  if (!session.ok) {
    return session;
  }
  try {
    const store = rateLimitStoreFor(durableSqlRunner());
    const result = await checkRateLimits(
      store,
      [{ key: rateLimitKey("write-user", session.value), ...writeLimitPerUser }],
      Date.now()
    );
    return result.allowed ? session : { ok: false, response: tooManyRequests() };
  } catch {
    return { ok: false, response: temporarilyUnavailable() };
  }
}

/**
 * Browser requests from another site are refused. `Sec-Fetch-Site` decides when present; otherwise the
 * Origin must be this app. A request with neither (curl, most bots) is refused too.
 */
export function isSameOriginRequest(request: NextRequest): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site) {
    return site === "same-origin";
  }
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }
  const allowed = new Set([request.nextUrl.origin]);
  const publicUrl = serverEnv().PUBLIC_APP_URL;
  if (publicUrl) {
    allowed.add(new URL(publicUrl).origin);
  }
  return allowed.has(origin);
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Parses a JSON object body of at most `maxBytes`; answers 413 when larger and 400 when not an object. */
export async function readJsonObject(
  request: Request,
  maxBytes = maxJsonBodyBytes
): Promise<Guarded<Record<string, unknown>>> {
  const tooLarge = { ok: false as const, response: NextResponse.json({ error: "Request body is too large" }, { status: 413 }) };
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) {
    return tooLarge;
  }
  const text = await request.text().catch(() => "");
  if (Buffer.byteLength(text) > maxBytes) {
    return tooLarge;
  }
  try {
    const body: unknown = JSON.parse(text);
    if (body !== null && typeof body === "object" && !Array.isArray(body)) {
      return { ok: true, value: body as Record<string, unknown> };
    }
  } catch {
    // fall through to 400
  }
  return { ok: false, response: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) };
}
