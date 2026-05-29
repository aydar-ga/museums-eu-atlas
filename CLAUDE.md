# Claude Agent Guide

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
