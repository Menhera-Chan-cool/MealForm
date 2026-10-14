# Dashboard System and control refinements — 14 October 2026

## Status and authority

This is an ordinary extension of the approved MealForm frontend. It records source checks and the integration owner's verification evidence; it is not a production release or Google sign-in certificate. The current authorization at the top of `PRODUCT.md` permits frontend implementation, feature-branch/PR updates and a Vercel staging build without assigning domains. User approval of the final staging appearance is required before merge or promotion. Earlier preview-only paragraphs in that file describe the historical design phase.

At this documentation handoff, the final mobile week-picker correction has received a `SHIP` re-review and is committed and pushed in `168a048a6d30936936c9e42512a8c58c819ad460`. The integration owner reports that the build, all 27 native/API test scripts, Storybook build and all 13 production-entrypoint browser tests passed again after that correction. The replacement staging deployment was still building at this snapshot; readiness, deployed version and user approval remain to be confirmed in the release ledger.

## Implemented scope

| Area | Source behavior checked |
| --- | --- |
| Dashboard chrome | `BrandingProvider.jsx` suppresses the separate top school-brand block only on `/dashboard` and `/dashboard/`. The Dashboard header retains its title, description and display preferences without duplicate header links, authorization or logout actions. `DashboardLayout.jsx` retains desktop sidebar logout and mobile More/account logout. |
| Owner System | The owner-only `health` panel starts with Apps Script authorization, followed by health checks and the shared seven-step installation instructions. `SetupInstructions` is reused from `SetupChecklist.jsx`; direct `/setup` bootstrapping remains available. |
| Missing Apps Script scopes | `isAppsScriptPermissionError` recognizes explicit Apps Script permission/scope messages. Dashboard alerts identify missing Apps Script permission; owners receive the existing authorization action and other roles receive contact-owner guidance. Generic rejection, Dashboard access denial, document access denial, network error and expired session are excluded by the native helper test. Existing authorization popup/fallback behavior remains in use. |
| Mobile viewer controls | The filter counter stays on one line and aligns with name search. The three week navigation links stretch evenly. Registration and status controls share a minimum height; at widths of 400px or below they stack in one column. An open registration action uses the runtime school accent and its contrast-selected foreground. |
| Mobile submissions and history | Ordinary response and audit cards use the panel surface, with transparent cells; the sticky toolbar uses the same surface. The response selector excludes `.new-response`, preserving the existing new-response highlight. |
| Committed week visibility | At mobile widths the submissions toolbar gives the week picker a complete first row, with search and reload in the second row. The browser test measures the selected date text against the input's usable width in both themes at 390px. |
| Google sign-in rendering | `App.jsx` uses the genuine SDK's `outline` / `outline_dark` themes, observes the container width and caps the requested button width at 400px. It initializes once for the encountered SDK client and keeps a ref to the current session check. The credential callback still posts the credential to `/api/session` and then checks the session. |

The inspected implementation files were `meal-viewer/src/{Dashboard.jsx,DashboardLayout.jsx,BrandingProvider.jsx,SetupChecklist.jsx,FilterControls.jsx,MealFormLink.jsx,App.jsx,dashboard-model.mjs,production-ui.css}`. Test inspection covered `meal-viewer/production-ui.test.mjs`, `mealform-preview/tests/ui/production-ui.spec.ts` and its production Playwright configuration. The production browser suite uses synthetic service records and a public synthetic Client ID; it does not perform live Form/Sheet writes.

## Incumbent design system

`meal-viewer/DESIGN.md` and `meal-viewer/.impeccable/design.json` remain the existing system records. No new visual world, palette, typography, tokens or component system was introduced. The sidecar is inside `meal-viewer`; no root `.impeccable/design.json` existed during this check.

- Palette: school Settings supply the `--meal-ui-*` light/dark semantic roles and contrast-selected action foreground.
- Type: existing self-hosted Noto Sans, with 1.75rem page headings, 1.25rem section headings, 1rem body/record text and .875rem labels; existing mobile and comfort scaling remain authoritative.
- Layout: the existing 232px desktop sidebar and mobile bottom navigation remain; task-specific controls wrap within the established responsive layout.
- Shape and depth: existing 8px control and 14px card corners; ordinary cards remain flat and bordered.
- Named rules: the Runtime Branding Rule and Flat Content Rule continue to govern these refinements.

The single detector pass reported five advisory size uses, largely existing 1.125rem, 1.625rem and .75rem values and small date text. It reported no primary finding. Those advisory values were not promoted into new tokens or repaired as unrelated drift; the design records were not refreshed.

SHA-256 at the documentation check:

```text
meal-viewer/DESIGN.md
C634DDE25896AB359AB609E7C16653D9AF05EBC53D48A203497FD29249CEC351
meal-viewer/.impeccable/design.json
FC6C913A81E702C7DF4219BCE4C6E763F1EE87EB4C846C285864771272B2D21B
```

## Verification evidence and limits

The following execution results were supplied by the integration owner; this documentation pass inspected source and evidence-file availability and did not rerun tests or open a browser.

| Check | Reported result and revision boundary |
| --- | --- |
| TDD | The permission helper, the two control bugs, Google-theme behavior and card colors were exercised as failing tests before passing. The final selected-week clipping regression was added and failed in both themes before the three CSS declarations fixed it. |
| Native/API and production build | `meal-viewer`'s `npm test` builds tokens/Vite and runs 27 native/API scripts. All passed in a clean integration clone before the final CSS correction, and the integration owner reports the full rerun passed after it. |
| Production-entrypoint browser suite | All 13 tests passed again in 32.7s after the final CSS correction, according to the integration owner. This includes the real frontend with synthetic service interception, desktop/mobile role boundaries, the nine panels, current/next/history states, controls, missing-scope feedback and SDK configuration/resize assertions. |
| Existing preview browser suite | 11 tests passed in 22s before the final CSS correction. |
| Token/Chromatic guards | Five local checks passed before the final CSS correction. This does not claim a Chromatic cloud run or baseline. |
| Storybook | Build passed before the final CSS correction and passed again afterward according to the integration owner. |
| Independent visual review | Initial disposition `FIX`: at 390px the committed week was clipped. After a text-measurement regression test and the three CSS declarations, the same reviewer returned `SHIP`, finding resolved with no visible regression in the scored fix scope. This is scoped reviewer evidence, not user staging approval. |

Evidence exists under `mealform-preview/review/production/`, including:

- `dashboard-{1440,390}-{light,dark}.png` for Dashboard chrome and navigation.
- `panel-Hệ-thống-{light,dark}.png` for owner authorization, checks and shared installation instructions.
- `controls-mobile-dark.png` at 360px for the mobile filter, navigation and Form controls.
- `submissions-audit-mobile-{light,dark}.png` at 390px for consistent card surfaces and the full selected week after the correction.
- `gsi-mobile-{light,dark}.png` for genuine Google SDK rendering.

The Google SDK captures were made separately with staged actual code and the real SDK, without a mocked SDK or an authentication click. Reported dark DOM colors were background `rgb(19, 19, 20)` and text `rgb(227, 227, 227)`; light mode used a white background. The visible SDK DOM button measured 288×40px inside a 44px host. A 1440-to-390px resize produced no document overflow. The 44px host does not establish a 44px visible Google button.

The Google Identity Services [JavaScript reference](https://developers.google.com/identity/gsi/web/reference/js-reference) was checked by the integration owner for `outline_dark`, the 400px maximum width and initialization-once guidance. The generated staging hostname returned the expected Google origin 403 because authorized origins were not changed. This evidence verifies rendering and resize behavior; successful Google sign-in, consent and live session establishment were not tested end to end.

## Release ledger

| Field | Snapshot at documentation handoff |
| --- | --- |
| Feature branch | `codex/dashboard-system-controls-2026-10-14` |
| PR | [MealForm PR #3](https://github.com/Menhera-Chan-cool/MealForm/pull/3), reported OPEN |
| Source before final clipping fix | `b57bfa25baa593ab83f0a7d6502e832c837b9d02` |
| Superseded first staging build | `dpl_J1EUfAtPNRYfobUP6FRWGhQGH7qQ`, reported READY; superseded by the final review correction and not a final approval target |
| Superseded staging URL | `https://menutaythanh-l4zeiwns4-anh-tun.vercel.app` |
| Final browser rerun | Integration owner reports 13/13 passed in 32.7s after the final correction |
| Final source commit | `168a048a6d30936936c9e42512a8c58c819ad460`, reported committed and pushed |
| Staging source identity | Integration owner reports SHA-256 matches for all nine changed production files against a clean Git checkout before staging |
| Replacement staging candidate | [menutaythanh-kwyf43mxu-anh-tun.vercel.app](https://menutaythanh-kwyf43mxu-anh-tun.vercel.app); build in progress at this snapshot, no READY or deployed-version confirmation |
| User visual approval | Pending |
| Merge and production promotion | Pending; no claim of release |
| Current production reference | Version `8971178a-2d6c-48af-9d53-5ae3fce06850`, deployment `dpl_D1teyKEdiPBD4gcYMXdJYuJN1tEg`, as supplied by the integration owner |
| PR attachment | Attempt reported unsuccessful: `Invalid app request`; PR creation and app attachment are separate states |

### Confirmed final staging handoff

The integration owner subsequently confirmed replacement deployment `dpl_GLsSK4iasorZGHGpSxq51RPULnzh` READY at https://menutaythanh-kwyf43mxu-anh-tun.vercel.app . It is built from runtime source `168a048a6d30936936c9e42512a8c58c819ad460` in the existing production environment with `--skip-domain`. Public `/version.json` returns `aefaf0b6-92d2-430d-9a43-559b2b67410c`; built assets are `/assets/index-BdF_gM4q.js` and `/assets/index-Bsrs2x_U.css`. Remote `npm ci`/build succeeded with zero audit vulnerabilities; existing vendor directive/deprecation warnings remain non-failing. No dependencies or configuration were changed.

Fresh main-domain `/version.json` still returned `8971178a-2d6c-48af-9d53-5ae3fce06850`, confirming the main user-facing domain was not promoted. This previous serving deployment `dpl_D1teyKEdiPBD4gcYMXdJYuJN1tEg` is the concrete rollback reference after any approved promotion. The generic project alias reported by CLI is not evidence of a main-domain switch.

Headed Chrome session `mealform-system-staging` opens three actual staged surfaces: owner System on PC, the filtered viewer on mobile with next registration/Form status, and mobile submissions/audit. Synthetic GET service responses are explicitly labeled by a banner, and all write requests are rejected in that browser context. The Dashboard has no top brand block. Real staged `/api/session` returned `authenticated:false` in a separate read-only HTTP check. An error-level Vercel query over 15 minutes returned no entries; this is a bounded observation, not ongoing monitoring. The review browser deliberately aborts the Google SDK request; genuine Google SDK appearance was checked separately as documented above.

PR #3 remains open. User visual approval and merge/promotion are still pending; neither reviewer SHIP nor the synthetic owner review grants that approval. After approval, promote this exact final artifact, not the superseded first stage, then append the main-domain read-only smoke result. The app PR attachment tool returned `Invalid app tool request`; the GitHub PR itself exists and is the review reference.

## Scope exclusions

No live Form/Sheet changes, paid OCR calls, secret changes, OAuth-origin changes, backend/API/Apps Script changes, deployment configuration changes or dependency changes are part of this refinement. No successful login, cloud Chromatic baseline, new Figma parity check or production promotion is certified by this document.
