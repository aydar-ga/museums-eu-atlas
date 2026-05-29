# museums-eu-atlas

English-language Next.js app for discovering and tracking visits to 50 major European and global art museums. The product header is "Europe's Top 50 Art Museums Atlas" and the app keeps the compact Roboto Mono museum-card experience while using TypeScript, React, Next App Router, Vitest, Playwright, and Vercel.

## What Is Included

- 50 researched art museums, museum complexes, palace collections, and artist museums.
- Search plus country, city, category, planned-only, and visited-only filters.
- Local planned/visit progress, milestone feedback, and legacy numeric-id localStorage migration.
- Light/dark mode with header icon controls, system preference fallback, and persisted local preference.
- Magic-link signup/sign-in using Next route handlers. In local/dev mode the link is shown directly; with `RESEND_API_KEY` and `AUTH_EMAIL_FROM`, the API can send email.
- Detail pages with reasons to visit, highlights, official links, online collections, source links, and image credits.
- Local image files only, plus an SVG fallback for missing images.
- npm-based tooling, ESLint, TypeScript build checks, Vitest unit/component tests, and Playwright e2e tests.
- Vercel configuration for Next.js deployment.

## Quickstart

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5001/`.

To use another port:

```bash
npm run dev -- -H 127.0.0.1 -p 5010
```

## Common Commands

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
npm run check
npm run generate:favicons
npm run db:migrate
npm run db:push
```

Regenerate PNG/ICO favicon sizes after editing `public/favicons/museum-icon.svg`:

```bash
npm run generate:favicons
```

Playwright browsers:

```bash
npx playwright install chromium
```

Run against an already running app:

```bash
APP_BASE_URL=http://127.0.0.1:5001 npm run test:e2e
```

## Vercel

Current live deployment from the previous deployment iteration:

- https://museums-tracker.vercel.app

Deploy with the linked Vercel project:

```bash
vercel deploy . -y
```

Explicit production deploy:

```bash
vercel deploy . --prod -y
```

Environment variables are documented in `.env.example`. Set `AUTH_SECRET` before any shared deployment. Add `DATABASE_URL` for Neon-backed account persistence, then run `npm run db:migrate`. Add `PUBLIC_APP_URL`, `RESEND_API_KEY`, and `AUTH_EMAIL_FROM` when real email delivery is desired.

## Architecture

The project intentionally uses Next.js App Router now because deployment to Vercel and TypeScript-first engineering are explicit requirements. Museum visit progress remains browser-local; magic-link auth creates a local browser session and upserts the account in Neon when `DATABASE_URL` is configured.

Read these first:

- `CLAUDE.md`
- `CODEX.md`
- `docs/AGENT_INDEX.md`
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT.md`
- `docs/TESTING.md`
- `docs/DECISIONS.md`
- `docs/ROADMAP.md`
- `docs/DESIGN_DIRECTION.md`
- `docs/sources.md`

## Non-Goals

- No database-backed museum visit sync yet.
- No OAuth, MFA, account deletion, or password reset; magic links replace passwords.
- No runtime image hotlinking.
- No Russian product content copied from `museums-tracker-ru`.
