import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";

import { requireAuthSecret } from "@/lib/env";
import { magicLinkLifetimeMs, maxEmailLength } from "./abuse-limits";
import type { SqlRunner } from "./sql-runner";

const invalidLinkMessage = "Magic link is invalid or expired.";

function base64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", requireAuthSecret()).update(payload).digest("base64url");
}

export function createMagicToken(email: string): string {
  const payload = base64url(
    JSON.stringify({
      typ: "magic",
      email: email.trim().toLocaleLowerCase("en-US"),
      exp: Date.now() + magicLinkLifetimeMs,
      // A random id makes every token unique, so each one can be stored and consumed once.
      jti: randomBytes(16).toString("base64url")
    })
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyMagicToken(token: string): string {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    throw new Error(invalidLinkMessage);
  }

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error(invalidLinkMessage);
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    typ?: unknown;
    email?: unknown;
    exp?: unknown;
  };
  if (typeof decoded.email !== "string" || typeof decoded.exp !== "number" || decoded.typ !== "magic") {
    throw new Error(invalidLinkMessage);
  }
  if (decoded.exp < Date.now()) {
    throw new Error(invalidLinkMessage);
  }
  return decoded.email;
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length <= maxEmailLength && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed);
}

/** Only this hash is stored; the token itself travels by email. */
export function magicTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Records an issued token so it can later be consumed exactly once. Without a database this is a no-op. */
export async function recordIssuedMagicToken(runner: SqlRunner | null, token: string, nowMs: number): Promise<void> {
  if (!runner) {
    return;
  }
  await runner.execute(sql`insert into magic_link_tokens (token_hash, expires_at, created_at)
    values (${magicTokenHash(token)}, ${new Date(nowMs + magicLinkLifetimeMs).toISOString()}::timestamptz,
      ${new Date(nowMs).toISOString()}::timestamptz)`);
}

/** Per-process fallback for local runs without a database. */
const locallyConsumedTokens = new Set<string>();

/**
 * Verifies the signature and expiry, then marks the token used in one atomic update. A second use, an
 * unknown token or an expired one all fail with the same message. Database errors propagate.
 */
export async function consumeMagicToken(runner: SqlRunner | null, token: string, nowMs: number): Promise<string> {
  const email = verifyMagicToken(token);
  const hash = magicTokenHash(token);
  if (!runner) {
    if (locallyConsumedTokens.has(hash)) {
      throw new Error(invalidLinkMessage);
    }
    locallyConsumedTokens.add(hash);
    return email;
  }
  const now = new Date(nowMs).toISOString();
  const { rows } = await runner.execute(sql`update magic_link_tokens set used_at = ${now}::timestamptz
    where token_hash = ${hash} and used_at is null and expires_at > ${now}::timestamptz
    returning token_hash`);
  if (rows.length === 0) {
    throw new Error(invalidLinkMessage);
  }
  return email;
}
