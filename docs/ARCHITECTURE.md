# Architecture

## Stack

- Next.js App Router for routing, static generation, and route handlers.
- React 19 with TypeScript.
- Static CSS in `src/app/globals.css`; no Tailwind requirement.
- Vitest for unit/component tests.
- Playwright for browser e2e tests.
- Vercel as the intended hosting target.
- Neon Postgres with Drizzle ORM for persisted magic-link accounts, museum progress, and saved routes.
- Browser `localStorage` for planned museums, visit progress, milestones, theme, session token, and local session email.

There is no active Flask, Python, uv, Poetry, Gunicorn, Docker, Jinja, or SQLite runtime.

## Runtime Shape

Pages:

- `/` renders the discovery grid.
- `/museums/[slug]` renders a statically generated museum detail page.
- `/signup` and `/login` keep the museum list visible and open the magic-link sign-up flow in a right-side panel.
- `/magic-link?token=...` consumes a one-time token and creates a browser session.
- `/account` keeps the museum list visible and opens the account shell in the same right-side panel. Signed-in users get one header account icon; sign-out is inside the account panel.

Route handlers:

- `POST /api/auth/request-link` creates a signed magic-link token. It sends via Resend when `RESEND_API_KEY` and `AUTH_EMAIL_FROM` exist; otherwise it returns a dev link.
- `POST /api/auth/verify-link` verifies a signed token, upserts the account in Neon when configured, and returns a signed session token.
- `POST /api/auth/dev-session` (non-production only) creates a signed session token for local/e2e shortcuts.
- `GET /api/progress` and `PUT /api/progress` read/write signed-in planned and visited museum slugs in Neon.
- `GET /api/routes`, `POST /api/routes`, and `DELETE /api/routes/[id]` manage saved trip routes for signed-in users.
- `GET /api/healthz` returns service metadata and database connectivity for monitoring.

## Data Model

The canonical museum data is TypeScript in `src/data/museums.generated.ts`, wrapped by helpers in `src/data/museums.ts`. Each museum has slug, name, location, category, themes, popularity tier, family/online flags, summary, visit rationale, highlights, official and online URLs, local image filename, image alt text, credit, and source URLs.

Neon tables:

- `users` — magic-link account rows
- `user_museum_progress` — per-user planned/visited museum slugs
- `saved_routes` — named trip routes containing museum slug arrays

## Frontend Behavior

`src/components/HomePage.tsx` renders all museums upfront and filters client-side by search, country, city, category, planned-only, and visited-only.

Visit state is stored under `visitedMuseums`; planned state is stored under `plannedMuseums`. The app migrates legacy numeric visited ids to slugs using the same `data-legacy-id` mapping as the previous app.

For signed-in users, progress merges local and server state on sign-in, writes back to Neon through `/api/progress`, and keeps `localStorage` as the live UI cache.

Light/dark mode is stored under `museumsEuAtlasTheme`; the bootstrap script applies the selected/system theme before hydration.

The utility rail (sign-in + theme controls) renders through `UtilityRailHost`, a viewport-fixed layer portaled to `document.body`, so it stays pinned while the museum grid scrolls.

## Auth

Auth is passwordless and intentionally minimal. The route handler signs a time-limited magic-link token with `AUTH_SECRET`. Successful verification also returns a longer-lived signed session token stored in `localStorage` as `museumsEuAtlasSession`.

Authenticated API routes read `Authorization: Bearer <sessionToken>`.

When `DATABASE_URL` or Vercel-provisioned `POSTGRES_URL` points at Neon Postgres, successful magic-link verification upserts a row in the `users` table through Drizzle. Progress and saved routes require both a valid session token and a configured database.

In non-production builds, `/account?testUser=<email>` seeds the local browser session for e2e and manual local checks via `POST /api/auth/dev-session`.

This is not a full identity platform. OAuth, MFA, and account deletion are still deferred.

## Database

- Schema: `src/db/schema.ts`
- Client: `src/db/index.ts` using `@neondatabase/serverless`
- Migrations: `drizzle/` via Drizzle Kit

Local commands:

```bash
npm run db:push      # apply schema to Neon (dev)
npm run db:migrate   # apply SQL migrations
npm run db:generate  # regenerate migration files after schema edits
npm run db:studio    # inspect data locally
```

On Vercel, `npm run build` runs `scripts/migrate-if-configured.mjs` first. When Neon is connected through Vercel Marketplace, migrations apply automatically using the injected `POSTGRES_URL`.

## Images

Images live in `public/images`. Runtime hotlinking is not used. Image source and license notes remain in `docs/sources.md`.

## Operations

See `docs/OPERATIONS.md` for health-check monitoring and rollback policy.

## Selectors

Playwright selectors use stable `data-testid` attributes. Do not remove or rename them without updating tests in the same change.
