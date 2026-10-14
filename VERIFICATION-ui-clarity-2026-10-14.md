# UI clarity: 13 selected improvements — 14/10/2026

## Authority and boundaries

User explicitly authorized the entire selected bundle, GitHub update and production release without a preview approval round. Map: CAPABILITY-MAP-ui-clarity.md; specs: search-presentation, week-context, responsive-workspaces, editing-safety. No new day-strip. No dependencies, API/Apps Script/schema/OAuth/configuration changes or real Form/Sheet mutations in QA.

Baseline main `6974e69203a71ae9c52515fa50a442c5889b16d2`; branch `codex/ui-clarity-2026-10-14`. Serving/rollback artifact before release: `dpl_EiNwPZLLD1sZdrEYNZfyTHcMKR9x`, version `301779d1-e6f7-461a-abc0-91afa3fb610f`.

## Completed scope

1. Literal search highlights in options, viewer names/meals, summary, Dashboard names/audit and command palette. Vietnamese accent folding maps graphemes to original text without changing data or injecting HTML. Original filtering rules remain unchanged.
2. Archive/month/week breadcrumbs and return links preserve the selected calendar/list month, including crossing-month weeks.
3. Mobile native bottom filter sheet: current values apply immediately, close/backdrop/Escape retain them, focus returns; resize restores desktop controls. Supports visualViewport/keyboard-height bounds and Full/Light/Off motion.
4. Long notices expand/collapse, reset on replacement and still expire from server-relative time. Text stays React-escaped.
5. Brand/notice unsaved indicators; internal tab/week/command/logout/explicit-update and browser-unload guards. Cancel preserves drafts, explicit discard resets the right edits. Failed saves retain editable text and original optimistic revision; notice 409 keeps text but requires explicit reload before retry. No success is inferred from an ambiguous failed response.
6. Known technical headers and loading text display in Vietnamese; original Sheet headers/model strings are untouched.
7. Valid OCR days may be marked reviewed and collapsed. Invalid/unacknowledged missing days cannot collapse. Content/validation changes and Undo invalidate review markers; fresh OCR resets them. Markers never enter drafts, final menu payloads or authorization logic.
8. Browser titles reflect actual loaded week, archive month or Dashboard section, with public school branding; never student names/emails. Theme changes no longer overwrite titles.
9. Clear controls for each search field and command palette. Week query clear preserves the committed concrete week; other field clears leave independent filters intact.
10. Archive list/calendar metadata badges distinguish real numeric zero from missing/invalid counts and unknown Form state. The current archive backend does not supply those fields; real cards honestly show unknown until supplied. No extra Form/Sheet scans or permission-bypassing Dashboard fetches were added.
11. Confirmation body scrolls while Cancel/Confirm remain visible under reduced viewport height; original reason/cancel/mutation handlers remain intact.
12. PC viewer/submission/history tables expand using the same native dialog/table/control DOM, not a duplicate mutable view. Close/Escape restores window/table scroll and focus; resize closes expansion. Inline regions are non-modal, and existing modal guards now check `:modal` so Ctrl/⌘ K and paste are not accidentally blocked.
13. External Form/Sheet/folder/help links use the installed icon family and a new-tab hint; destinations and existing safe row-resolution handlers are preserved. Sheet lookup still occurs only on actual click.

## Verification evidence

- Focused RED/GREEN checks were observed for highlight mapping, metadata/context, sheet presence, expanded workspace, unsaved guards, OCR review. Notice-conflict protection was mutation-checked: temporarily removing its 409 gate made the Save-disabled assertion fail, restoring it passed. Fixtures model a remote revision change independently of React StrictMode's initial GET count.
- Native helper boundaries: composed/decomposed Vietnamese, emoji, literal punctuation, repeated matches, untouched original-text reconstruction, display-only headers, malformed dates, crossing months, zero/null/string/negative/NaN counts and dirty raw fields.
- `meal-viewer/npm test`: production build and **29 native/API scripts passed**. Existing vendor module-directive warnings are non-fatal; no dependency change.
- Final real-entrypoint Chrome suite: **38 passed (1.3m)**, including notice-conflict retry/reload cancellation. Synthetic HTTP is the only substituted boundary; delete/restore identities, reasons, permission/cache gates remain tested.
- Preview compatibility: **11 browser tests and 5 token/Chromatic-guard tests passed**. TypeScript/Vite and 45-story Storybook builds passed. Existing tooling chunk-size warnings are not runtime blockers. No preview site, Figma update or Chromatic cloud upload was created.
- Bounded visual/interaction pass at 360/768/1440 and both themes: search marks, mobile sheet, archive/calendar, expanded viewer/Dashboard and confirmation footer; existing responsive/motion/permission regressions retained. Keyboard-height footer now uses the smaller CSS dynamic viewport and JS visual viewport, preventing one-frame oversizing. Screenshot fixtures contain only synthetic data.
- SSR regression caught a new unguarded window read in the mobile initializer; fixed at the shared caller. Old tests were updated only for deliberately changed Vietnamese copy, contextual URLs and explicit sheet closing, retaining their data/state assertions.

## Limitations

Desktop Chrome plus responsive emulation, not physical iOS/Android or cross-browser certification. Native browser unload warnings cannot guarantee recovery after OS/process termination; unsaved brand/notice edits are not automatically saved or synced. Archive count/status unknowns are intentional when absent. No paid OCR, live create/delete/restore or owner configuration writes are used during QA. No release RAR regenerated and no new long-term monitoring configuration.

## Release target

Existing `anh-tun/menutaythanh`, project `prj_J0aPrnCB79cyxClYyfCpb02nqSES`, scope `team_alPCXVFOOevXpZxlqFldUisB`, Node 24/Vite/npm ci/npm run build/dist/root `.` verified from canonical meal-viewer and its existing CLI configuration. Stage an exact production-environment artifact without main-domain switching, smoke it internally, then merge/promote under the already-given authority; no user preview gate. Record exact source/deployment/version/assets and genuine readonly live smoke below.

## Completed release

- Runtime source `8ce03583568468f8afcf8fd147ad9b5970a1ef47`, PR https://github.com/Menhera-Chan-cool/MealForm/pull/6 . Merge pinned to that exact head; GitHub confirms MERGED at `2026-10-14T16:00:55Z` (23:00 Vietnam), merge `a14406c88afbce48624fa1aed0ab12f46435ccc1`. Fresh fetch confirms main; merged runtime is identical. App attachment attempted once but the desktop tool returned `Invalid app tool request`; actual GitHub PR is valid.
- All 92 tracked deployment inputs were checked against committed Git blobs after normal line-ending filters: 91 match, with the sole incumbent public HTML-title difference between production and the clean sharing template retained unchanged. Dry run 93 entries (including an empty directory), 526700 bytes; no private env, credential, browser-state, screenshot or test input.
- READY artifact `dpl_14tQxX9URMbxNGLujbA3evbjeKJB`, https://menutaythanh-1f5umqjpl-anh-tun.vercel.app . Production environment, staged without main-domain switch. Remote clean install/build succeeded; 177 packages audited, zero vulnerabilities. Existing module-directive/npm deprecation warnings remain non-fatal. Build duration 17s.
- Artifact version **`cc5952e1-4675-4245-9305-74a4b162bd87`**, JS `/assets/index-BX9vDR8J.js`, CSS `/assets/index-B_Az35cB.css`. Internal headless check used real built assets with fully synthetic API responses, exercising search marks, Vietnamese header, expanded table, mobile sheet, archive metadata, unsaved cancel/discard, OCR reviewed-day collapse and delete cancellation. No application errors, one synthetic OCR response, zero live API writes. No user preview was opened or approval requested.
- Before promotion, the named main domain independently still returned prior version `301779d1-e6f7-461a-abc0-91afa3fb610f`; the CLI-generated project alias assignment did not change that named domain. After exact-head GitHub merge, the same artifact was promoted successfully **without rebuilding**.
- https://menutaythanh.vercel.app independently returns the exact new version, JS and CSS above. Fresh temporary Chrome used genuine production GETs, not fixtures: accent-folded search highlights, Vietnamese timestamp, PC expansion/close, mobile sheet/day selection/close, name clear preserving date, no day-strip, 390px document width=scroll width, contextual titles, seven setup steps/six external-link icons, `/next` HTTP 200 and `/old` redirect all passed. API history/dashboard-access both returned 401 without a session, and their pages showed login rather than data. No application page errors and no non-GET API request was attempted; no student name was emitted in the report.
- Bounded error-level log scan: last 30m, limit 20, one Node `[DEP0169] url.parse()` deprecation warning on HTTP 200 viewer GET, no 5xx observed in that scan. No monitoring/drain configuration was altered or audited. No real owner configuration/OCR/create/delete/restore action was used to validate this release.
- Previous artifact `dpl_EiNwPZLLD1sZdrEYNZfyTHcMKR9x` remains the rollback reference. No rollback was required. README and this release record are updated by a documentation-only follow-up; no extra deployment is needed for that commit.
