# Seven operating UI improvements — 2026-10-16

User selected all seven capabilities and explicitly approved GitHub/main and production. Approved boundaries/order/specs are in CAPABILITY-MAP-operating-feedback.md and SPEC-image-budget.md, SPEC-image-pan.md, SPEC-table-crosshair.md, SPEC-field-budget.md, SPEC-system-summary.md, SPEC-loaded-warnings.md and SPEC-readable-time.md.

## Delivered scope

- Image meter uses the existing decoded-base64 byte counter and the same five-image/2800000-byte validation. Remaining slots/decimal MB and a labelled native progress bar update from actual accepted/restored/removed images; rejected files leave the original selection and meter intact. Full capacity explains removal/replacement and prevents futile append selection. No upload or OCR side effect.
- Primary mouse drag pans the actual zoomed inline/fullscreen viewport. Scrollbars, native touch scrolling, minimap and keyboard navigation remain. Captures release on up/cancel/lost capture, Escape, source/zoom/fit change and fullscreen close. Source pixels, OCR and Undo untouched.
- Mouse-capable PC detail tables use semantic subtle row/day-column/intersection highlights. Name/time and generic meal projections do not become day columns; leave/resize/projection resets the guide. No persistent choice or filter/data mutation; mobile cards retain their original presentation.
- Accessible remaining-character descriptions share the unchanged UI limits: name 100, notice/reason 500. UTF-16 length matches native maxLength and existing backend limits. Near/full/overflow states are explicit. Existing restore, dirty guards, revision checks, cancel and confirmed payloads remain.
- Dashboard System keeps Apps Script authorization first, summarizes the actual loaded health statuses and offers native expandable technical details/setup guidance. Empty/loading/error/unknown results are explicit. Expansion has no request side effect; the public setup route is unchanged.
- Navigation badges show only positive loaded reconciliation or health warning/error/unknown counts, with their week and read time, never an invented live check. Scope is local memory only. Week change, stop, manual overview refresh or mutations invalidate the snapshot; late results cannot repopulate it. Roles and stable navigation names remain. A request generation also prevents an older same-week health response replacing a newer check.
- Viewer/Dashboard/Quick View submission timestamps show Vietnam Today/Yesterday and HH:mm, with full exact values on hover or keyboard/tap. Old values retain their full representation; missing/invalid/impossible dates are not guessed. Classification updates at Vietnam midnight/visibility return without service calls. Sorting/filter/raw values, audit-event timestamps and Form deadlines are unchanged.

## Verification and diagnostics

- TDD: native helper test and seven actual-entrypoint scenarios failed before implementation. A separate impossible ISO-date assertion failed before strict validation. A controlled same-week out-of-order health response reproduced an old result replacing a newer result; request-generation guard made it pass.
- All 11 focused actual-entrypoint cases passed together (21.7s), including response ordering, cross-week rejection, mutation invalidation, both input counters/cancel, rejected image preservation, real mouse scroll and Vietnam midnight.
- Native application/API/GAS tests and production build passed in both canonical local app and sharing worktree: 32 scripts each. No API, Apps Script, schema, dependencies, lockfile, auth, environment or CI change.
- Preview TypeScript/Vite build, five token/Chromatic guard tests and Storybook build passed. Shared preview/Storybook entrypoints load the new stylesheet.
- One batched 360/900/1440px light/dark/large-text review inspected tables, warning badges, System, counters, image budget and fullscreen pan/minimap. No horizontal page overflow in the selected states. No new visible browser window or cloud visual upload. Existing single-line week inputs can scroll their long contents at large text sizes; this bundle does not redesign week selection.
- Two initial test-fixture issues were corrected without changing product guards: wait for draft readiness before selecting an image, and supply a future deadline before testing the reopen confirmation. An initial concurrency test was corrected to start the held health request through user navigation rather than React development remounts. No removed assertions or retries.
- Full browser/compatibility and immutable-artifact/publication results will be appended after execution. Existing nonfatal Lucide/Storybook/terminal-color build warnings remain.

## Boundaries and rollback

Owner interactions use synthetic API/GSI/image boundaries only. Real publication smoke is GET-only, never creates/deletes/restores student records or writes branding/Form settings. Physical phones and non-Chromium engines were not tested; cloud Chromatic and old RAR rebuilding were not requested. Local school-specific GAS/title and the dirty original sharing checkout are preserved.

Previous production: PR #13, source 26d850c403fc14d56fa557d7a0b8409904ba3a50, main 4a0137c42d0ecbade67abf3cccdd7c95c3d97691, artifact dpl_6BdaSZrVyzukKgW1faaAJPgfFbXB, version 3c197e72-b588-4550-946c-2573454bbda2. Existing Apps Script v79 is not redeployed by this bundle.
