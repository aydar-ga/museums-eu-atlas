/** Every abuse and cost cap in one place. */

const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;

/**
 * Sign-in email caps, counted over sliding windows of sent links (auth_events `link_requested`).
 * Resend Free allows 100/day and 3,000/month, shared with another project, so the app keeps well under.
 * "Month" is 31 days, so no calendar month can exceed it.
 */
export const emailSendLimits = {
  perRecipientPerHour: { limit: 3, windowMs: hour },
  perRecipientPerDay: { limit: 5, windowMs: day },
  perIpPerHour: { limit: 5, windowMs: hour },
  perIpPerDay: { limit: 20, windowMs: day },
  appPerDay: { limit: 40, windowMs: day },
  appPerMonth: { limit: 1000, windowMs: 31 * day }
} as const;

/** At most this many `link_blocked` rows are logged per 24 hours, so a flood cannot fill the database. */
export const blockedLogLimitPerDay = 1000;

/** auth_events rows older than this are pruned whenever a link is requested. */
export const authEventRetentionMs = 35 * day;

/** Cheap per-instance first layer in front of the durable caps (not shared between serverless instances). */
export const requestLinkMemoryLimits = {
  perEmail: { limit: 5, windowMs: 15 * minute },
  perIp: { limit: 20, windowMs: 15 * minute }
} as const;

/** POST /api/auth/verify-link, per IP, durable. */
export const verifyLinkLimitPerIp = { limit: 20, windowMs: 10 * minute } as const;

/** Authenticated writes (progress, saved routes), per user per day, durable. */
export const writeLimitPerUser = { limit: 300, windowMs: day } as const;

/** Owner sign-up alerts, durable. Beyond this, sign-ups are only recorded in auth_events. */
export const ownerAlertLimit = { limit: 10, windowMs: day } as const;

/** Magic links expire after 15 minutes and work once. */
export const magicLinkLifetimeMs = 15 * minute;

/** JSON request bodies above this size are refused with 413. */
export const maxJsonBodyBytes = 16 * 1024;

/** Emails longer than RFC 5321 allows are refused. */
export const maxEmailLength = 254;

/**
 * Visitor feedback (POST /api/feedback), durable, counted over stored messages. A message over a cap is refused
 * with 429. Owner alert emails are capped separately (feedbackAlertLimit).
 */
export const feedbackLimits = {
  perIpPerHour: { limit: 5, windowMs: hour },
  perIpPerDay: { limit: 20, windowMs: day },
  appPerDay: { limit: 100, windowMs: day }
} as const;

/** Cheap per-instance first layer in front of the durable feedback caps. */
export const feedbackMemoryLimitPerIp = { limit: 5, windowMs: 15 * minute } as const;

/** Owner emails about feedback, durable. Beyond this, messages are stored, and the daily check says how many were not emailed. */
export const feedbackAlertLimit = { limit: 10, windowMs: day } as const;

export const maxFeedbackMessageLength = 2000;

/** Feedback rows are deleted after this, by the daily digest cron. */
export const feedbackRetentionMs = 365 * day;

/**
 * Anonymous product events (POST /api/events): one beacon per page visit, at most `maxEventsPerBeacon` events.
 * The per-instance limit stops one client from flooding; the app-wide daily cap bounds database writes.
 */
export const productEventLimits = {
  maxEventsPerBeacon: 30,
  beaconsPerIp: { limit: 20, windowMs: 10 * minute },
  appEventsPerDay: 20_000
} as const;

/** Daily event counters are deleted after this, by the daily digest cron. */
export const productEventRetentionMs = 400 * day;

