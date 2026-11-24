import { bigserial, boolean, date, index, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }).defaultNow().notNull()
});

export const userMuseumProgress = pgTable(
  "user_museum_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    museumSlug: text("museum_slug").notNull(),
    planned: boolean("planned").notNull().default(false),
    visited: boolean("visited").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.museumSlug] })
  })
);

export const savedRoutes = pgTable("saved_routes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  museumSlugs: text("museum_slugs").array().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

/** Fixed-window counters for POST /api/auth/request-link; keys are SHA-256 hashes of email or IP. */
export const authRateLimits = pgTable(
  "auth_rate_limits",
  {
    key: text("key").primaryKey(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull()
  },
  (table) => [index("auth_rate_limits_window_start_idx").on(table.windowStart)]
);

/**
 * Append-only auth log (migration 0003). Rows hold HMAC hashes of email and IP, never raw values.
 * `link_requested` rows are the sliding-window counters behind the email caps in src/server/email-guard.ts.
 * Kinds: link_requested | link_blocked | sign_in | sign_up. Rows older than 35 days are pruned.
 */
export const authEvents = pgTable(
  "auth_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    kind: text("kind").notNull(),
    emailHash: text("email_hash"),
    ipHash: text("ip_hash"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index("auth_events_kind_created_at_idx").on(table.kind, table.createdAt),
    index("auth_events_email_hash_created_at_idx").on(table.emailHash, table.createdAt),
    index("auth_events_ip_hash_created_at_idx").on(table.ipHash, table.createdAt)
  ]
);

/** Issued magic links, stored as SHA-256 of the token. A link is consumed once (used_at). */
export const magicLinkTokens = pgTable(
  "magic_link_tokens",
  {
    tokenHash: text("token_hash").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("magic_link_tokens_expires_at_idx").on(table.expiresAt)]
);

/** Server-side sessions (migration 0004). The cookie holds a random id; only its SHA-256 is stored. */
export const sessions = pgTable(
  "sessions",
  {
    idHash: text("id_hash").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
  },
  (table) => [index("sessions_user_id_idx").on(table.userId), index("sessions_expires_at_idx").on(table.expiresAt)]
);

/**
 * Visitor feedback from /feedback. `reply_email` is optional and used only to answer the visitor; the IP is
 * stored as an HMAC (see email-guard.ts). Rows are deleted after feedbackRetentionMs.
 */
export const feedbackMessages = pgTable(
  "feedback_messages",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    kind: text("kind").notNull(),
    message: text("message").notNull(),
    replyEmail: text("reply_email"),
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index("feedback_messages_created_at_idx").on(table.createdAt),
    index("feedback_messages_ip_hash_created_at_idx").on(table.ipHash, table.createdAt)
  ]
);

/**
 * Anonymous product events, aggregated per UTC day: no user, IP, cookie or timestamp finer than the day.
 * `subject` is a museum slug, a filter name or a feedback kind, or '' when the event has none.
 */
export const productEventCounts = pgTable(
  "product_event_counts",
  {
    day: date("day").notNull(),
    name: text("name").notNull(),
    subject: text("subject").notNull().default(""),
    count: integer("count").notNull().default(0)
  },
  (table) => [primaryKey({ columns: [table.day, table.name, table.subject] })]
);

