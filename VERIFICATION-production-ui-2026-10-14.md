# Production UI verification — 2026-10-14

Status: RELEASED. The user approved staging on 14 October 2026; GitHub PR #1 is merged and the exact approved artifact is serving the main production domain. Post-promotion read-only checks passed within the limits recorded below.

## Implemented scope

Both approved preview surfaces have been ported into the real React/Vite frontend: nine Dashboard sections and the current/next/archive/selected-week viewer. Existing controllers retain their callback arguments, week and response identities, permission checks, OCR review/drafts, confirmations/reasons, cancellation/version checks and verified-cache behavior. Routes remain `/dashboard`, `/newest`, `/next`, `/history` and `/?view=`; `/old` is redirect-only.

Shared changes include source-adapted shadcn button/card/badge primitives with `mf:` utilities and no global Tailwind Preflight, self-hosted Noto Sans, shared radii/spacing, the existing branding/appearance bridge and header portals for the original preferences. The sole token JSON is `meal-viewer/design/tokens.json`; `meal-viewer/scripts/build-tokens.mjs` is reused by the preview wrapper. Actual Settings and `brandingTheme` supply production colors, including default-brand light mode. The sampled preview teal is not a production default.

The approved implementation boundary excludes API/backend/Apps Script, environment and deployment-configuration changes. Production service contracts remain existing behavior. Synthetic service interception, rather than live Form/Sheet writes, supplies browser QA.

## Local evidence

The integration run reported the following passing checks before documentation:

- `npm test` in `meal-viewer`: production build plus 27 Node/native/API regression scripts, including the new calendar-safe week grouping and live-brand UI-variable checks.
- Six real-entrypoint browser tests in `mealform-preview/tests/ui/production-ui.spec.ts`: nine-tool Dashboard navigation, exact synthetic deletion identity/reason and cancel-without-write, width/theme visual matrix, role-aware mobile More, immediate viewer filtering/preferences and large/empty/login/session-error states.
- The visual matrix captures Dashboard, newest viewer and archive at 1440/768/390/360px in light and dark themes. Eight additional owner panels in both themes, plus large-text, next-week empty, guest-login and session-error captures, produce 44 PNGs in `mealform-preview/review/production/`.
- Runtime accent checks include the sampled teal, red, white and the existing default green. These checks verify variable propagation and the white accent's contrast-selected foreground; they do not certify every possible school palette.
- Eleven existing preview browser tests and five token/Chromatic-guard tests passed, as did Vite production and Storybook builds. The reported non-blocking build warnings concern a vendor `use client` directive in the plain SPA and a large Storybook tooling chunk.

The documentation pass inspected the named source files, canonical token source/compiler, native provider styles, actual browser test source and the 44-capture directory. It did not rerun the integration suite or open a new browser. The integration owner retains the command-output evidence and is responsible for recording any later rerun or release result.

## Independent finish review

The independent finish review initially requested two fixes: readable week-card width at 768px, and a usable recovery-button width under mobile large text. Both were corrected in one bounded batch. The new regressions were observed failing before the fixes, and the six actual-entrypoint UI tests then passed. The reviewer's final disposition was SHIP for those two scored fixes. This is local visual evidence, not a backend certificate, a blanket accessibility audit or user staging approval.

The production detail view retains the real response table, native sorting and complete mobile field/value rendering. Existing semantic success/warning/error/closed/unknown status styles remain in the source. Static screenshots do not establish animated trajectories. No cloud Chromatic run or baseline was created.

## Recorded design system and historical drift

`meal-viewer/DESIGN.md` and `meal-viewer/.impeccable/design.json` record the implemented production-source system. Runtime palette roles remain CSS variable bindings; no sampled accent or invented fixed tonal ramp is canonized. The sidecar's component examples are standalone native HTML/CSS, use runtime variables and require no React or Tailwind runtime.

Root `PRODUCT.md` began with preview-only scope and Noto/dependency isolation; that historical phase should not be confused with the current user-approved production migration in `SPEC-production-ui.md`. Prior `mealform-preview/DESIGN.md` and `VIEWER-DESIGN.md` describe the isolated previews. At the source read, their token references and the compiler bridge comment still named the former `tokens/tokens.json` path; the integration owner is reconciling migration-related path references and appending current authorization without erasing the earlier phase. This documentation pass does not rewrite those files. The canonical source is now `meal-viewer/design/tokens.json`. No claim is made of imported official Figma kit assets, pixel-perfect Figma agreement or automatic two-way token synchronization.

## Release gate — completed

1. Record the previous serving deployment and source commit for rollback. The integration owner verified the exact linked CLI project/team and serving artifact `dpl_7uarNkV1ZoixaYZCVAmb9qHotsDJ`; the connector's team request returned 403, so the mapped CLI credentials supplied this inspection. The source commit remains to be recorded.
2. Prepare the reviewable source branch/PR and the exact production-environment staged artifact without switching the production alias, as required by `SPEC-production-ui.md`.
3. Append the staging URL, deployment identifier, source commit and relevant read-only staging checks here. Existing OAuth origins remain unchanged; authenticated staging review uses fixtures where needed.
4. Present both surfaces to the user and await their explicit staging visual approval.
5. Only after approval, merge/sync GitHub and promote that exact artifact; record the merged commit and serving deployment, then perform deployed read-only smoke/log checks.
6. If a critical regression appears, restore the recorded serving artifact and revert the UI release commit without altering data.

Staged URL/artifact: https://menutaythanh-bp4fmmq70-anh-tun.vercel.app — `dpl_DvF1xpniLG8AUVU2jg62JrYiySQ3`, READY, production environment with `--skip-domain`. Build version `83c4d096-03eb-44e0-997d-f9f1dc166f7a`; entry asset `/assets/index-Ce33QV0b.js` and CSS `/assets/index-GtbmNmS3.css`.

UI source commit: `ac94b2a468b354f760510fb35bd024747840c3a2` on `codex/ui-remake-2026-10-14`. PR: https://github.com/Menhera-Chan-cool/MealForm/pull/1 — MERGED at `2026-10-14T11:11:01Z`, merge commit `feb344d9731b68813df3c2eea0a01b4407d21897`. The only difference between the approved artifact source and this merge is this root verification document, not runtime code.

User staging approval: explicitly approved in this thread on14/10/2026 — merge GitHub and put the approved artifact on production.

Merge/promotion and deployed smoke evidence:

- `gh pr view` confirmed MERGED; fetching `origin/main` independently confirmed merge commit `feb344d9731b68813df3c2eea0a01b4407d21897`.
- Vercel promotion of `dpl_DvF1xpniLG8AUVU2jg62JrYiySQ3` succeeded. A fresh CLI inspection of `menutaythanh.vercel.app` resolved to this READY deployment. No second build was created for promotion.
- Main-domain `/version.json` returned `83c4d096-03eb-44e0-997d-f9f1dc166f7a`; HTML references exactly `/assets/index-Ce33QV0b.js` and `/assets/index-GtbmNmS3.css`, matching the approved staged artifact.
- A separate, fresh headed Playwright session (`mealform-production`) used no mock routes or injected review scripts. Real guest reads of `/newest` and `/next` each rendered five day-summary cards, summary/detail headings, no alert and no document overflow at 390px. The browser reported no page errors in this flow. No names or meal records were emitted to logs.
- Fresh anonymous `/dashboard` and `/history` displayed their real login guards without overflow. `/api/session` returned `authenticated:false`, `/api/branding` returned the existing `#357185` primary color, and unauthenticated Dashboard/history endpoints returned 401. Existing Google SDK requests were allowed in this production session.
- A bounded error-level Vercel log query over the preceding 15 minutes returned no entries. This is a point-in-time check, not ongoing monitoring or proof that every authenticated action works.
- Real owner-authenticated administration and all live mutations were deliberately not retested in production. Exact request/confirmation behavior was exercised against synthetic transport before release; this does not substitute for a live owner end-to-end certificate. No Form/Sheet data, access permissions, OAuth origins, environment secrets or Apps Script code changed.
- Rollback target remains the previous serving deployment `dpl_7uarNkV1ZoixaYZCVAmb9qHotsDJ` (`https://menutaythanh-bskh1zcag-anh-tun.vercel.app`), version `d02f3489-b81a-47b4-afa7-6d064375a224`. Its original source commit was not independently available; the immutable deployment identifier is the concrete rollback target. No data rollback is part of this UI release.

## Staging inspection and review handoff

- CLI independently confirmed the intended `anh-tun/menutaythanh` project/team. Dry-run upload contained no credentials, `.env`, build output or prior screenshot files; canonical token JSON/compiler were included. Clean checkout `npm ci` and all27Node/native/API scripts passed.25changed frontend source files had identical hashes between canonical workspace and Git checkout before commit. No API or Apps Script path was staged.
- Remote build completed with Node24/Vite8.3, `npm ci`, zero dependency audit vulnerabilities and valid output. Non-failing vendor `use client` and transitive deprecation warnings remain documented, not app failures.
- The main user-facing domain `menutaythanh.vercel.app` still resolved to the prior serving `dpl_7uarNkV1ZoixaYZCVAmb9qHotsDJ` after staging. Its build version `d02f3489-b81a-47b4-afa7-6d064375a224` differs from the staged version. Do not interpret the CLI's production-environment label as approval or main-domain promotion.
- Staged `/newest` and `/version.json` returned200. Read-only live service checks returned `authenticated:false`, branding primary `#357185`, and expected401 for unauthenticated Dashboard access/history. No real records, Forms/Sheets, access lists or paid OCR were changed by these checks.
- Headed Playwright session `mealform-staging` opens actual staged Dashboard/viewer assets with synthetic GET service responses and rejects every write request. The injected banner explicitly labels this mode. Existing Google OAuth origins were not expanded for the staged hostname; these views are UI review, not a real owner-login/backend end-to-end certificate. One deliberately aborted Google SDK request is expected in that isolated review browser.
- PR attachment to the Codex panel was attempted but the app tool returned Invalid app tool request; the real GitHub PR URL is valid and remains the handoff reference.
- The owner has now explicitly approved the displayed staging UI and authorized merge/main-domain promotion. A bounded staged-deployment error-level log query over15minutes returned no entries; this is not ongoing monitoring. Physical device checks, Chromatic cloud, live mutation tests and pixel-perfect Figma certification remain out of scope/unverified.
