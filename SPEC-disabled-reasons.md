# Spec: disabled-reasons
## Objective
Blocked business action buttons expose a manual explanation beside them via the incumbent FieldHelp popover. Reasons mirror the actual guard: pending operation/read, unselected week/image, invalid menu, existing week, unverified cached rows or notice conflict. The original button stays natively disabled and cannot submit or mutate through help.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Structure and style
Small ExplainedButton presenter renders the existing native button and, only when disabled, a 44px manual help trigger. Explicit reason strings at callers; no DOM scans/global event hooks. Scope covers viewer reload/Today; table default size; Dashboard OCR/read/create/Form/reconciliation/read-more and response actions; notice editor, branding and system checks. Hidden unauthorized tools stay hidden. Bounded zoom, required-column and review-checkbox controls already have explicit adjacent state text and are not given duplicate help.
## Testing
RED/GREEN keyboard/touch, popover close/focus, truthful unavailable-image/week/cached-data/conflict reasons, help cannot invoke action/POST, enabled state removes help, mobile/light-dark/large-text layout and original confirmations/validation intact.
## Boundaries and success
Always pass the original disabled condition and callback unchanged. Ask before role/auth behavior changes. Never enable a button to explain it, infer missing scopes without server evidence, or treat the helper as permission. No tooltip-only hover interaction.
