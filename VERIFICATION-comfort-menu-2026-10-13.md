# Ellipsis display menu — 13/10/2026

## Scope

Existing quick commands, Normal/Large font, Light/Dark/System and Full/Light/Off motion grouped under one 44px horizontal-ellipsis button in the shared ComfortProvider. Native auto popover handles light dismiss and Esc, stays above page content without reflow; bounded position and internal scroll keep it within the viewport. Resize/window scroll closes it. No new package, storage format, backend service, role or permission.

Keyboard supports Enter/Space toggle, ArrowDown entry, Up/Down/Home/End between buttons/controls, native select keys and Tab. Quick command activation closes settings before opening the existing modal; focus returns to the visible ellipsis instead of a hidden menu item. Ctrl/Command K and blocked mutation/modal guards preserved.

Native behavior reference: https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using

## Verification

Browser regression failed first on the missing ellipsis control, and separately on missing arrow navigation. Passed after implementation on Chrome and headed Microsoft Edge across /newest, /next, /history, /dashboard and /setup, at 1280/390/320px plus a short 390x300 viewport. Verified toggle/outside/Esc, focus restoration, no overlay stacking, no large-text horizontal overflow, preference restoration after reload. Light/mobile and dark menu screenshots inspected.

Existing navigation/draft guards, import/appearance, dark surface/palette/status browser fixtures adapted to open the new menu and passed. Build and all 26 Node/native/API scripts passed with final source in main, release and clean GitHub. Final source also built on Vercel.

Final production READY: dpl_FMasojAGsLogBrirNfuFu8QCnC4C, https://menutaythanh.vercel.app. Asset /assets/index-DP0helLs.js; version 94731e7a-790a-45a4-a7d8-ddad9404e52a. Readonly deployed /setup smoke passed on headed Edge at all three widths, testing open/close, dark/motion selection, shortcuts and bounds; temporary preferences restored.

The final Edge production check caught a classic-scrollbar boundary case: at 320px the visible layout width was 305px, and the old right-offset calculation placed the menu at x=-6. Positioning now uses clientWidth and the panel is capped by the fixed containing block width, rather than 100vw. Added scrollbar-gutter regression coverage and verified the originally failing deployed Edge path passes after the second frontend deployment. Final build/all 26 tests repeated successfully in all three sources.

Selected frontend and browser fixtures synchronized to release/GitHub with README. Backend template getters/private configuration and unrelated dirty release changes preserved. No actual brand settings, sessions, student records, Forms, Sheets or OCR calls changed. RAR archives not rebuilt.

## Limits

Physical Android/iOS and older browsers without the native Popover API not tested. This reproduces the requested compact Edge-style opening/dismissal behavior for these four existing controls, not every unrelated Edge menu feature.
