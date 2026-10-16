# OCR navigation — selected 4, 6, 8; 2026-10-16

User selected all three capabilities and explicitly approved main/production. Approved scope: CAPABILITY-MAP-ocr-navigation.md and SPEC-ocr-image-order.md, SPEC-loaded-attention.md, SPEC-ocr-find.md.

## Behavior and safeguards

- Accepted image sources have indexed drag handles and Up/Down buttons. Immutable moves use exact positions, not filenames/URLs; duplicates preserve identity. Reordering retains the active preview, filename and byte budget, persists through existing draft storage, and the next explicit multi-image OCR request uses the visible order. No source pixels or service call are changed by a move. Foreign/cancelled/stale drags and boundary moves do nothing. Ordering is blocked while busy/loading or while menu/Undo/merge/region results are retained, so OCR source indexes cannot silently drift; choosing a replacement image set resets the draft as before.
- Overview reuses the existing current-week System/reconciliation warning snapshots, count, read time and revision/role invalidation. It lists groups and links to the existing exact week/section without adding requests. Not-yet-checked and no issues in loaded results are distinct, and neither claims verified overall health or current freshness. Owner-only System links stay owner-only; extra response identities are not exposed in the summary.
- OCR find matches current title/date/serving-meal values using the existing accent folding. Results use exact rendered field IDs, retain duplicates, skip non-rendered closed-day meal fields and update after edits/Undo. Existing reviewed-day navigation reopens the correct field. Typing does not steal focus; Enter/Shift+Enter navigate instead of submitting creation. Clear/new source/reset affect search state only; no replacement, OCR or creation side effect. Search state is not persisted. Existing validation coloring, missing-meal flags, Undo, source provenance and role/confirmation guards remain.

## Verification and diagnostics

- Native helper test and actual-entrypoint ordering/Overview/find cases failed before implementation. The initial retained-OCR scenario was completed with actual append and disabled-order assertions, then failed on missing controls before implementation.
- Eight focused actual-entrypoint cases passed together (16.0s): native drag plus button ordering, active preview/budget/draft restoration and explicit submitted order; retained-result guards; foreign/cancelled drags and mobile boundaries; loaded-only Overview navigation/week invalidation and clean/unknown/role states; reviewed-field find, accent matching, live edit/Undo, clearing/no-match/no-submit and source reset.
- One test synchronization issue was fixed: wait until accepted images render before capturing their source URLs, instead of reading an empty in-progress list. No weakened assertion or retry.
- `npm test` in both canonical and sharing apps passed: production build and 33 native/UI/API/GAS scripts each. TypeScript/Vite, five token/Chromatic guards and Storybook build passed. No API/GAS/dependency/lockfile/auth/environment/CI changes.
- Batched 360/900/1440px light/dark, large-text review covered loaded attention, image controls, find/navigation and matched fields. One compact drag-handle adjustment is confirmed by the final suite. Real drag/drop, Up/Down and Enter navigation work; no horizontal page overflow in selected states. No cloud Chromatic upload, physical phone or non-Chromium engine testing.
- Complete regression, compatibility and actual deployed-asset/publication evidence is appended after execution. Existing nonfatal bundle-size, Lucide, Storybook timing and terminal-color warnings remain.

## Publication boundaries and rollback

All owner interactions during QA use synthetic service/image boundaries. OCR posts in tests follow explicit test-button clicks and go to mocks only. Genuine production smoke uses GETs only; no real student/source/Form/Sheet or settings mutation. No new visible browser windows, Google scopes or Apps Script redeployment. Canonical school-specific GAS/title, unrelated dirty checkout and existing RARs are preserved.

Rollback: PR #14 source 08728ae287f267108e75a16c53a30ba82f62625c, main 9831cc73fc295833ebc2939bda862d2b41dfa2d7; artifact dpl_E2wXb68gLFEgv7o5HGJz5WwTj7k5, version 54204858-6d73-4a8b-bd9a-f875634e5e7c. Existing Apps Script remains v79.
