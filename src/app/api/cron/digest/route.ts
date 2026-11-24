import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { emailDelivery, serverEnv } from "@/lib/env";
import { temporarilyUnavailable, unauthorized } from "@/server/api-guard";
import { digestCounts, digestText } from "@/server/auth-events";
import { sendEmail } from "@/server/email";
import { feedbackCounts, pruneFeedback, type FeedbackCounts } from "@/server/feedback";
import { pruneProductEvents, recentProductEvents, type ProductEventCount } from "@/server/product-events";
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

/** The feedback and product-event sections appended to the sign-in digest. */
export function activityText(feedback: FeedbackCounts, events: ProductEventCount[]): string {
  const lines = ["", `Feedback messages: ${feedback.messages} (of them "I'd like more": ${feedback.interest})`];
  if (events.length > 0) {
    lines.push("", "Visitor actions yesterday (UTC day, anonymous counts):");
    for (const event of events) {
      lines.push(`  ${event.name}${event.subject ? ` · ${event.subject}` : ""}: ${event.count}`);
    }
  }
  return lines.join("\n");
}

/**
 * Daily owner digest (vercel.json cron, 07:00 UTC). Sends only when something happened in the last 24 hours.
 * Also prunes feedback and product-event rows past their retention.
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
  // Feedback and visitor actions are extras: a failure here must not stop the sign-in digest.
  let feedback: FeedbackCounts = { messages: 0, interest: 0 };
  let events: ProductEventCount[] = [];
  try {
    feedback = await feedbackCounts(runner, nowMs);
    events = await recentProductEvents(runner, nowMs);
    await pruneFeedback(runner, nowMs);
    await pruneProductEvents(runner, nowMs);
  } catch {
    // Reported as zero; the next run retries.
  }

  const happened = counts.signUps + counts.signIns + counts.linkRequests + counts.blocked + feedback.messages + events.length > 0;
  const delivery = emailDelivery();
  const to = serverEnv().OWNER_ALERT_EMAIL;
  if (!happened || !delivery || !to) {
    return NextResponse.json({ sent: false, counts, feedback });
  }
  try {
    await sendEmail(delivery, { to, subject: `ArtMuse daily: ${counts.signUps} sign-ups, ${feedback.messages} messages`, text: digestText(counts, nowMs) + activityText(feedback, events) });
  } catch {
    return NextResponse.json({ sent: false, counts, feedback }, { status: 502 });
  }
  return NextResponse.json({ sent: true, counts, feedback });
}
