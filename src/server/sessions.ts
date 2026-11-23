import { createHmac, timingSafeEqual } from "node:crypto";

import { authSecret } from "./secret";

const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000;

function base64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", authSecret()).update(payload).digest("base64url");
}

function verifySignedPayload(token: string): { email: string; exp: number } {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    throw new Error("Session is invalid or expired.");
  }

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error("Session is invalid or expired.");
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    typ?: unknown;
    email?: unknown;
    exp?: unknown;
  };
  // Session tokens issued before token types existed carry no typ; a magic-link token never passes.
  if (
    typeof decoded.email !== "string" ||
    typeof decoded.exp !== "number" ||
    (decoded.typ !== undefined && decoded.typ !== "session")
  ) {
    throw new Error("Session is invalid or expired.");
  }
  if (decoded.exp < Date.now()) {
    throw new Error("Session has expired.");
  }

  return { email: decoded.email, exp: decoded.exp };
}

export function createSessionToken(email: string): string {
  const payload = base64url(
    JSON.stringify({
      typ: "session",
      email: email.trim().toLocaleLowerCase("en-US"),
      exp: Date.now() + sessionLifetimeMs
    })
  );
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): string {
  return verifySignedPayload(token).email;
}
