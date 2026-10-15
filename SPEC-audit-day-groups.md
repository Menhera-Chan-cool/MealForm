# Spec: audit-day-groups
## Objective
Group current filtered, loaded audit events by calendar date in Vietnam; allow collapse while keeping that day's loaded-event count and pending/error count visible. Invalid timestamps get an explicit unknown-time group.
## Structure and style
Keep one table with the existing headers, row actions, column controls and TableScroll; insert a full-colspan day heading for each group. Pure grouping helper returns original event objects. Group collapse is local to the current week/filter signature and resets on a changed filter, not persisted or used for authorization.
## Commands and tests
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`. RED/GREEN Vietnam midnight, unknown time, loaded subset/limit, collapsed issue badge, filter reopening, safe restore identity and mobile row palettes.
## Boundaries and success
Always preserve native pagination/global filtering and existing row callbacks. Counts mean the loaded subset, not the whole day's server total. Ask before changing log storage/order. Never delete/filter out failures merely because a group is folded.
