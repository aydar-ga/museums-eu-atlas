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
- Simplified signed-in account controls: header keeps one account icon, sign-out moved into the account panel, and local/e2e test users can skip the magic-link roundtrip with `/account?testUser=<email>`.
- Replaced Pushkin and Hermitage entries with Museum of Fine Arts Budapest and Acropolis Museum, including greyscale building card images.
- Added Playwright visual regression snapshots for light/dark hero, signed-in account panel, utility rail, and planned/visited card states.
- Fixed utility rail positioning with a viewport-fixed host portaled to `document.body`, and locked page scroll while the side panel is open.
- Added signed-in museum progress sync to Neon (`user_museum_progress`) with session tokens after magic-link verification.
- Added saved trip routes (`saved_routes`) in the account panel for signed-in users.
- Added production operations guidance and richer `/api/healthz` monitoring payload.

## Near-Term Next Iteration

- Add real email delivery credentials in Vercel project settings.
- Consider Next Image after confirming image optimization costs and behavior on Vercel.
- Add `AUTH_SECRET` to Vercel Preview environments and verify magic-link flow end-to-end in preview deployments.
- Regenerate Playwright visual snapshots in the same OS/container as CI when visual diffs appear.

## Future Product Vision (New Project Direction)

These items are intentionally scoped as a separate product evolution, not part of the current compact atlas MVP:

1. **Modern sci-fi AI SaaS visual language** — dynamic hero and UI motion similar to contemporary AI products. Example: rotate the headline qualifier (`Top` → `must-see` → `must-watch` → other curated variants) with smooth transitions and ambient background elements.
2. **Logged-in product features** — business and product capabilities beyond anonymous/local browsing: saved routes/trip planning (initial version shipped), collections, preferences, notifications, and account-level settings.
3. **AI museum guides** — assistant experiences such as personalized visit plans, highlight explainers, route suggestions, and conversational museum guidance grounded in the curated dataset.
4. **Personal scratch-off Europe map** — generate a printable or shareable map from the user's planned and visited museum choices. Start from predefined visual templates (e.g. dark gold scratch-off poster, minimal atlas, travel-journal styles), plot selected museums on a Europe map, and use scratch-off layers for planned vs visited progress. Inspired by premium travel scratch maps such as [Europe Art Travel scratch maps](https://www.etsy.com/de/listing/1478021081/europe-art-travel-scratch-map-52-museen) and curated art-travel products like [Artlas](https://www.artlas.art/en).

## Deferred

- OAuth, MFA, account deletion, and full account lifecycle UI.
- Ticket prices, opening hours, live closure data, restoration status, and schedule data.
- Public API surface.
- Email delivery hardening beyond basic Resend integration.
