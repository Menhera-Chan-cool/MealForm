# Reading context — verification and completed release, 2026-10-15

Scope: selected ideas 4, 5, 6 only. Specs: CAPABILITY-MAP-reading-context.md and its three module specifications. The user explicitly authorized main/production publication through PR #12. The three features are now merged and live with Apps Script metadata updated to version 79. The preceding five reading tools remain a separate PR #11 release.

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
- Publication updated both Apps Script metadata and the Vercel viewer gateway. Before the backend update a genuine staging GET returned `lockAt:null`; after version 79 it returned the actual configured current and next deadlines. Countdown is informational and can lag its deadline by up to the 30-second display interval; server Form state stays authoritative.

## Completed release

- Runtime source `8ab0e591981a2ddb19ee94d2dcd6a377c734c659`; 116 upload files, 700773 bytes, no mismatches against Git blobs.
- [PR #12](https://github.com/Menhera-Chan-cool/MealForm/pull/12) merged at 2026-10-15T11:30:25Z (18:30 Vietnam), merge `e3c49ea6767c1b5f8b8ad564f051c8057d911992`. Head `96cc539fe1b62f4773cd14f278e5c557fe9fc399` adds only release documentation over the runtime source; application, preview and GAS trees match the staged source exactly. Both provider checks passed. Desktop artifact attachment was attempted once and returned Invalid app tool request; GitHub creation/merge succeeded.
- READY production-environment artifact `dpl_7tYqsR2iWFfCxvvaGagaDrwBzXiB`, `https://menutaythanh-j5xzwtrj2-anh-tun.vercel.app`, version `5c107e3f-5717-4774-9373-d497263a0d3e`. Promoted this same artifact without rebuilding after the backend update; named main URL returns this version. Vite/Node 24, existing anh-tun/menutaythanh project and team, provider build about 17 seconds; npm ci audited 177 packages with zero vulnerabilities. JS `/assets/index-DE6Ia7x5.js`, CSS `/assets/index-DOR91wM8.css`.
- Actual immutable assets passed expanded context in all three tables, distinct real-deadline fixture rendering, and pinned readonly quick navigation with 12 successful font requests, no page errors or business writes. An initial smoke-fixture assertion was corrected to await the existing 300ms Dashboard read and echo its requested query/sort; no application change or rebuild was needed.
- Browser-control kernel could not initialize (OS error 3); Playwright CLI reused the owner's existing `mealform-production` Chrome tab and authenticated MEALFORM project. After the user asked to stop opening windows, no further windows were opened, and four verified-empty QA sessions were closed. No account credentials or Script Properties were read.
- Apps Script version **79**, 15/10/2026 18:41 Vietnam, updated the existing web-app deployment in place. Four unique guarded Monaco edits added only the requested metadata, preserving the full incumbent source and one Undo group (123248 to 123372 characters). The source was saved and the deployment UI confirmed success, the unchanged deployment URL, execute-as-owner and Anyone access. No trigger, folder/origin configuration, Form/Sheet record or permission was changed.
- Genuine staging and production responses now report current `2026-10-12T00:00:00+07:00` and next `2026-10-16T00:00:00+07:00`, demonstrating the configured deadline rather than an inferred serving-week date. The current Form remains closed and next Form open.
- Existing headless production session passed genuine GET-only UI checks: expected version, real current/next deadline `<time>` values, expanded filter context and Escape, **22 submissions**, **390px viewport/document width**, protected history/dashboard APIs **401**, zero page errors and zero business-write attempts. No student names were emitted. Owner quick-view navigation used synthetic services on the immutable built assets.
- Deployment-specific error-log scan: last 15 minutes, limit 20; one DEP0169 deprecation entry on HTTP 200, zero 5xx and no unknown statuses in that scan. Monitoring/drains were not modified or fully audited. Nonfatal CLI update-worker EPIPE/timeout output did not affect READY inspection or successful promotion.
- Rollback references: Apps Script version 78 and Vercel `dpl_5W7qkMhYGNf264nuuFiZ8XPv9D3r` (PR #11). No rollback required. Final README/task evidence is a documentation-only main follow-up; RAR was not rebuilt.

Implementation used Impeccable to preserve the existing Operate UI, semantic light/dark palette and bounded responsive checks, and Ponytail to reuse TableWorkspace, the registry deadline helper, native dialog and navigation without new dependencies.
