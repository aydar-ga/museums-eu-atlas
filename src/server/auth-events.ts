import { sql } from "drizzle-orm";

import { emailDelivery, serverEnv } from "@/lib/env";
import { ownerAlertLimit } from "./abuse-limits";
import { sendEmail } from "./email";
import { checkRateLimits, createDbRateLimitStore } from "./rateLimit";
import type { SqlRunner } from "./sql-runner";
import type { SignedInUser } from "./users";

/** Logs `sign_in` for every successful sign-in and `sign_up` for a new account. No email or IP is stored. */
export async function recordSignInEvents(runner: SqlRunner, user: SignedInUser, nowMs: number): Promise<void> {
  const now = new Date(nowMs).toISOString();
  await runner.execute(sql`insert into auth_events (kind, user_id, created_at)
    select kind, ${user.userId}::uuid, ${now}::timestamptz
    from unnest(${user.isNew ? "{sign_in,sign_up}" : "{sign_in}"}::text[]) as kind`);
}

/** "s***@example.com": enough to recognise a sign-up, not enough to read the address. */
export function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
}

/**
 * Emails the owner about a new account, at most `ownerAlertLimit` times a day. Returns whether it sent.
 * Callers must not let a failure here affect the sign-in.
 */
export async function notifyOwnerOfSignUp(runner: SqlRunner, email: string, nowMs: number): Promise<boolean> {
  const delivery = emailDelivery();
  const to = serverEnv().OWNER_ALERT_EMAIL;
  if (!delivery || !to) {
    return false;
  }
  const limit = await checkRateLimits(createDbRateLimitStore(runner), [{ key: "owner-alert:sign-up", ...ownerAlertLimit }], nowMs);
  if (!limit.allowed) {
    return false;
  }
  const when = new Date(nowMs).toISOString().replace("T", " ").slice(0, 16);
  await sendEmail(delivery, {
    to,
    subject: "🎉 New ArtMuse sign-up",
    text: `New ArtMuse account: ${maskEmail(email)}\nSigned up at ${when} UTC.`
  }, 2500);
  return true;
}

export type DigestCounts = {
  signUps: number;
  signIns: number;
  linkRequests: number;
  blocked: number;
  totalUsers: number;
};

/** Counts for the 24 hours before `nowMs`, plus the all-time number of accounts. */
export async function digestCounts(runner: SqlRunner, nowMs: number): Promise<DigestCounts> {
  const since = new Date(nowMs - 24 * 60 * 60 * 1000).toISOString();
  const { rows } = await runner.execute(sql`select
      count(*) filter (where kind = 'sign_up')::int as sign_ups,
      count(*) filter (where kind = 'sign_in')::int as sign_ins,
      count(*) filter (where kind = 'link_requested')::int as link_requests,
      count(*) filter (where kind = 'link_blocked')::int as blocked,
      (select count(*)::int from users) as total_users
    from auth_events where created_at > ${since}::timestamptz`);
  const row = rows[0] ?? {};
  return {
    signUps: Number(row.sign_ups ?? 0),
    signIns: Number(row.sign_ins ?? 0),
    linkRequests: Number(row.link_requests ?? 0),
    blocked: Number(row.blocked ?? 0),
    totalUsers: Number(row.total_users ?? 0)
  };
}

export function digestText(counts: DigestCounts, nowMs: number): string {
  return [
    `ArtMuse, last 24 hours (to ${new Date(nowMs).toISOString().slice(0, 16).replace("T", " ")} UTC)`,
    "",
    `Sign-ups: ${counts.signUps}`,
    `Sign-ins: ${counts.signIns}`,
    `Sign-in links sent: ${counts.linkRequests}`,
    `Blocked link requests: ${counts.blocked}`,
    `Total accounts: ${counts.totalUsers}`
  ].join("\n");
}
