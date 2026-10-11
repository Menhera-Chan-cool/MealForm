# Spec: ocr-undo — Hoàn tác và làm lại

## Objective and success
Undo/redo title, dates, meals and closed flag; group typing within one field, 50 in-memory changes. Reset on new image/OCR/account/draft reset. Restore current draft menu only, not historical undo snapshots. After undo require missing-meal confirmation again.
## Commands
`cd meal-viewer; node editor-qol.test.mjs`; `npm test`; `npm run build`.
## Structure
MealForm.gs shared normalization/Form/Sheet/viewer functions; src/Dashboard.jsx and dashboard-model.mjs editing; ocr-draft.mjs compatibility; shared safe-error-report and ErrorReportButton for frontend errors; existing CSS and API whitelist.
## Style
Reuse immutable updates, safe React text and authenticated request helpers. Example: `day.closed === true`. No new dependency or credentials.
## Testing
Pure models and isolated Apps Script/Sheet fixtures, full old-week regressions, browser checks at 1280/390px. Test invalid dates, all-closed weeks, holiday at beginning/middle/end, lost network/clipboard and unchanged existing registrations. Undo/redo changes actual submission values. Sticky control bounds checked during scroll/focus.
## Boundaries
Always: verify dates/calendar routing, unique-record guards, account isolation and compatibility. Ask: schema/permission/dependency expansions. Never: overwrite a registered menu or mutate real responses for QA, auto-publish from OCR, copy sensitive diagnostics.
## Delivery
Main/template tests and browser fixtures before Apps Script + Vercel deployment, read-only production smoke, checked GitHub source and README.
