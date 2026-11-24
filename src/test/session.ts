import { createSession, sessionCookieName } from "@/server/sessions";

/** A `cookie` header value for a per-process (no database) session. */
export async function sessionCookieFor(email: string): Promise<string> {
  return `${sessionCookieName}=${await createSession(null, { email }, Date.now())}`;
}
