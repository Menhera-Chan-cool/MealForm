# Reading layouts — 2026-10-21

## Authorization and scope
User approved all17 selected layouts in six modules, autonomous specification/planning/implementation/verification, GitHub main and named production. No API, Apps Script, OAuth, session protocol, dependency or business-data schema change.

## Acceptance map
| Items | Implementation | Evidence |
|---|---|---|
| Compact week ledger | DashboardLayout | Past-week rows retain actual counts/status/links; scoped navigation; current/next cards preserved |
| OCR matrix | Dashboard + container layout | Same inputs at1366px aligned by meal; mobile values and Undo retained; holidays/errors/order controls unchanged |
| Notice compose/preview | WeekNoticeEditor | PC split, mobile accessible tabs; dirty text/revision retained; cancel produces no write |
| Grouped table headers | TableWorkspace/DetailTable | Actual visible/reordered columns; colgroup keeps exact resized widths; mobile omits group row |
| Mobile expandable records | DetailTable | Name/time/real content count, per-record and open-all; one-day projection is immediately visible |
| Four brand samples | BrandingPreview | PC/mobile x light/dark, enlarge and Escape focus return; existing saved/draft comparison retained |
| Form info/actions | Dashboard | Exact week/status/links before original guarded actions; deadline never inferred |
| Current session separate | SessionManager | Current above others; accepted legacy noncurrent records retained; existing exact revoke/cancel flow |
| Inline logo group | Dashboard | URL, thumbnail, scoped current-attempt loading/error/retry together |
| Attention grouping | useAppAttention | Actual memory-only events, pending/viewed; empty polls do not fabricate history; max20, reset on account/reload |
| Command grouping | ComfortProvider | Navigation/week/appearance groups with keyboard/IME and dirty guards; no business mutations |
| Device data rows | DeviceData | Original three categories and scoped confirmation; no server/cookie deletion |
| Data footer | App/Dashboard | Loaded vs displayed counts, real server totals only and original load-more |
| Confirmation layout | ActionConfirmation | Caller-provided affected object, PC split/mobile object first; Cancel focus, reason and sticky safe footer |
| Wide-PC sidebar | reading-layouts | One set of original filters; mobile submission drawer retains state and focus; quick view still leaves table visible |
| Theme samples | ComfortProvider | Native radio group uses existing preference store; keyboard/forced-colors support |
| Recovery layout | ViewerLinkProblem/App | Whole-page failure recovery, retained-data reload errors remain inline |

## Verification
- Native/API/GAS suites and Vite build:43 scripts passed in both Git worktree and canonical application.
- Preview:5 token/Chromatic-guard cases passed; TypeScript, Vite and Storybook built. No Chromatic cloud upload.
- Isolated final browser suite: **259/259 passed in7.5m**. Previous complete pass reached257/258 with one30s screenshot-loop timeout during concurrent local activity; changed DOM selectors were migrated without removing payload, identity, permission, cancellation or Undo assertions. Final run uses one worker, fixed source,60s resource timeout, no concurrent builds.
- Two added RED/GREEN checks:1366px matrix visibility and legacy noncurrent-session retention. Grouped-header resizing first failed against real rendered widths, then passed using ordered visible col widths.
- One batched PC/tablet/mobile/short/large/forced-colors review plus correction confirmation; layout detector returned zero findings. Preview compatibility6 cases passed; separate symlinked preview dev server emitted font allow-list warnings, so that run is not font-fidelity certification.
- Canonical runtime/test/preview synchronization:26 files, baseline guards and normalized Git hashes; no unrelated source overwritten.

## Release gate
Not released yet. CLI verified team anh-tun/project menutaythanh/prj_J0aPrnCB79cyxClYyfCpb02nqSES, Vite/Node24.x/root dot, no Git auto-deployment link. Use existing CLI credentials; no credentials copied or printed. Dry manifest initially180 files, no private/test helper inputs; pin and verify final commit and every raw upload digest before staging.
PR, staged deployment, pinned main merge, same-artifact promotion and genuine readonly smoke are pending.

## Rollback
Current named production before this change: dpl_FG7BWndNrwyTBxeq12isuppYfjjq; version85cec74e-c429-4901-b06c-81fa61386be9; source baseline20b942273c493f96241eda29e0b38473a1e4cb08. Apps Script remains v82 on the existing deployment; this change needs no GAS publication.

## Limits
No real Form/Sheet/create/OCR/revoke QA mutations. No physical-device/screen-reader or OS-notification certification; no paid/cloud visual-baseline claim. Existing large-bundle/directive/Storybook plugin-timing warnings remain. Old sharing source/RAR not regenerated.
