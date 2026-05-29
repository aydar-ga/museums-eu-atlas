# Roadmap

## Completed In This Iteration

- Migrated active app runtime from Flask/Python to Next.js App Router and TypeScript.
- Added React component structure, typed museum data, Next route handlers, and Vercel config.
- Renamed the project to `museums-eu-atlas` with the visible title "Europe's Top 50 Art Museums Atlas".
- Aligned museum cards with the RU reference card pattern.
- Removed the mascot from all product surfaces.
- Added passwordless magic-link signup/sign-in.
- Added Neon Postgres + Drizzle ORM for persisted account rows on magic-link verification.
- Preserved light/dark mode with header icon controls.
- Reduced filters to search, country, city, category, planned-only, and visited-only.
- Added Vitest unit/component tests and Playwright e2e tests.
- Updated README, docs, Claude/Codex guides, CI, and Makefile for npm/Next.
- Deployed the migrated Next.js app to Vercel from the local CLI.

## Near-Term Next Iteration

- Add visual regression screenshots for both themes and card states.
- Add real email delivery credentials in Vercel project settings.
- Wire Neon `DATABASE_URL` in Vercel project settings and run `npm run db:migrate`.
- Consider Next Image after confirming image optimization costs and behavior on Vercel.

## Deferred

- Server-side museum visit sync.
- OAuth, MFA, account deletion, and full account lifecycle UI.
- Ticket prices, opening hours, live closure data, restoration status, and schedule data.
- Public API surface.
- Production environment hardening: stable `AUTH_SECRET`, Resend sender verification, monitoring, and rollback policy.
