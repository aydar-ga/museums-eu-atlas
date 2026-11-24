import { createHmac } from "node:crypto";
import { sql, type SQL } from "drizzle-orm";

import { requireAuthSecret } from "@/lib/env";
import { authEventRetentionMs, blockedLogLimitPerDay, emailSendLimits } from "./abuse-limits";
import type { SqlRunner } from "./sql-runner";

/** Serialises concurrent reservations, so N parallel requests cannot all pass the same count. */
const emailSendLockKey = 7_202_611;

/** HMAC-SHA256 of an identifier, keyed by AUTH_SECRET, so stored hashes cannot be reversed by guessing. */
export function hashIdentifier(kind: "email" | "ip" | "user", value: string): string {
  return createHmac("sha256", requireAuthSecret()).update(`${kind}:${value}`).digest("hex");
}

export type EmailSendDecision = "allowed" | "blocked";

/**
 * Atomically checks every email cap and, if all pass, records the send as `link_requested`.
 * A refused attempt is logged as `link_blocked`, or `link_blocked_app` when an app-wide cap refused it
 * (each up to a daily cap). Any database error propagates:
 * callers must treat it as a refusal.
 */
export async function reserveEmailSend(
  runner: SqlRunner,
  input: { emailHash: string; ipHash: string; nowMs: number }
): Promise<EmailSendDecision> {
  const { emailHash, ipHash, nowMs } = input;
  const now = new Date(nowMs).toISOString();
  const since = (windowMs: number) => new Date(nowMs - windowMs).toISOString();
  const sentWithin = (scope: SQL, rule: { limit: number; windowMs: number }) =>
    sql`(select count(*) from auth_events where kind = 'link_requested' and ${scope} and created_at > ${since(rule.windowMs)}::timestamptz) < ${rule.limit}::int`;
  const limits = emailSendLimits;

  const [, inserted] = await runner.transaction([
    sql`select pg_advisory_xact_lock(${emailSendLockKey}::bigint)`,
    sql`insert into auth_events (kind, email_hash, ip_hash, created_at)
      select 'link_requested', ${emailHash}, ${ipHash}, ${now}::timestamptz
      where ${sentWithin(sql`email_hash = ${emailHash}`, limits.perRecipientPerHour)}
        and ${sentWithin(sql`email_hash = ${emailHash}`, limits.perRecipientPerDay)}
        and ${sentWithin(sql`ip_hash = ${ipHash}`, limits.perIpPerHour)}
        and ${sentWithin(sql`ip_hash = ${ipHash}`, limits.perIpPerDay)}
        and ${sentWithin(sql`true`, limits.appPerDay)}
        and ${sentWithin(sql`true`, limits.appPerMonth)}
      returning id`,
    sql`delete from auth_events where created_at < ${since(authEventRetentionMs)}::timestamptz`,
    sql`delete from magic_link_tokens where expires_at < ${since(24 * 60 * 60 * 1000)}::timestamptz`
  ]);
  if (inserted && inserted.length > 0) {
    return "allowed";
  }

  // `link_blocked_app` means an app-wide cap refused a visitor: the daily check alerts the owner on it.
  // Each kind is logged at most blockedLogLimitPerDay times a day.
  await runner.execute(sql`with refused as (
      select case when ${sentWithin(sql`true`, limits.appPerDay)} and ${sentWithin(sql`true`, limits.appPerMonth)}
        then 'link_blocked' else 'link_blocked_app' end as kind)
    insert into auth_events (kind, email_hash, ip_hash, created_at)
    select refused.kind, ${emailHash}, ${ipHash}, ${now}::timestamptz from refused
    where (select count(*) from auth_events where auth_events.kind = refused.kind
      and created_at > ${since(24 * 60 * 60 * 1000)}::timestamptz) < ${blockedLogLimitPerDay}::int`);
  return "blocked";
}
