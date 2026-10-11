# Spec: response-updates

## Objective
Check current Form response identities every 60 seconds while Dashboard is visible and not mutating. Count genuinely new identities, not net row-count changes. Badge uses existing Tải lại dữ liệu button; never reorder/replace table from polling.
## Commands
`cd meal-viewer; node dashboard-qol.test.mjs`; `node admin-upgrades.test.mjs`; `npm test`.
## Structure
MealForm.gs small identity-only reader; authenticated API read action; Dashboard.jsx polling lifecycle and baseline ids.
## Style
Reuse request/session handling; comparison is `ids.filter(id => !known.has(id)).length`. Never fetch item answers/history for this check.
## Testing
New response concurrent with deletion, duplicate identities, removed new response, hidden tabs, no overlapping checks, stale week responses, manual refresh clears badge, network failures leave table intact.
## Boundaries
Always authorize each read and stop polling on unmount/session loss. Ask before push/background automation. Never call OCR, mutate Form/Sheet, or auto-apply new table data.
## Success
Accurate new-id count; table stable until manual reload, in-flight poll cannot resurrect badge after reload or change week.
