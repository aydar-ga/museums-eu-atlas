import type { MagicLinkResponse, VerifyLinkResponse } from "../types";
import { isProductionBuild } from "./env";

const devTokenPrefix = "dev.";

export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
}

function absoluteUrl(path: string): string {
  return new URL(path, window.location.origin).toString();
}

export function createDevMagicToken(email: string): string {
  return `${devTokenPrefix}${btoa(
    JSON.stringify({
      email: email.trim().toLocaleLowerCase("en-US"),
      exp: Date.now() + 10 * 60 * 1000
    })
  )}`;
}

export function consumeDevMagicToken(token: string): string {
  if (!token.startsWith(devTokenPrefix)) {
    throw new Error("Magic link is invalid or expired.");
  }
  const payload = JSON.parse(atob(token.slice(devTokenPrefix.length))) as {
    email?: unknown;
    exp?: unknown;
  };
  if (typeof payload.email !== "string" || typeof payload.exp !== "number") {
    throw new Error("Magic link is invalid or expired.");
  }
  if (payload.exp < Date.now()) {
    throw new Error("Magic link has expired. Request a new link.");
  }
  return payload.email;
}

// Local test fallback for environments where the route handlers are unreachable
// (unit tests). Never used in production builds.
const allowLocalFallback = !isProductionBuild;

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return typeof body?.error === "string" && body.error ? body.error : fallback;
}

/** `website` is the honeypot field: people leave it empty, form bots fill it in. */
export async function requestMagicLink(email: string, website = ""): Promise<MagicLinkResponse> {
  const normalizedEmail = email.trim().toLocaleLowerCase("en-US");
  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Enter a valid email address.");
  }

  let response: Response;
  try {
    response = await fetch("/api/auth/request-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(website ? { email: normalizedEmail, website } : { email: normalizedEmail })
    });
  } catch {
    if (!allowLocalFallback) {
      throw new Error("Could not reach the server. Check your connection and try again.");
    }
    const token = createDevMagicToken(normalizedEmail);
    return {
      email: normalizedEmail,
      magicLink: absoluteUrl(`/magic-link?token=${encodeURIComponent(token)}`),
      delivery: "dev"
    };
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Could not create a magic link."));
  }
  return (await response.json()) as MagicLinkResponse;
}

export async function verifyMagicLink(token: string): Promise<VerifyLinkResponse> {
  let response: Response;
  try {
    response = await fetch("/api/auth/verify-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
  } catch {
    if (!allowLocalFallback) {
      throw new Error("Could not reach the server. Check your connection and try again.");
    }
    return { email: consumeDevMagicToken(token) };
  }

  if (!response.ok) {
    if (allowLocalFallback && token.startsWith(devTokenPrefix)) {
      return { email: consumeDevMagicToken(token) };
    }
    throw new Error(await readErrorMessage(response, "Magic link is invalid or expired."));
  }
  return (await response.json()) as VerifyLinkResponse;
}
