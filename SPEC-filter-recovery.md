# Spec: filter-recovery
## Original objective
Viewer, submission search, audit filters and archive month empties explain the current criteria and allow removing one criterion without clearing the others. Distinguish empty source, filtered empty and unread/unverified data.
## Original commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Original structure and style
Shared FilterEmptyState and pure filterConditions helper in ui-clarity.mjs; App/Dashboard/HistoryArchive callers; native/browser tests. Plain Vietnamese, literal escaped user text, flat state surface and original clear handlers. Keep focus at a meaningful input.
## Original testing and boundaries
RED/GREEN all/single/boolean criteria, independent clear, name/day/meal intersections, empty source vs query, archive reset and loading/error distinction. Always keep sort, week and other filters. Ask before search/API changes. Never claim a filter caused an unread/error state or merge names/records. Recovery does not re-enter unaffected criteria; no reads/writes beyond existing filter behavior.

# Approved extension — 2026-10-17

## Objective / success criteria
For zero matches, compute each single-condition removal with the same matching rules and current loaded snapshot. Show positive exact counts only for complete snapshots; otherwise label loaded subset. Explicit click removes only its condition; no requests, automatic relaxation or guessing. Viewer name/day/meal, Dashboard names and audit filters are covered.

## Commands / tests
App build/native/API/GAS: npm test in meal-viewer. Browser: node_modules/.bin/playwright.cmd test --config playwright.production.config.ts in mealform-preview (CI=1, headless, serial). Preview: npm test, npm run build, npm run build-storybook. Native tests in meal-viewer/*.test.mjs and MealForm.test.js; actual-entrypoint tests in mealform-preview/tests/ui/production-ui.spec.ts. Meaningful RED before implementation; preserve all regressions. Desktop/mobile/light/dark/narrow/forced-colors visual batch, at most one repair/confirmation round. No real record mutations during QA.

## Structure / style
Existing React19/Vite UI, existing helpers/components/CSS tokens, existing native test scripts and API/GAS contracts. Reuse reducers and shared TableWorkspace/FilterEmptyState/branding modules; small native JS functions. Example: dispatchMenu({type:'edit',value:current=>next}) retains existing undo/validation rather than a second state store.

## Boundaries
Always preserve roles, account/week scope, exact record matching, error handling, confirmations, safe focus, IME input, storage limits and backward compatibility. Ask before new dependencies, auth/secrets/schema or unrelated backend changes. Never queue writes, mutate real records in QA, silently save branding/reorder published data, persist destructive credentials, edit vendor files or expose student data in logs. User approved scoped GAS mutation verification and production deployment; do not rebuild old sharing RARs.
