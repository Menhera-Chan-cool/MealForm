# Spec: table-density — Bảng gọn/rộng

## Objective and success
Dashboard PC table cell spacing and text density setting; readable 44px action targets. Mobile cards always comfortable. Setting included in account/week view preferences.
## Commands
`cd meal-viewer; node interaction-qol.test.mjs`; `npm test`; `npm run build`.
## Structure
MealForm.gs only adds display metadata; shared viewer-model/dashboard-model helpers; Dashboard.jsx, existing ComboSelect and narrow presentation/state components; dashboard-cache.mjs keeps bounded display-only storage. Unit/native/browser fixtures belong in meal-viewer.
## Style
Immutable menu edits, safe React text, native dialog and house dropdown. Reuse existing authenticated requests and fresh-record guards. Example: `response.responseId`, not folded names, is a view identity.
## Testing
RED then GREEN helpers/native fixtures; full old regressions; Edge at 1280/390px. Holiday labels, missing cache metadata, account/week isolation, expiry, denied storage, out-of-order loads, changed/deleted anchor, native scroll containers, keyboard focus, no API calls while typing, full mobile text, safe actions and preserved Undo all tested.
## Boundaries
Always: authorize before cached display, label stale records, keep privileged operations live and unique. Ask: new dependencies/schema/permissions. Never: overwrite week content, normalize deletion identity, persist tokens, duplicate hidden actions or mutate real responses during QA.
## Delivery
Backend before frontend, readonly production smoke, clean share-template sync and verified GitHub/README delivery.
