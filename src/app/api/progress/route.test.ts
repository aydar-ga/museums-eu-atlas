// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { writeUserProgress } = vi.hoisted(() => ({ writeUserProgress: vi.fn(async () => undefined) }));

const durable = vi.hoisted(() => ({ runner: null as import("@/server/sql-runner").SqlRunner | null }));

vi.mock("@/db", () => ({ getDb: () => ({}) }));
vi.mock("@/server/sql-runner", () => ({ durableSqlRunner: () => durable.runner }));
vi.mock("@/server/progress", () => ({
  readUserProgress: vi.fn(async () => ({ planned: [], visited: [] })),
  writeUserProgress
}));

import { resetMemoryRateLimitStore } from "@/server/rateLimit";
import { sessionCookieFor } from "@/test/session";
import { failingRunner } from "@/test/pglite";
import { PUT } from "./route";

let visitorCookie = "";
beforeAll(async () => {
  visitorCookie = await sessionCookieFor("visitor@example.com");
});

function put(body: string, token: string | null = visitorCookie) {
  return new NextRequest("https://artmuse.app/api/progress", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "sec-fetch-site": "same-origin",
      ...(token ? { cookie: token } : {})
    },
    body
  });
}

describe("PUT /api/progress", () => {
  beforeEach(() => {
    writeUserProgress.mockClear();
    resetMemoryRateLimitStore();
    durable.runner = null;
  });

  it("caps each user at 300 writes per day", async () => {
    const body = JSON.stringify({ planned: [], visited: [] });
    for (let i = 0; i < 300; i += 1) {
      expect((await PUT(put(body))).status).toBe(200);
    }
    expect((await PUT(put(body))).status).toBe(429);
    const other = await sessionCookieFor("someone-else@example.com");
    expect((await PUT(put(body, other))).status).toBe(200);
  });

  it("refuses the write with 503 when the write counter errors", async () => {
    durable.runner = failingRunner;
    expect((await PUT(put(JSON.stringify({ planned: [], visited: [] })))).status).toBe(503);
    expect(writeUserProgress).not.toHaveBeenCalled();
  });

  it("refuses bodies over 16 KB with 413", async () => {
    const response = await PUT(put(JSON.stringify({ planned: ["x".repeat(17 * 1024)], visited: [] })));
    expect(response.status).toBe(413);
  });

  it("returns 401 without a session before looking at the payload", async () => {
    const response = await PUT(put("{nope", null));
    expect(response.status).toBe(401);
    expect(writeUserProgress).not.toHaveBeenCalled();
  });

  it("drops unknown, non-string and duplicate slugs", async () => {
    const response = await PUT(
      put(
        JSON.stringify({
          planned: ["louvre-museum", "pushkin-museum", 7, "louvre-museum"],
          visited: ["british-museum", { evil: true }]
        })
      )
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ planned: ["louvre-museum"], visited: ["british-museum"] });
    expect(writeUserProgress).toHaveBeenCalledWith("visitor@example.com", {
      planned: ["louvre-museum"],
      visited: ["british-museum"]
    });
  });

  it("rejects non-array and oversized lists", async () => {
    const notArray = await PUT(put(JSON.stringify({ planned: "louvre-museum", visited: [] })));
    const oversized = await PUT(
      put(JSON.stringify({ planned: [], visited: Array.from({ length: 201 }, () => "louvre-museum") }))
    );

    expect(notArray.status).toBe(400);
    expect(oversized.status).toBe(400);
    expect(writeUserProgress).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const response = await PUT(put("{nope"));
    expect(response.status).toBe(400);
    expect(writeUserProgress).not.toHaveBeenCalled();
  });
});
