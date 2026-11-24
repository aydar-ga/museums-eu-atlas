// @vitest-environment node
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { SqlRunner } from "@/server/sql-runner";
import { createTestDatabase, failingRunner, type TestDatabase } from "@/test/pglite";

const durable = vi.hoisted(() => ({ runner: null as SqlRunner | null }));
vi.mock("@/server/sql-runner", () => ({ durableSqlRunner: () => durable.runner }));

import { resetMemoryRateLimitStore } from "@/server/rateLimit";
import { POST } from "./route";

function send(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new NextRequest("https://artmuse.app/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json", "sec-fetch-site": "same-origin", "x-real-ip": "203.0.113.7", ...headers },
    body: JSON.stringify(body)
  });
}

function mockResend(status = 200) {
  // Typed parameters so tests can read the request body from mock.calls.
  const fetchMock = vi.fn(async (...args: [string, RequestInit?]) => new Response(args.length ? "{}" : "", { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const sentBody = (fetchMock: ReturnType<typeof mockResend>) =>
  JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as Record<string, string>;

let database: TestDatabase;
beforeAll(async () => {
  database = await createTestDatabase();
});
afterAll(async () => {
  await database.close();
});
beforeEach(async () => {
  resetMemoryRateLimitStore();
  await database.reset();
  durable.runner = database.runner;
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("FEEDBACK_ENABLED", "");
  vi.stubEnv("AUTH_EMAIL_ENABLED", "true");
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <login@artmuse.app>");
  vi.stubEnv("OWNER_ALERT_EMAIL", "owner@example.com");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/feedback", () => {
  it("stores the message and emails the owner, with no Reply-To that would invite answering from the owner's inbox", async () => {
    const fetchMock = mockResend();
    const response = await POST(send({ kind: "feedback", message: "Please add Vienna's Albertina.", email: "Visitor@Example.com" }));

    expect(response.status).toBe(200);
    const responseText = JSON.stringify(await response.json());
    expect(responseText).not.toContain("owner@example.com");
    expect(await database.query("select kind, message, reply_email from feedback_messages")).toEqual([
      { kind: "feedback", message: "Please add Vienna's Albertina.", reply_email: "visitor@example.com" }
    ]);
    const email = sentBody(fetchMock);
    expect(email.to).toBe("owner@example.com");
    expect(email.reply_to).toBeUndefined();
    expect(email.text).toContain("Albertina");
    expect(email.text).toContain("Visitor's email: visitor@example.com");
    expect(email.text).toContain("replying here reveals this address");
  });

  it("accepts a one-click 'I'd like more' without a message or email", async () => {
    mockResend();
    const response = await POST(send({ kind: "interest" }));
    expect(response.status).toBe(200);
    expect(await database.query("select kind, message, reply_email from feedback_messages")).toEqual([
      { kind: "interest", message: "", reply_email: null }
    ]);
  });

  it("answers 400 for a short message, an unknown kind or a malformed email", async () => {
    mockResend();
    expect((await POST(send({ kind: "bug", message: "hi" }))).status).toBe(400);
    expect((await POST(send({ kind: "spam", message: "hello there" }))).status).toBe(400);
    expect((await POST(send({ kind: "feedback", message: "hello there", email: "not-an-email" }))).status).toBe(400);
    expect(await database.query("select id from feedback_messages")).toHaveLength(0);
  });

  it("refuses cross-site posts with 403", async () => {
    expect((await POST(send({ kind: "interest" }, { "sec-fetch-site": "cross-site" }))).status).toBe(403);
  });

  it("pretends success for the honeypot and stores nothing", async () => {
    const fetchMock = mockResend();
    const response = await POST(send({ kind: "feedback", message: "buy cheap pills", website: "spam.example" }));
    expect(response.status).toBe(200);
    expect(await database.query("select id from feedback_messages")).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers 503 when the kill switch is off", async () => {
    vi.stubEnv("FEEDBACK_ENABLED", "false");
    expect((await POST(send({ kind: "interest" }))).status).toBe(503);
  });

  it("caps messages per IP: the sixth in an hour is refused with 429", async () => {
    mockResend();
    for (let i = 0; i < 5; i += 1) {
      resetMemoryRateLimitStore();
      expect((await POST(send({ kind: "feedback", message: `message number ${i}` }))).status).toBe(200);
    }
    resetMemoryRateLimitStore();
    expect((await POST(send({ kind: "feedback", message: "message number 6" }))).status).toBe(429);
    expect(await database.query("select id from feedback_messages")).toHaveLength(5);
  });

  it("keeps the message when the alert email fails", async () => {
    mockResend(500);
    const response = await POST(send({ kind: "bug", message: "The map does not load." }));
    expect(response.status).toBe(200);
    expect(await database.query("select id from feedback_messages")).toHaveLength(1);
  });

  it("answers 503 when the database fails", async () => {
    durable.runner = failingRunner;
    expect((await POST(send({ kind: "interest" }))).status).toBe(503);
  });
});
