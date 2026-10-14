# MealForm UI fixes — 14/10/2026

RELEASED after the user's explicit staging approval on 14/10/2026. PR #2 is merged; the exact staged artifact now serves the main domain. Scope and verification limits remain below.

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

Source commit `dbe22e5d7b11b763ac5b28bf4de5781bf03d7f20` was pushed on `codex/fix-detail-week-picker-2026-10-14`. PR: https://github.com/Menhera-Chan-cool/MealForm/pull/2, merged at `2026-10-14T11:34:53Z` as `155b0a4fb5b8a20d24a575982946502514097fee`. Fetching `origin/main` independently confirmed this merge; only this verification document differs from the approved runtime source. The exact `anh-tun/menutaythanh` project/team, Node 24 and existing build commands were inspected before deployment. Dry run included 73 files and excluded credentials, environment files, screenshots and test tooling; all five changed production files matched the committed source by SHA256.

Staged artifact: `dpl_D1teyKEdiPBD4gcYMXdJYuJN1tEg`, READY, https://menutaythanh-6ool3knin-anh-tun.vercel.app . Built with production environment and `--skip-domain`; no OAuth/configuration change. Build version `8971178a-2d6c-48af-9d53-5ae3fce06850`, JS `/assets/index-uqc8uB9h.js`, CSS `/assets/index-aUXrVoTm.css`. Remote clean install/build succeeded with zero audit vulnerabilities; existing non-failing vendor directive/deprecation warnings remain.

Main domain https://menutaythanh.vercel.app/version.json still returned the previously approved `83c4d096-03eb-44e0-997d-f9f1dc166f7a` after staging, independently proving that the main site was not switched. Current serving/rollback artifact is `dpl_DvF1xpniLG8AUVU2jg62JrYiySQ3`.

Headed Chrome session `mealform-ui-fixes` opens staged Dashboard and mobile viewer tabs. Actual deployed assets use synthetic GET services with every write rejected. Dashboard visibly selects `Tuần 28/09/2026 - 02/10/2026` inside the input; the viewer is day-filtered to 14/10/2026. A banner explicitly labels the synthetic mode and pending main-domain release. Google SDK is intentionally aborted in this isolated review context; its single failed request is expected, not an application exception. This is not a real owner-authenticated backend certificate. PR attachment to the Codex panel was attempted but the app returned Invalid app tool request; the GitHub URL itself is valid.

Release gate completed: the user explicitly approved merge and production, then the recorded PR head was merged and `dpl_D1teyKEdiPBD4gcYMXdJYuJN1tEg` was promoted successfully without rebuilding. Fresh main-domain checks returned build version `8971178a-2d6c-48af-9d53-5ae3fce06850` and the same staged JS/CSS assets. Rollback remains the preceding serving deployment `dpl_DvF1xpniLG8AUVU2jg62JrYiySQ3`; no data rollback is in scope.

Post-promotion read-only smoke used the separate genuine `mealform-production` browser with no service mocks or review scripts. After waiting for actual loaded rows and clearing its local display filters, the real guest viewer rendered 22 records with seven full-week fields; filtering a day retained 22 records with two fields. Both dark/mobile states had one uniform card surface, transparent cell fills, regular values, no document overflow and no browser page errors. Only counts and computed styles were logged, not names or meal records. The real Dashboard login guard remained visible, and anonymous Dashboard/history APIs returned 401.

A bounded error-level Vercel log query over 15 minutes returned one Node `DEP0169` deprecation warning about `url.parse()` during `/api/viewer`; it was not an application exception or failed read. This dependency/runtime warning and all backend code remain unchanged, not marked fixed. No ongoing monitoring certificate is claimed.

Local and staged authenticated UI checks used intercepted synthetic services; the post-release guest smoke above used real read-only services. Real owner-authenticated week switching was not separately repeated on the main domain, and no paid OCR or live Forms/Sheets writes were tested. Backend/API/Apps Script/OAuth/HMAC and environment configuration are unchanged. Physical devices, animation trajectories and cloud Chromatic baselines are not certified here. The documentation subagent did not deploy; merge/promotion and the added smoke evidence were performed and recorded by the integration owner.
