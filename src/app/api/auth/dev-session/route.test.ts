// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/sql-runner", () => ({ durableSqlRunner: () => null }));

import { POST } from "./route";

const devSession = () =>
  new NextRequest("https://artmuse.app/api/auth/dev-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "e2e@example.com" })
  });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/auth/dev-session", () => {
  it.each(["production", "preview"])("is not found on a Vercel %s deployment", async (vercelEnv) => {
    vi.stubEnv("VERCEL_ENV", vercelEnv);
    expect((await POST(devSession())).status).toBe(404);
  });

  it("issues a session for local dev and e2e builds", async () => {
    vi.stubEnv("VERCEL_ENV", "");
    expect((await POST(devSession())).status).toBe(200);
  });
});
