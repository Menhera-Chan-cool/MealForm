# Operate UI: selected 1, 2, 4, 6, 7 — 15/10/2026

## Authorization and scope

User explicitly requested implementation, GitHub/main merge and production. Baseline `532ff322bb073f1b038a858cfc21e965b2283c8d`; feature branch `ui/operate-tools-2026-10-15`. Module boundaries and assumptions are recorded in CAPABILITY-MAP-operate-ui.md and its five linked specs. Production release evidence is pending below; local checks alone are not a deployment certificate.

- PC sidebar collapses to an icon rail with named keyboard/mouse hints, preserving roles, account context, sign-out and existing dirty-navigation callbacks. Mobile navigation is unchanged.
- Shared TableWorkspace offers PC column selection for viewer, submissions and audit history. Required identity/context/action columns stay; display rules affect only this workspace and exclude empty-state colspan cells. Choices survive sorting/expansion while the table signature is unchanged, reset when a view is reopened/projection changes, and never hide mobile fields. No export/source/record/count changes.
- Filter empties distinguish matching failure, explicitly empty source and unavailable data. Viewer name/day/meal, Dashboard search, audit criteria and refreshed archive months can clear one criterion without clearing others. Calendar month reset deliberately returns the all-month list.
- Notice preview reuses WeekNotice and current branding with locally scoped phone/PC and light/dark choices. Calendar dates and Vietnam end-of-day expiry are checked; invalid/expired/empty text is explained rather than shown as live. Original draft/revision/409/confirmation behavior is unchanged. “Chưa lưu” appears only when the editor is actually dirty.
- Manual field help at OCR, notice text/expiry, deadline, reconciliation and access permissions. Native top-layer popovers escape clipped ancestors, close on Escape/outside/resize/ancestor scroll, and retain their own internal scrolling. Help does not submit forms or change permissions.

## Verification before publication

- Six core browser scenarios and pure filter/notice helper boundaries failed before implementation. Additional RED/GREEN checks caught an empty Dashboard source being blamed on filters and an unchanged saved notice being mislabeled unsaved; corrected at the presenter/caller. A test's timestamp label was corrected to the existing Vietnamese display alias; a TypeScript `never[]` inferred default was fixed with a typed shared-prop contract, not a cast or dependency change.
- `meal-viewer/npm test`: build and all **29 native/UI/API/Apps Script scripts passed**. No backend/API/Apps Script/dependency/secret changes. New pure checks cover independent criteria, booleans/unknown objects, invalid and leap dates, expired notices, 500-character boundary, literal markup/newlines and Vietnam midnight.
- Actual React entrypoint browser suite: **56 passed** (44 incumbent + 12 new). HTTP services alone use complete synthetic fixtures. Includes all three table callers, optional columns hidden together, mandatory columns, same-DOM expansion, projection reset, mobile completeness, independent filter recovery, source-empty honesty, refreshed archive, dirty/saved notice preview, keyboard/touch help, current permissions and all prior exact delete/restore/OCR/cache/dirty safeguards.
- Compatibility: **11 preview browser tests** and **5 token/Chromatic-guard tests passed**. TypeScript/Vite build passed; **47-story Storybook build passed**, including actual column controls and notice draft examples. Existing non-fatal vendor module-directive/chunk warnings remain. No Figma sync or Chromatic cloud upload.
- Bounded visual pass at 360/768/1440, both themes and large text: collapsed rail, column menu, filtered empty, help and independent preview themes. Actual computed preview backgrounds and unchanged global color scheme were asserted. New notes in the existing manual “Có gì mới?” list describe the five features without auto-opening it.
- QA only: synthetic business actions in tests, no real Form/Sheet or owner setting mutation. Sidebar/column choices are transient presentation state, not new persistent or cross-device preferences. No day strip was reintroduced.

## Release status

Pending exact-source PR, staged production build, artifact smoke, pinned merge and promotion, genuine readonly main-domain checks and bounded log scan. Preserve the existing public HTML-title difference from the share template. Previous production rollback reference: `dpl_8hQWYe4QiYbAtKzGse3dBft8uEGW`, version `4e0e4677-5b44-4af0-baec-813b23504bb8`.

## Limits

Chrome responsive emulation, not physical phones or cross-browser certification. Owner UI verification uses synthetic service fixtures; real production smoke is readonly/guest and verifies protected routes without an authenticated owner's session. No new monitoring/drain configuration or rebuilt RAR.
