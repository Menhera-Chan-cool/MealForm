# Approved admin upgrades: implementation plan

## UI clarity — 13 items, production authorized 2026-10-14

Map: CAPABILITY-MAP-ui-clarity.md. User explicitly requests all 13 changes, GitHub and production with no preview approval. Four specs: search-presentation → week-context → responsive-workspaces → editing-safety. Keep slices small and verify RED/GREEN per presenter/model/caller, then full 29 native/API scripts and real-frontend browser regressions plus preview/Storybook compatibility. Bounded light/dark PC/mobile review, one repair confirmation. No API/Apps Script/dependency changes; no new day-strip or real Form writes. Publish feature PR, verify exact source and mapped Vercel project, build tested artifact without switching main domain, smoke, merge and promote that artifact under already-given release authority; record main version and readonly live checks.

## Ten UI improvements approved 2026-10-14

Map: CAPABILITY-MAP-ui-ten.md. User approved all four groups and delegated detailed planning/implementation; no further design-step gates before staging.
loading-states (shared component, then each caller) → week-discovery (pure helpers, grouped picker, calendar) → viewer-reading (model metadata/cards, mobile tabs, PC pinning) → dashboard-workflow (progress, action menus, brand preview) → full regression/visual review → one staged release, explicit user approval before merge/promotion. User removed day-strip idea 2 before staging; the other nine remain authorized. Existing Day filter/Today, APIs/permissions/drafts/cache identities remain unchanged. Keep each implementation checkpoint to a small component/model/caller/test slice; preserve prior plan history below.

## Import and appearance QoL approved 2026-10-12

reload-changes -> common validated image-ingest -> multi-image OCR reviewed merge -> shared color-scheme and motion-level -> integration, native/API/browser regression -> backend before web deploy -> clean release/README/GitHub sync. Preserve whole-week verified change baselines independent of filters/pages; invalid uploads and failed OCR retain drafts. Merge conflict choices and apply are explicit and one Undo. Reuse comfort/branding/native dialogs, no new dependencies/services/scopes. Test fake OCR/record changes only; production smoke is readonly.

## Navigation and comfort QoL approved 2026-10-12

text-size -> safe command palette -> owner week notices -> read wait cancellation -> integrate/full regression/template sync/backend-before-web deploy and readonly production/GitHub delivery. Native dialogs/context reuse, no extra dependencies. Separate per-week notice properties, optimistic audit, expiry-safe public getters. Abort and stale-generation checks are read-only; cancelled snapshots never regain mutation eligibility. Draft flush failures block hard navigation.

## Review and scale QoL approved 2026-10-12

account-badge -> audit-filters + response-batches -> region-ocr -> version-notice -> full regression, browser QA, clean template sync and backend-before-web deployment. API paging is opt-in for compatibility. Exact indexed identity matching, token-free short-lived server snapshots, global search/sort and revision guards are required; mutations always read both stores again. Crop previews and one Undo reuse current menu history; explicit version refresh waits for current draft persistence. User authorized all five without separate step approvals.

## Dashboard interaction QoL approved 2026-10-11

accent-search + real response day labels/cards -> monday-fill + explicit-selection week search -> density + id-based highlights + readonly quick view -> account/week view restoration. UI-only search folding never reaches matching/deletion functions. Restore scroll only for the correct generation and use the closest surviving row when an anchor disappears. User approved continuous execution, tests and deployment of all eight modules.

## Editing/mobile QoL approved 2026-10-11

holiday-days -> ocr-undo -> existing-week-warning -> mobile-toolbar -> safe-error-report. Keep full five-date calendar identity while Form/Sheet answers only contain serving days. Native-service fixtures must prove correct summary formulas and existing-registration no-op. User approved continuous implementation and verification of all five modules. Deploy backend before web; tests and production checks do not alter real weekly Forms or responses.

## Dashboard QoL follow-up approved 2026-10-11

Implement audit-readability -> sheet-locations -> dashboard-cache -> response-updates. Run failing helper/native-fixture tests before production edits, then full regression and desktop/mobile browser fixtures. Synchronize only scoped files into clean share template. Backend must precede frontend deployment; smoke tests are read-only. No actual weekly Form controls or real response deletion during verification.

1. action-feedback: accessible toast, per-row pending state and guarded week loads; verify before dependent controls.
2. form-control: owner-only bridge/GAS operation, audited live-state updates, shared effective-deadline helper, existing scheduler integration; isolate tests.
3. reconciliation: cached matching report and view-only UI; prove zero writes and duplicate handling.
4. branding: validated owner setting and filtered public read, frontend defaults/theme/identity; preserve semantic status colors.
5. Integrate main and clean share template, run full regression and browser QA, then merge only relevant active Apps Script functions with a live-source backup. Deploy backend before frontend. Smoke tests are read-only and invalid-permission tests only. Push verified template and specs to GitHub without secrets.

Risks: reopening a past week must not be immediately auto-closed; an expired token or stale tab must not mutate a newly changed target; theme must not make text unreadable; read-only diagnostics must not become repairs; live duplicate function definitions must be merged by active definition without dropping unrelated safeguards.
