# Spec: text-size

## Objective and success
Normal/Large text on PC/mobile, all pages and dialogs. Local browser preference survives reload/storage denial; no account or response data stored. Keep minimum touch targets and wrapping, test 320/390/1280px, readable names/labels/meals with no page overflow. Existing zoom/motion/branding unaffected.
## Commands
Build/test: `cd meal-viewer; npm test`; preview: `npx vite --host 127.0.0.1 --port 5176`.
## Structure/style
MealForm.gs and meal-viewer API, existing model/cache/draft/App/Dashboard components plus small native helpers. Safe React text, immutable state and existing authenticated requests; `await draft.flush()` before navigation. No new dependency or service.
## Verification
RED/GREEN Node assert/native VM/API contracts and browser fixtures at 320/390/1280px. Permissions, invalid inputs, stale versions/replies, expiry boundaries/server-clock skew, preserved drafts/focus, large text, storage denial, no mutation commands and read-only cancelled snapshots. Full old regressions, clean-template tests and readonly production proof.
## Boundaries
Always authorize/validate and keep current-record mutation checks. Ask for services/scopes outside this approved map. Never commit secrets, mutate real responses or publish real notices during QA, cancel/retry writes, claim server cancellation or silently overwrite another edit. Backend before web, clean sharing config/README/GitHub delivery.
