# Dashboard QoL verification — 2026-10-11

## Scope
Display cache after current authorization; fresh matching Sheet row resolver; optional reasons without audit schema changes; readable legacy JSON/history cards; visible-tab new-identity badge with manual refresh.

## Verification
- Main workspace, clean share template and GitHub checkout: complete `npm test` including Vite build and existing regression suites passed.
- Native-service fixtures: invalid reasons reject before writes; pending/success/partial failures retain reasons; lightweight access avoids Spreadsheet reads; polling never reads item answers/audit; current row shifts and multiple candidates resolve without writes.
- Browser fixture at 1280px and 390px: cached rows visible before delayed week AND overview; cached/failed-refresh delete buttons disabled; no deletion token in browser cache; old row removal does not cancel a new-id badge; manual refresh clears badge; Form/delete reasons forwarded; multiple fresh row links have correct gid/range; JSON hidden; no page overflow; logout clears cache.
- Production read-only check: week API 200, 24 displayed responses, 23 Form response ids, one history event; identity-only API 200; first matched response locator 200 with one candidate and native gid 937096150. Mobile no overflow; cached table present before delayed live response and its actions disabled. No admin mutation requests sent; POST/DELETE blocked on the QA page.

## Deployment
- Apps Script active deployment updated to version 72 at 16:27 Vietnam time, retaining the existing exec URL and execution/access settings.
- Live source saved and reloaded exactly matched the normalized merge. Four active functions replaced and three helpers added; 110 other active functions unchanged.
- Vercel deployment `dpl_Az7hffusrNkuc3dHmahRfxWmF6XR` confirmed READY and aliased to https://menutaythanh.vercel.app at 16:29 Vietnam time.
- GitHub main accepted feature commit `61ffe10`; clean template README now documents version 72 and the cache/privacy/deployment requirements.

## Limits
No live response deletion/restoration or manual live Form controls were used to verify this release. Mutations were tested using isolated native-service fixtures and intercepted browser responses. Snapshot names/meals are not separately encrypted in browser storage; logout on shared machines. Sheet rows can still move after a resolved link is opened; ambiguous candidates require human inspection. Existing RAR files were not rebuilt.

Run the browser fixture with the installed Playwright CLI and local Vite preview at port 5176: `playwright-cli -s=meal-qol run-code --filename=browser-tests/dashboard-qol.js`.
