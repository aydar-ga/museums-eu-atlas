import { NextRequest, NextResponse } from "next/server";

import { createMagicToken, isValidEmail } from "@/server/magicTokens";

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
      subject: "Your Museums EU Atlas magic link",
      html: `<p>Open your Museums EU Atlas magic link:</p><p><a href="${magicLink}">${magicLink}</a></p><p>This link expires in 10 minutes.</p>`
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

  const origin =
    process.env.PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    new URL(request.url).origin;
  const token = createMagicToken(email);
  const magicLink = `${origin}/magic-link?token=${encodeURIComponent(token)}`;
  const sent = await sendWithResend(email, magicLink);

  return NextResponse.json({
    email,
    magicLink,
    delivery: sent ? "email" : "dev"
  });
}
