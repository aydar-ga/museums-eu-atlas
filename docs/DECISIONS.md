# Decisions

## Migrate To Next.js

Decision: migrate from Flask/Jinja/Python to Next.js App Router, React, and TypeScript.

Why:

- The current requirement explicitly asks for a best TypeScript engineering stack.
- The app is intended to deploy to Vercel, where Next.js has first-class support.
- App Router route handlers cover the small auth API without a separate backend.
- The museum discovery UI benefits from typed components and component tests.

## Preserve Museum Cards

Decision: match the RU reference card anatomy while preserving this app's English Europe/global dataset: image, title/details icon, city/category line, planned chip, and visited chip.

Why:

- The user explicitly asked to keep museum cards as they are in the RU reference.
- Existing e2e selectors and product muscle memory depend on this surface.

## Passwordless Magic Links

Decision: replace local email/password auth with magic-link signup/sign-in.

Why:

- It is minimal and avoids password storage.
- It fits Vercel route handlers and optional email delivery.
- It keeps browsing open before sign-in.

Known limitation: OAuth and account deletion are still deferred.

## Sync Museum Progress For Signed-In Users

Decision: store planned/visited museum slugs in Neon for authenticated users while keeping `localStorage` as the live UI cache.

Why:

- Signed-in users expect progress to survive browser changes when a database is connected.
- The merge-on-sign-in flow preserves anonymous progress and upgrades it after magic-link verification.
- Session tokens reuse the existing `AUTH_SECRET` signing model without introducing cookies.

## Saved Trip Routes

Decision: add a first logged-in feature beyond auth: named routes saved from the current planned museum list.

Why:

- It is the smallest useful trip-planning step before richer map/export work.
- It reuses the same authenticated API/session pattern as progress sync.

## Utility Rail Host

Decision: render sign-in and theme controls inside a viewport-fixed host portaled to `document.body`.

Why:

- Controls must stay pinned while the museum grid scrolls.
- Portaling avoids invalid `documentElement` children and scroll-lock side effects from `position: fixed` body locking.

## Add Neon Postgres With Drizzle

Decision: persist magic-link accounts in Neon Postgres through Drizzle ORM.

Why:

- The product now needs durable account rows without introducing a second backend service.
- Neon fits Vercel/serverless deployment and works with the Neon HTTP driver.
- Drizzle keeps schema, migrations, and TypeScript types in-repo.

Known limitation: museum visit progress is still intentionally local-only until cross-device sync is scoped.

## Use Webpack For Local Dev

Decision: run `next dev` with `--webpack` locally.

Why:

- The current Turbopack dev backend can panic on the account route in this project.
- The production `next build` path remains unchanged.
- The stable local workflow matters more than Turbopack-specific dev speed here.

## Keep Visit Progress Local

Decision: keep visit state in `localStorage`.

Why:

- The product remains a local-first tracker.
- Cross-device sync requires a real database, account lifecycle, privacy policy, and data export/delete plan.

## Remove Mascot

Decision: remove the mascot from the hero, auth flow, footer, components, and tests.

Why:

- The user explicitly requested no mascot anywhere.
- The app should keep focus on the atlas title, filters, and museum cards.
