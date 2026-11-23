# Codex Agent Guide

Read `docs/AGENT_INDEX.md` first. This repository is `museums-eu-atlas`, an English Europe/global art museum atlas built with Next.js App Router, React, TypeScript, local images, magic-link auth route handlers, and browser localStorage planned/visited progress.

## Hard Guardrails

- Keep the Next.js/TypeScript/Vercel stack unless a concrete requirement justifies another migration.
- Do not reintroduce Flask, uv, Poetry, Python app code, or Docker-by-default workflow.
- Do not hotlink museum images at runtime.
- Preserve stable `data-testid` selectors or update e2e tests in the same change.
- Preserve the light/dark theme switcher contract: header icon controls, `museumsEuAtlasTheme` localStorage key, system fallback, and e2e coverage when changed.
- Do not add a mascot or character layer unless explicitly requested.
- Preserve the Europe/global art museum identity; do not copy Russian product content from `museums-tracker-ru`.

## Required After Every Iteration

1. Tests are updated for changed behavior.
2. Docs are updated for changed architecture, workflow, or product behavior.
3. README, agent index, and other entrypoint/index files are updated when commands or navigation change.
4. Roadmap is updated when scope is deferred, completed, or newly discovered.

## Verification Default

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
