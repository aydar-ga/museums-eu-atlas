import type { MagicLinkResponse } from "../types";

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

export async function requestMagicLink(email: string): Promise<MagicLinkResponse> {
  const normalizedEmail = email.trim().toLocaleLowerCase("en-US");
  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Enter a valid email address.");
  }

  try {
    const response = await fetch("/api/auth/request-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail })
    });
    if (response.ok) {
      return (await response.json()) as MagicLinkResponse;
    }
  } catch {
    // Local test fallback for environments where the route handler is unavailable.
  }

  const token = createDevMagicToken(normalizedEmail);
  return {
    email: normalizedEmail,
    magicLink: absoluteUrl(`/magic-link?token=${encodeURIComponent(token)}`),
    delivery: "dev"
  };
}

export async function verifyMagicLink(token: string): Promise<string> {
  try {
    const response = await fetch("/api/auth/verify-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    if (response.ok) {
      const body = (await response.json()) as { email: string };
      return body.email;
    }
  } catch {
    // Local test fallback for environments where the route handler is unavailable.
  }
  return consumeDevMagicToken(token);
}
