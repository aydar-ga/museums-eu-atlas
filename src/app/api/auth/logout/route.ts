import { NextRequest, NextResponse } from "next/server";

import { forbidden, isSameOriginRequest } from "@/server/api-guard";
import { clearSessionCookie, deleteSession, sessionIdFrom } from "@/server/sessions";
import { durableSqlRunner } from "@/server/sql-runner";

/**
 * POST only (other methods get 405) and same-origin only, so another site cannot sign a visitor out.
 * Deletes the server-side session and clears the cookie. If the delete fails the cookie is still
 * cleared, and the answer is 503 so the failure is visible.
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return forbidden();
  }
  let deleted = true;
  const id = sessionIdFrom(request);
  if (id) {
    try {
      await deleteSession(durableSqlRunner(), id);
    } catch {
      deleted = false;
    }
  }
  const response = deleted
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json({ error: "Temporarily unavailable. Try again later." }, { status: 503 });
  clearSessionCookie(response);
  return response;
}
