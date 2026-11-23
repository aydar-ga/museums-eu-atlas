import { createHash } from "node:crypto";
import { sql, type SQL } from "drizzle-orm";

/** Fixed-window limits for POST /api/auth/request-link. */
export const requestLinkWindowMs = 15 * 60 * 1000;
export const requestLinkLimitPerEmail = 5;
export const requestLinkLimitPerIp = 20;

/** Rows older than this are deleted; it only needs to exceed the longest window. */
const pruneAfterMs = 24 * 60 * 60 * 1000;

export type RateLimitRule = { key: string; limit: number; windowMs: number };
export type RateLimitHit = { count: number; windowStartMs: number };
export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export interface RateLimitStore {
  /** Counts one request against `key` and returns the count in its current window. */
  hit(key: string, windowMs: number, nowMs: number): Promise<RateLimitHit>;
}

/** Every rule is counted, so a refused request still uses up its quota. */
export async function checkRateLimits(
  store: RateLimitStore,
  rules: RateLimitRule[],
  nowMs: number
): Promise<RateLimitResult> {
  let retryAfterMs = 0;
  for (const rule of rules) {
    const { count, windowStartMs } = await store.hit(rule.key, rule.windowMs, nowMs);
    if (count > rule.limit) {
      retryAfterMs = Math.max(retryAfterMs, windowStartMs + rule.windowMs - nowMs);
    }
  }
  return retryAfterMs > 0 ? { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) } : { allowed: true };
}

/** Per-process store for local runs and tests. Serverless instances do not share it. */
export function createMemoryRateLimitStore(): RateLimitStore {
  const windows = new Map<string, RateLimitHit>();
  return {
    async hit(key, windowMs, nowMs) {
      const current = windows.get(key);
      const next =
        current && nowMs - current.windowStartMs < windowMs
          ? { count: current.count + 1, windowStartMs: current.windowStartMs }
          : { count: 1, windowStartMs: nowMs };
      windows.set(key, next);
      return next;
    }
  };
}

type SqlExecutor = { execute(query: SQL): Promise<{ rows: Record<string, unknown>[] }> };

/**
 * Postgres store shared by every serverless instance (table auth_rate_limits,
 * migration 0002). One atomic upsert per hit: concurrent requests serialize on the row.
 */
export function createDbRateLimitStore(db: SqlExecutor): RateLimitStore {
  return {
    async hit(key, windowMs, nowMs) {
      const now = new Date(nowMs).toISOString();
      const windowCutoff = new Date(nowMs - windowMs).toISOString();
      const result = await db.execute(sql`
        insert into auth_rate_limits (key, window_start, count)
        values (${key}, ${now}::timestamptz, 1)
        on conflict (key) do update set
          count = case when auth_rate_limits.window_start <= ${windowCutoff}::timestamptz
            then 1 else auth_rate_limits.count + 1 end,
          window_start = case when auth_rate_limits.window_start <= ${windowCutoff}::timestamptz
            then ${now}::timestamptz else auth_rate_limits.window_start end
        returning count, window_start
      `);
      const row = result.rows[0] ?? {};
      const hit = { count: Number(row.count ?? 1), windowStartMs: Date.parse(String(row.window_start ?? now)) };

      if (hit.count === 1) {
        // A key started a new window: prune rows nobody has touched for a day so the table stays small.
        await db.execute(
          sql`delete from auth_rate_limits where window_start < ${new Date(nowMs - pruneAfterMs).toISOString()}::timestamptz`
        );
      }
      return hit;
    }
  };
}

/** Keys hold a SHA-256 of the email or IP, never the raw value. */
export function rateLimitKey(kind: "email" | "ip", value: string): string {
  return `${kind}:${createHash("sha256").update(value).digest("hex")}`;
}

/** Vercel sets x-real-ip and x-forwarded-for itself; elsewhere these headers can be spoofed. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

let memoryStore = createMemoryRateLimitStore();

/** Test hook: forget every in-memory window. */
export function resetMemoryRateLimitStore(): void {
  memoryStore = createMemoryRateLimitStore();
}

/** The shared Postgres store when a database is configured, else the per-process memory store. */
export function rateLimitStoreFor(db: SqlExecutor | null): RateLimitStore {
  return db ? createDbRateLimitStore(db) : memoryStore;
}
