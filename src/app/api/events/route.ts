import { NextRequest, NextResponse } from "next/server";

import { serverEnv } from "@/lib/env";
import { productEventLimits } from "@/server/abuse-limits";
import { forbidden, isSameOriginRequest, readJsonBody, temporarilyUnavailable, tooManyRequests } from "@/server/api-guard";
import { productEventsPayload } from "@/server/payloads";
import { recordProductEvents } from "@/server/product-events";
import { checkRateLimits, clientIp, ipBucket, memoryRateLimitStore, rateLimitKey } from "@/server/rateLimit";
import { durableSqlRunner } from "@/server/sql-runner";

const noContent = () => new NextResponse(null, { status: 204 });

/**
 * Anonymous product events, one beacon per page visit (src/lib/product-events.ts). Nothing identifying is
 * read or stored: the IP only feeds the per-instance flood limit and is never written.
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return forbidden();
  }
  const parsed = await readJsonBody(request, productEventsPayload, "Invalid events");
  if (!parsed.ok) {
    return parsed.response;
  }
  const { events } = parsed.value;
  if (!serverEnv().PRODUCT_EVENTS_ENABLED || events.length === 0) {
    return noContent();
  }
  const nowMs = Date.now();
  try {
    const limit = await checkRateLimits(
      memoryRateLimitStore(),
      [{ key: rateLimitKey("events-ip", ipBucket(clientIp(request.headers))), ...productEventLimits.beaconsPerIp }],
      nowMs
    );
    if (!limit.allowed) {
      return tooManyRequests();
    }
    const runner = durableSqlRunner();
    if (!runner) {
      return noContent();
    }
    await recordProductEvents(runner, events, nowMs);
  } catch {
    return temporarilyUnavailable();
  }
  return noContent();
}
