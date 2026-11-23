const developmentSecret = "local-development-secret-change-me";

/** True only on the Vercel production deployment (artmuse.app). Preview and local runs are not production. */
export function isProductionDeployment(env: Record<string, string | undefined> = process.env): boolean {
  return env.VERCEL_ENV === "production";
}

/**
 * The HMAC key for magic-link and session tokens. In production a missing AUTH_SECRET
 * fails closed: the well-known development fallback would let anyone forge a session.
 * The configured value is used exactly as stored, so existing token signatures stay valid.
 */
export function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret?.trim()) {
    return secret;
  }
  if (isProductionDeployment()) {
    throw new Error("Sign-in is not configured on this server (AUTH_SECRET is missing).");
  }
  return developmentSecret;
}
