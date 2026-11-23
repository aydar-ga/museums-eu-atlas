import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/db";
import { createMagicToken, isValidEmail } from "@/server/magicTokens";
import {
  checkRateLimits,
  clientIp,
  rateLimitKey,
  rateLimitStoreFor,
  requestLinkLimitPerEmail,
  requestLinkLimitPerIp,
  requestLinkWindowMs
} from "@/server/rateLimit";
import { isProductionDeployment } from "@/server/secret";

const emailUnavailableMessage =
  "Email sign-in isn't available yet. Your museum progress stays saved in this browser.";

function emailDeliveryConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.AUTH_EMAIL_FROM);
}

async function sendWithResend(email: string, magicLink: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  if (!apiKey || !from) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Your ArtMuse sign-in link",
      text: `Sign in to ArtMuse: ${magicLink}\n\nThe link expires in 10 minutes. If you did not ask for it, ignore this email.`,
      html: `<p>Here is your ArtMuse sign-in link:</p><p><a href="${magicLink}">Sign in to ArtMuse</a></p><p>The link expires in 10 minutes. If you did not ask for it, ignore this email.</p>`
    })
  });

  if (!response.ok) {
    throw new Error("Email provider rejected the magic link request.");
  }
  return true;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLocaleLowerCase("en-US") : "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // In production the link must only ever travel by email: returning it in the response
  // would let anyone sign in as any address. Without an email provider, refuse.
  if (isProductionDeployment() && !emailDeliveryConfigured()) {
    return NextResponse.json({ error: emailUnavailableMessage }, { status: 503 });
  }

  let limit;
  try {
    limit = await checkRateLimits(
      rateLimitStoreFor(getDb()),
      [
        { key: rateLimitKey("email", email), limit: requestLinkLimitPerEmail, windowMs: requestLinkWindowMs },
        { key: rateLimitKey("ip", clientIp(request.headers)), limit: requestLinkLimitPerIp, windowMs: requestLinkWindowMs }
      ],
      Date.now()
    );
  } catch {
    // Without a working counter we cannot bound email sends, so refuse rather than fail open.
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterSeconds / 60);
    return NextResponse.json(
      { error: `Too many sign-in requests. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  // Never build the link from the client-supplied Origin header: an attacker could
  // request a link for someone else's address and point the emailed token at their host.
  const origin = process.env.PUBLIC_APP_URL?.trim().replace(/\/+$/, "") || request.nextUrl.origin;
  let token: string;
  try {
    token = createMagicToken(email);
  } catch {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
  const magicLink = `${origin}/magic-link?token=${encodeURIComponent(token)}`;

  let sent: boolean;
  try {
    sent = await sendWithResend(email, magicLink);
  } catch {
    return NextResponse.json({ error: "Could not send the magic link email. Try again later." }, { status: 502 });
  }

  if (sent) {
    // The link proves ownership of the inbox, so it must only travel by email.
    return NextResponse.json({ email, delivery: "email" });
  }

  return NextResponse.json({
    email,
    magicLink,
    delivery: "dev"
  });
}
