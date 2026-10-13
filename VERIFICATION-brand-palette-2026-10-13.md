# Brand-derived dark palette — 13/10/2026

## Fix and regression evidence

The brand provider updated buttons/headings, while shared dark CSS hardcoded green canvas, panels, fields and lines. Added primary-derived neutral dark tokens in the existing helper; apply them for custom and default dark branding and remove the actual applied keys when the scheme changes. Default light presentation and semantic warning/error/Form colors remain unchanged.

The helper regression failed before implementation (missing dark canvas), and the real-browser regression failed on unchanged blue canvas and separately on the remaining green input focus. Both pass after the fix. No extra dependency, service, permission or backend change.

Build and all 26 Node/native/API test scripts passed in the main, release and clean GitHub sources. Color/hue and text >=4.5:1, control-line >=3:1 checks cover green, blue, red, white, black and yellow primaries. Browser tests cover green/blue/red updates while dark, focus/dropdown, default branding, stale-token cleanup, System changes, Dashboard/history/setup and 1280/390/320px layouts. Existing import/appearance/navigation fixtures passed, including closed-Form contrast 8.53:1 and mobile response-name contrast 12.18:1.

## Production and sharing

Frontend deployment dpl_AczzyeTXRo8FWTEWUVEsbwmz3SN9 is READY at https://menutaythanh.vercel.app. Asset /assets/index-HdipYFsT.js; version c686429e-8b70-40d7-be40-4efbe91c3478.

Readonly deployed smoke uses the actual saved primary #357185: dark canvas rgb(13,21,23), main rgb(27,36,39), controls derive from the primary and setup panels follow its hue. Verified fresh page loads at 1280/390/320px and restored temporary appearance preferences. No production brand settings, student records, Forms, Sheets or OCR calls were changed. Apps Script was not redeployed.

Selected frontend source, regression fixture and README synchronized to the clean GitHub source and release folder. Backend template configuration getters and unrelated release edits preserved; RAR archives not rebuilt.

## Limits

Physical Android/iOS not tested. Live smoke was guest/read-only; authenticated dashboard styling was checked with API service fixtures and real UI. Google's pre-existing guest sign-in iframe retains its mounted desktop width when resizing a loaded PC page; production mobile checks used fresh loads at each native viewport.
