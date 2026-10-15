# Reading polish — six UI improvements, 2026-10-15

User explicitly requested all six improvements and production publication. Scope and acceptance: `SPEC-reading-polish.md`.

## Behavior and safeguards

- Viewer and Dashboard/Quick View distinguish explicit empty answers (Chưa chọn), missing/null answers (Chưa đọc được), and explicitly recorded holidays (Không phục vụ). No inference from weekday position. Day-filtered empty submissions remain visible and still count zero meal choices. The Vercel allowlisted serializer now preserves null instead of silently turning it into an empty string; source Sheet/Form data is not edited.
- Existing day dropdown includes explicitly known holidays in actual date order, disabled and labelled Nghỉ. Pointer, keyboard and committed typed search cannot select them. No day strip or new date guess.
- Saved and draft branding share device/page/theme controls. Desktop has two columns; mobile switches explicitly. Independent name/logo/color restoration affects only that draft field. Original validation, dirty guards, confirmation, revision check and owner-only save remain. Only successful saves update the comparison baseline. Saved-logo events do not affect draft feedback.
- Zoomed OCR image has a thumbnail and viewport rectangle. Pointer click/drag and arrows/Home/End move the corresponding real scroll viewport, bounded to image edges. Resize/load/zoom and the fullscreen dialog are supported. No OCR call, crop, source-image edit or draft mutation from navigation.
- Anonymous login states describe the current page or validated archive date range/month. Existing Google callback keeps the exact current route and query. No new redirect parameter, token storage, Google scope or authentication policy.

## Verification record

- Native helper and five real-entrypoint scenarios failed before implementation; all seven new browser scenarios subsequently passed together, including explicit-save/reset and responsive coverage.
- `npm test` in meal-viewer: production build plus 31 native/UI/API/GAS scripts passed.
- Preview TypeScript/Vite build, five token/Chromatic guard tests and Storybook build passed. Shared Storybook/preview entrypoints import the new scoped CSS.
- Visual batch inspected 360/900/1440px, light/dark, large text; one confirmation followed a selected-button contrast improvement. No horizontal page overflow in tested states. No cloud Chromatic upload.
- Final complete actual-entrypoint suite passed **104/104 (3.2m)**, without retries, after the scoped menu fix and the two test corrections described below.

Regression investigation: the first full run had 100/104 passing. A prior screenshot popover race was stabilized by allowing scrolling to settle before opening it; one old holiday assertion now locates its actual weekday instead of assuming it is the first displayed day. Week search passed unchanged in isolation. A genuine taller-row regression was reproduced: browser auto-scroll to the Sheet lookup control closed the row-action popover before the lookup result could appear. The shared menu now tracks its visible anchor while scrolling, and still closes when the anchor leaves the screen or the viewport resizes. The original lookup/restore/cancel test and all four affected cases then passed together (4/4). No assertions were removed or test retries enabled. An instrumented trace was removed after identifying the cause.

Both the canonical local app and the clean sharing worktree passed all 31 scripts. Preview compatibility browser suite passed 11/11 against built Vite/Storybook output. A concurrent local build hit memory exhaustion; rebuilding serially with two worker threads succeeded without a source/configuration change.

## Limits

Only synthetic service boundaries were used for owner interactions; one explicit branding save is against a mocked API. Genuine release smoke uses GETs only. Physical phones and other browser engines were not tested. Existing nonfatal Lucide directives, Storybook chunk/timing and terminal-color warnings remain. No dependencies, lockfiles, secrets, environment variables, permission changes or Apps Script redeployment; backend remains v79. Existing RAR files are not rebuilt.

Rollback baseline: PR #12 runtime source `8ab0e591981a2ddb19ee94d2dcd6a377c734c659`, artifact `dpl_7tYqsR2iWFfCxvvaGagaDrwBzXiB`, version `5c107e3f-5717-4774-9373-d497263a0d3e`.

## Completed publication

- Runtime source: `26d850c403fc14d56fa557d7a0b8409904ba3a50`. [PR #13](https://github.com/Menhera-Chan-cool/MealForm/pull/13) merged at 2026-10-15 12:46:17 UTC; merge `3f931f78977fe1d4464ba9f7f7cfcd0c0bf2ab51`. The merged application/preview/GAS trees exactly match the checked source. App attachment was attempted once but the desktop tool returned Invalid app tool request; the PR itself exists and is merged.
- Named Vercel project `menutaythanh`, scope `anh-tun`, project ID `prj_J0aPrnCB79cyxClYyfCpb02nqSES`: 120 upload inputs, 714444 bytes, zero committed-blob mismatches; no env/auth/test/screenshots uploaded. The reused upload verifier prints older feature names in its summary, but checks every current input blob against the specified commit.
- Artifact `dpl_6BdaSZrVyzukKgW1faaAJPgfFbXB`, immutable URL `https://menutaythanh-e13wanr78-anh-tun.vercel.app`; version `3c197e72-b588-4550-946c-2573454bbda2`; JS `/assets/index-Cw55Cqu5.js`, CSS `/assets/index-1ACjt_7N.css`. Build READY using npm ci, Node 24 and the existing production environment. Exact artifact promoted to `menutaythanh.vercel.app`, no promotion rebuild.
- Six functional real-entrypoint scenarios ran against the immutable deployed assets with synthetic API/GSI boundaries: **6/6 passed (12.5s)**, covering all six requested capabilities. A redundant remote screenshot matrix stalled after the 900px light comparison and was interrupted; it is not claimed as a pass. The complete local 104-case run already includes the successful 360/900/1440px light/dark visual matrix. No cloud visual upload.
- Genuine production browser/API GET smoke passed: exact version, 22 submissions/110 meal choices, real day selection, 390px no horizontal page overflow, archive week/query preserved, contextual OCR Dashboard login, private history/Dashboard APIs 401, next week 200, setup seven steps, zero page errors and zero business writes. Current Form closed with configured deadline `2026-10-12T00:00:00+07:00`; next deadline `2026-10-16T00:00:00+07:00`. No student names emitted.
- Bounded 15-minute logs: zero 5xx matches (limit 20) and zero warning matches (limit 20). This is a release smoke, not a monitoring/drain audit or guarantee about future requests. No monitoring settings changed.
- Canonical app/preview/tests were synchronized only after validating their prior source hashes against the baseline. Local school-specific GAS and HTML title, dirty original sharing checkout, user browser tabs and old RARs were preserved. This final follow-up changes documentation only.
