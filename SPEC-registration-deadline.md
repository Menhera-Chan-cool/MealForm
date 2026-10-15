# registration-deadline

Objective: show the configured absolute deadline in Vietnam time and approximate remaining time for the viewed Form and, separately, next-week registration. Unknown/invalid deadlines stay explicitly unknown; no inferred deadlines in the browser.

Implementation: reuse GAS getMealFormLockDeadline_ inside existing metadata read, expose only lockAt through public gateway including nextForm, validate explicit-timezone ISO input, and render a shared read-only deadline component. Server timestamp anchors elapsed time where available; browser fallback must be labelled. Closed/unknown status never claims registration remains open; elapsed deadline never claims Form was closed. No new service reads/polls. Dashboard Form control reuses the same display.

Verify: from meal-viewer run `node registration-deadline.test.mjs` then `npm test`; from mealform-preview run `./node_modules/.bin/playwright.cmd test --config playwright.production.config.ts --grep reading-context`. Cover customized and default registry deadlines, missing/invalid values, distinct current/next, server/client skew, minute/expiry transitions and no mutations.

Boundaries: always validate public input; preserve all Form control/trigger/auth behavior; never invent dates, change deadlines, expose registry fields, or deploy without authority. Existing React/ESM/assert/vm patterns; no dependencies. Source: MealForm.gs, api/security.mjs, viewer-model.mjs, RegistrationContext/App/Dashboard and new pure deadline helper/component.
