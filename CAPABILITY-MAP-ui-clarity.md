# UI clarity bundle — 14/10/2026

User explicitly authorized all 13 selected ideas through GitHub and production, without a preview approval round. Retain the incumbent token/brand/light-dark/motion system. Assumptions: frontend only, no new dependencies/API/Apps Script/scopes, no live mutations in QA, existing search/record identity and confirmations remain authoritative. Archive metadata may be absent and must never be fabricated. Previously removed day-strip stays removed.

| Module | Selected items | Depends on |
| --- | --- | --- |
| search-presentation | Safe accent-aware text marks, Vietnamese display labels, field-specific clear actions, explicit external-link affordances (1,6,9,13) | Existing models/handlers |
| week-context | Archive breadcrumbs/month return, truthful metadata cards, contextual tab titles, expandable notice (2,4,8,10) | search-presentation |
| responsive-workspaces | Native mobile filter bottom sheet, same-DOM PC table expansion, sticky confirmation actions (3,11,12) | search-presentation |
| editing-safety | Unsaved brand/notice guards and discard semantics; content-bound reviewed OCR days that reopen on invalidation (5,7) | Existing validation/drafts + responsive-workspaces |

Build order: search-presentation → week-context → responsive-workspaces → editing-safety → integrated test/build/visual batch → GitHub PR merge + exact artifact production promotion. This map/spec/plan is self-completed under the user's explicit continuous implementation instruction; no additional preview gate.

Shared commands: in meal-viewer run `npm test`; in mealform-preview run `npx playwright test --config playwright.production.config.ts`, `npm test`, `npm run test:ui`, `npm run build`, `npm run build-storybook`. Observe RED then GREEN for new helpers/behaviors. Real frontend components/controllers with only external HTTP mocked. Test synthetic mutations, never paid OCR/real Form writes. One PC/mobile/theme QA batch plus a bounded repair confirmation.

Code/style: small named JSX presenters and native dialogs; React text rendering, no innerHTML. Canonical runtime is meal-viewer/src; helpers/test scripts at meal-viewer root and browser specs in mealform-preview/tests/ui. Use existing 44px controls, font and semantic brand variables. No global DOM replacement or name-based record lookup. Changes in data/routing/authorization require explicit new scope, not inference.
