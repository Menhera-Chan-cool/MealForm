# Spec: summary-drilldown
## Objective
Summary meal names become one accessible action per actual day/meal; the existing count badge stays adjacent. Clicking sets the day/meal filters together, retains name/sort, switches mobile to Details, and focuses its heading (or result summary when no rows match). Return restores the prior filter snapshot and summary position/focus, without a data fetch or mutation. Drilldown matches the selected meal exactly so prefix names cannot add false matches; ordinary typed substring filtering remains unchanged.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Structure and style
ViewerSummary optional callback, App owns filters/return snapshot. Reuse current card/list/count visuals and actual serving labels. E.g. `onMealSelect(day.label,meal)`; no inferred weekdays.
## Testing
RED/GREEN mobile and PC exact selection, filtered count, retained name/sort, return/focus, zero matches, same meal on multiple days, markup literal, no writes. Preview callers remain display-only without a callback.
## Boundaries and success
Always preserve name filtering, source rows and existing sort. Ask before API or persistence changes. Never infer identity from names or fetch private records to fill a summary. Return state is page-local and cleared by ordinary filter changes/new dataset, not persisted or carried to another week.
