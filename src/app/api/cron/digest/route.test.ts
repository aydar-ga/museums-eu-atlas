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

  const sentBody = (fetchMock: ReturnType<typeof vi.fn>) =>
    JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body)) as Record<string, string>;

  it("sends nothing on a normal day, however busy", async () => {
    await database.query(`insert into auth_events (kind, created_at) values ('link_requested', now()), ('sign_up', now()), ('sign_in', now()), ('link_blocked', now())`);
    await database.query(`insert into feedback_messages (kind, message, ip_hash) values ('interest', '', 'h1'), ('bug', 'broken map', 'h2')`);
    await database.query(`insert into product_event_counts (day, name, subject, count) values ((now() at time zone 'utc')::date - 1, 'museum_planned', 'louvre', 400)`);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(cron("Bearer cron-test-secret"));

    expect(await response.json()).toMatchObject({ sent: false, reasons: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("emails the owner when the app-wide sign-in cap refused visitors", async () => {
    await database.query(`insert into auth_events (kind, created_at) select 'link_blocked_app', now() from generate_series(1, 3)`);
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(cron("Bearer cron-test-secret"));

    expect(await response.json()).toMatchObject({ sent: true });
    const body = sentBody(fetchMock);
    expect(body.to).toBe("owner@example.com");
    expect(body.subject).toContain("ArtMuse needs a look");
    expect(body.text).toContain("The app-wide sign-in email cap refused 3 sign-in requests");
  });

  it("sends nothing for a busy day that stayed within every cap", async () => {
    await database.query(`insert into auth_events (kind, created_at) select 'link_requested', now() from generate_series(1, 40)`);
    await database.query(`insert into feedback_messages (kind, message, ip_hash) select 'bug', 'message ' || n, 'h' || n from generate_series(1, 11) as n`);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(cron("Bearer cron-test-secret"));

    expect(await response.json()).toMatchObject({ sent: false, reasons: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("emails the owner when feedback alerts were suppressed by their cap", async () => {
    await database.query(`insert into auth_events (kind, created_at) select 'feedback_alert_skipped', now() from generate_series(1, 2)`);
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await GET(cron("Bearer cron-test-secret"));

    expect(sentBody(fetchMock).text).toContain("2 feedback messages were not emailed");
  });

  it("emails the owner when visitor-action counts hit their daily cap", async () => {
    await database.query(`insert into product_event_counts (day, name, subject, count) values ((now() at time zone 'utc')::date - 1, 'filter_used', 'mood', 20000)`);
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await GET(cron("Bearer cron-test-secret"));

    expect(sentBody(fetchMock).text).toContain("visitor-action counts reached their daily cap (20000)");
  });

  it("still alerts on the sign-in cap when the feedback tables are unavailable", async () => {
    await database.query(`insert into auth_events (kind, created_at) values ('link_blocked_app', now())`);
    await database.query("drop table feedback_messages");
    try {
      const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);
      const response = await GET(cron("Bearer cron-test-secret"));
      expect(await response.json()).toMatchObject({ sent: true });
    } finally {
      // Later tests need the table back, whatever happened above.
      await database.query(`create table feedback_messages (id bigserial primary key, kind text not null, message text not null,
        reply_email text, ip_hash text not null, created_at timestamptz not null default now())`);
    }
  });

  it("prunes feedback and event counters past their retention", async () => {
    await database.query(`insert into feedback_messages (kind, message, ip_hash, created_at) values ('bug', 'old one', 'h', now() - interval '400 days'),
      ('bug', 'three days old', 'h3', now() - interval '3 days'), ('bug', 'today', 'h4', now())`);
    await database.query(`insert into product_event_counts (day, name, subject, count) values (current_date - 500, 'route_saved', '', 1)`);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    await GET(cron("Bearer cron-test-secret"));
    expect(await database.query("select message, ip_hash from feedback_messages order by created_at")).toEqual([
      { message: "three days old", ip_hash: "" },
      { message: "today", ip_hash: "h4" }
    ]);
    expect(await database.query("select day from product_event_counts")).toHaveLength(0);
  });
});

