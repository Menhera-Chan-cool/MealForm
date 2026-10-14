# Approved UI bundle — staging checkpoint, 14/10/2026

## Scope and release gate

User approved all four implementation groups and delegated detailed specifications/planning. Before staging, the user removed idea 2 (the week day-strip). The remaining nine are implemented; the original Day dropdown, Today shortcut and holiday notice remain. Production promotion and main-branch merge require a fresh visual approval.

No API, Apps Script, OAuth, schema, environment, dependency or real Form/Sheet changes. Baseline main is `bd3e5691c2d2106645838689ca396da6c1a834d5`; branch `codex/ten-ui-improvements-2026-10-14`.

## Implemented slices

1. Accessible static skeletons for initial viewer/auth/archive/Dashboard reads. Existing data is retained on reload; original verified/cache/cancel gates remain authoritative.
2. Exact-key grouped week choices, duplicate-label disambiguation, malformed-date fallback group; month archive includes valid crossing-month/year weeks and links to the original week route.
3. Mobile Summary/Details tabs retain search/sort and mounted panel state. Name/time metadata comes from the original projection model, never a name lookup; full/day/meal modes retain same-name response timestamps. PC name cells/headers are sticky on horizontal scroll.
4. Truthful OCR image/review/create states, completion only after a successful create response; create errors keep draft/review. Three-image import/crop/draft validation flows are not changed.
5. Native row-action popovers defer Sheet lookup until clicked. Quick View remains primary. Existing delete token/week/response identity, cached-read disables, role conditions, delete confirmation/reason and restore browser confirmation/entry identity are reused unchanged.
6. Read-only illustrative brand context preview across surface/device/theme; local choices and draft colors never update root appearance or save to backend. Only the existing Save action persists. Light preview headings are isolated from the surrounding dark-page palette.

## Verification

- RED/GREEN: initial-only skeletons, grouped/calendar discovery, projection metadata, mobile tabs/pinning, OCR stages, row popover presence and brand context controls.
- Additional reproduced regressions: invalid calendar date was incorrectly classified as a past week; mobile timestamp inherited a second grid column; light preview headings inherited global dark text. Each now has a passing focused assertion.
- User's removal has a failing-then-passing browser assertion for absence of the day-strip and continued operation of the original Day filter/Today button. No strip component, import, markup or CSS remains in runtime/Storybook.
- `meal-viewer/npm test`: build + all 28 native/API scripts passed after removing the strip. Build has existing non-fatal vendor `use client` directive warnings.
- Preview token/Chromatic safety tests: 5 passed. Preview TypeScript/Vite build passed; Storybook build passed after removal (45 stories); existing preview bundle-size/tool timing warnings are not runtime blockers.
- Preview browser suite: 11 passed. Actual-frontend browser suite: **25 passed (51.3s)** after removing the day-strip, including exact synthetic delete/restore payloads and cancellation, OCR create failure/retry/completion, all theme/device brand contexts and no remaining strip.
- Bounded screenshots/interaction review: 360/390/768/1440 widths, light/dark; calendar, mobile tabs/cards, PC pinning, OCR, row menu bounds/keyboard, brand contexts; existing full/light/off motion checks retained. All service mutations in tests are synthetic.

## Limitations

Chrome desktop and responsive emulation, not physical iOS/Android or a cross-browser certification. No paid OCR or live create/delete/restore used in QA. No new Chromatic cloud upload/baseline or Figma sync; local Storybook/token pipeline remains intact. Brand preview is illustrative, not an authenticated app instance or a pixel-match claim. No release archive was regenerated.

## Deployment

Existing project verified: `prj_J0aPrnCB79cyxClYyfCpb02nqSES`, team `team_alPCXVFOOevXpZxlqFldUisB`, `anh-tun/menutaythanh`, Node 24 / Vite / npm ci / npm run build / dist / root `.`.

Before staging the serving main domain returns build `22d5121a-5e27-4223-bbc8-d3ffca680313`, deployment `dpl_4WqD8AxQhaxoTEn6bkUFVQaqe1Rr`. Stage using the existing production environment and `--skip-domain`, test that exact artifact, and do not promote it without approval. No secrets or browser authentication state belong in this record.

### Completed staging checkpoint

- PR **#5**: https://github.com/Menhera-Chan-cool/MealForm/pull/5 . OPEN/CLEAN, base main; runtime source `444da01515d014d2772cb5a5fc4f661d2609ae7c`. App PR attachment was attempted once but the desktop tool returned `Invalid app tool request`; the verified GitHub PR itself is accessible.
- Dry run: 82 entries, including an empty directory; source/compiler/tokens only, with credentials/private environment files, local browser state, screenshots, tests and Storybook output excluded. Of 81 tracked runtime inputs, 80 normalize to exactly the committed Git blobs. The only existing deployment/template difference is the retained public HTML title: production uses `Ăn bán trú - THPT Tây Thạnh`, while the clean share template uses `Thực đơn bán trú`. This was independently checked against the serving production HTML; no personal settings or credentials were copied into GitHub.
- **READY**, `dpl_EiNwPZLLD1sZdrEYNZfyTHcMKR9x`, https://menutaythanh-jlszvslb0-anh-tun.vercel.app . Production environment staged with `--skip-domain`; remote clean install/build succeeded, zero audit vulnerabilities. Existing vendor/npm deprecation warnings are non-fatal. Build duration 26s.
- Immutable stage version `301779d1-e6f7-461a-abc0-91afa3fb610f`, JS `/assets/index-DH-DTNRY.js`, CSS `/assets/index-CrOjWaSK.css`. Headful browser independently loaded that exact JS and version.
- CLI assigned generated project alias `menutaythanh-anh-tun.vercel.app`. The user-facing **menutaythanh.vercel.app remains on the old version** `22d5121a-5e27-4223-bbc8-d3ffca680313`, independently fetched again after the staged browser check. No promotion/main-domain alias command was run.
- Four dedicated Chrome review tabs opened on actual staged assets: PC Dashboard, mobile viewer, mobile calendar archive and mobile response menu. Synthetic API GET responses; every write rejected in this review browser context, Google links replaced with explanatory fixtures. This is not a backend sandbox and does not change the deployed API or production security rules.
- Staged flow checks confirmed committed week text, Summary/Details switching, no day strip, existing Filter/Today controls, calendar week links and row popover. No application page errors; the Google sign-in SDK intentionally aborted by the fixture produces an expected resource-load console error. Fixture `about:blank` storage access was fixed with a same-origin init guard before the successful review; no app change was needed.
- **Awaiting user visual approval. PR remains unmerged; production promotion is not authorized.** Runtime source must stay identical when promoting this artifact; any code revision needs a new stage and review.

## Approved production release — 14/10/2026

The user subsequently explicitly approved merging PR #5 and publishing the displayed staging artifact.

- Merge pinned to approved PR head `5ceccc52ce2e6bd60674f211b16952ab17fc4c6e`; GitHub confirms MERGED at `2026-10-14T14:53:16Z` (21:53 Vietnam), merge commit `dccfddc8ef2d1c86ec329d793e2d08f8e8c7949c`. Fresh fetch confirms main. Only documentation differs from staged runtime source `444da01515d014d2772cb5a5fc4f661d2609ae7c`.
- Existing project/team and READY production-environment artifact rechecked before promotion. Promoted **the same** `dpl_EiNwPZLLD1sZdrEYNZfyTHcMKR9x`, with no rebuild, API/configuration change or data migration.
- https://menutaythanh.vercel.app now returns version `301779d1-e6f7-461a-abc0-91afa3fb610f` and exactly the approved JS `/assets/index-DH-DTNRY.js` and CSS `/assets/index-CrOjWaSK.css`.
- Fresh temporary Chrome context used genuine production GET responses, not synthetic data. Non-GET API requests were blocked defensively; **zero were attempted**. Current week displayed 22 response rows, next week GET returned 200. Mobile 390px has no document overflow, Summary/Details tabs work, name/time cards render, original Today remains and no day-strip exists. Public setup has seven steps. Archive and Dashboard expose login screens without a session; no archive/admin rows leaked. `/old` redirects to `/history`. No application page errors in this smoke.
- Bounded error-level runtime-log scan (last hour, limit 20) returned one Node `[DEP0169] url.parse()` deprecation warning on an HTTP 200 viewer GET, not a failed request. No 5xx appeared in that bounded scan. Dependency warning was not investigated or changed by this UI release. External drains/long-term monitoring were not inspected.
- One read-only post-release inspect used a clone-relative CLI config directory and completed an additional local CLI login. That directory is ignored by Git; no credential content was read or committed. Subsequent verification used the intended canonical app/config directory again. Future CLI calls should use canonical `meal-viewer` to avoid duplicate login caches.
- No real OCR, Form/Sheet creation, delete/restore or authenticated-owner production mutation was used for this release check. Existing synthetic owner regression results remain the evidence for those guards. Physical-device/cross-browser and Chromatic cloud limitations remain as above.
- Rollback artifact retained: `dpl_4WqD8AxQhaxoTEn6bkUFVQaqe1Rr`, previous version `22d5121a-5e27-4223-bbc8-d3ffca680313`. No rollback was needed.
