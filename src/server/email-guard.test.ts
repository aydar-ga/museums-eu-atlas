// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTestDatabase, failingRunner, type TestDatabase } from "@/test/pglite";
import { emailSendLimits } from "./abuse-limits";
import { hashIdentifier, reserveEmailSend } from "./email-guard";

const t0 = Date.parse("2026-11-24T12:00:00Z");
const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;

let database: TestDatabase;

beforeAll(async () => {
  database = await createTestDatabase();
});
afterAll(async () => {
  await database.close();
});
beforeEach(async () => {
  await database.reset();
});

function attempt(email: string, ip: string, nowMs: number) {
  return reserveEmailSend(database.runner, { emailHash: hashIdentifier("email", email), ipHash: hashIdentifier("ip", ip), nowMs });
}

async function attempts(count: number, make: (i: number) => [string, string, number]) {
  const decisions = [];
  for (let i = 0; i < count; i += 1) {
    decisions.push(await attempt(...make(i)));
  }
  return decisions;
}

async function countKind(kind: string) {
  const [row] = await database.query(`select count(*)::int as n from auth_events where kind = '${kind}'`);
  return Number(row?.n);
}

describe("reserveEmailSend caps", () => {
  it("allows 3 links per recipient per hour", async () => {
    const decisions = await attempts(4, (i) => ["a@example.com", `10.0.0.${i}`, t0 + i * minute]);
    expect(decisions).toEqual(["allowed", "allowed", "allowed", "blocked"]);
    expect(await attempt("a@example.com", "10.0.1.1", t0 + hour + 1)).toBe("allowed");
  });

  it("allows 5 links per recipient per day", async () => {
    const decisions = await attempts(6, (i) => ["a@example.com", `10.0.0.${i}`, t0 + i * 61 * minute]);
    expect(decisions).toEqual(["allowed", "allowed", "allowed", "allowed", "allowed", "blocked"]);
    expect(await attempt("a@example.com", "10.0.1.1", t0 + day + 1)).toBe("allowed");
  });

  it("allows 5 links per IP per hour", async () => {
    const decisions = await attempts(6, (i) => [`user${i}@example.com`, "10.0.0.1", t0 + i * minute]);
    expect(decisions).toEqual(["allowed", "allowed", "allowed", "allowed", "allowed", "blocked"]);
  });

  it("allows 20 links per IP per day", async () => {
    const decisions = await attempts(21, (i) => [`user${i}@example.com`, "10.0.0.1", t0 + Math.floor(i / 5) * 61 * minute + i]);
    expect(decisions.slice(0, 20).every((decision) => decision === "allowed")).toBe(true);
    expect(decisions[20]).toBe("blocked");
  });

  it(`allows ${emailSendLimits.appPerDay.limit} links per day app-wide`, async () => {
    const limit = emailSendLimits.appPerDay.limit;
    const decisions = await attempts(limit + 1, (i) => [`user${i}@example.com`, `10.0.${i}.1`, t0 + i * minute]);
    expect(decisions.filter((decision) => decision === "allowed")).toHaveLength(limit);
    expect(decisions[limit]).toBe("blocked");
  });

  it(`allows ${emailSendLimits.appPerMonth.limit} links per 31 days app-wide`, async () => {
    const limit = emailSendLimits.appPerMonth.limit;
    // limit - 1 earlier sends spread over the last 30 days, plus some older than the window.
    await database.query(`insert into auth_events (kind, email_hash, ip_hash, created_at)
      select 'link_requested', 'seed' || n, 'seed', '2026-11-24T12:00:00Z'::timestamptz - (n % 29 + 1) * interval '1 day'
      from generate_series(1, ${limit - 1}) n`);
    await database.query(`insert into auth_events (kind, email_hash, ip_hash, created_at)
      select 'link_requested', 'old' || n, 'old', '2026-11-24T12:00:00Z'::timestamptz - interval '32 days' from generate_series(1, 50) n`);
    expect(await attempt("last@example.com", "10.9.9.9", t0)).toBe("allowed");
    expect(await attempt("over@example.com", "10.9.9.8", t0 + 1)).toBe("blocked");
  });
});

describe("reserveEmailSend logging", () => {
  it("stores HMAC hashes only, never the raw email or IP", async () => {
    await attempt("visitor@example.com", "203.0.113.7", t0);
    const rows = await database.query("select email_hash, ip_hash from auth_events");
    expect(JSON.stringify(rows)).not.toMatch(/visitor|203\.0\.113/);
    expect(rows[0]?.email_hash).toBe(hashIdentifier("email", "visitor@example.com"));
  });

  it("logs refused attempts as link_blocked, at most 1000 per day", async () => {
    await attempts(4, (i) => ["a@example.com", "10.0.0.1", t0 + i]);
    expect(await countKind("link_requested")).toBe(3);
    expect(await countKind("link_blocked")).toBe(1);

    await database.query(`insert into auth_events (kind, created_at)
      select 'link_blocked', '2026-11-24T11:00:00Z'::timestamptz from generate_series(1, 999)`);
    await attempt("a@example.com", "10.0.0.1", t0 + 10);
    expect(await countKind("link_blocked")).toBe(1000);
  });

  it("logs a refusal by the app-wide daily cap as link_blocked_app, so the daily check can alert", async () => {
    const limit = emailSendLimits.appPerDay.limit;
    await attempts(limit + 1, (i) => [`user${i}@example.com`, `10.0.${i}.1`, t0 + i * minute]);
    expect(await countKind("link_blocked_app")).toBe(1);
    expect(await countKind("link_blocked")).toBe(0);
  });

  it("logs a refusal by the 31-day cap as link_blocked_app", async () => {
    await database.query(`insert into auth_events (kind, email_hash, ip_hash, created_at)
      select 'link_requested', 'seed' || n, 'seed', '2026-11-24T12:00:00Z'::timestamptz - (n % 29 + 1) * interval '1 day'
      from generate_series(1, ${emailSendLimits.appPerMonth.limit}) n`);
    expect(await attempt("over@example.com", "10.9.9.8", t0)).toBe("blocked");
    expect(await countKind("link_blocked_app")).toBe(1);
  });

  it("keeps per-recipient and per-IP refusals as link_blocked", async () => {
    await attempts(4, (i) => ["a@example.com", `10.0.0.${i}`, t0 + i]);
    expect(await countKind("link_blocked")).toBe(1);
    expect(await countKind("link_blocked_app")).toBe(0);
  });

  it("prunes events older than 35 days and expired tokens", async () => {
    await database.query(`insert into auth_events (kind, created_at) values ('link_requested', '2026-10-01T00:00:00Z')`);
    await database.query(`insert into magic_link_tokens (token_hash, expires_at) values ('old', '2026-11-01T00:00:00Z')`);
    await attempt("a@example.com", "10.0.0.1", t0);
    expect(await countKind("link_requested")).toBe(1);
    expect(await database.query("select * from magic_link_tokens")).toEqual([]);
  });

  it("propagates database errors so callers can refuse", async () => {
    await expect(
      reserveEmailSend(failingRunner, { emailHash: "e", ipHash: "i", nowMs: t0 })
    ).rejects.toThrow("database is down");
  });
});
