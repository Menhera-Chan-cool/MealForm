# Editing/mobile QoL — verification 2026-10-11

## Scope
Five approved modules: holiday-days, ocr-undo, existing-week-warning, mobile-toolbar, safe-error-report. Holidays apply only to newly created weeks. Existing questions/responses are not migrated or rewritten.

## Evidence
- Main, clean template and GitHub checkout full `npm test`: build and existing regression suites pass, including the new editor-qol suite.
- Native-service fixtures: full five-date identity/default Monday lock retained; holiday questions omitted; serving-day answer columns and summary/detail formulas correct; single serving day at every weekday tested; all-holiday creation refused; malformed closed flag refused; already-registered changed holiday draft returns existing links without creating or replacing files.
- Browser fixtures at 1280px and 390px: grouped Undo/Redo changes actual title/holiday values and preserves original meals; all-closed draft disables submission; current draft includes holiday flags; complete dates show existing-week links, invalid partial dates hide stale warning and Undo restores it; copy report excludes raw secret/error/user/menu/photo values; denied clipboard shows safe manual-copy text.
- Holiday viewer fixture: full Monday-Friday range retained with three serving columns and explicit closed-day notice.
- Prior admin and Dashboard QoL browser fixtures re-run: caches, safe pending actions, identity badge, fresh row links, reasons/history, Form controls, reconciliation, branding and manager guards still pass.
- Production read-only check: authenticated Dashboard; mobile sticky toolbar 163px, focused search compacted to 88px; simulated blocked read produces a safe NETWORK_ERROR report; no overflow; zero Form/Sheet mutation requests. POST/DELETE were blocked on the QA page.
- Public production routes `/dashboard`, newest viewer, next viewer and branding returned 200; anonymous Dashboard access returned 401.

## Deployment
Apps Script version 73 confirmed at 17:42 Vietnam time, same exec URL and owner/Anyone execution settings. Saved/reloaded source exactly matches normalized merge. Seven active functions changed, two helpers added, 110 other active functions preserved.

Vercel `dpl_GkppJxamX4tokCbKSq5q3ZTFiXHW` READY, aliased to https://menutaythanh.vercel.app. Production assets: index-D0rP9hZd.js, index-Bb5u1dAU.css.

GitHub main accepted feature commit `3fdfd8b`, including the clean template README documenting version 73.

## Limits
No live holiday week was created and no real weekly Form/Sheet content or response was changed for testing. Google-native service behavior is exercised through isolated service fixtures; layout/keyboard compaction uses Edge mobile viewport, not a physical phone keyboard. Undo stack is 50 in-memory changes and resets on reload/new OCR/image/account; only current draft persists. Diagnostic ids are client references, not server-log ids. Existing RAR files are not rebuilt.
