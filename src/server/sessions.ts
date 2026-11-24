import { createHash, randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import type { NextRequest, NextResponse } from "next/server";

import type { SqlRunner } from "./sql-runner";

/** `__Host-` makes the browser insist on Secure, Path=/ and no Domain, so subdomains cannot set or read it. */
export const sessionCookieName = "__Host-artmuse_session";
export const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000;

/** Only this hash is stored; the random id itself lives in the HttpOnly cookie. */
function hashSessionId(id: string): string {
  return createHash("sha256").update(id).digest("hex");
}

/** Per-process fallback for local runs without a database (dev, e2e). */
const memorySessions = new Map<string, { email: string; expiresAtMs: number }>();

/** Creates a server-side session and returns the id for the cookie. With a database it needs the account id. */
export async function createSession(
  runner: SqlRunner | null,
  account: { email: string; userId?: string },
  nowMs: number
): Promise<string> {
  const id = randomBytes(32).toString("base64url");
  const idHash = hashSessionId(id);
  const expiresAtMs = nowMs + sessionLifetimeMs;
  if (!runner) {
    memorySessions.set(idHash, { email: account.email, expiresAtMs });
    return id;
  }
  if (!account.userId) {
    throw new Error("A database session needs an account id.");
  }
  await runner.transaction([
    sql`delete from sessions where expires_at < ${new Date(nowMs).toISOString()}::timestamptz`,
    sql`insert into sessions (id_hash, user_id, created_at, expires_at)
      values (${idHash}, ${account.userId}::uuid, ${new Date(nowMs).toISOString()}::timestamptz,
        ${new Date(expiresAtMs).toISOString()}::timestamptz)`
  ]);
  return id;
}

/** The signed-in email for a session id, or null when it is unknown or expired. Database errors propagate. */
export async function readSessionEmail(runner: SqlRunner | null, id: string, nowMs: number): Promise<string | null> {
  const idHash = hashSessionId(id);
  if (!runner) {
    const session = memorySessions.get(idHash);
    return session && session.expiresAtMs > nowMs ? session.email : null;
  }
  const { rows } = await runner.execute(sql`select u.email from sessions s join users u on u.id = s.user_id
    where s.id_hash = ${idHash} and s.expires_at > ${new Date(nowMs).toISOString()}::timestamptz`);
  const email = rows[0]?.email;
  return typeof email === "string" ? email : null;
}

export async function deleteSession(runner: SqlRunner | null, id: string): Promise<void> {
  const idHash = hashSessionId(id);
  if (!runner) {
    memorySessions.delete(idHash);
    return;
  }
  await runner.execute(sql`delete from sessions where id_hash = ${idHash}`);
}

export function sessionIdFrom(request: NextRequest): string | null {
  return request.cookies.get(sessionCookieName)?.value || null;
}

export function setSessionCookie(response: NextResponse, id: string): void {
  response.cookies.set(sessionCookieName, id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: sessionLifetimeMs / 1000
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(sessionCookieName, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
}
