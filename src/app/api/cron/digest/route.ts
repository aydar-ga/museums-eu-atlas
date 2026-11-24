import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { emailDelivery, serverEnv } from "@/lib/env";
import { temporarilyUnavailable, unauthorized } from "@/server/api-guard";
import { emailSendLimits, feedbackAlertLimit, productEventLimits } from "@/server/abuse-limits";
import { digestCounts, digestText, type DigestCounts } from "@/server/auth-events";
import { sendEmail } from "@/server/email";
import { feedbackCounts, pruneFeedback, type FeedbackCounts } from "@/server/feedback";
import { pruneProductEvents, yesterdayProductEventTotal } from "@/server/product-events";
import { durableSqlRunner } from "@/server/sql-runner";

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Without a configured secret nothing is allowed. */
function isAuthorizedCron(request: NextRequest): boolean {
  const secret = serverEnv().CRON_SECRET;
  if (!secret) {
    return false;
  }
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(request.headers.get("authorization") ?? ""), digest(`Bearer ${secret}`));
}

/**
 * What needs the owner's attention: only refusals that turned real visitors away, and dropped data.
 * Each is recorded when it happens (auth_events kinds `link_blocked_app` and `feedback_alert_skipped`), so the
 * check never guesses from totals whose window differs from the cap's. An empty list means no email.
 */
export function attentionReasons(counts: DigestCounts, eventsYesterday: number): string[] {
  const reasons: string[] = [];
  if (counts.appBlocked > 0) {
    reasons.push(
      `The app-wide sign-in email cap refused ${counts.appBlocked} sign-in requests (${emailSendLimits.appPerDay.limit} a day, ` +
        `${emailSendLimits.appPerMonth.limit} per 31 days): those visitors got no link.`
    );
  }
  if (counts.feedbackAlertsSkipped > 0) {
    reasons.push(
      `${counts.feedbackAlertsSkipped} feedback messages were not emailed (alert cap: ${feedbackAlertLimit.limit} a day). Read them in feedback_messages.`
    );
  }
  if (eventsYesterday >= productEventLimits.appEventsPerDay) {
    reasons.push(`The visitor-action counts reached their daily cap (${productEventLimits.appEventsPerDay}); later actions were dropped.`);
  }
  return reasons;
}

/**
 * Daily check (vercel.json cron, 07:00 UTC). Emails the owner only when something needs attention
 * (`attentionReasons`); a normal day sends nothing. Always prunes feedback and product-event rows past retention.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return unauthorized();
  }
  const nowMs = Date.now();
  const runner = durableSqlRunner();
  if (!runner) {
    return temporarilyUnavailable();
  }
  let counts;
  try {
    counts = await digestCounts(runner, nowMs);
  } catch {
    return temporarilyUnavailable();
  }
  // Feedback and visitor actions are extras: a failure here must not stop the sign-in check.
  let feedback: FeedbackCounts = { messages: 0, interest: 0 };
  let eventsYesterday = 0;
  try {
    feedback = await feedbackCounts(runner, nowMs);
    eventsYesterday = await yesterdayProductEventTotal(runner, nowMs);
    await pruneFeedback(runner, nowMs);
    await pruneProductEvents(runner, nowMs);
  } catch {
    // Treated as zero; the next run retries.
  }

  const reasons = attentionReasons(counts, eventsYesterday);
  const delivery = emailDelivery();
  const to = serverEnv().OWNER_ALERT_EMAIL;
  if (reasons.length === 0 || !delivery || !to) {
    return NextResponse.json({ sent: false, reasons, counts, feedback });
  }
  const text = ["Something needs a look:", ...reasons.map((reason) => `- ${reason}`), "", digestText(counts, nowMs)].join("\n");
  try {
    await sendEmail(delivery, { to, subject: `ArtMuse needs a look: ${reasons.length} ${reasons.length === 1 ? "issue" : "issues"}`, text });
  } catch {
    return NextResponse.json({ sent: false, reasons, counts, feedback }, { status: 502 });
  }
  return NextResponse.json({ sent: true, reasons, counts, feedback });
}
