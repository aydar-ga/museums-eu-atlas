// @vitest-environment node
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createTestDatabase, type TestDatabase } from "@/test/pglite";
import { digestCounts, maskEmail, notifyOwnerOfSignUp, recordSignInEvents } from "./auth-events";
import { recordUserSignIn } from "./users";

const t0 = Date.parse("2026-11-24T12:00:00Z");
let database: TestDatabase;

beforeAll(async () => {
  database = await createTestDatabase();
});
afterAll(async () => {
  await database.close();
});
beforeEach(async () => {
  await database.reset();
  vi.stubEnv("AUTH_EMAIL_ENABLED", "true");
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <login@artmuse.app>");
  vi.stubEnv("OWNER_ALERT_EMAIL", "owner@example.com");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("maskEmail", () => {
  it("keeps the first letter and the domain", () => {
    expect(maskEmail("sophie.martin@example.com")).toBe("s***@example.com");
  });
});

describe("notifyOwnerOfSignUp", () => {
  it("emails the owner a masked address, at most 10 times a day", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const sent = [];
    for (let i = 0; i < 11; i += 1) {
      sent.push(await notifyOwnerOfSignUp(database.runner, `new${i}@example.com`, t0 + i));
    }
    expect(sent.filter(Boolean)).toHaveLength(10);
    expect(fetchMock).toHaveBeenCalledTimes(10);
    const body = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body)) as Record<string, string>;
    expect(body).toMatchObject({ to: "owner@example.com", subject: "🎉 New ArtMuse sign-up" });
    expect(body.text).toContain("n***@example.com");
    expect(body.text).not.toContain("new0@");
  });

  it("does nothing without OWNER_ALERT_EMAIL or with the kill switch off", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OWNER_ALERT_EMAIL", "");
    expect(await notifyOwnerOfSignUp(database.runner, "a@example.com", t0)).toBe(false);
    vi.stubEnv("OWNER_ALERT_EMAIL", "owner@example.com");
    vi.stubEnv("AUTH_EMAIL_ENABLED", "false");
    expect(await notifyOwnerOfSignUp(database.runner, "a@example.com", t0)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("digestCounts", () => {
  it("counts the last 24 hours and all accounts", async () => {
    const newUser = await recordUserSignIn(database.runner, "a@example.com", t0 - 60_000);
    const oldUser = await recordUserSignIn(database.runner, "b@example.com", t0 - 3 * 86_400_000);
    await recordSignInEvents(database.runner, newUser!, t0 - 60_000);
    await recordSignInEvents(database.runner, { userId: oldUser!.userId, isNew: false }, t0 - 30_000);
    await recordSignInEvents(database.runner, { userId: oldUser!.userId, isNew: true }, t0 - 2 * 86_400_000);
    await database.query(`insert into auth_events (kind, created_at) values
      ('link_requested', '2026-11-24T10:00:00Z'), ('link_blocked', '2026-11-24T10:00:00Z'), ('link_requested', '2026-11-22T10:00:00Z'),
      ('link_blocked_app', '2026-11-24T10:00:00Z'), ('link_blocked_app', '2026-11-22T10:00:00Z'), ('feedback_alert_skipped', '2026-11-24T10:00:00Z')`);

    expect(await digestCounts(database.runner, t0)).toEqual({
      signUps: 1,
      signIns: 2,
      linkRequests: 1,
      blocked: 2,
      appBlocked: 1,
      feedbackAlertsSkipped: 1,
      totalUsers: 2
    });
  });
});
