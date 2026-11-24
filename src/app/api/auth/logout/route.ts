import { NextRequest, NextResponse } from "next/server";

import { forbidden, isSameOriginRequest } from "@/server/api-guard";

/**
 * POST only (other methods get 405) and same-origin only, so another site cannot sign a visitor out.
 * Sessions are stateless bearer tokens today; the client deletes its copy. Server-side session
 * deletion arrives with cookie sessions.
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return forbidden();
  }
  return new NextResponse(null, { status: 204 });
}
