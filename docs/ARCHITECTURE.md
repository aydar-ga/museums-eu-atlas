# Architecture

## Stack

- Next.js App Router for routing, static generation, and route handlers.
- React 19 with TypeScript.
- Static CSS in `src/app/globals.css`; no Tailwind requirement.
- Vitest for unit/component tests.
- Playwright for browser e2e tests.
- Vercel as the intended hosting target.
- Neon Postgres with Drizzle ORM for persisted magic-link accounts.
- Browser `localStorage` for planned museums, visit progress, milestones, theme, and local session email.

There is no active Flask, Python, uv, Poetry, Gunicorn, Docker, Jinja, or SQLite runtime.

## Runtime Shape

Pages:

- `/` renders the discovery grid.
- `/museums/[slug]` renders a statically generated museum detail page.
- `/signup` and `/login` keep the museum list visible and open the magic-link sign-up flow in a right-side panel.
- `/magic-link?token=...` consumes a one-time token and creates a local browser session.
- `/account` keeps the museum list visible and opens the local account shell in the same right-side panel.

Route handlers:

- `POST /api/auth/request-link` creates a signed magic-link token. It sends via Resend when `RESEND_API_KEY` and `AUTH_EMAIL_FROM` exist; otherwise it returns a dev link.
- `POST /api/auth/verify-link` verifies a signed token and upserts the account in Neon when `DATABASE_URL` is configured.
- `GET /api/healthz` returns `{ "status": "ok" }` and reports database connectivity when configured.

## Data Model

The canonical museum data is TypeScript in `src/data/museums.generated.ts`, wrapped by helpers in `src/data/museums.ts`. Each museum has slug, name, location, category, themes, popularity tier, family/online flags, summary, visit rationale, highlights, official and online URLs, local image filename, image alt text, credit, and source URLs.

## Frontend Behavior

`src/components/HomePage.tsx` renders all museums upfront and filters client-side by search, country, city, category, planned-only, and visited-only.

Visit state is stored under `visitedMuseums`; planned state is stored under `plannedMuseums`. The app migrates legacy numeric visited ids to slugs using the same `data-legacy-id` mapping as the previous app. Planned and visited state are not synced to the magic-link account.

Light/dark mode is stored under `museumsEuAtlasTheme`; the bootstrap script applies the selected/system theme before hydration.

## Auth

Auth is passwordless and intentionally minimal. The route handler signs a time-limited token with `AUTH_SECRET`; local development also supports browser-generated dev tokens so the app remains easy to run without email credentials.

When `DATABASE_URL` or Vercel-provisioned `POSTGRES_URL` points at Neon Postgres, successful magic-link verification upserts a row in the `users` table through Drizzle. The browser session email still lives in `localStorage`; visit progress is not synced to the database yet.

This is not a full identity platform. No OAuth, MFA, account deletion, or visit sync exists yet.

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

## Selectors

Playwright selectors use stable `data-testid` attributes. Do not remove or rename them without updating tests in the same change.
