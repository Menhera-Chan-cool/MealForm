# Spec: access-discovery

## Objective and success
Owner's Gmail tab gains email search and a single All/View/OCR/Delete permission filter. Intersect filters over members already loaded, keep original objects/identities. Show X/Y loaded accounts and distinct empty-list/no-match states. Search is case/accent insensitive using existing foldSearchText. Filters never call services or update permissions. Original add/set/remove callbacks, confirmations, busy and owner gates remain unchanged.

## Structure and style
Dashboard.jsx with existing SearchInput and native select, semantic theme variables and responsive labels. `members.filter(member=>...)` derived during render; no duplicated member state.

## Commands and tests
`npm test` in meal-viewer; focused/full production-ui Playwright suite in mealform-preview. Test all permission predicates, query intersection, empty state, zero filter POSTs, exact identity on actual checkbox update, non-owner denial.

## Boundaries
Always show loaded scope. Ask before server filtering. Never infer or silently modify permissions.
