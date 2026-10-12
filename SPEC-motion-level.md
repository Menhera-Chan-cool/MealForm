# Spec: motion-level

## Objective and success criteria
One Full/Light/Off preference across CSS/JavaScript animation and disclosure timers. Default follows reduced-motion until explicit selection, migrate old Full override. Light removes decorative sequences and keeps short interaction feedback; Off immediate menus/panels, no invisible Form labels, no stranded closing states. No dependency on CSS transition events for correctness.

## Commands
Build/test: `cd meal-viewer; npm test`. Browser preview: `node .playwright-cli/admin-preview.mjs`; QA: `playwright-cli -s=meal-import run-code --filename=.playwright-cli/check-import-appearance.js`.

## Structure and style
MealForm.gs, meal-viewer/api/security.mjs, existing Dashboard/Comfort/Branding/disclosure/draft components plus small pure helpers and native review UI. Node assert/native VM tests in meal-viewer, browser fixtures copied to browser-tests in clean sharing sources. Immutable edits: `dispatchMenu({type:'edit',value:next})`; plain React text and existing fresh authorization.

## Verification
Write failing helper/native/API/browser tests first, then implement minimal changes. Validate identities, whole-week/filter/paging guards, malformed/oversized files and provider JSON, merge conflicts/missing slots, preserved draft/Undo, storage denial, theme contrast, reduced/full/light/off state, focus and 320/390/1280px overflow. Run all previous regressions and clean-template tests, saved backend source readback and readonly deployed-path smoke.

## Boundaries
Always preserve existing drafts/configuration/roles, fresh two-store mutation identity and input validation. Ask before new dependencies, services or scopes. Never commit secrets, publish Forms/notices or perform real OCR/response mutations during QA; no automatic content corrections or cached mutation authority. Deploy backend before web and sync clean source/README to GitHub.
