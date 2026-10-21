# Spec: week-reading

## Objective and success criteria
Compact old-week rows; current/next stay prominent. Desktop grouped headers follow actual reordered/visible columns. Mobile full-week responses collapse with expand-all, but single-day projections show meals directly. One wide-PC sidebar, one mobile filter sheet; honest loaded/shown footer.

## Commands
From meal-viewer: npm test; npm run build. From mealform-preview: npx playwright test --config playwright.production.config.ts --grep reading-layouts; npm test; npm run build; npm run build-storybook.

## Structure
Existing React/Vite JSX and semantic runtime CSS in meal-viewer/src. Target: DashboardLayout.jsx, DetailTable.jsx, TableWorkspace.jsx, Dashboard.jsx. Browser tests in mealform-preview/tests/ui/production-ui.spec.ts; native helpers in meal-viewer/reading-layouts.test.mjs.

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
