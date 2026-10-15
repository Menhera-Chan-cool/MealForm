# Spec: table-columns
## Objective
Choose visible PC columns in viewer details, Dashboard submissions and history, reusing each existing TableWorkspace. No table data is removed or refetched.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Structure
TableWorkspace.jsx with shared ColumnChooser, explicit caller headers/required indexes; UI CSS and browser suite.
## Style
Native popover with named checkboxes and reset. Scope display rules to one workspace and only PC widths; keep the original table DOM.
## Testing
RED/GREEN headers/cells hide together, required columns stay, all optional columns may hide, mobile restores every column, expanded table shares choices, changed projection resets safely and no mutation call is issued.
## Boundaries
Always keep viewer name/projected-day context, submission identity/actions, history action/target/actions. Ask before export/schema changes. Never hide an empty-state colspan or change matching/deletion identity.
## Success
Choices apply only to the current table signature/page visit; filter/count data and mobile completeness stay unchanged. Archive calendar is excluded.
