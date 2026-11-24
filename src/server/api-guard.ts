import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { serverEnv } from "@/lib/env";
import { maxJsonBodyBytes, writeLimitPerUser } from "./abuse-limits";
import { checkRateLimits, rateLimitKey, rateLimitStoreFor } from "./rateLimit";
import { readSessionEmail, sessionIdFrom } from "./sessions";
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

/** The signed-in email from the session cookie; 401 without a valid session, 503 if the store fails. */
export async function requireSession(request: NextRequest): Promise<Guarded<string>> {
  const id = sessionIdFrom(request);
  if (!id) {
    return { ok: false, response: unauthorized() };
  }
  try {
    const email = await readSessionEmail(durableSqlRunner(), id, Date.now());
    return email ? { ok: true, value: email } : { ok: false, response: unauthorized() };
  } catch {
    return { ok: false, response: temporarilyUnavailable() };
  }
}

/**
 * For cookie-authenticated writes: same-origin (403, CSRF), a session (401), then the per-user durable
 * write cap (429). A failed counter refuses the write (503).
 */
export async function requireWriteSession(request: NextRequest): Promise<Guarded<string>> {
  if (!isSameOriginRequest(request)) {
    return { ok: false, response: forbidden() };
  }
  const session = await requireSession(request);
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

/** Reads a JSON body and validates it with a Zod schema; any mismatch answers 400 with `invalidMessage`. */
export async function readJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
  invalidMessage: string
): Promise<Guarded<T>> {
  const parsed = await readJsonObject(request);
  if (!parsed.ok) {
    return parsed;
  }
  const result = schema.safeParse(parsed.value);
  return result.success
    ? { ok: true, value: result.data }
    : { ok: false, response: NextResponse.json({ error: invalidMessage }, { status: 400 }) };
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
