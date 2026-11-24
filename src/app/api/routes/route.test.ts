// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createSavedRoute } = vi.hoisted(() => ({
  createSavedRoute: vi.fn(async (_email: string, name: string, museumSlugs: string[]) => ({
    id: "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b",
    name,
    museumSlugs,
    createdAt: "2026-11-23T00:00:00.000Z",
    updatedAt: "2026-11-23T00:00:00.000Z"
  }))
}));

vi.mock("@/db", () => ({ getDb: () => ({}) }));
vi.mock("@/server/sql-runner", () => ({ durableSqlRunner: () => null }));
vi.mock("@/server/routes", () => ({
  listSavedRoutes: vi.fn(async () => []),
  createSavedRoute
}));

import { createSessionToken } from "@/server/sessions";
import { POST } from "./route";

function post(body: string, token: string | null = createSessionToken("visitor@example.com")) {
  return new NextRequest("https://artmuse.app/api/routes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body
  });
}

describe("POST /api/routes", () => {
  beforeEach(() => {
    createSavedRoute.mockClear();
  });

  it("returns 401 without a session", async () => {
    const response = await POST(post(JSON.stringify({ name: "Trip", museumSlugs: ["louvre-museum"] }), null));
    expect(response.status).toBe(401);
  });

  it("cleans museum slugs to known, unique entries in submitted order", async () => {
    const response = await POST(
      post(
        JSON.stringify({
          name: "  Spring Europe trip  ",
          museumSlugs: ["british-museum", "hermitage-museum", "louvre-museum", "british-museum", 3]
        })
      )
    );

    expect(response.status).toBe(201);
    expect(createSavedRoute).toHaveBeenCalledWith("visitor@example.com", "Spring Europe trip", [
      "british-museum",
      "louvre-museum"
    ]);
  });

  it("rejects empty and overlong names", async () => {
    const empty = await POST(post(JSON.stringify({ name: "   ", museumSlugs: ["louvre-museum"] })));
    const overlong = await POST(post(JSON.stringify({ name: "a".repeat(81), museumSlugs: ["louvre-museum"] })));

    expect(empty.status).toBe(400);
    expect(overlong.status).toBe(400);
    expect(createSavedRoute).not.toHaveBeenCalled();
  });

  it("rejects lists with no known museum or too many items", async () => {
    const unknownOnly = await POST(post(JSON.stringify({ name: "Trip", museumSlugs: ["pushkin-museum"] })));
    const oversized = await POST(
      post(JSON.stringify({ name: "Trip", museumSlugs: Array.from({ length: 201 }, () => "louvre-museum") }))
    );

    expect(unknownOnly.status).toBe(400);
    expect(oversized.status).toBe(400);
    expect(createSavedRoute).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(post("{nope"));
    expect(response.status).toBe(400);
    expect(createSavedRoute).not.toHaveBeenCalled();
  });
});
