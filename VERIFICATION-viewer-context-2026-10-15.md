# Viewer context UI — 15/10/2026

## Scope and status

Implemented the selected ideas 2, 3, 7 and 10. The user authorized GitHub publication on 15/10/2026: push feature branch `ui/viewer-context-2026-10-15` and open a PR, without merging `main` or deploying/promoting Vercel. No Apps Script edit or live-data mutation has been performed. Baseline: `08008f070caf1ee58f38f8087c832e38a89f1c73`; runtime implementation commit: `d9a1ed617ed1910e3ed7e5603b4d831309a5ab67`.

The UI continues using the existing model, Form target allowlist, source labels, permissions and record identity. No new dependency, API request, secret or persistence key. Impeccable guided the flat registration groups, shared theme colors, 44px mobile controls and bounded inline release notes rather than another modal. No day strip was reintroduced.

## Fresh checks

- TDD: four new browser behaviors failed against the old UI (counts, registration groups, compact date disclosure, manual release notes); the unit count/date helpers also failed before implementation. The per-meal unit test failed with the old ambiguous “lượt” badge before its copy changed.
- `meal-viewer`: `npm test` passed: production build and all 29 native/UI/API/Apps Script test scripts. New assertions include three source submissions sharing names, four matching choices across three submissions, empty choices, filtered/empty results, real holiday columns, valid leap dates and invalid/custom date fallback.
- `mealform-preview`: `npx playwright test --config playwright.production.config.ts` passed **44 tests** (38 existing + 6 new). Real React controllers/components; only external HTTP services were replaced with synthetic fixtures. Covers mobile tab/filter counts, separate closed-current/open-next Form contexts, touch date expansion, PC full labels, holiday Dashboard/quick view pairing, manual notes/reset and 320/390/1440px large-text light/dark overflow checks. The new theme matrix explicitly selects and asserts the actual color scheme.
- Preview `npm test`: **5 passed** (tokens and Chromatic guard); `npm run test:ui`: **11 passed**; TypeScript/Vite `npm run build` passed; `npm run build-storybook` passed.
- Inspected generated screenshots of current/next registration context and narrow-screen notes, including dark theme. Existing delete/restore, dirty-edit, OCR, quick-view focus and authorization regressions remain passing. No real Form/Sheet write was used.

## Limits

Chrome responsive emulation, not physical iOS/Android devices. No Figma write/sync or Chromatic cloud upload/baseline comparison. Existing non-fatal Lucide module-directive and Storybook vendor-chunk warnings remain. Production and old RARs do not receive these local changes until separately published.
