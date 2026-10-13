# Centered branded upload card — 13/10/2026

## Scope

Replaced the visible native file row with a large centered upload button, round brand-colored SVG icon, browse hint and limits. Vietnamese copy retained for this UI. File input remains hidden and labeled; a genuine button opens the same multiple picker with mouse/keyboard. Replacement explicitly resets append intent. Add-image action appears once there are existing sources; thumbnails/removal remain outside the primary button. Paste/drop validation, account-local drafts, limits and manual OCR behavior unchanged.

Existing primary/foreground/ink/muted theme tokens provide dark/light colors; no fixed cyan accent, image assets, dependency or backend change.

## Tests and deployment

Browser test failed before the UI change on missing upload-card action. A subsequent contrast test caught red browse text at 3.44:1; browse text now uses the contrasting brand-derived ink instead of raw primary. Headed Edge checks pass for hidden native input, multiple picker, empty-picker cancellation preserving selected images, centered icon and layout at 1280/390/320px, blue/red/white primary changes, and final-source removal confirmation. Light/dark card screenshots inspected.

Existing import/appearance browser fixture passed at all three widths, covering paste/drop, invalid-image preservation, multi-image conflict review, Undo/Redo and draft restoration. Build and all 26 Node/native/API scripts passed in main, release and clean GitHub sources.

Vercel dpl_7uarNkV1ZoixaYZCVAmb9qHotsDJ READY at https://menutaythanh.vercel.app; asset /assets/index-C9zP6YLS.js; version d02f3489-b81a-47b4-afa7-6d064375a224.

Deployed Edge UI smoke used isolated session/overview service fixtures with actual deployed UI and actual public branding #357185; icon rgb(53,113,133), multiple picker and centered card verified at all widths. Only cancelled picker opened, no files uploaded or real OCR/data mutation. Temporary appearance restored. No real brand settings, roles, sessions, Forms or Sheets changed; Apps Script not redeployed.

Selected frontend source, browser regression and README synchronized to release/GitHub. Unrelated dirty release changes and template configuration getters preserved; RAR archives not rebuilt.

## Limits

Physical Android/iOS and real OCR provider quality/latency not tested. Production administrator state is service-fixtured UI QA, not a real authorized-account/OCR integration run.
