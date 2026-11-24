import { sql, type SQL } from "drizzle-orm";

import { emailDelivery, serverEnv } from "@/lib/env";
import { feedbackKindLabels, type FeedbackKind } from "@/lib/feedback";
import { feedbackAlertLimit, feedbackLimits, feedbackRetentionMs } from "./abuse-limits";
import { sendEmail } from "./email";
import { checkRateLimits, createDbRateLimitStore } from "./rateLimit";
import type { SqlRunner } from "./sql-runner";

/** Serialises concurrent stores, so N parallel requests cannot all pass the same count. */
const feedbackLockKey = 7_202_612;

export type FeedbackInput = { kind: FeedbackKind; message: string; replyEmail?: string };

/**
 * Atomically checks the per-IP and app-wide caps and, if all pass, stores the message. Any database error
 * propagates: callers must treat it as a refusal.
 */
export async function storeFeedback(
  runner: SqlRunner,
  input: FeedbackInput & { ipHash: string; nowMs: number }
): Promise<"stored" | "blocked"> {
  const since = (windowMs: number) => new Date(input.nowMs - windowMs).toISOString();
  const under = (scope: SQL, rule: { limit: number; windowMs: number }) =>
    sql`(select count(*) from feedback_messages where ${scope} and created_at > ${since(rule.windowMs)}::timestamptz) < ${rule.limit}::int`;
  const [, inserted] = await runner.transaction([
    sql`select pg_advisory_xact_lock(${feedbackLockKey}::bigint)`,
    sql`insert into feedback_messages (kind, message, reply_email, ip_hash, created_at)
      select ${input.kind}, ${input.message}, ${input.replyEmail ?? null}, ${input.ipHash}, ${new Date(input.nowMs).toISOString()}::timestamptz
      where ${under(sql`ip_hash = ${input.ipHash}`, feedbackLimits.perIpPerHour)}
        and ${under(sql`ip_hash = ${input.ipHash}`, feedbackLimits.perIpPerDay)}
        and ${under(sql`true`, feedbackLimits.appPerDay)}
      returning id`
  ]);
  return inserted && inserted.length > 0 ? "stored" : "blocked";
}

/**
 * Emails the message to the owner. There is deliberately no Reply-To: replying from the inbox that receives
 * alerts would reveal its address to whatever email the visitor typed. At most `feedbackAlertLimit` a day;
 * returns whether it sent. Callers must not let a failure here affect the visitor's submission.
 */
export async function notifyOwnerOfFeedback(runner: SqlRunner, input: FeedbackInput, nowMs: number): Promise<boolean> {
  const delivery = emailDelivery();
  const to = serverEnv().OWNER_ALERT_EMAIL;
  if (!delivery || !to) {
    return false;
  }
  const limit = await checkRateLimits(createDbRateLimitStore(runner), [{ key: "owner-alert:feedback", ...feedbackAlertLimit }], nowMs);
  if (!limit.allowed) {
    // Recorded so the daily check can tell the owner some messages were never emailed. Bounded by the
    // app-wide feedback cap (feedbackLimits.appPerDay), since only stored messages reach this point.
    await runner.execute(sql`insert into auth_events (kind, created_at) values ('feedback_alert_skipped', ${new Date(nowMs).toISOString()}::timestamptz)`);
    return false;
  }
  const when = new Date(nowMs).toISOString().replace("T", " ").slice(0, 16);
  await sendEmail(
    delivery,
    {
      to,
      subject: `💬 ArtMuse: ${feedbackKindLabels[input.kind]}`,
      text: [
        `${feedbackKindLabels[input.kind]} — ${when} UTC`,
        "",
        input.message || "(no message)",
        "",
        input.replyEmail
          ? `Visitor's email: ${input.replyEmail}\nReply from a separate address, not from this inbox: replying here reveals this address.`
          : "No reply address given."
      ].join("\n")
    },
    2500
  );
  return true;
}

export type FeedbackCounts = { messages: number; interest: number };

/** Messages stored in the 24 hours before `nowMs`, and how many of them were "I'd like more". */
export async function feedbackCounts(runner: SqlRunner, nowMs: number): Promise<FeedbackCounts> {
  const since = new Date(nowMs - 24 * 60 * 60 * 1000).toISOString();
  const { rows } = await runner.execute(sql`select count(*)::int as messages,
      count(*) filter (where kind = 'interest')::int as interest
    from feedback_messages where created_at > ${since}::timestamptz`);
  return { messages: Number(rows[0]?.messages ?? 0), interest: Number(rows[0]?.interest ?? 0) };
}

/**
 * Deletes messages older than the retention period, and blanks the IP hash once the per-IP caps (24 hours)
 * no longer need it. Run by the daily digest cron.
 */
export async function pruneFeedback(runner: SqlRunner, nowMs: number): Promise<void> {
  await runner.execute(sql`delete from feedback_messages where created_at < ${new Date(nowMs - feedbackRetentionMs).toISOString()}::timestamptz`);
  await runner.execute(sql`update feedback_messages set ip_hash = '' where ip_hash <> ''
    and created_at < ${new Date(nowMs - 2 * 24 * 60 * 60 * 1000).toISOString()}::timestamptz`);
}
