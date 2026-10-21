# Spec: confirmation-scope

## Objective and success criteria
PC explanation left / exact affected object right; mobile object first. Caller provides scope snapshot, never guessed from names. Preserve reason, default Cancel focus, sticky footer, duplicate-submit lock and focus return.

## Commands
From meal-viewer: npm test; npm run build. From mealform-preview: npx playwright test --config playwright.production.config.ts --grep reading-layouts; npm test; npm run build; npm run build-storybook.

## Structure
Existing React/Vite JSX and semantic runtime CSS in meal-viewer/src. Target: ActionConfirmation.jsx, Dashboard.jsx, WeekNoticeEditor.jsx, SessionManager.jsx. Browser tests in mealform-preview/tests/ui/production-ui.spec.ts; native helpers in meal-viewer/reading-layouts.test.mjs.

## Code style
Reuse original handlers and primitives. Example: <button type="button" className="secondary" onClick={onCancel}>Hủy</button>. Do not introduce an independent state store for source data or appearance.

## Testing
Add behavioural RED browser/native cases before implementation; verify projection, reorder/hide, mobile expansion/filter preservation, dirty state, keyboard/focus, cancel/no writes. Run complete existing suite and one batched light/dark PC/mobile/short/large-text review plus one correction confirmation. Never run QA writes against real services.

## Boundaries
- Always: retain loaded-data truth, readonly cache, exact identities, access checks, confirmations, draft/Undo and focus/scroll.
- Ask first: API/GAS, dependency, auth, destructive-storage or deployment-scope expansion.
- Never: fake totals/unread events, auto-save/retry writes, copy secrets or student data into test outputs, remove validation.

## Open questions
None; user authorized autonomous detail choices and release after verification.
