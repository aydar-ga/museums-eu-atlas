# Atomic museum progress writes

> slug: `atomic-progress-writes` · created: 2026-11-23 · status: done
> Ledger: `ledger.json` (machine state — do not hand-edit while a run is active)

## Problem

`writeUserProgress` (`src/server/progress.ts`) replaces a user's progress in two separate HTTP calls to Neon: delete every row, then insert the new set. If the insert fails (network error, timeout, constraint error), the delete has already committed and the user's synced planned/visited list is empty on the server.

## Outcome

Replacing progress is all-or-nothing: either the new set is stored, or the old set is still there.

## Acceptance criteria

1. With a non-empty snapshot, the delete and the insert are sent together through `db.batch`, which the `neon-http` driver runs as one transaction (`client.transaction`); the delete is never executed on its own — *evidence:* `src/server/progress.test.ts` "replaces progress in one batch".
2. With an empty snapshot, a single delete statement runs (atomic by itself) — *evidence:* `src/server/progress.test.ts` "clears progress with one delete".
3. Stored rows are unchanged in shape: one row per slug with `planned`/`visited` flags — *evidence:* AC1 test checks the inserted rows.

## Non-functional requirements

| Requirement | Target | How it is measured |
|---|---|---|
| HTTP round trips to Neon per progress write (after user lookup) | 1 (was 2) | AC1 test: one `batch` call, no standalone delete |

## Out of scope

- Merging concurrent writes from two devices (last write wins, as today).
- Schema changes.

## Invariants

- Existing tests stay green; `PUT /api/progress` response unchanged.

## Design notes

Skipped as a separate stage: one function. `db.transaction()` is not available on `neon-http` (it throws); `db.batch([...])` is the driver's transaction primitive (`drizzle-orm/neon-http/session.js` calls `client.transaction(builtQueries)`).

## Assumptions

- None.

## Stop conditions

- Maker-checker ceiling: 4 iterations per stage, then escalate.
- Human gate: **release**. Everything before it runs unattended.
- Escalate immediately on: schema loss, auth changes, a failing invariant.
