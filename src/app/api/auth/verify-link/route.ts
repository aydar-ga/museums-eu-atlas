import { NextRequest, NextResponse } from "next/server";

import { verifyLinkLimitPerIp } from "@/server/abuse-limits";
import { notifyOwnerOfSignUp, recordSignInEvents } from "@/server/auth-events";
import { forbidden, isSameOriginRequest, readJsonObject, temporarilyUnavailable, tooManyRequests } from "@/server/api-guard";
import { consumeMagicToken } from "@/server/magicTokens";
import { checkRateLimits, clientIp, rateLimitKey, rateLimitStoreFor } from "@/server/rateLimit";
import { createSessionToken } from "@/server/sessions";
import { durableSqlRunner, type SqlRunner } from "@/server/sql-runner";
import { recordUserSignIn } from "@/server/users";

const invalidLink = () => NextResponse.json({ error: "Magic link is invalid or expired." }, { status: 400 });

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return forbidden();
  }

  const nowMs = Date.now();
  let runner: SqlRunner | null;
  try {
    runner = durableSqlRunner();
    const limit = await checkRateLimits(
      rateLimitStoreFor(runner),
      [{ key: rateLimitKey("verify-ip", clientIp(request.headers)), ...verifyLinkLimitPerIp }],
      nowMs
    );
    if (!limit.allowed) {
      return tooManyRequests();
    }
  } catch {
    return temporarilyUnavailable();
  }

  const parsed = await readJsonObject(request);
  if (!parsed.ok) {
    return parsed.response;
  }
  const token = typeof parsed.value.token === "string" ? parsed.value.token : "";

  let email: string;
  try {
    email = await consumeMagicToken(runner, token, nowMs);
  } catch {
    // Same answer for a forged, expired, reused or unknown token, and for a database failure.
    return invalidLink();
  }
  let user;
  try {
    user = await recordUserSignIn(runner, email, nowMs);
  } catch {
    return temporarilyUnavailable();
  }
  if (runner && user) {
    // Monitoring is best effort: a failed event row or alert never blocks the sign-in.
    await recordSignInEvents(runner, user, nowMs).catch(() => undefined);
    if (user.isNew) {
      await notifyOwnerOfSignUp(runner, email, nowMs).catch(() => false);
    }
  }
  return NextResponse.json({ email, sessionToken: createSessionToken(email) });
}
