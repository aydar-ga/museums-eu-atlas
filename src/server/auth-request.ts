import type { NextRequest } from "next/server";

import { verifySessionToken } from "@/server/sessions";

export function readBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

export function getAuthenticatedEmail(request: NextRequest): string | null {
  const token = readBearerToken(request);
  if (!token) {
    return null;
  }

  try {
    return verifySessionToken(token);
  } catch {
    return null;
  }
}
