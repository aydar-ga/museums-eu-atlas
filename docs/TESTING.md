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

Covered browser behavior includes index load, search/country/category filters, planned-only and visited-only filters, light/dark switching, localStorage visit persistence, legacy id migration, milestone message, detail navigation, magic-link signup, account page, image fallback, favicon/manifest head tags, and responsive layout checks across phone, tablet, and desktop widths.

## Full Local Check

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```

## CI Pipeline

GitHub Actions runs four independent jobs on pull requests and pushes to `main`:

1. **Lint** — ESLint static analysis.
2. **Build** — `next build` production validation.
3. **Unit & component tests** — Vitest (`npm run test`).
4. **End-to-end tests** — Playwright in the official `mcr.microsoft.com/playwright` image; runs after build succeeds. Browsers are preinstalled in the container, so CI does not call `playwright install`.

Workflow file: `.github/workflows/ci.yml`.
