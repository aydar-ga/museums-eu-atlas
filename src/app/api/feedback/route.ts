import { NextRequest, NextResponse } from "next/server";

import { isVercelDeployment, serverEnv } from "@/lib/env";
import { feedbackMemoryLimitPerIp } from "@/server/abuse-limits";
import { forbidden, isSameOriginRequest, readJsonBody, temporarilyUnavailable, tooManyRequests } from "@/server/api-guard";
import { hashIdentifier } from "@/server/email-guard";
import { notifyOwnerOfFeedback, storeFeedback } from "@/server/feedback";
import { feedbackPayload } from "@/server/payloads";
import { checkRateLimits, clientIp, ipBucket, memoryRateLimitStore, rateLimitKey } from "@/server/rateLimit";
import { durableSqlRunner } from "@/server/sql-runner";

const invalidMessage = "Write a message of at least 5 characters (up to 2,000), and check the email if you gave one.";
const tooManyMessage = "Thanks — that's enough messages for now. Try again later.";

/**
 * Visitor feedback. Checks run cheapest first and fail closed: same-origin, body size and shape, honeypot,
 * kill switch, per-instance memory limit, then the durable caps while storing. The owner email is best-effort.
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return forbidden();
  }
  const parsed = await readJsonBody(request, feedbackPayload, invalidMessage);
  if (!parsed.ok) {
    return parsed.response;
  }
  const body = parsed.value;
  // Honeypot: people never fill the hidden field, form bots do. Pretend success and store nothing.
  if (body.website?.trim()) {
    return NextResponse.json({ ok: true });
  }
  if (!serverEnv().FEEDBACK_ENABLED) {
    return NextResponse.json({ error: "Feedback is switched off for now. Please try again later." }, { status: 503 });
  }

  const nowMs = Date.now();
  const ip = ipBucket(clientIp(request.headers));
  const input = { kind: body.kind, message: body.message, replyEmail: body.email };
  const runner = durableSqlRunner();
  try {
    const firstLayer = await checkRateLimits(
      memoryRateLimitStore(),
      [{ key: rateLimitKey("feedback-ip", ip), ...feedbackMemoryLimitPerIp }],
      nowMs
    );
    if (!firstLayer.allowed) {
      return tooManyRequests(tooManyMessage);
    }
    if (!runner) {
      // Local runs without a database accept the message and keep nothing; deployments must store it.
      return isVercelDeployment() ? temporarilyUnavailable() : NextResponse.json({ ok: true, stored: false });
    }
    const decision = await storeFeedback(runner, { ...input, ipHash: hashIdentifier("ip", ip), nowMs });
    if (decision === "blocked") {
      return tooManyRequests(tooManyMessage);
    }
  } catch {
    return temporarilyUnavailable();
  }

  try {
    await notifyOwnerOfFeedback(runner, input, nowMs);
  } catch {
    // The message is stored and the digest counts it; a failed alert email must not fail the visitor.
  }
  return NextResponse.json({ ok: true });
}
