# Agent Index

Authoritative starting point for Claude, Codex, and other agents working on this repository.

## What This Project Is

`museums-eu-atlas` is a small English-language museum discovery and visit-tracking product. It focuses on 50 major European and global art museums while preserving the compact RU-style card visual identity.

The active stack is Next.js App Router, React, TypeScript, static CSS, local images, magic-link auth route handlers, Neon Postgres with Drizzle ORM for account persistence, and browser `localStorage` for planned and visited museum progress.

## Read First

1. `README.md` - quickstart, commands, local/test/Vercel workflow.
2. `CLAUDE.md` and `CODEX.md` - agent guardrails and iteration checklist.
3. `docs/ARCHITECTURE.md` - app structure, routes, data flow, limits.
4. `src/data/museums.ts` and `src/data/museums.generated.ts` - validated museum dataset and filters.
5. `src/components/HomePage.tsx` - discovery UX, filters, progress, localStorage visits.
6. `src/components/MuseumCard.tsx` - museum card contract; keep visual treatment stable.
7. `src/components/AuthFlow.tsx` and `src/app/api/auth/*` - magic-link auth flow.
8. `src/db/` and `src/server/users.ts` - Neon/Drizzle account persistence on sign-in.
9. `src/app/globals.css` - visual language, RU-style cards, light/dark themes, responsive behavior.
10. `docs/DECISIONS.md` - why the stack and tooling look this way.
11. `docs/ROADMAP.md` - what is intentionally deferred.

## Repository Structure

- `src/app/` - Next App Router pages, layouts, API route handlers.
- `src/components/` - React components and component tests.
- `src/data/` - TypeScript museum data and data tests.
- `src/lib/` - localStorage, theme, auth, image helpers and unit tests.
- `src/db/` - Drizzle schema, Neon client, and database tests.
- `src/server/` - server-only helpers for magic-link token signing and account upserts.
- `public/images/` - local museum images and fallback SVG.
- `public/favicons/` - favicon assets; edit `museum-icon.svg` then run `npm run generate:favicons`.
- `tests/e2e/` - Playwright e2e tests.
- `docs/` - product, architecture, testing, roadmap, source, and design docs.
- `.github/workflows/ci.yml` - GitHub Actions CI: lint, build, Vitest, and Playwright (official Docker image) run as separate jobs.

## What Not To Change Without Reason

- Do not reintroduce Flask/Python/uv as the app runtime.
- Do not add fake OAuth, profile, password reset, or visit-sync UI before backend support exists.
- Do not hotlink museum images at runtime.
- Do not remove source/license documentation for data or images.
- Do not replace the English Europe/global product with Russian product copy.
- Do not move museum visit state into a database until cross-device progress is explicitly required.
