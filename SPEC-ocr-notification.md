# ocr-notification

## Objective / acceptance
Per-account local opt-in, permission requested only on explicit user gesture. Notify only validated successful full/multi/region OCR received after the page became hidden; no failures, cancel, fake progress or stale account. Generic fixed message contains no students, email, image, dishes, IDs, tokens or source URLs. Persistent SW notification preferred when available; graceful unsupported/denied/error feedback, manual test clearly labeled and disabled by default. Click focuses existing Dashboard and posts a guarded request to open OCR; no silent navigation over unsaved data, no auto create. No push server or promise after tab/browser closes.

## Controls presentation — 2026-10-18
Controls are collapsed behind a 44px CircleAlert (!) button immediately left of OCR help (?). Reuse the native auto-popover and More menu theme/motion, anchor by the trigger on PC, bottom panel above mobile navigation. Close by outside click, Escape or explicit Close; keyboard focus returns to the opener. Settings/state remain in the existing parent hook; no extra permission request/read/write on opening. Very short screens use available viewport with scrolling and sticky Close. This presentation-only delta does not change API/GAS v81 or notification/badge logic.

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
