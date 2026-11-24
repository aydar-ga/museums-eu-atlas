// @vitest-environment node
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { museums } from "@/data/museums";
import type { SqlRunner } from "@/server/sql-runner";
import { createTestDatabase, type TestDatabase } from "@/test/pglite";

const durable = vi.hoisted(() => ({ runner: null as SqlRunner | null }));
vi.mock("@/server/sql-runner", () => ({ durableSqlRunner: () => durable.runner }));

import { resetMemoryRateLimitStore } from "@/server/rateLimit";
import { POST } from "./route";

const slug = museums[0]!.slug;

function beacon(events: unknown[], headers: Record<string, string> = {}) {
  return new NextRequest("https://artmuse.app/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json", "sec-fetch-site": "same-origin", ...headers },
    body: JSON.stringify({ events })
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
  resetMemoryRateLimitStore();
  await database.reset();
  durable.runner = database.runner;
  vi.stubEnv("PRODUCT_EVENTS_ENABLED", "");
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/events", () => {
  it("adds a beacon's events to today's counters, storing only day, name, subject and count", async () => {
    const events = [
      { name: "museum_planned", subject: slug },
      { name: "museum_planned", subject: slug },
      { name: "filter_used", subject: "country" },
      { name: "signin_started" }
    ];
    expect((await POST(beacon(events))).status).toBe(204);
    expect((await POST(beacon([{ name: "museum_planned", subject: slug }]))).status).toBe(204);

    const rows = await database.query("select name, subject, count from product_event_counts order by name, subject");
    expect(rows).toEqual([
      { name: "filter_used", subject: "country", count: 1 },
      { name: "museum_planned", subject: slug, count: 3 },
      { name: "signin_started", subject: "", count: 1 }
    ]);
    const columns = await database.query("select column_name from information_schema.columns where table_name = 'product_event_counts'");
    expect(columns.map((column) => column.column_name).sort()).toEqual(["count", "day", "name", "subject"]);
  });

  it("refuses unknown events, unknown museums and oversized beacons with 400", async () => {
    expect((await POST(beacon([{ name: "page_scrolled" }]))).status).toBe(400);
    expect((await POST(beacon([{ name: "museum_visited", subject: "not-a-museum" }]))).status).toBe(400);
    expect((await POST(beacon(Array.from({ length: 31 }, () => ({ name: "route_saved" }))))).status).toBe(400);
    expect(await database.query("select name from product_event_counts")).toHaveLength(0);
  });

  it("refuses cross-site beacons with 403", async () => {
    expect((await POST(beacon([{ name: "route_saved" }], { "sec-fetch-site": "cross-site" }))).status).toBe(403);
  });

  it("stores nothing when the kill switch is off", async () => {
    vi.stubEnv("PRODUCT_EVENTS_ENABLED", "false");
    expect((await POST(beacon([{ name: "route_saved" }]))).status).toBe(204);
    expect(await database.query("select name from product_event_counts")).toHaveLength(0);
  });

  it("drops events once the app-wide daily cap is reached", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await database.query(`insert into product_event_counts (day, name, subject, count) values ('${today}', 'route_saved', '', 20000)`);
    expect((await POST(beacon([{ name: "signin_started" }]))).status).toBe(204);
    expect(await database.query("select name from product_event_counts where name = 'signin_started'")).toHaveLength(0);
  });
});
