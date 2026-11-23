// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

function requestLink(email: string, headers: Record<string, string> = {}) {
  return new NextRequest("https://artmuse.app/api/auth/request-link", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ email })
  });
}

describe("POST /api/auth/request-link", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("PUBLIC_APP_URL", "");
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("AUTH_EMAIL_FROM", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rejects an invalid email with 400", async () => {
    const response = await POST(requestLink("not-an-email"));
    expect(response.status).toBe(400);
  });

  it("returns the link inline when no email provider is configured (dev delivery)", async () => {
    const response = await POST(requestLink("visitor@example.com"));
    const body = (await response.json()) as { delivery: string; magicLink?: string };

    expect(response.status).toBe(200);
    expect(body.delivery).toBe("dev");
    expect(body.magicLink).toMatch(/^https:\/\/artmuse\.app\/magic-link\?token=/);
  });

  it("does not return the magic link when it was delivered by email", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <noreply@example.com>");
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(requestLink("visitor@example.com"));
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(body.delivery).toBe("email");
    expect(body).not.toHaveProperty("magicLink");
    expect(JSON.stringify(body)).not.toContain("token=");
  });

  it("ignores a spoofed Origin header when building the emailed link", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <noreply@example.com>");
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async () => new Response("{}", { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await POST(requestLink("visitor@example.com", { Origin: "https://evil.example" }));

    const sentBody = String(fetchMock.mock.calls[0]?.[1]?.body ?? "");
    expect(sentBody).toContain("https://artmuse.app/magic-link?token=");
    expect(sentBody).not.toContain("evil.example");
  });

  it("prefers PUBLIC_APP_URL for the link origin", async () => {
    vi.stubEnv("PUBLIC_APP_URL", "https://museums-eu-atlas.vercel.app/");
    const response = await POST(requestLink("visitor@example.com", { Origin: "https://evil.example" }));
    const body = (await response.json()) as { magicLink?: string };

    expect(body.magicLink).toMatch(/^https:\/\/museums-eu-atlas\.vercel\.app\/magic-link\?token=/);
  });
});
