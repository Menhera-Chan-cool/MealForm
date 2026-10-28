# Serving-day fix and OCR investigation — 2026-10-28

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
- Canonical source/test copy uses baseline Git-object guards for the7 changed files; normalized hashes match. The44 native/API/GAS scripts and Vite build also passed in the canonical copy. Release verification is pending.
- No physical-device or screen-reader certification; no paid/cloud visual test claim.

## OCR: not fixed or claimed faster yet
User confirmed one image. Source uses VILAO_MODEL from server Script Properties and makes a synchronous ViLao chat/completions request. A successful first request calls the provider once. Transient429/5xx responses can cause up to3 attempts with1s and3s sleeps; those sleeps alone do not explain2–3 minutes.
Multi-image processing is sequential, but that is not an explanation for the reported single-image case. No blind concurrency/model/temperature/token-limit changes were made.
Free request-log queries for the most recent6h and11h returned no relevant POST records;24h history requires a paid Observability entitlement, which was not purchased. Provider duration/retries/model selection are not proven from live evidence.
User confirmed VILAO_MODEL is spd/gemini-3.8-flash-high, then explicitly chose to keep High and decline paid tests. Google documents reasoning_effort:low for Gemini3.8 Flash, but that is not proof the SPD relay alias honors an override. Public ViLao catalog confirms the current alias; no unsupported low alias or different provider was substituted.
No live OCR request or paid provider benchmark was run. No model/effort change, image quality reduction, shorter fake-success timeout, Apps Script publish or automatic Form/Sheet creation. OCR latency remains unverified and is NOT claimed fixed or faster.
Sources: https://ai.google.dev/gemini-api/docs/openai#thinking and https://vilao.ai/models (rendered public catalog,28/10/2026).

## Release
Not yet released. Stage a production-target artifact without changing the primary domain, test its immutable assets and the actual dotted-date guest flow, merge the pinned source and promote the same artifact.
Rollback is the current dpl_2P6v5qsj2sAvMVdJ66DTwdKrjRwr/versionde2030de-7843-4aa5-85b0-1637d5d34223.
