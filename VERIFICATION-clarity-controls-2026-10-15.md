# Clarity controls: selected 4, 5, 8, 9, 10 — 15/10/2026

## Authorization and scope

User authorized implementation, GitHub/main merge and production. Baseline `88e2e73dfae25a93df9e3cf21f1b68d509c8e2e1`; branch `ui/clarity-controls-2026-10-15`. CAPABILITY-MAP-clarity-controls.md links the five scoped specs. Publication is pending the gates below; do not interpret this preparation record as a deployed release.

- Reuse the existing protected confirmation for before/after changes to Form controls/deadline, branding and weekly notices. Confirm sends the captured original payload/revision and existing Form reason. Cancel sends nothing and keeps the edited draft. Discard/unload/restore confirmations and 409 safeguards remain.
- PC table sizing in the shared workspace and all three real table headers: viewer, submissions and audit. Pointer capture, keyboard Left/Right/Home/End, Escape/pointer-cancel rollback, reset and same-DOM expansion. One resize freezes the other widths; hidden columns and mobile complete content remain. Width choices are temporary, scoped to the table signature, and do not write Sheet settings or data. Bounds start at 144px for edits; the upper bound is at least 720px or the initial natural width, preserving existing wide columns.
- Manual Phím tắt reference inside the existing display menu. Describes supported contexts only, retains Ctrl/Command K and OCR Undo/Redo, and adds no global destructive shortcut.
- Isolated monotonic client elapsed counter for actual pending reads and business actions; resets with the operation/phase, cleans timers and does not announce every second to screen readers. It is not an ETA, percent or server progress. Stop waiting still aborts browser reads only; mutations are not cancelled.
- Invalid/unknown link guidance matches existing API syntax, including legacy short valid IDs. Actual missing/forbidden/network/archive-only states follow HTTP status or explicit existing server messages. 401 still requires login, valid current/next 404 remains the normal empty-week state, and transient refresh failures retain loaded rows. Explicit access refusal or missing-week response clears stale view data.

## Verification before publication

- Eight new core browser scenarios and pure classification/change helper assertions failed before implementation. Real geometry caught initial column clamping that jumped narrow columns; fixed by measuring natural widths first. Default-layout restoration is checked as auto layout plus bounded subpixel/font rounding, not falsely equated with a stored pixel width.
- Additional coverage: three table callers, keyboard bounds, Escape during expanded drag, projection reset, hidden columns, complete mobile values, readonly cache retention vs forbidden clearing, mobile large-text confirmation footer and manual reference in both themes. Original dirty-save failure/retry and notice 409 cases now use the new Save review while native discard/restore guards stay intact.
- One parallel local test invocation reused another invocation's web server and lost it when that owner exited; source hot reload during another early run also remounted the table. Final actual-entrypoint runs were serialized with source fixed. Two test fixtures/selectors were corrected (archive detail returns viewer data, error banner uses its existing class), not hidden by runtime changes. No production request or business write was involved. Synthetic branding/notice acknowledgments now mirror existing response contracts.
- **67 actual-entrypoint browser tests passed** (56 incumbent + 11 new). Production app build and all **29 native/UI/API/Apps Script scripts passed**, both canonical and clean clone. TypeScript/Vite preview, **11 compatibility browser tests**, **5 token/Chromatic-guard tests**, and **49-story Storybook build** passed. No release claim yet.
- Bounded visual batch uses PC/mobile, light/dark and large text. New 360px confirmation and shortcut reference images were inspected; footer remains visible and content scrolls inside its own surface. Incumbent visual matrices and motion/permissions/cache/delete/restore coverage remain.
- Final host-config inspection caught a dev-only unknown-path result: Vercel has explicit page rewrites, not a catch-all. Added a small post-build hook emitting `404.html` from the exact already-built index, using the [official Vercel convention](https://vercel.com/kb/guide/custom-404-page). Its build assertion failed first with missing output, then the full 29-script build/test passed. No routing/HTTP status/API or CI configuration is changed; immutable artifact and live checks must prove unknown paths return HTTP 404 and render recovery UI.

## Release gate

Pending: exact-head PR, upload blob comparison, staged production-environment artifact smoke with synthetic services, merge, same-artifact promotion, genuine readonly production smoke and release documentation. Existing target was reverified: `anh-tun/menutaythanh`, `prj_J0aPrnCB79cyxClYyfCpb02nqSES`, `team_alPCXVFOOevXpZxlqFldUisB`, root `.`, Node 24/Vite, npm ci/npm run build/dist. No relink or secret inspection.

## Limits

Chrome responsive emulation, not physical-device or cross-browser certification. Business actions are tested against synthetic services only; live production verification is readonly. No backend, API contract, Apps Script, permission, env, secret, dependency or CI change. No paid Chromatic cloud upload or rebuilt RAR.
