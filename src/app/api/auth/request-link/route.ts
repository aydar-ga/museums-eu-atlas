import { NextRequest, NextResponse } from "next/server";

import { emailDelivery, isVercelDeployment, serverEnv } from "@/lib/env";
import { forbidden, isSameOriginRequest, readJsonObject, temporarilyUnavailable, tooManyRequests } from "@/server/api-guard";
import { hashIdentifier, reserveEmailSend } from "@/server/email-guard";
import { createMagicToken, isValidEmail, recordIssuedMagicToken } from "@/server/magicTokens";
import {
  checkRateLimits,
  clientIp,
  memoryRateLimitStore,
  rateLimitKey,
  requestLinkLimitPerEmail,
  requestLinkLimitPerIp,
  requestLinkWindowMs
} from "@/server/rateLimit";
import { durableSqlRunner } from "@/server/sql-runner";

const emailUnavailableMessage =
  "Email sign-in isn't available yet. Your museum progress stays saved in this browser.";
const tooManyMessage = "Too many sign-in requests. Try again later.";

async function sendWithResend(delivery: { apiKey: string; from: string }, email: string, magicLink: string): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${delivery.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: delivery.from,
      to: email,
      subject: "Your ArtMuse sign-in link",
      text: `Sign in to ArtMuse: ${magicLink}\n\nThe link works once and expires in 15 minutes. If you did not ask for it, ignore this email.`,
      html: `<p>Here is your ArtMuse sign-in link:</p><p><a href="${magicLink}">Sign in to ArtMuse</a></p><p>The link works once and expires in 15 minutes. If you did not ask for it, ignore this email.</p>`
    })
  });

  if (!response.ok) {
    throw new Error("Email provider rejected the magic link request.");
  }
}

/**
 * Checks run cheapest first and every one fails closed: same-origin, body size, honeypot, email shape,
 * kill switch, per-instance memory limits, then the durable Postgres caps (docs/security-guardrails.md).
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return forbidden();
  }
  const parsed = await readJsonObject(request);
  if (!parsed.ok) {
    return parsed.response;
  }
  const body = parsed.value;
  const email = typeof body.email === "string" ? body.email.trim().toLocaleLowerCase("en-US") : "";

  // Honeypot: people never fill the hidden field, form bots do. Pretend success and send nothing.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ email, delivery: "email" });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // Kill switch: deployments send only when AUTH_EMAIL_ENABLED is "true" and Resend is configured.
  // The link is never returned in the response there; only local runs get it inline.
  const delivery = emailDelivery();
  if (!delivery && isVercelDeployment()) {
    return NextResponse.json({ error: emailUnavailableMessage }, { status: 503 });
  }

  const nowMs = Date.now();
  const ip = clientIp(request.headers);
  let token: string;
  let origin: string;
  try {
    const firstLayer = await checkRateLimits(
      memoryRateLimitStore(),
      [
        { key: rateLimitKey("email", email), limit: requestLinkLimitPerEmail, windowMs: requestLinkWindowMs },
        { key: rateLimitKey("ip", ip), limit: requestLinkLimitPerIp, windowMs: requestLinkWindowMs }
      ],
      nowMs
    );
    if (!firstLayer.allowed) {
      return tooManyRequests(tooManyMessage);
    }

    const runner = durableSqlRunner();
    if (runner) {
      const decision = await reserveEmailSend(runner, {
        emailHash: hashIdentifier("email", email),
        ipHash: hashIdentifier("ip", ip),
        nowMs
      });
      if (decision === "blocked") {
        return tooManyRequests(tooManyMessage);
      }
    }
    // Never build the link from the client-supplied Origin header: an attacker could
    // request a link for someone else's address and point the emailed token at their host.
    origin = serverEnv().PUBLIC_APP_URL ?? request.nextUrl.origin;
    token = createMagicToken(email);
    await recordIssuedMagicToken(runner, token, nowMs);
  } catch {
    return temporarilyUnavailable();
  }
  const magicLink = `${origin}/magic-link?token=${encodeURIComponent(token)}`;

  if (!delivery) {
    // Local runs only (checked above): no email provider, so hand the link to the developer.
    return NextResponse.json({ email, magicLink, delivery: "dev" });
  }
  try {
    await sendWithResend(delivery, email, magicLink);
  } catch {
    return NextResponse.json({ error: "Could not send the magic link email. Try again later." }, { status: 502 });
  }
  // The link proves ownership of the inbox, so it only travels by email.
  return NextResponse.json({ email, delivery: "email" });
}
