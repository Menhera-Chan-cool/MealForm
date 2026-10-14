# Preview verification — 2026-10-13

Scope: mealform-preview only. Production/GitHub/Apps Script/release packages not changed.

- Token + missing-Chromatic-token tests: 5 passed. Tests were written and observed failing before implementation.
- Browser interaction tests: 5 passed using isolated Chrome, desktop 1440×960/mobile390×960. Cover dark card/brand colors,44px Radix trigger, mobile tools/viewer link, read-only quick view, local image drop/type rejection and safe placeholder navigation.
- Vite type-check/build and Storybook static build succeeded. Storybook emits a large-chunk warning for preview tooling; not a production dependency.
- Twelve story entries indexed successfully.
- Nine screenshot stories measured and viewed: desktop/mobile light/dark, More, submissions, upload, empty and loading. No page errors, no horizontal document overflow, no visible button/input/select under44px.
- Impeccable detector ran once against main preview TSX/CSS, result `[]`.
- Independent finish reviewer initially requested mobile viewer access. Added Mở trang xem to More; failing regression test now passes. Recaptured same viewports. Verdict: `ship` for that scored fix, not certification of production or all backend behaviors.
- Figma native frames7:2–7:7 exist. Fresh high-fidelity context/final Figma capture blocked by Starter MCP quota; no pixel-perfect claim.
- Anonymous Figma embed returned403. Design addon now uses direct Figma links; sharing permissions were not changed.
- Chromatic Node entry verified and missing-token guard tested. No project, token, cloud upload, baseline or CI run.
- GitHub sync clone remains clean at cae3d564a27155ed3cf51c34b00391e295236b2e.

Preview servers: Vite127.0.0.1:5174, Storybook127.0.0.1:6006. Bound to localhost only. Ignored generated build/review folders in watchers to prevent Windows EBUSY while building with the dev server open.

## Weekly viewer extension — 2026-10-13

The preceding bullets record the earlier administration preview. The viewer extension stays in the same isolated preview; no production, Apps Script, GitHub or deployment changes are authorized by this verification record.

- The build session reported 11 browser tests and five token/missing-Chromatic-token tests passing, plus successful Vite/typecheck and Storybook builds. This documentation pass did not rerun them. The saved `test-results/.last-run.json` records `passed` with no failed tests; it does not itself establish a test count.
- The static Storybook index was inspected: 19 MealForm/Viewer stories, nine Dashboard stories and three Components stories. Viewer tests cover immediate accent-folded filtering, sort options, mobile inline expansion, Today behavior, dark chevron color, month/archive selection, advanced validation and no outbound service requests. Saved viewer captures exist in `review/viewer` for 360/390/768/1440 widths, light/dark, large text and selected state scenarios.
- `.playwright-cli/figma-viewer/final-readback.json` was inspected and counted: 22 native frames, 563 component instances, 40 variables, four single-mode collections, Noto Sans only and zero image-filled nodes. This is saved readback evidence, not a new remote Figma query. Viewer file: `W0eib9OIk99Ia0fweyf09e`; the original admin file is separate.
- The independent finish reviewer reported `SHIP` for the supplied preview/design evidence after dark-chevron contrast, archive transition capture and the SVG back icon were resolved. The detector reported no primary findings; the responsive 26px mobile heading is an intentional specialization, and combo options now use the incumbent 8px control radius. This document records those session results without a fresh detector or browser run.
- `VIEWER-DESIGN.md` records viewer-specific layout/type overrides and inherited system rules. Root `PRODUCT.md`, preview `DESIGN.md` and `.impeccable/design.json` retain their earlier administration/quota wording; it is historical drift, not a current inability to read the new viewer file. No system replacement or sidecar regeneration occurred.
- Remaining limits: no pixel-perfect Figma certification, backend/auth/permission validation, production implementation or deployment. Details beyond the supplied screenshot viewports received source review only. Native variables and Tokens Studio JSON are separate, without automatic two-way sync. Chromatic remains opt-in, without a project/token, cloud upload, approved baseline or CI run.
