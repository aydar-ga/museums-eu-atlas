# Development

## Prerequisites

- Node.js 24.
- npm.
- Optional Neon Postgres database for persisted accounts.
- Vercel CLI when deploying to the linked Vercel project.

## First Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5001/`.

Port `5001` remains the default because macOS often reserves `5000`.

Override the local port:

```bash
npm run dev -- -H 127.0.0.1 -p 5010
```

## Environment Variables

Supported variables:

- `APP_PORT` - local Playwright/dev port, default `5001`.
- `DATABASE_URL` or Vercel-provisioned `POSTGRES_URL` - Neon Postgres connection string for Drizzle account persistence.
- `AUTH_SECRET` - signs magic-link tokens; required for shared deployments.
- `PUBLIC_APP_URL` - optional absolute URL for generated magic links.
- `RESEND_API_KEY` - optional email delivery.
- `AUTH_EMAIL_FROM` - optional sender address for email delivery.
- `APP_BASE_URL` - optional Playwright target for an already running app.

Without `DATABASE_URL`, magic-link auth still works locally and the browser session stays in `localStorage`.

Without Resend settings, the magic-link endpoint returns a dev link in the UI.

## Database

### Local

1. Create a Neon project and copy the Postgres connection string into `DATABASE_URL` or `POSTGRES_URL`.
2. Apply the schema:

```bash
npm run db:migrate
```

### Vercel Marketplace Neon

1. Import the repo in Vercel.
2. Connect Neon from **Storage** in the project dashboard.
3. Redeploy. Build-time migrations run automatically when `POSTGRES_URL` is present.

Useful commands:

```bash
npm run db:generate
npm run db:push
npm run db:studio
```

## Dependency Changes

Use npm:

```bash
npm install package-name
npm install -D package-name
```

Do not reintroduce Python dependency management for the app runtime.
