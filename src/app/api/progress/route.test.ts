// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { writeUserProgress } = vi.hoisted(() => ({ writeUserProgress: vi.fn(async () => undefined) }));

vi.mock("@/db", () => ({ getDb: () => ({}) }));
vi.mock("@/server/progress", () => ({
  readUserProgress: vi.fn(async () => ({ planned: [], visited: [] })),
  writeUserProgress
}));

import { createSessionToken } from "@/server/sessions";
import { PUT } from "./route";

function put(body: string, token: string | null = createSessionToken("visitor@example.com")) {
  return new NextRequest("https://artmuse.app/api/progress", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body
  });
}

describe("PUT /api/progress", () => {
  beforeEach(() => {
    writeUserProgress.mockClear();
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
