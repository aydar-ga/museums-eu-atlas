// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetMemoryRateLimitStore } from "@/server/rateLimit";
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
    resetMemoryRateLimitStore();
    vi.stubEnv("VERCEL_ENV", "");
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

  describe("in production (VERCEL_ENV=production)", () => {
    beforeEach(() => {
      vi.stubEnv("VERCEL_ENV", "production");
      vi.stubEnv("AUTH_SECRET", "production-test-secret");
    });

    it("refuses with 503 and never returns a link when no email provider is configured", async () => {
      const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);

      const response = await POST(requestLink("visitor@example.com"));
      const body = (await response.json()) as Record<string, unknown>;

      expect(response.status).toBe(503);
      expect(body.error).toBe("Email sign-in isn't available yet. Your museum progress stays saved in this browser.");
      expect(body).not.toHaveProperty("magicLink");
      expect(JSON.stringify(body)).not.toContain("token=");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("still delivers by email when a provider is configured", async () => {
      vi.stubEnv("RESEND_API_KEY", "re_test");
      vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <noreply@example.com>");
      vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));

      const response = await POST(requestLink("visitor@example.com"));
      const body = (await response.json()) as Record<string, unknown>;

      expect(response.status).toBe(200);
      expect(body).toEqual({ email: "visitor@example.com", delivery: "email" });
    });

    it("refuses with 503 when AUTH_SECRET is missing", async () => {
      vi.stubEnv("AUTH_SECRET", "");
      vi.stubEnv("RESEND_API_KEY", "re_test");
      vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <noreply@example.com>");
      const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);

      const response = await POST(requestLink("visitor@example.com"));

      expect(response.status).toBe(503);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("rate limiting", () => {
    it("allows 5 requests per email in 15 minutes, then answers 429 with Retry-After", async () => {
      for (let i = 0; i < 5; i += 1) {
        expect((await POST(requestLink("visitor@example.com", { "x-real-ip": `203.0.113.${i}` }))).status).toBe(200);
      }
      const limited = await POST(requestLink("visitor@example.com", { "x-real-ip": "203.0.113.99" }));
      const body = (await limited.json()) as Record<string, unknown>;

      expect(limited.status).toBe(429);
      expect(Number(limited.headers.get("Retry-After"))).toBeGreaterThan(0);
      expect(body.error).toMatch(/Too many sign-in requests/);
      expect(body).not.toHaveProperty("magicLink");
    });

    it("allows 20 requests per IP in 15 minutes across different emails", async () => {
      for (let i = 0; i < 20; i += 1) {
        expect((await POST(requestLink(`visitor${i}@example.com`, { "x-real-ip": "198.51.100.5" }))).status).toBe(200);
      }
      expect((await POST(requestLink("someone-else@example.com", { "x-real-ip": "198.51.100.5" }))).status).toBe(429);
      expect((await POST(requestLink("someone-else@example.com", { "x-real-ip": "198.51.100.6" }))).status).toBe(200);
    });

    it("does not send an email once the limit is reached", async () => {
      vi.stubEnv("RESEND_API_KEY", "re_test");
      vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <noreply@example.com>");
      const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);

      for (let i = 0; i < 6; i += 1) {
        await POST(requestLink("visitor@example.com"));
      }
      expect(fetchMock).toHaveBeenCalledTimes(5);
    });
  });

  it("brands the email as ArtMuse", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("AUTH_EMAIL_FROM", "ArtMuse <noreply@example.com>");
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async () => new Response("{}", { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await POST(requestLink("visitor@example.com"));
    const sent = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { subject: string; html: string; text: string };

    expect(sent.subject).toBe("Your ArtMuse sign-in link");
    expect(sent.html).toContain("ArtMuse");
    expect(sent.html).not.toContain("Museums EU Atlas");
    expect(sent.text).toContain("/magic-link?token=");
  });
});
