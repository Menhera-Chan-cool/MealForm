# Serving-day fix and OCR investigation — 2026-10-28

## Production result — verified18:43 UTC+7
Date fix released through [PR27](https://github.com/Menhera-Chan-cool/MealForm/pull/27), head36f157286dfba14c44a4abcc3f7e4dc971b333bd, mergeef2be13fb5852990e67ee87481c5b60d51102d19. Main's entire meal-viewer tree matched the staged source.
Production-target artifact dpl_H6XCwB2pN6f3XZTFKoKDkeQ4QUQ3 was promoted without rebuild. Named-domain inspection resolved to the same READY ID/version44f7196e-d281-40f7-b45e-0d91359a454a; Vite/Node24.x, build17.3s.
Immutable URL: https://menutaythanh-9gxkqt4o8-anh-tun.vercel.app · Primary: https://menutaythanh.vercel.app
All180 raw upload digests/Git-object inputs matched the pinned source:959535 bytes, zero mismatches/private inputs. Four compiled-asset regression cases passed. Genuine staged and primary-domain browser/API/GAS reads each returned20 submissions/5 days, Today enabled and selecting exactly Thứ 4 (28.10.2026), week range visible, mobile filter retained, zero overflow/page errors/business writes/OCR calls and401 anonymous private boundaries.
Bounded15m/20-record error query returned2 existing DEP0169 deprecation records,0 other error records, hasMore=false. No all-traffic5xx/drains/monitoring certification. Build reported6 dev-only advisories (4low,1moderate,1high); fresh npm audit --omit=dev returned0 findings. Lockfile unchanged; no automatic audit fix was run. Temporary local Vite server stopped. App PR attachment tool returned Invalid app tool request; GitHub PR/merge were independently verified.

## User scope
Fix the week/day filter shown as dark/disabled and investigate a single image taking2–3 minutes for OCR. User authorized GitHub/main and production after verification. No authorization to change model/cost/quality trade-offs has been inferred.

## Reproduction and cause
- Current production version de2030de-7843-4aa5-85b0-1637d5d34223 returned actual labels such as Thứ 4 (28.10.2026).
- Today and several date displays only parsed dd/mm/yyyy. The current week therefore lost its range and Today was disabled despite a matching serving date.
- The genuine dark-mode day dropdown measured foreground rgb(239,244,245) on dark surfaces, not black text. The fix addresses the disabled state/date recognition rather than forcing a different palette.
- Genuine investigation used GET-only guest access; zero business writes, no student names in emitted results.

## Change
One shared display-only parser accepts dd/mm/yyyy, dd.mm.yyyy and dd-mm-yyyy with a consistent separator and strict UTC date round-trip validation. Today still returns the exact original header. Week range, next-week display, browser title, compact mobile day labels and holiday display comparisons reuse that parser.
No Sheet headers, response timestamps/identity, Form–Sheet matching, permissions, source rows, API/GAS or OCR configuration are changed.

## Verification
- RED: native test returned empty Today instead of the exact dotted date; browser regression found Today disabled.
- GREEN: dotted-date regression passed on desktop and mobile, including exact filter value/title/week range and zero writes.
- Native/API/GAS suite44 scripts passed in the Git worktree. Preview5 token/Chromatic guards, TypeScript, Vite and Storybook builds passed.
- Full260 browser suite passed in8.1 minutes, one worker, fixed runtime source.
- Canonical source/test copy uses baseline Git-object guards for the7 changed files; normalized hashes match. The44 native/API/GAS scripts and Vite build also passed in the canonical copy. Immutable-asset and genuine release verification passed.
- No physical-device or screen-reader certification; no paid/cloud visual test claim.

## OCR: not fixed or claimed faster yet
User confirmed one image. Source uses VILAO_MODEL from server Script Properties and makes a synchronous ViLao chat/completions request. A successful first request calls the provider once. Transient429/5xx responses can cause up to3 attempts with1s and3s sleeps; those sleeps alone do not explain2–3 minutes.
Multi-image processing is sequential, but that is not an explanation for the reported single-image case. No blind concurrency/model/temperature/token-limit changes were made.
Free request-log queries for the most recent6h and11h returned no relevant POST records;24h history requires a paid Observability entitlement, which was not purchased. Provider duration/retries/model selection are not proven from live evidence.
User confirmed VILAO_MODEL is spd/gemini-3.8-flash-high, then explicitly chose to keep High and decline paid tests. Google documents reasoning_effort:low for Gemini3.8 Flash, but that is not proof the SPD relay alias honors an override. Public ViLao catalog confirms the current alias; no unsupported low alias or different provider was substituted.
No live OCR request or paid provider benchmark was run. No model/effort change, image quality reduction, shorter fake-success timeout, Apps Script publish or automatic Form/Sheet creation. OCR latency remains unverified and is NOT claimed fixed or faster.
Sources: https://ai.google.dev/gemini-api/docs/openai#thinking and https://vilao.ai/models (rendered public catalog,28/10/2026).

## Release
Released date fix only after exact-source staging, compiled/genuine verification, pinned main merge and same-artifact promotion. No OCR performance change was released.
Pre-cutover rollback baseline: dpl_2P6v5qsj2sAvMVdJ66DTwdKrjRwr/versionde2030de-7843-4aa5-85b0-1637d5d34223.
