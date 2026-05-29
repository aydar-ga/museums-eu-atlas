import { NextRequest, NextResponse } from "next/server";

import { verifyMagicToken } from "@/server/magicTokens";
import { recordUserSignIn } from "@/server/users";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { token?: unknown };
    const token = typeof body.token === "string" ? body.token : "";
    const email = verifyMagicToken(token);
    await recordUserSignIn(email);
    return NextResponse.json({ email });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Magic link is invalid or expired."
      },
      { status: 400 }
    );
  }
}
