# Spec: sheet-locations

## Objective
Adjacent response/issue button resolves the current registered response Sheet and matching row(s). One match opens its row; ambiguity lists each candidate without guessing; no match explains why. Read-only users retain Google Drive access requirements.
## Commands
`cd meal-viewer; node dashboard-qol.test.mjs`; `node admin-upgrades.test.mjs`; `npm test`.
## Structure
MealForm.gs shared matching, API authenticated read route, Dashboard.jsx shared row-link control; existing reconciliation issues receive response identity metadata.
## Style
Construct only Google Sheets links using registered spreadsheet id, native response Sheet gid, validated integer row. Never navigate to client-provided URLs.
## Testing
Row shifts, zero/unique/duplicate candidates, different sheet gid, unauthorized calls and no writes. Browser popup behavior and ambiguous-link list.
## Boundaries
Always re-read on click. Ask before adding permissions. Never infer unique match from name alone, share Drive files, mutate rows, or expose links publicly.
## Success
Row address uses current gid and row, fresh identity matching, no stale cached row links; Form-only issues do not invent a Sheet row.
