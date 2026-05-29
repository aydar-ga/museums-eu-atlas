# Codex Agent Guide

Read `docs/AGENT_INDEX.md` first. This repository is `museums-eu-atlas`, a compact Next.js App Router art museum atlas with a magic-link auth shell. It is not a Flask app and no Python runtime is part of the active stack.

## Working Rules

- Use `npm` scripts for dependency and command execution.
- Keep local dev on port `5001` by default.
- Preserve localStorage visit tracking until server-side sync is explicitly in scope.
- Preserve the light/dark theme switcher contract: header icon controls, `museumsEuAtlasTheme` localStorage key, system fallback, and e2e coverage when changed.
- Keep the current auth flow minimal: email magic link, local browser session, and account shell.
- Keep images local under `public/images` and keep `docs/sources.md` current.
- Treat `museums-tracker-ru` as a modernization pattern only, not as product copy to paste.

## Required After Every Iteration

1. Tests are updated.
2. Docs are updated.
3. README, agent index, and other entrypoint/index files are updated when relevant.
4. Roadmap is updated when plans, deferrals, or completed items change.

## Verification Default

```bash
npm install
npm run lint
npm run build
npm run test
npm run test:e2e
```

Deploy with Vercel CLI only when requested:

```bash
vercel deploy . -y
```
