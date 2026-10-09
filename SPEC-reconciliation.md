# Spec: reconciliation

## Objective / approved criteria
Read-only report for one registered week: matched, Form-only, Sheet-only and ambiguous records. Match timestamp to the existing second-level rule, normalized name and ordered meal choices. Duplicate pairing on either side must remain ambiguous. No tokens, respondent emails or restore payloads are returned by this report.
## Commands
`node meal-viewer/admin-upgrades.test.mjs`; `npm --prefix meal-viewer test`; `npm --prefix meal-viewer run build`.
## Structure and style
Reuse `getMealDashboardWeek_` cached Form targets and existing matching helpers. Apps Script report, authenticated bridge query and Dashboard report panel. Example: `if (!permissions.view) throw new Error('Không có quyền xem.');`.
## Verification
Fixtures with exact matches, two same names/different choices, missing Form/Sheet rows and duplicate candidates; assert no writes or deletes. Deny guests/non-viewers. Browser verifies counts and empty state.
## Boundaries
Always preserve unique-record deletion safeguards. Ask before offering repairs. Never automatically delete, restore, deduplicate or alter either store. No new dependencies.
