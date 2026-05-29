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

Known limitation: no durable server-side account database exists yet. The current session is local to the browser.

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
