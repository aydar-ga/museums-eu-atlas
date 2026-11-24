# Claude Agent Guide

This repository is public. Its internal docs (agent index, architecture, decisions, roadmap, operations, owner actions) live in the owner's private notes at `../ag-dev-meta/projects/museums-eu-atlas/docs/`. Read `AGENT_INDEX.md` there first when it is available. This repository is `museums-eu-atlas`, an English Europe/global art museum atlas built with Next.js App Router, React, TypeScript, local images, magic-link auth route handlers, and browser localStorage planned/visited progress.

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
2. The private docs (`../ag-dev-meta/projects/museums-eu-atlas/docs/`) are updated for changed architecture, workflow, product behavior or roadmap scope.
3. The visitor README is updated when visitors would notice the change.
4. Never commit internal notes here: owner actions, incident or rotation logs, security rationale and thresholds, monitoring setup, account plans, audits, roadmaps or changelogs. They go in the private docs.

## Verification Default

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```
