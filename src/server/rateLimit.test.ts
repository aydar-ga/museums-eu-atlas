// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import {
  checkRateLimits,
  clientIp,
  createDbRateLimitStore,
  createMemoryRateLimitStore,
  rateLimitKey,
  requestLinkWindowMs
} from "./rateLimit";

const t0 = Date.parse("2026-11-23T12:00:00Z");

describe("checkRateLimits with the memory store", () => {
  it("allows up to the limit within a window, then refuses with Retry-After", async () => {
    const store = createMemoryRateLimitStore();
    const rules = [{ key: "email:a", limit: 5, windowMs: requestLinkWindowMs }];

    for (let i = 0; i < 5; i += 1) {
      await expect(checkRateLimits(store, rules, t0 + i * 1000)).resolves.toEqual({ allowed: true });
    }
    await expect(checkRateLimits(store, rules, t0 + 60_000)).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: 14 * 60
    });
  });

  it("starts a new window once the old one has passed", async () => {
    const store = createMemoryRateLimitStore();
    const rules = [{ key: "email:a", limit: 1, windowMs: requestLinkWindowMs }];

    await checkRateLimits(store, rules, t0);
    expect((await checkRateLimits(store, rules, t0 + 1000)).allowed).toBe(false);
    expect((await checkRateLimits(store, rules, t0 + requestLinkWindowMs)).allowed).toBe(true);
  });

  it("refuses when any one rule is exceeded and reports the longest wait", async () => {
    const store = createMemoryRateLimitStore();
    const ipRule = { key: "ip:1", limit: 2, windowMs: requestLinkWindowMs };

    await checkRateLimits(store, [{ key: "email:a", limit: 5, windowMs: requestLinkWindowMs }, ipRule], t0);
    await checkRateLimits(store, [{ key: "email:b", limit: 5, windowMs: requestLinkWindowMs }, ipRule], t0);
    const third = await checkRateLimits(
      store,
      [{ key: "email:c", limit: 5, windowMs: requestLinkWindowMs }, ipRule],
      t0 + 5 * 60_000
    );

    expect(third).toEqual({ allowed: false, retryAfterSeconds: 10 * 60 });
  });
});

describe("createDbRateLimitStore", () => {
  it("maps the upsert result to a count and window start", async () => {
    const execute = vi.fn(async () => ({ rows: [{ count: 3, window_start: "2026-11-23T12:00:00.000Z" }] }));
    const store = createDbRateLimitStore({ execute });

    await expect(store.hit("email:a", requestLinkWindowMs, t0 + 1000)).resolves.toEqual({
      count: 3,
      windowStartMs: t0
    });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("prunes expired rows when a key starts a new window", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ count: 1, window_start: "2026-11-23T12:00:00.000Z" }] })
      .mockResolvedValueOnce({ rows: [] });
    const store = createDbRateLimitStore({ execute });

    await store.hit("email:a", requestLinkWindowMs, t0);
    expect(execute).toHaveBeenCalledTimes(2);
  });
});

describe("rateLimitKey", () => {
  it("hashes the value so raw emails and IPs are never stored", () => {
    const key = rateLimitKey("email", "visitor@example.com");
    expect(key).toMatch(/^email:[0-9a-f]{64}$/);
    expect(key).not.toContain("visitor");
    expect(rateLimitKey("email", "visitor@example.com")).toBe(key);
  });
});

describe("clientIp", () => {
  it("prefers x-real-ip, then the first x-forwarded-for entry", () => {
    expect(clientIp(new Headers({ "x-real-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.1" }))).toBe("203.0.113.7");
    expect(clientIp(new Headers({ "x-forwarded-for": "198.51.100.1, 10.0.0.1" }))).toBe("198.51.100.1");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
