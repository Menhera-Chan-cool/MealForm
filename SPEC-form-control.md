# Spec: form-control

## Objective / approved criteria
Owner-only open/close/deadline controls for a registered week, confirmation, live expected-state check and actor/before/after audit. Vietnam time; reopening an expired deadline requires a future one. Default Monday 00:00 remains unless explicitly overridden. Setup, clock-trigger and read-time fallback must retain that override. Partial changes are reported honestly.
## Commands
`node meal-viewer/admin-upgrades.test.mjs`; `npm --prefix meal-viewer test`; `npm --prefix meal-viewer run build`.
## Structure and style
Standalone Apps Script functions in `MealForm.gs`; bridge validation in `meal-viewer/api/security.mjs`; UI in Dashboard. Reuse registry, script lock, existing `_DashboardHistory` headers and cache invalidation. Example: `if (role !== 'owner') throw new Error('Chỉ chủ sở hữu được điều khiển Form.');`.
## Verification
Mocks for registered Form/Sheet/clock; deny managers, reject invalid/stale/past deadline, preserve Monday behavior, honor override on setup and rollover, audit success and failure. Browser fixture confirms open/close/deadline prompts.
## Boundaries
Only owner is granted this new capability. Ask before editing real Form status or real deadlines for a smoke test. Never edit response data, silently override a custom deadline, or claim rollback after a partial failure. Additive registry field `customLockAt`; no new scopes/dependencies.
