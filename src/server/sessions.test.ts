// @vitest-environment node
import { NextRequest, NextResponse } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTestDatabase, type TestDatabase } from "@/test/pglite";
import {
  clearSessionCookie,
  createSession,
  deleteSession,
  readSessionEmail,
  sessionCookieName,
  sessionIdFrom,
  sessionLifetimeMs,
  setSessionCookie
} from "./sessions";
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
});

describe("server-side sessions", () => {
  it("stores only a hash of the id and resolves it to the account email until it expires", async () => {
    const user = await recordUserSignIn(database.runner, "visitor@example.com", t0);
    const id = await createSession(database.runner, { email: "visitor@example.com", userId: user?.userId }, t0);

    expect(JSON.stringify(await database.query("select * from sessions"))).not.toContain(id);
    expect(await readSessionEmail(database.runner, id, t0 + 1000)).toBe("visitor@example.com");
    expect(await readSessionEmail(database.runner, id, t0 + sessionLifetimeMs + 1)).toBeNull();
    expect(await readSessionEmail(database.runner, "unknown", t0)).toBeNull();
  });

  it("deletes a session on logout", async () => {
    const user = await recordUserSignIn(database.runner, "visitor@example.com", t0);
    const id = await createSession(database.runner, { email: "visitor@example.com", userId: user?.userId }, t0);
    await deleteSession(database.runner, id);
    expect(await readSessionEmail(database.runner, id, t0)).toBeNull();
  });

  it("works per process without a database", async () => {
    const id = await createSession(null, { email: "local@example.com" }, t0);
    expect(await readSessionEmail(null, id, t0)).toBe("local@example.com");
    await deleteSession(null, id);
    expect(await readSessionEmail(null, id, t0)).toBeNull();
  });
});

describe("session cookie", () => {
  it("is __Host-, Secure, HttpOnly, SameSite=Lax and Path=/", () => {
    const response = NextResponse.json({});
    setSessionCookie(response, "abc");
    const header = response.headers.get("set-cookie") ?? "";
    expect(header).toMatch(new RegExp(`^${sessionCookieName}=abc;`));
    expect(header).toMatch(/Path=\//);
    expect(header).toMatch(/Secure/);
    expect(header).toMatch(/HttpOnly/);
    expect(header).toMatch(/SameSite=lax/i);
    expect(header).not.toMatch(/Domain=/i);

    const cleared = NextResponse.json({});
    clearSessionCookie(cleared);
    expect(cleared.headers.get("set-cookie")).toMatch(/Max-Age=0/);
  });

  it("is read from the request", () => {
    const request = new NextRequest("https://artmuse.app/", { headers: { cookie: `${sessionCookieName}=xyz` } });
    expect(sessionIdFrom(request)).toBe("xyz");
  });
});
