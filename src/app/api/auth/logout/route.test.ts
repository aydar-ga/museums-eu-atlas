// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as route from "./route";

function logout(headers: Record<string, string>) {
  return new NextRequest("https://artmuse.app/api/auth/logout", { method: "POST", headers });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/auth/logout", () => {
  it("accepts same-origin requests", async () => {
    expect((await route.POST(logout({ "sec-fetch-site": "same-origin" }))).status).toBe(204);
    vi.stubEnv("PUBLIC_APP_URL", "https://artmuse.app");
    expect((await route.POST(logout({ origin: "https://artmuse.app" }))).status).toBe(204);
  });

  it.each<Record<string, string>>([
    { "sec-fetch-site": "cross-site" },
    { "sec-fetch-site": "same-site" },
    { origin: "https://evil.example" },
    {}
  ])("refuses %j with 403", async (headers) => {
    expect((await route.POST(logout(headers))).status).toBe(403);
  });

  it("exposes POST only, so GET answers 405", () => {
    expect(Object.keys(route)).toEqual(["POST"]);
  });
});
