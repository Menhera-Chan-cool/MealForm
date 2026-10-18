# app-badge

## Objective / acceptance
Optional per-account flag only from successful unread OCR result or new response IDs already verified by current client read lifecycle. No extra polls/network, no numeric fake counts. Acknowledge OCR only after visible create review is available; updates only after explicit successful reload. Aggregate both pending reasons within this window, clear appropriately on account/logout. Actual API capability/denied states shown, rejected APIs never break operations. Plain in-page pending label fallback. Cross-window/global/background unread synchronization is explicitly out of scope.

## Commands
`npm test` in meal-viewer; `npm exec -- playwright test --config .playwright-cli/reading-polish.config.ts --grep app-session-attention` in mealform-preview. Final fixed-source entire UI suite, preview `npm test`, `npm run build`, `npm run build-storybook`, built compatibility; exact staged artifact tests before merge/promotion.

## Structure and style
React19/Vite8 and Node24 API; existing Apps Script V8. Reuse security.mjs, Google OAuth verifier, signed GAS bridge, display menu, existing dialogs/dirty guards, OCR validation and current API wrappers. Small explicit functions, immutable state and native controls. Example: `return {active: records.some(record=>record.id===request.sessionKey)};`

## Test strategy
RED native fixtures first, then UI behavior tests before edits. Cover malformed IDs/account crossing, revoked/expired renewal, origin, failure/unknown outcomes, no private cache; denied/unsupported permissions; late account/notification/badge callbacks; actual OCR completion and explicit acknowledgement; mobile/PC light-dark/narrow/forced-color. Synthetic services only.

## Boundaries
Always enforce server identity and revocation on every protected route; retain raw record matching and draft guards. Ask before new vendor/dependency/paid storage or offline sync. Never real sessions revoked, student data notifications, token/client credential persistence, fake platform support, auto permission prompts, write retry, forced reload or cache private/API/Google resources.

## Delivery
Source/gateway fixtures and sharing copy updated together. Verify canonical edits against baseline; guarded active live GAS function update, same deployment and scopes; stage/pin exact source, merge main and promote same artifact. Document physical-device limits, server-store capacity/availability and one-time legacy sign-in. No separate design approval required within approved scope.
