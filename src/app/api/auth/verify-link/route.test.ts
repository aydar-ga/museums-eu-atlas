// @vitest-environment node
import { NextRequest } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { SqlRunner } from "@/server/sql-runner";
import { createTestDatabase, failingRunner, type TestDatabase } from "@/test/pglite";

const durable = vi.hoisted(() => ({ runner: null as SqlRunner | null }));
vi.mock("@/server/sql-runner", () => ({ durableSqlRunner: () => durable.runner }));

import { createMagicToken, recordIssuedMagicToken } from "@/server/magicTokens";
import { resetMemoryRateLimitStore } from "@/server/rateLimit";
import { readSessionEmail, sessionCookieName } from "@/server/sessions";
import { POST } from "./route";

function verify(token: string, headers: Record<string, string> = {}) {
  return new NextRequest("https://artmuse.app/api/auth/verify-link", {
    method: "POST",
    headers: { "Content-Type": "application/json", "sec-fetch-site": "same-origin", "x-real-ip": "203.0.113.1", ...headers },
    body: JSON.stringify({ token })
  });
}

let database: TestDatabase;
beforeAll(async () => {
  database = await createTestDatabase();
});
afterAll(async () => {
  await database.close();
});
beforeEach(async () => {
  vi.useRealTimers();
  resetMemoryRateLimitStore();
  await database.reset();
  durable.runner = database.runner;
});

async function issue(email = "visitor@example.com") {
  const token = createMagicToken(email);
  await recordIssuedMagicToken(database.runner, token, Date.now());
  return token;
}

describe("POST /api/auth/verify-link", () => {
  it("signs in once per link: a second use is refused", async () => {
    const token = await issue();
    const first = await POST(verify(token));
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ email: "visitor@example.com" });
    const sessionId = first.cookies.get(sessionCookieName)?.value ?? "";
    expect(await readSessionEmail(database.runner, sessionId, Date.now())).toBe("visitor@example.com");

    const second = await POST(verify(token));
    expect(second.status).toBe(400);
    expect(await second.json()).toEqual({ error: "Magic link is invalid or expired." });
  });

  it("logs sign_up and sign_in, and alerts the owner once per new account", async () => {
    vi.stubEnv("AUTH_EMAIL_ENABLED", "true");
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <login@artmuse.app>");
    vi.stubEnv("OWNER_ALERT_EMAIL", "owner@example.com");
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    expect((await POST(verify(await issue()))).status).toBe(200);
    expect((await POST(verify(await issue()))).status).toBe(200);

    const kinds = await database.query("select kind from auth_events where kind like 'sign_%' order by id");
    expect(kinds.map((row) => row.kind)).toEqual(["sign_in", "sign_up", "sign_in"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("still signs in when the owner alert fails", async () => {
    vi.stubEnv("AUTH_EMAIL_ENABLED", "true");
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <login@artmuse.app>");
    vi.stubEnv("OWNER_ALERT_EMAIL", "owner@example.com");
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("Resend is down");
    }));

    expect((await POST(verify(await issue()))).status).toBe(200);
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rotates the session: the browser's previous session ends at sign-in", async () => {
    const first = await POST(verify(await issue()));
    const oldId = first.cookies.get(sessionCookieName)?.value ?? "";
    const second = await POST(verify(await issue(), { cookie: `${sessionCookieName}=${oldId}` }));
    const newId = second.cookies.get(sessionCookieName)?.value ?? "";

    expect(newId).not.toBe(oldId);
    expect(await readSessionEmail(database.runner, oldId, Date.now())).toBeNull();
    expect(await readSessionEmail(database.runner, newId, Date.now())).toBe("visitor@example.com");
  });

  it("refuses a correctly signed token that was never issued", async () => {
    expect((await POST(verify(createMagicToken("visitor@example.com")))).status).toBe(400);
  });

  it("refuses an expired link with the same generic message", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-24T12:00:00Z"));
    const token = await issue();
    vi.setSystemTime(new Date("2026-11-24T12:15:01Z"));
    const response = await POST(verify(token));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Magic link is invalid or expired." });
  });

  it("allows 20 attempts per IP per 10 minutes, durably", async () => {
    for (let i = 0; i < 20; i += 1) {
      expect((await POST(verify("bogus"))).status).toBe(400);
    }
    expect((await POST(verify(await issue()))).status).toBe(429);
    expect((await POST(verify("bogus", { "x-real-ip": "203.0.113.2" }))).status).toBe(400);
    const [row] = await database.query("select count(*)::int as n from auth_rate_limits where key like 'verify-ip:%'");
    expect(Number(row?.n)).toBe(2);
  });

  it("refuses cross-site requests with 403", async () => {
    expect((await POST(verify(await issue(), { "sec-fetch-site": "cross-site" }))).status).toBe(403);
  });

  it("fails closed with 503 when the database errors", async () => {
    durable.runner = failingRunner;
    expect((await POST(verify("anything"))).status).toBe(503);
  });
});
