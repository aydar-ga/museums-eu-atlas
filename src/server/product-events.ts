import { sql } from "drizzle-orm";

import type { ProductEvent } from "@/lib/product-events";
import { productEventLimits, productEventRetentionMs } from "./abuse-limits";
import type { SqlRunner } from "./sql-runner";

const utcDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** A Postgres text[] literal. Values are validated against fixed vocabularies first, so quoting is enough. */
function textArray(values: string[]): string {
  return `{${values.map((value) => `"${value.replace(/["\\]/g, "")}"`).join(",")}}`;
}

/**
 * Adds a beacon's events to today's counters in one statement. Once the app-wide daily cap is reached, further
 * events that day are dropped. Returns how many counters were written.
 */
export async function recordProductEvents(runner: SqlRunner, events: ProductEvent[], nowMs: number): Promise<number> {
  if (events.length === 0) {
    return 0;
  }
  const day = utcDay(nowMs);
  const { rows } = await runner.execute(sql`insert into product_event_counts (day, name, subject, count)
    select ${day}::date, e.name, e.subject, count(*)::int
    from unnest(${textArray(events.map((e) => e.name))}::text[], ${textArray(events.map((e) => e.subject))}::text[]) as e(name, subject)
    where (select coalesce(sum(count), 0) from product_event_counts where day = ${day}::date) < ${productEventLimits.appEventsPerDay}::int
    group by e.name, e.subject
    on conflict (day, name, subject) do update set count = product_event_counts.count + excluded.count
    returning name`);
  return rows.length;
}

export type ProductEventCount = { name: string; subject: string; count: number };

/** Yesterday's counters (the last complete UTC day), largest first: what the daily digest reports. */
export async function recentProductEvents(runner: SqlRunner, nowMs: number, limit = 15): Promise<ProductEventCount[]> {
  const { rows } = await runner.execute(sql`select name, subject, count
    from product_event_counts where day = ${utcDay(nowMs - 24 * 60 * 60 * 1000)}::date
    order by count desc, name, subject limit ${limit}::int`);
  return rows.map((row) => ({ name: String(row.name), subject: String(row.subject ?? ""), count: Number(row.count ?? 0) }));
}

/** Deletes counters older than the retention period. Run by the daily digest cron. */
export async function pruneProductEvents(runner: SqlRunner, nowMs: number): Promise<void> {
  await runner.execute(sql`delete from product_event_counts where day < ${utcDay(nowMs - productEventRetentionMs)}::date`);
}
