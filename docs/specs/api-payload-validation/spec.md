# Validate progress and saved-route API payloads

> slug: `api-payload-validation` · created: 2026-11-23 · status: done
> Ledger: `ledger.json` (machine state — do not hand-edit while a run is active)

## Problem

The signed-in write APIs trust their JSON bodies:

- `PUT /api/progress` converts every array item to a string (`{}` becomes `"[object Object]"`) and stores any slug, known or not, with no limit on list length.
- `POST /api/routes` accepts a route name of any length and any number of slugs, including unknown and duplicate ones.
- `DELETE /api/routes/:id` passes any id to Postgres. A non-UUID id makes Postgres raise `invalid input syntax for type uuid`, so the API answers 500 instead of 404.

A signed-in client can therefore fill `user_museum_progress` and `saved_routes` with rows that point at no museum, and a malformed id produces a server error.

## Outcome

The API stores only slugs that exist in the 50-museum dataset. List sizes and route names are bounded. Malformed requests get 4xx answers, never 500.

## Acceptance criteria

1. `PUT /api/progress` keeps only string items that are known museum slugs, removes duplicates (first occurrence wins), stores the cleaned lists and echoes them — *evidence:* `src/app/api/progress/route.test.ts` "drops unknown, non-string and duplicate slugs".
2. `PUT /api/progress` answers 400 when `planned` or `visited` is not an array or has more than 200 items — *evidence:* `src/app/api/progress/route.test.ts` "rejects non-array and oversized lists".
3. `PUT /api/progress` and `POST /api/routes` answer 400 for a body that is not valid JSON — *evidence:* `route.test.ts` "rejects malformed JSON" in both folders.
4. `POST /api/routes` answers 400 when the trimmed name is empty or longer than 80 characters — *evidence:* `src/app/api/routes/route.test.ts` "rejects empty and overlong names".
5. `POST /api/routes` stores only known, de-duplicated slugs in submitted order, and answers 400 when none remain or the raw list has more than 200 items — *evidence:* `src/app/api/routes/route.test.ts` "cleans museum slugs" and "rejects lists with no known museum".
6. `DELETE /api/routes/:id` answers 404 for an id that is not a UUID, without calling the database — *evidence:* `src/app/api/routes/[id]/route.test.ts` "returns 404 for a non-UUID id".
7. Unauthenticated requests still get 401 before any validation — *evidence:* the 401 cases in the three test files.
8. Old browsers that still hold slugs of removed museums (Pushkin, Hermitage) keep syncing: unknown slugs are dropped, not rejected — *evidence:* AC1 test uses `"pushkin-museum"`.

## Non-functional requirements

| Requirement | Target | How it is measured |
|---|---|---|
| Max stored progress rows per user | ≤ 50 (dataset size) | AC1: only known slugs are stored, and the set has 50 members |
| Max items accepted per list in one request | 200 | AC2 / AC5 tests |
| Max saved-route name length | 80 characters | AC4 test |

## Out of scope

- A per-user cap on the number of saved routes (needs a count query; not requested).
- Rate limiting.
- Request body size limits below the platform default.
- Any database schema change.

## Invariants

- Existing tests stay green.
- Response shapes of successful calls are unchanged: `{ planned, visited }`, `{ route }` with 201, `{ ok: true }`.
- The client (`src/lib/progress-sync.ts`, `src/lib/routes-api.ts`) needs no change.

## Design notes

Skipped as a separate stage: one pure module plus three route handlers.

- `src/server/payloads.ts` holds pure parsers: `parseMuseumSlugList(value, { maxItems })`, `parseRouteName(value)`, `isUuid(value)`, and `readJsonBody(request)` (returns `null` on malformed JSON).
- Known slugs come from `museums` in `src/data/museums.ts`.
- Route handlers keep their order: auth (401) → database configured (503) → payload (400) → work.

## Assumptions

- Limits: 200 items per list (4× the dataset, room for stale local slugs) and 80 characters per route name. The UI input has no limit today; 80 fits every name in the e2e suite.

## Stop conditions

- Maker-checker ceiling: 4 iterations per stage, then escalate.
- Human gate: waived by the owner for this run (direct push to `main`).
- Escalate immediately on: schema loss, auth changes, a failing invariant.
