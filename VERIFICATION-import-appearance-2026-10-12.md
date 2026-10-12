# Import and appearance delivery — 12/10/2026

## Scope verified

- Whole-week Form response-id/content comparison after verified manual reload, independent of query/page. Added, missing and changed counts; legacy/first/other-week/invalid/key-rotation baselines do not fabricate changes. No name-based identity or automatic record writes. Private fingerprints/binding do not appear in public viewer responses.
- Validated file/paste/drop ingestion, PNG/JPEG/WEBP, up to five images and 2.8 MB total. Invalid image decode leaves draft/menu/sources intact; ordinary text paste is not intercepted. Multiple source images survive account-local draft restoration; old single-image drafts remain supported.
- Authorized per-image fragment OCR, all inputs validated before provider calls, no missing-day fabrication. Source-aware duplicate/conflict review, explicit choice/edit before apply, immutable one-step Undo/Redo including initially empty drafts. Real Form creation remains behind existing week/calendar/holiday/meal checks.
- Shared Light/Dark/System and Full/Light/Off preferences, browser-local storage, legacy Full migration, reduced-motion fallback and explicit override. School primary colors retain readable ink/borders. Light feedback 0.16 s, Off immediate disclosures and visible Form labels. Dark closed-link contrast 8.53:1 and mobile-name contrast 10.56:1 in the browser fixture.

## Tests and production

- Build and 26 Node/native/API tests passed in main, release and GitHub checkouts.
- Browser import/appearance/contrast, navigation-comfort, review-scale, interaction-qol, dashboard-qol, editor-qol and admin-upgrades fixtures passed; new import scope verified at 1280/390/320px. Mobile screenshot inspected.
- Apps Script 78: saved/reloaded source matched the prepared merge, three active functions changed and one added, 127 unrelated active functions preserved. Existing deployment URL, execute-as-owner/access configuration and manifest unchanged.
- Vercel `dpl_BJ2EbPTsQLUkdj7aYYDLofinehpa`, READY, alias <https://menutaythanh.vercel.app>, asset `/assets/index-BZI2Z6Cs.js`, version `0c5d19d7-cc2c-44db-a37a-9e0b9f412b0f`.
- Readonly production owner check: 24 displayed rows, 23 Form ids/valid version tuples, valid binding, manual comparison `0 new / 0 missing / 0 changed`; source-ingest controls present and layouts checked at three widths. Public viewer HTTP 200 with email headers/private version fields absent. Restored browser view/cache/font/appearance preferences; no real record mutations, Form creation, notices or OCR calls.
- Release source and README synchronized with the clean GitHub checkout; Script Properties configuration getters preserved. RAR files not rebuilt.

## Limits

Physical Android/iOS and real provider OCR quality/latency were not tested. Provider/service mocks exercise validation, partial fragments and failure guards; real data QA is readonly. More images can consume more OCR calls/quota and time, including existing transient-error retries. Preview edits before apply are not saved; drafts/preferences remain browser-local, not separately encrypted or cross-device synchronized.
