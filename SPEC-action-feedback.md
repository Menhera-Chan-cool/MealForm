# Spec: action-feedback

## Objective / approved criteria
Accessible fixed notifications for explicit dashboard operations; pending delete/restore is shown on the selected row, not as invented percentages. Success can expire; errors remain dismissible. Week switches cannot expose stale actionable rows while a load is pending.
## Commands
`npm --prefix meal-viewer test`; `npm --prefix meal-viewer run build`; `playwright-cli -s=meal-admin-qa --raw run-code --filename=meal-viewer/.playwright-cli/check-admin-upgrades.js`.
## Structure and style
Reuse `meal-viewer/src/Dashboard.jsx`; small `ActionToast.jsx` and dashboard CSS; SSR checks in `viewer-ui.test.mjs`, browser fixtures under ignored `.playwright-cli/`. React hooks, function components and existing request/error helpers. Example: `notify('Đã cập nhật.', 'success');`.
## Verification
Test success/error display, dismiss button, role=status/alert, per-row label, stale-week race, reduced motion and 390/1280px layouts. No real deletion smoke tests.
## Boundaries
Always preserve confirmations and session handling. Ask before enabling concurrent mutations or external notifications. Never auto-repeat mutations or clear unresolved errors as success. No new dependencies.
