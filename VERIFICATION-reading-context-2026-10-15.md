# Reading context — local verification, 2026-10-15

Scope: selected ideas 4, 5, 6 only. Specs: CAPABILITY-MAP-reading-context.md and its three module specifications. The user explicitly authorized main/production publication through PR #12. The preceding five reading tools remain a separate PR #11 release. Current three-feature artifact is staged and verified; Apps Script metadata publication needs the owner's Google login.

## Delivered behavior

- Expanded Viewer detail, Dashboard submissions and audit tables keep a readonly week/filter context above the scrolling body. Viewer/submission sort is included; audit shows its own criteria, not the name-search criteria. Native table DOM, existing controls, required columns, filters and close/focus restoration are retained.
- Existing GAS registry metadata read adds configured `lockAt`, using the same deadline helper as Dashboard. The public gateway validates explicit-timezone ISO timestamps and forwards only allowlisted current/next-week metadata, including next calendar days and server clock. No new service read or trigger behavior. Arbitrary/unregistered sources have no invented deadline.
- Absolute deadline uses Vietnam time. Approximate remaining time is shown only for an open Form; closed/unknown status never claims remaining registration time. Elapsed time never changes Form status. The display uses a server time anchor where supplied and explicitly labels browser-clock fallback. Missing or invalid deadline is stated clearly.
- Quick view has a bounded native dialog, fixed Close header and existing readonly previous/next footer, independently scrolling content and a viewport-height bound. Navigation still uses exact loaded-list identities and never fetches or writes; a changed response starts at the top. Escape and focus return are retained.

## Evidence

- TDD: missing deadline helpers and five real-entrypoint tests failed before implementation. The 900px deadline arrangement also failed its geometry check (deadline started at 415px while controls ended at 477px), then passed after placing the deadline on a separate row.
- `npm test` in canonical meal-viewer: build and 30 native/UI/API/GAS scripts passed after the final runtime changes.
- `npm test` in .github-sync/MealForm/meal-viewer: same build/scripts passed. The sharing template retains its Script Property folder/origin helpers and recipient setup. Only the four intended deadline metadata edits plus final newline differ in its GAS file.
- `npm run build`, `npm test`, `npm run build-storybook` in mealform-preview: TypeScript/Vite build, five token/Chromatic-guard tests and Storybook build passed. No cloud Chromatic upload.
- Compatibility browser suite: 11 passed.
- Final complete actual-entrypoint browser rerun: **97/97 passed (3.0m)** using `./node_modules/.bin/playwright.cmd test --config playwright.production.config.ts --output test-results-reading-context-full` in mealform-preview. Eight added tests and all 89 prior tests passed together, without changing or skipping the earlier flaky assertion.
- Visual review: one batched 360/900/1440px light/dark, large-text inspection and one confirmation after the 900px deadline layout repair. Fixed semantic brand roles; no overflow in the new states. All service boundaries use synthetic fixtures; no real Form/Sheet writes.

## Diagnostics and limits

- First full browser run: 96/97 passed; an existing responsive screenshot case timed out waiting for a column-chooser popover. It passed unchanged in isolation (12.8s). Final full rerun is recorded above; no product workaround or removed assertion was used.
- A first clone GAS synchronization copied the canonical school-specific version instead of preserving the sharing template. The recipient-origin assertion caught it. The clone was restored from its exact clean local HEAD using apply_patch, then only the four scoped metadata edits were reapplied; the full clone suite passed. No external push/deploy occurred.
- Nonfatal existing Lucide directive, Storybook chunk-size/timing and terminal color warnings remain.
- No new dependency/lockfile/env/auth/CI changes, no live owner mutation, no RAR update. Physical mobile devices and other browser engines were not tested.
- Publication requires both Apps Script metadata and the Vercel viewer gateway. A genuine staging GET currently returns `lockAt:null` for current and next Form, confirming the backend still needs its metadata update. Old backend payloads remain compatible but display unknown deadline. Countdown is informational and can lag its deadline by up to the 30-second display interval; server Form state stays authoritative.

## Staged release

- Runtime source `8ab0e591981a2ddb19ee94d2dcd6a377c734c659`; 116 upload files, 700773 bytes, no mismatches against Git blobs.
- READY production-environment artifact `dpl_7tYqsR2iWFfCxvvaGagaDrwBzXiB`, `https://menutaythanh-j5xzwtrj2-anh-tun.vercel.app`, version `5c107e3f-5717-4774-9373-d497263a0d3e`. Named main domain still serves the prior PR #11 artifact pending backend update.
- Actual immutable assets passed expanded context in all three tables, distinct real-deadline fixture rendering, and pinned readonly quick navigation with 12 successful font requests, no page errors or business writes. An initial smoke-fixture assertion was corrected to await the existing 300ms Dashboard read and echo its requested query/sort; no application change or rebuild was needed.
- Browser-control kernel could not initialize (`failed to write kernel assets`, OS error 3). Playwright CLI works, but existing sessions were not Google-authenticated; dedicated visible `mealform-gas-live` Chrome is waiting for the owner login. No account credentials or Script Properties were read.

Implementation used Impeccable to preserve the existing Operate UI, semantic light/dark palette and bounded responsive checks, and Ponytail to reuse TableWorkspace, the registry deadline helper, native dialog and navigation without new dependencies.
