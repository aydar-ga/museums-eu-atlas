// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { deleteSavedRoute } = vi.hoisted(() => ({ deleteSavedRoute: vi.fn(async () => true) }));

vi.mock("@/db", () => ({ getDb: () => ({}) }));
vi.mock("@/server/routes", () => ({ deleteSavedRoute }));

import { createSessionToken } from "@/server/sessions";
import { DELETE } from "./route";

function del(id: string, token: string | null = createSessionToken("visitor@example.com")) {
  const request = new NextRequest(`https://artmuse.app/api/routes/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return DELETE(request, { params: Promise.resolve({ id }) });
}

describe("DELETE /api/routes/:id", () => {
  beforeEach(() => {
    deleteSavedRoute.mockClear();
  });

  it("returns 401 without a session", async () => {
    const response = await del("3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b", null);
    expect(response.status).toBe(401);
  });

  it("returns 404 for a non-UUID id without calling the database", async () => {
    const response = await del("not-a-uuid");
    expect(response.status).toBe(404);
    expect(deleteSavedRoute).not.toHaveBeenCalled();
  });

  it("deletes an owned route by UUID", async () => {
    const response = await del("3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b");
    expect(response.status).toBe(200);
    expect(deleteSavedRoute).toHaveBeenCalledWith("visitor@example.com", "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b");
  });
});
