import { createHmac, timingSafeEqual } from "node:crypto";

const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000;

function secret(): string {
  return process.env.AUTH_SECRET || "local-development-secret-change-me";
}

function base64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
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
    email?: unknown;
    exp?: unknown;
  };
  if (typeof decoded.email !== "string" || typeof decoded.exp !== "number") {
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
      email: email.trim().toLocaleLowerCase("en-US"),
      exp: Date.now() + sessionLifetimeMs
    })
  );
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): string {
  return verifySignedPayload(token).email;
}
