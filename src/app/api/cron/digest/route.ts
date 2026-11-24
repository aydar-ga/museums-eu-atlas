import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { emailDelivery, serverEnv } from "@/lib/env";
import { temporarilyUnavailable, unauthorized } from "@/server/api-guard";
import { digestCounts, digestText } from "@/server/auth-events";
import { sendEmail } from "@/server/email";
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

/** Daily owner digest (vercel.json cron, 07:00 UTC). Sends only when something happened in the last 24 hours. */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return unauthorized();
  }
  const nowMs = Date.now();
  let counts;
  try {
    const runner = durableSqlRunner();
    if (!runner) {
      return temporarilyUnavailable();
    }
    counts = await digestCounts(runner, nowMs);
  } catch {
    return temporarilyUnavailable();
  }

  const happened = counts.signUps + counts.signIns + counts.linkRequests + counts.blocked > 0;
  const delivery = emailDelivery();
  const to = serverEnv().OWNER_ALERT_EMAIL;
  if (!happened || !delivery || !to) {
    return NextResponse.json({ sent: false, counts });
  }
  try {
    await sendEmail(delivery, { to, subject: `ArtMuse daily: ${counts.signUps} sign-ups, ${counts.signIns} sign-ins`, text: digestText(counts, nowMs) });
  } catch {
    return NextResponse.json({ sent: false, counts }, { status: 502 });
  }
  return NextResponse.json({ sent: true, counts });
}
