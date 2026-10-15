# Spec: archive-status-filter
## Objective
Filter the archive by All/Open/Closed/Unknown using only explicit metadata. Missing/invalid formStatus is Unknown, not Closed. Works together with month and List/Calendar and can clear one criterion independently.
## Structure and style
Existing ComboSelect, pure status classifier and archive URL helpers preserve an allowlisted status query in week/back links. Original unauthorized/empty/source-error distinctions remain. No extra Form reads or server query contract changes.
## Commands and tests
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`. RED/GREEN missing metadata vs explicit closed, month intersection, query round-trip, invalid status fallback, independent clear and refreshed metadata.
## Boundaries and success
Always require existing archive login and show unknown counts/status honestly. Ask before live status scans. Never infer missing weeks, fake zero counts or change a Form to match a filter.
