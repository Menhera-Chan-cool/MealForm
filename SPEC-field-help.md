# Spec: field-help
## Objective
Manual help beside registration deadline, reconciliation, access permissions, OCR and notice expiry. Explain meaning and safe next steps without exposing secrets or triggering actions.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Structure
Shared FieldHelp.jsx, existing Dashboard/WeekNoticeEditor callers and UI CSS; existing browser suite.
## Style
Use the installed icon family, native popover, runtime theme variables and 44px trigger: `<FieldHelp label="Hạn đăng ký">…</FieldHelp>`. Keep help buttons outside input labels.
## Testing
RED/GREEN manual open/Escape/outside close, focus, labels, mobile bounds, no writes and unchanged form handlers.
## Boundaries
Always preserve labels/validation. Ask before dependencies/backend changes. Never auto-open, request extra rights or display credentials.
## Success
Help can be found next to its field by mouse, keyboard or touch; no setting changes until the original action is used.
