# Security Guardrails

Abuse and cost limits for sign-in and writes. The numbers live in one module, `src/server/abuse-limits.ts`. Every check fails closed: if a counter cannot be read, the request is refused.

Context: Vercel Hobby, Neon Free, Resend Free (100 emails/day and 3,000/month, shared with another project; bounces and complaints can suspend the account).

## Sign-in email: `POST /api/auth/request-link`

Checks run in this order, cheapest first. Nothing reaches Resend until all pass.

| Step | Rule | Refusal |
|---|---|---|
| Same origin | `Sec-Fetch-Site: same-origin`, or an `Origin` equal to the app. Neither header means refused | 403 |
| Body | JSON object, at most 16 KB | 413 / 400 |
| Honeypot | hidden `website` field filled | fake 200, nothing sent or stored |
| Email | valid shape, at most 254 characters, lowercased | 400 |
| Kill switch | deployments send only when `AUTH_EMAIL_ENABLED` is exactly `true` and `RESEND_API_KEY` and `AUTH_EMAIL_FROM` are set | 503 |
| Memory layer | per instance: 5 per email, 20 per IP, 15 minutes | 429 |
| Durable caps | per recipient 3/hour and 5/day; per IP 5/hour and 20/day; app-wide 40/day and 1,000 per 31 days | 429 |
| Database error | any failure in the checks above or in storing the token | 503 |

The durable caps are sliding windows over `auth_events` rows of kind `link_requested`. One Postgres transaction takes an advisory lock, counts and inserts, so parallel requests cannot all pass the same count. Refused attempts are logged as `link_blocked`, at most 1,000 rows a day. Rows hold HMAC-SHA256 hashes of the email and IP, keyed by `AUTH_SECRET`; raw values are never stored. Rows older than 35 days are pruned on each request.

The link is never returned in the response on a Vercel deployment. Local runs without Resend get it inline for development.

## Magic links

- Expire after 15 minutes and work once. Each token carries a random id; only its SHA-256 is stored (`magic_link_tokens`). Verification marks it used in one atomic update.
- The `/magic-link` page waits for a click before using the token, so email scanners that open links cannot spend it.
- `POST /api/auth/verify-link`: same-origin only, 20 attempts per IP per 10 minutes (durable, `auth_rate_limits`). Forged, expired, reused and unknown tokens get the same message.

## Logout

`POST /api/auth/logout` only (other methods get 405), same-origin only (else 403). It deletes the server-side session and clears the `__Host-` cookie. Sign-in rotates the session.

## Authenticated writes

`PUT /api/progress`, `POST /api/routes` and `DELETE /api/routes/:id` need a same-origin request (403, CSRF) and a session cookie (401), allow 300 writes per user per day (durable, 429), and refuse JSON bodies over 16 KB (413). Helpers: `requireSession`, `requireWriteSession` and `readJsonObject` in `src/server/api-guard.ts`, the only module that builds a 401.

## Without a database

On a Vercel deployment a missing database refuses every guarded request. Local runs without a database (dev, e2e) fall back to per-process memory counters and a per-process used-token set.

## Tests

`src/server/email-guard.test.ts` exercises every cap against an in-process Postgres (PGlite) with the real migrations. Route tests cover the order above, the kill switch, single use, the verify limit, logout and the write cap, and fail-closed behaviour on database errors.
