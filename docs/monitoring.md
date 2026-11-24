# Monitoring

Free, built-in signals for real demand. No raw emails or IPs are stored; `auth_events` rows hold HMAC hashes or a user id.

| Signal | Where | Notes |
|---|---|---|
| Sign-up alert | email to `OWNER_ALERT_EMAIL`, "🎉 New ArtMuse sign-up" | sent on a new account's first sign-in, masked address (`s***@domain.com`) and UTC time; at most 10 a day (durable); never blocks the sign-in |
| Daily digest | email to `OWNER_ALERT_EMAIL` | Vercel Cron `0 7 * * *` → `GET /api/cron/digest` with `Authorization: Bearer $CRON_SECRET`; last 24 hours of sign-ups, sign-ins, links sent, blocked requests, plus total accounts; skipped when nothing happened |
| Auth events | `auth_events` table | kinds `link_requested`, `link_blocked`, `sign_in`, `sign_up`; 35-day retention |
| Page views | Vercel Web Analytics (`<Analytics />` in `src/app/layout.tsx`, Vercel deployments only) | cookieless, same-origin script |
| Health | `GET /api/healthz` | see [OPERATIONS.md](OPERATIONS.md) |

Both emails need the email kill switch on (`AUTH_EMAIL_ENABLED=true` plus Resend), and the digest needs `CRON_SECRET`; without it the route answers 401. They use the same Resend quota as sign-in links, so they count toward the caps in [security-guardrails.md](security-guardrails.md) only through Resend's own limits.

Ad-hoc numbers (read-only, Neon console SQL editor):

```sql
select kind, count(*) from auth_events where created_at > now() - interval '7 days' group by kind;
select count(*) from users;
```
