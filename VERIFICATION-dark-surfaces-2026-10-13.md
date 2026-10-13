# Dark empty states and contrast — 13/10/2026

## Scope and evidence

Checked empty current/next week and archive, guest/access panels, all nine Dashboard tabs, setup, and six dialog styles (real command dialog plus isolated native-dialog CSS fixtures for confirm/quick response/image/region/merge). The previous palette patch already themed the shared empty/login panel; added explicit text inheritance and regression coverage for the screenshot branch and related states.

The regression initially reported bright missing-meal confirmation/unknown Form status, image-preview text contrast 2.18:1, version-error text 1.91:1 and update-available button 1.06:1. A separate active-placeholder test on white primary failed at 1.35:1. Shared dark CSS now uses existing neutral palette tokens and dark warning/error colors, fixes the bright !important reload style and selects contrast-aware active placeholder text. Light CSS, branding settings and animations unchanged.

After the fix, browser contrast/surface checks pass across five routes, nine Dashboard tabs, eight rare states, six dialog styles, five primary colors and 1280/390/320px. API fixtures preserve the real UI; rare state markup and modal surfaces are isolated CSS fixtures, not provider/integration end-to-end tests. Existing brand palette, appearance/status and import/merge tests also pass. Build and all 26 Node/native/API scripts passed in main, release and clean GitHub sources.

## Deployment and read-only smoke

Vercel dpl_4tV3Bfr7uZ7kktfHEcxjj3g6791q is READY, https://menutaythanh.vercel.app. Asset /assets/index-BOZifCHN.js; version 3b9eab60-976f-4110-b96e-36e9f0e01e27.

Live guest empty /next, archive/dashboard login and setup panels are dark, using saved primary #357185. Deployed reload button is rgb(44,62,68) with text rgb(225,234,237); warning confirmation rgb(68,57,27) / rgb(255,228,160). Saved appearance preferences restored. No brand configuration, account access, Forms, Sheets, student records or OCR calls changed. Backend not redeployed.

Selected styles, browser regression and README synchronized to release/GitHub. Unrelated dirty release changes preserved, no secrets copied, RAR archives not rebuilt.

## Limits

No physical Android/iOS checks. Authenticated dashboard and rare/error/OCR/modal states use read-only service or CSS fixtures, not real data mutation. Native-width production page loads used for mobile checks because Google's guest sign-in iframe measures its width when mounted.
