# Testing

## Test Layers

- ESLint for static checks.
- `next build` for TypeScript and App Router build validation.
- Vitest for unit/component tests.
- Playwright for e2e browser tests.

## Unit And Component Tests

```bash
npm run test
npm run test:unit
npm run test:component
```

Covered behavior includes museum data integrity, cleaned data examples, theme helpers, dev magic-token helpers, theme switcher, home page filtering, planned/visited behavior, magic-link form states, and favicon asset/manifest integrity.

## Browser E2E Tests

Install Chromium once:

```bash
npx playwright install chromium
```

Run e2e:

```bash
npm run test:e2e
```

Run against an already running app:

```bash
APP_BASE_URL=http://127.0.0.1:5001 npm run test:e2e
```

Covered browser behavior includes index load, search/country/category filters, planned-only and visited-only filters, light/dark switching, localStorage visit persistence, legacy id migration, milestone message, detail navigation, already signed-in account state, saved routes panel, fixed utility rail on scroll, image fallback, favicon/manifest head tags, responsive layout checks across phone, tablet, and desktop widths, and Playwright screenshot regression for hero, utility rail, account panel, and card states.

Visual regression snapshots live in `tests/e2e/visual.spec.ts-snapshots/`. Update them intentionally with:

```bash
npm run test:e2e -- --project=visual --update-snapshots
```

The account e2e opens `/account?testUser=e2e@example.com` and skips the magic-link roundtrip. That shortcut is ignored in production builds. Magic-link form behavior remains covered by component tests, and token verification is covered below the browser layer.

## Full Local Check

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```

## CI Pipeline

GitHub Actions runs four independent jobs on pull requests and pushes to `main`:

0. **Workflow lint** — actionlint validates `.github/workflows/ci.yml` before any job runs.
1. **Lint** — ESLint static analysis.
2. **Build** — `next build` production validation.
3. **Unit & component tests** — Vitest (`npm run test`).
4. **End-to-end tests** — Playwright in the official `mcr.microsoft.com/playwright:v1.60.0-noble` image; runs after build succeeds. Browsers are preinstalled in the container, so CI does not call `playwright install`.

The Playwright container image tag in `.github/workflows/ci.yml` must stay a literal string. GitHub Actions does not allow the `env` context in `container.image`.

Workflow file: `.github/workflows/ci.yml`.
