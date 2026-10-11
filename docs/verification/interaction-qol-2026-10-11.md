# Dashboard interaction QoL — 11/10/2026

## Scope

Eight approved features: mobile response cards, accent-insensitive UI search, atomic Monday fill, per-account/week view restoration, searchable week selection, temporary identity-based new-row highlights, desktop density, and native read-only response details. No new packages, OAuth scopes, registry migrations, or matching/deletion identity changes.

## Verification

- RED: missing UI folding and native weekday metadata failed their tests before implementation. Browser fixture initially lacked response cards. Cached quick-view refresh also failed before the fresh-record binding was added.
- GREEN: `npm test` completed successfully in the main workspace, clean release template and GitHub checkout. Covers previous session, permissions, OCR, holiday, lifecycle, reconciliation, delete/restore and navigation contracts.
- Edge fixtures at 1280px and 390px: real holiday day/meal pairs, complete cards without page/meal clipping, explicit selection without API reads while typing, readonly dialog/Escape/focus return, five-day fill as one Undo preserving holidays, initial rows unhighlighted, manual reload marks only new IDs and clears after eight seconds.
- Per-week query/sort/density and reload restoration passed. Desktop list returned to scrollTop 240; mobile window returned to scrollY 1711. Removing the saved anchor from the mocked response then reloading retained a nearby position. These are controlled Edge viewport checks, not physical iOS/Android device tests.
- Existing dashboard fixtures passed: delayed authorization/overview and display cache, no deletion tokens persisted, failure leaves actions disabled, current Sheet row/gid, reasons and readable audit, new-ID badge, logout clears snapshots and preferences. Cached quick-view meals update from the fresh response instead of retaining a verified-looking old snapshot.
- Editor and admin regression browser fixtures passed: grouped Undo, holiday payload, duplicate warnings, safe error copy/fallback, sticky keyboard compaction, Form controls, view-only reconciliation, branding, row pending/error and owner-only guards.

## Deployment evidence

- Live Apps Script source backed up; replaced only active `getMealDashboardWeek_`, preserved 118 other active functions. Reloaded editor source matched prepared content. Manifest, execution owner, access and deployment URL unchanged.
- Same Apps Script deployment updated successfully to version 74 at 21:03 Vietnam time, 11/10/2026. Backend adds actual serving-column day labels and registered closed-day display metadata only.
- Vercel production `dpl_9BbcvJ4tx7yNj9WURmnLG61jccuc` reached READY, aliased to `https://menutaythanh.vercel.app`.
- Authenticated read-only production browser smoke confirmed five real day labels match response cards, mobile grid layout with no page/meal overflow, readonly dialog and focus return. Active asset `/assets/index-BMRc6EY1.js`; zero Dashboard mutation requests. Original browser display cache/preferences restored after checking; existing owner tabs left open.

## Limits

Preferences and display snapshots expire after 24 hours and remain in this browser/origin, not cross-device; they are not separately encrypted. Shared devices should log out. Search folding never feeds Form–Sheet identity or deletion. Old snapshots without day labels display an explicit unknown label instead of guessing weekdays. No real response was created/deleted/restored, no existing weekly Form content was edited, and no paid OCR was invoked during QA. Old RAR files are not rebuilt by a repository update.
