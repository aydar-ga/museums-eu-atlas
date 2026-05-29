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
- Prepared Vercel Marketplace Neon integration: build-time migrations, `POSTGRES_URL`/`DATABASE_URL` support, and zero-manual-schema deploy flow.

## Near-Term Next Iteration

- Add visual regression screenshots for both themes and card states.
- Add real email delivery credentials in Vercel project settings.
- Consider Next Image after confirming image optimization costs and behavior on Vercel.

## Future Product Vision (New Project Direction)

These items are intentionally scoped as a separate product evolution, not part of the current compact atlas MVP:

1. **Modern sci-fi AI SaaS visual language** — dynamic hero and UI motion similar to contemporary AI products. Example: rotate the headline qualifier (`Top` → `must-see` → `must-watch` → other curated variants) with smooth transitions and ambient background elements.
2. **Logged-in product features** — business and product capabilities beyond anonymous/local browsing: saved routes, trip planning, collections, preferences, notifications, and account-level settings.
3. **AI museum guides** — assistant experiences such as personalized visit plans, highlight explainers, route suggestions, and conversational museum guidance grounded in the curated dataset.

## Deferred

- Server-side museum visit sync.
- OAuth, MFA, account deletion, and full account lifecycle UI.
- Ticket prices, opening hours, live closure data, restoration status, and schedule data.
- Public API surface.
- Production environment hardening: stable `AUTH_SECRET`, Resend sender verification, monitoring, and rollback policy.
