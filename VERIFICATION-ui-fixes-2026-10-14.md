# MealForm UI fixes — 14/10/2026

Source verification and a staged production-environment deployment support the two requested fixes. PR #2 is open; merge and promotion still require the user's visual approval under `SPEC-production-ui.md`.

## Scope and source evidence

- Mobile viewer detail cards now use one card surface, transparent cells and regular body values across full-week, day and meal filters. Removing positional first-two-column emphasis prevents the remaining columns from acquiring unrelated styling after filtering. Existing response fields, sorting and filter callbacks remain in their existing controllers.
- The shared Dashboard week picker shows the committed week inside each of its five search inputs. Opening starts a separate search query; selection commits through the original callback, and Escape restores the committed display. The extra selected-week line is removed. The production picker width accommodates the full date range on desktop and mobile.
- Checked source: `meal-viewer/src/mobile-cards.css`, `appearance.css`, `production-ui.css`, `DashboardWeekPicker.jsx` and `FilterControls.jsx`; checked regressions in `mealform-preview/tests/ui/production-ui.spec.ts`.

## Incumbent design comparison

Checked `PRODUCT.md`, `meal-viewer/DESIGN.md` and `meal-viewer/.impeccable/design.json`. This is an extension of their existing Operate interface, with no new visual system or tokens:

- Palette remains bound to runtime `--meal-ui-*` branding and semantic light/dark surfaces.
- Noto Sans and the recorded heading, body and label hierarchy remain applicable; mobile detail values use regular `1rem` body type.
- Flat bordered cards retain the existing 14px corners; fields retain the established control treatment.
- The Runtime Branding Rule and Flat Content Rule still describe the implementation.
- Existing system files were preserved byte-for-byte during this documentation pass; no sidecar refresh or drift cleanup was performed.

Inspected the current `detail-day-light.png` and `week-picker-mobile-dark.png` captures under `mealform-preview/review/production/`; the companion day/week theme captures and desktop picker capture are retained there. The independent finish reviewer reported **SHIP**, with no material fixes and a recommendation to keep the incumbent world.

## Verification reported by the integration owner

- Original card and picker defects, followed by desktop date-range clipping, were observed failing before their respective fixes.
- Final `npm test` in `meal-viewer`, including the clean Git clone after the width declarations: build and all 27 scripts passed.
- Final production-entrypoint browser suite: 8 tests passed in 28.8 seconds. Coverage includes transparent mobile cells, equal card surfaces, regular readable values, day/meal filters, sorting, 360/390px overflow checks, both themes, all five week searches, selection/cancel behavior and date-range fit.
- Existing preview browser suite: 11 tests passed. Storybook build and preview token/Chromatic guard checks passed.
- One detector run reported existing triangle, easing and height-transition warnings plus earlier ramp/radius advisory drift; no newly introduced findings were reported. These were not canonized or repaired in this scoped fix.

These test executions were reported by the integration owner; this documentation pass inspected their source assertions and existing captures without rerunning suites or changing the browser.

## Release status and limits

Source commit `dbe22e5d7b11b763ac5b28bf4de5781bf03d7f20` is pushed on `codex/fix-detail-week-picker-2026-10-14`. PR: https://github.com/Menhera-Chan-cool/MealForm/pull/2 (open, not merged). The exact `anh-tun/menutaythanh` project/team, Node 24 and existing build commands were inspected before deployment. Dry run included 73 files and excluded credentials, environment files, screenshots and test tooling; all five changed production files matched the committed source by SHA256.

Staged artifact: `dpl_D1teyKEdiPBD4gcYMXdJYuJN1tEg`, READY, https://menutaythanh-6ool3knin-anh-tun.vercel.app . Built with production environment and `--skip-domain`; no OAuth/configuration change. Build version `8971178a-2d6c-48af-9d53-5ae3fce06850`, JS `/assets/index-uqc8uB9h.js`, CSS `/assets/index-aUXrVoTm.css`. Remote clean install/build succeeded with zero audit vulnerabilities; existing non-failing vendor directive/deprecation warnings remain.

Main domain https://menutaythanh.vercel.app/version.json still returned the previously approved `83c4d096-03eb-44e0-997d-f9f1dc166f7a` after staging, independently proving that the main site was not switched. Current serving/rollback artifact is `dpl_DvF1xpniLG8AUVU2jg62JrYiySQ3`.

Headed Chrome session `mealform-ui-fixes` opens staged Dashboard and mobile viewer tabs. Actual deployed assets use synthetic GET services with every write rejected. Dashboard visibly selects `Tuần 28/09/2026 - 02/10/2026` inside the input; the viewer is day-filtered to 14/10/2026. A banner explicitly labels the synthetic mode and pending main-domain release. Google SDK is intentionally aborted in this isolated review context; its single failed request is expected, not an application exception. This is not a real owner-authenticated backend certificate. PR attachment to the Codex panel was attempted but the app returned Invalid app tool request; the GitHub URL itself is valid.

Pending: obtain the user's visual approval, then merge/promote this exact approved artifact and perform the required live read-only smoke check. Source verification and reviewer SHIP do not substitute for this release gate.

Browser checks used intercepted synthetic services. No paid OCR, live Forms/Sheets writes, backend/API/Apps Script/OAuth/HMAC changes or production promotion were performed by this documentation pass. Live staging behavior, animation trajectories and cloud Chromatic baselines are not certified here.
