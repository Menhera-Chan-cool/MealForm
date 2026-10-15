# Spec: save-diff
## Objective
Deadline/Form control, branding and weekly notice save/clear show the actual before/after fields. Cancel retains edits; only explicit Confirm runs the original guarded request, with unchanged reason/optimistic revision payloads.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Structure and style
Extend ActionConfirmation with structured changes and optional reason, keep its native dialog/sticky footer. Use a literal escaped dl/grid, e.g. `{label:'Tên trường',before,after}`; no raw HTML or nested forms.
## Testing
RED/GREEN no-write cancel, exact confirmed snapshot/revision/reason, unchanged retry/409/dirty guards, keyboard focus, literal long values and mobile footer.
## Boundaries
Always preserve original validation, authorization and server conflict checks. Ask before schema changes. Never auto-save or silently add reasons to endpoints that do not accept them.
## Success
Users see only the intended fields; the confirmed values equal the original API payload. Readonly QA never changes a live owner setting.
