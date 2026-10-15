# Spec: filter-recovery
## Objective
Viewer, submission search, audit filters and archive month empties explain the current criteria and allow removing one criterion without clearing the others. Distinguish empty source, filtered empty and unread/unverified data.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Structure
Shared FilterEmptyState and pure filterConditions helper in ui-clarity.mjs; App/Dashboard/HistoryArchive callers; native/browser tests.
## Style
Plain Vietnamese, literal escaped user text, flat state surface and original clear handlers: `<FilterEmptyState conditions={…} onClear={…}/>`. Keep focus at a meaningful input.
## Testing
RED/GREEN all/single/boolean criteria, independent clear, name/day/meal intersections, empty source vs query, archive reset and loading/error distinction.
## Boundaries
Always keep sort, week and other filters. Ask before search/API changes. Never claim a filter caused an unread/error state or merge names/records.
## Success
A user can recover from an empty filtered view without re-entering unaffected criteria; no automatic reads or writes beyond existing filter behavior.
