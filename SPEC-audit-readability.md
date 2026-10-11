# Spec: audit-readability

## Objective
Optional reason (max 500 characters) for closing/opening Form, changing deadline, and deleting one verified response. Preserve the twelve audit columns and all old events. Display legacy JSON state/deadline changes as Vietnamese text, not raw JSON; preserve partial-failure diagnostics.
## Commands
`cd meal-viewer; node dashboard-qol.test.mjs`; `npm test`; `npm run build`.
## Structure
MealForm.gs handles validation/audit; meal-viewer/api/security.mjs forwards reasons; src/Dashboard.jsx and dashboard-model.mjs render readable history; tests run real helpers and isolated native-service fixtures.
## Style
Reuse existing action labels, escaped React text and history note column. Example: `reason: reason.trim()`; never render HTML from a note.
## Testing
Legacy JSON, JSON plus partial-error suffix, normal notes, malformed JSON, unchanged deadline, empty/long/control-character reasons, success and failure preserving reason. Browser check desktop and mobile.
## Boundaries
Always validate server-side before writes. Ask before schema/dependency changes. Never rewrite old audit rows or delete real responses for testing.
## Success
Readable before/after status and Vietnam-time deadline, optional reason retained on pending/success/partial audit, no JSON clutter.
