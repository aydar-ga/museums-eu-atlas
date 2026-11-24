// @vitest-environment node
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { SqlRunner } from "@/server/sql-runner";
import { createTestDatabase, type TestDatabase } from "@/test/pglite";

const durable = vi.hoisted(() => ({ runner: null as SqlRunner | null }));
vi.mock("@/server/sql-runner", () => ({ durableSqlRunner: () => durable.runner }));

import { GET } from "./route";

const cron = (authorization?: string) =>
  new NextRequest("https://artmuse.app/api/cron/digest", { headers: authorization ? { authorization } : {} });

let database: TestDatabase;
beforeAll(async () => {
  database = await createTestDatabase();
});
afterAll(async () => {
  await database.close();
});
beforeEach(async () => {
  await database.reset();
  durable.runner = database.runner;
  vi.stubEnv("CRON_SECRET", "cron-test-secret");
  vi.stubEnv("AUTH_EMAIL_ENABLED", "true");
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <login@artmuse.app>");
  vi.stubEnv("OWNER_ALERT_EMAIL", "owner@example.com");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /api/cron/digest", () => {
  it("answers 401 without the cron secret, with a wrong one, or when none is configured", async () => {
    expect((await GET(cron())).status).toBe(401);
    expect((await GET(cron("Bearer wrong"))).status).toBe(401);
    vi.stubEnv("CRON_SECRET", "");
    expect((await GET(cron("Bearer "))).status).toBe(401);
  });

  it("sends nothing when nothing happened", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await GET(cron("Bearer cron-test-secret"));
    expect(await response.json()).toMatchObject({ sent: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("emails the owner the last day's counts", async () => {
    await database.query(`insert into auth_events (kind, created_at) values ('link_requested', now()), ('sign_up', now()), ('sign_in', now())`);
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(cron("Bearer cron-test-secret"));

    expect(await response.json()).toMatchObject({ sent: true, counts: { signUps: 1, signIns: 1, linkRequests: 1 } });
    const body = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body)) as Record<string, string>;
    expect(body.to).toBe("owner@example.com");
    expect(body.text).toContain("Sign-ups: 1");
  });
});
