import { NextRequest, NextResponse } from "next/server";

import { devAffordancesEnabled, serverEnv } from "@/lib/env";
import { isValidEmail } from "@/server/magicTokens";
import { createSession, setSessionCookie } from "@/server/sessions";
import { durableSqlRunner } from "@/server/sql-runner";
import { recordUserSignIn } from "@/server/users";

export async function POST(request: NextRequest) {
  // Local dev and e2e builds only; never on a Vercel deployment, whatever flags are set there.
  const { VERCEL_ENV } = serverEnv();
  if (!devAffordancesEnabled || VERCEL_ENV === "production" || VERCEL_ENV === "preview") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLocaleLowerCase("en-US") : "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const runner = durableSqlRunner();
  const user = await recordUserSignIn(runner, email);
  const response = NextResponse.json({ email });
  setSessionCookie(response, await createSession(runner, { email, userId: user?.userId }, Date.now()));
  return response;
}
