# Operations

Production guidance for `museums-eu-atlas` on Vercel with Neon Postgres.

## Monitoring

### Health endpoint

`GET /api/healthz` returns service metadata and database connectivity:

```json
{
  "status": "ok",
  "service": "museums-eu-atlas",
  "version": "3.0.0",
  "commit": "<git-sha>",
  "environment": "production",
  "uptimeSeconds": 123,
  "database": "connected",
  "checks": { "database": "connected" }
}
```

Use this endpoint for:

- Vercel deployment health checks
- External uptime monitors (poll every 1–5 minutes)
- Incident triage before rollback

`503` with `"status": "degraded"` means the app is up but Neon is unreachable.

### What to watch

| Signal | Where | Action |
|--------|-------|--------|
| `/api/healthz` non-200 | Uptime monitor | Check Neon status, Vercel logs, recent deploy |
| Build failures | Vercel Deployments | Inspect migration or env var errors |
| Auth failures spike | Vercel Function logs | Verify `AUTH_SECRET`, Resend config |
| Progress sync 503 | Function logs | Confirm Neon connection string and migrations |

## Rollback policy

1. **Detect** — health check failure, auth regression, or broken progress sync after deploy.
2. **Assess** — open the failing Vercel deployment and compare with the last green production deploy.
3. **Rollback** — in Vercel Dashboard → Deployments → previous production deployment → **Promote to Production**.
4. **Database** — migrations run forward-only on deploy. Do not revert SQL manually unless a migration broke production; prefer a follow-up migration fix.
5. **Verify** — confirm `/api/healthz`, sign-in, progress sync, and saved routes on the rolled-back deployment.
6. **Document** — note incident cause and follow-up fix in the next change set.

## Environment requirements

Production needs at minimum:

- `AUTH_SECRET`
- Neon `POSTGRES_URL` / `DATABASE_URL` from Vercel Marketplace
- `PUBLIC_APP_URL` for magic-link redirects
- Email delivery: `RESEND_API_KEY`, `AUTH_EMAIL_FROM`. Without them, production answers `POST /api/auth/request-link` with 503 and nobody can sign in; local progress still works.
- Rotating `AUTH_SECRET` signs every user out (all session tokens become invalid).

Preview deployments have their own `AUTH_SECRET` (since 2026-11-23). Without one, sign-in on that deployment answers 503; the build still succeeds because `src/lib/env.ts` validates at request time.

## Local verification before promote

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```

For database-backed features:

```bash
npm run db:migrate
npm run dev
```

Then sign in, toggle planned/visited museums, open Account → Saved routes, and confirm `/api/healthz`.
