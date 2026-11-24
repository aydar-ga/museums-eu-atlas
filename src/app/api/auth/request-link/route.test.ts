// @vitest-environment node
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { SqlRunner } from "@/server/sql-runner";
import { createTestDatabase, failingRunner, type TestDatabase } from "@/test/pglite";

const durable = vi.hoisted(() => ({ runner: null as SqlRunner | null }));
vi.mock("@/server/sql-runner", () => ({ durableSqlRunner: () => durable.runner }));

import { magicTokenHash } from "@/server/magicTokens";
import { resetMemoryRateLimitStore } from "@/server/rateLimit";
import { POST } from "./route";

function requestLink(email: string, headers: Record<string, string> = {}, extra: Record<string, unknown> = {}) {
  return new NextRequest("https://artmuse.app/api/auth/request-link", {
    method: "POST",
    headers: { "Content-Type": "application/json", "sec-fetch-site": "same-origin", ...headers },
    body: JSON.stringify({ email, ...extra })
  });
}

function enableEmail() {
  vi.stubEnv("AUTH_EMAIL_ENABLED", "true");
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <login@artmuse.app>");
}

function mockResend() {
  const fetchMock = vi.fn(async (...args: [string, RequestInit?]) => (args.length ? new Response("{}", { status: 200 }) : new Response()));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function sentLink(fetchMock: ReturnType<typeof mockResend>): string {
  const payload = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { text: string };
  return payload.text.match(/https?:\/\/\S+/)?.[0] ?? "";
}

let database: TestDatabase;
beforeAll(async () => {
  database = await createTestDatabase();
});
afterAll(async () => {
  await database.close();
});

beforeEach(async () => {
  vi.unstubAllEnvs();
  resetMemoryRateLimitStore();
  durable.runner = null;
  await database.reset();
  for (const name of ["VERCEL_ENV", "PUBLIC_APP_URL", "RESEND_API_KEY", "AUTH_EMAIL_FROM", "AUTH_EMAIL_ENABLED"]) {
    vi.stubEnv(name, "");
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/auth/request-link: request shape", () => {
  it("refuses cross-site requests and requests without Origin or Sec-Fetch-Site", async () => {
    expect((await POST(requestLink("visitor@example.com", { "sec-fetch-site": "cross-site" }))).status).toBe(403);
    const bare = new NextRequest("https://artmuse.app/api/auth/request-link", {
      method: "POST",
      body: JSON.stringify({ email: "visitor@example.com" })
    });
    expect((await POST(bare)).status).toBe(403);
  });

  it("refuses bodies over 16 KB with 413", async () => {
    const response = await POST(requestLink("visitor@example.com", {}, { padding: "x".repeat(17 * 1024) }));
    expect(response.status).toBe(413);
  });

  it("answers a filled honeypot with a fake success and sends nothing", async () => {
    enableEmail();
    vi.stubEnv("VERCEL_ENV", "production");
    durable.runner = database.runner;
    const fetchMock = mockResend();

    const response = await POST(requestLink("visitor@example.com", {}, { website: "https://spam.example" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ email: "visitor@example.com", delivery: "email" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await database.query("select * from auth_events")).toEqual([]);
  });

  it.each(["not-an-email", `${"a".repeat(250)}@example.com`])("rejects %j with 400", async (email) => {
    expect((await POST(requestLink(email))).status).toBe(400);
  });
});

describe("POST /api/auth/request-link: kill switch", () => {
  it.each(["production", "preview"])("on %s refuses with 503 and no link unless AUTH_EMAIL_ENABLED is true", async (vercelEnv) => {
    vi.stubEnv("VERCEL_ENV", vercelEnv);
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <login@artmuse.app>");
    durable.runner = database.runner;
    const fetchMock = mockResend();

    for (const value of ["", "false", "TRUE"]) {
      vi.stubEnv("AUTH_EMAIL_ENABLED", value);
      const response = await POST(requestLink("visitor@example.com"));
      expect(response.status).toBe(503);
      expect(JSON.stringify(await response.json())).not.toContain("token=");
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends exactly one email when AUTH_EMAIL_ENABLED is true, never returning the link", async () => {
    enableEmail();
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("PUBLIC_APP_URL", "https://artmuse.app");
    durable.runner = database.runner;
    const fetchMock = mockResend();

    const response = await POST(requestLink("visitor@example.com", { origin: "https://evil.example" }));
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body).toEqual({ email: "visitor@example.com", delivery: "email" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { from: string; subject: string };
    expect(payload.from).toBe("ArtMuse <login@artmuse.app>");
    expect(payload.subject).toBe("Your ArtMuse sign-in link");
    // Built from PUBLIC_APP_URL, never from the Origin header.
    expect(sentLink(fetchMock)).toMatch(/^https:\/\/artmuse\.app\/magic-link\?token=/);
  });

  it("stores only a hash of the issued token", async () => {
    enableEmail();
    durable.runner = database.runner;
    const fetchMock = mockResend();
    await POST(requestLink("visitor@example.com"));

    const token = decodeURIComponent(new URL(sentLink(fetchMock)).searchParams.get("token") ?? "");
    const rows = await database.query("select token_hash from magic_link_tokens");
    expect(rows).toEqual([{ token_hash: magicTokenHash(token) }]);
  });

  it("returns the link inline only for local runs without an email provider", async () => {
    const response = await POST(requestLink("visitor@example.com"));
    const body = (await response.json()) as { delivery: string; magicLink?: string };
    expect(response.status).toBe(200);
    expect(body.delivery).toBe("dev");
    expect(body.magicLink).toMatch(/^https:\/\/artmuse\.app\/magic-link\?token=/);
  });
});

describe("POST /api/auth/request-link: caps", () => {
  it("answers 429 from the durable caps before calling Resend", async () => {
    enableEmail();
    vi.stubEnv("VERCEL_ENV", "production");
    durable.runner = database.runner;
    const fetchMock = mockResend();

    for (let i = 0; i < 3; i += 1) {
      expect((await POST(requestLink("visitor@example.com", { "x-real-ip": `203.0.113.${i}` }))).status).toBe(200);
    }
    const limited = await POST(requestLink("visitor@example.com", { "x-real-ip": "203.0.113.99" }));
    expect(limited.status).toBe(429);
    expect(((await limited.json()) as { error: string }).error).toBe("Too many sign-in requests. Try again later.");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("fails closed with 503 and sends nothing when the database check errors", async () => {
    enableEmail();
    vi.stubEnv("VERCEL_ENV", "production");
    durable.runner = failingRunner;
    const fetchMock = mockResend();

    expect((await POST(requestLink("visitor@example.com"))).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the per-instance memory layer: 5 per email and 20 per IP in 15 minutes", async () => {
    for (let i = 0; i < 5; i += 1) {
      expect((await POST(requestLink("visitor@example.com", { "x-real-ip": `203.0.113.${i}` }))).status).toBe(200);
    }
    expect((await POST(requestLink("visitor@example.com", { "x-real-ip": "203.0.113.99" }))).status).toBe(429);

    for (let i = 0; i < 20; i += 1) {
      expect((await POST(requestLink(`visitor${i}@example.com`, { "x-real-ip": "198.51.100.5" }))).status).toBe(200);
    }
    expect((await POST(requestLink("someone-else@example.com", { "x-real-ip": "198.51.100.5" }))).status).toBe(429);
  });

  it("refuses with 503 when AUTH_SECRET is missing", async () => {
    enableEmail();
    vi.stubEnv("AUTH_SECRET", "");
    const fetchMock = mockResend();
    expect((await POST(requestLink("visitor@example.com"))).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
