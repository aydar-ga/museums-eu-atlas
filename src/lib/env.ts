import { z } from "zod";

import { getDatabaseUrlFromEnv } from "./vercel-build";

/**
 * The only module in `src/` that reads `process.env` (tooling configs and `scripts/` are outside the app).
 *
 * Two kinds of variables live here:
 *
 * 1. Build-time flags. Next.js inlines `process.env.NODE_ENV` and `NEXT_PUBLIC_*` when it bundles,
 *    so these constants are safe to import from client components.
 * 2. Server configuration, parsed with a Zod schema by `serverEnv()` on every call. Parsing happens at
 *    request time, never at import, so `next build` succeeds without secrets (Preview and CI builds),
 *    and a missing or malformed value fails the request that needs it, closed. There are no secret
 *    fallbacks: code that needs a secret calls a `require*` accessor, which throws when it is missing.
 */

/** True for `next build` output, including Vercel Preview and Production. Dev-only helpers check it. */
export const isProductionBuild = process.env.NODE_ENV === "production";

function serverSchema() {
  // Built lazily, so a client component importing only `isProductionBuild` does not bundle Zod.
  /** Unset and whitespace-only values both mean "not configured". */
  const optionalString = z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value : undefined));

  return z.object({
    NODE_ENV: optionalString,
    VERCEL_ENV: optionalString,
    VERCEL_GIT_COMMIT_SHA: optionalString,
    GIT_COMMIT: optionalString,
    npm_package_version: optionalString,
    AUTH_SECRET: optionalString,
    DATABASE_URL: optionalString,
    POSTGRES_URL: optionalString,
    POSTGRES_PRISMA_URL: optionalString,
    PUBLIC_APP_URL: optionalString.pipe(
      z
        .url({ protocol: /^https?$/ })
        .transform((url) => url.replace(/\/+$/, ""))
        .optional()
    ),
    RESEND_API_KEY: optionalString,
    AUTH_EMAIL_FROM: optionalString
  });
}

export type ServerEnv = z.infer<ReturnType<typeof serverSchema>>;

/** Parses the server environment. Throws, naming only the offending variables, when a value is malformed. */
export function serverEnv(): ServerEnv {
  const parsed = serverSchema().safeParse(process.env);
  if (!parsed.success) {
    const names = [...new Set(parsed.error.issues.map((issue) => issue.path.join(".")))].join(", ");
    throw new Error(`Server configuration is invalid: ${names}.`);
  }
  return parsed.data;
}

/** True only on the Vercel production deployment (artmuse.app). Preview and local runs are not production. */
export function isProductionDeployment(): boolean {
  return serverEnv().VERCEL_ENV === "production";
}

/** The HMAC key for magic-link and session tokens. Throws when AUTH_SECRET is missing, in every environment. */
export function requireAuthSecret(): string {
  const secret = serverEnv().AUTH_SECRET;
  if (!secret) {
    throw new Error("Sign-in is not configured on this server (AUTH_SECRET is missing).");
  }
  return secret;
}

/** Neon/Postgres URL: `DATABASE_URL`, else Vercel's `POSTGRES_URL`, else `POSTGRES_PRISMA_URL`. */
export function databaseUrl(): string | null {
  return getDatabaseUrlFromEnv(serverEnv());
}

/** Resend credentials, or null when email delivery is not configured. */
export function emailDelivery(): { apiKey: string; from: string } | null {
  const env = serverEnv();
  return env.RESEND_API_KEY && env.AUTH_EMAIL_FROM ? { apiKey: env.RESEND_API_KEY, from: env.AUTH_EMAIL_FROM } : null;
}
