# Capability map: UI improvements — approved 14/10/2026

Scope amendment: the user removed idea 2 (day strip) before staging. Implement the other nine; preserve the original Day filter and Today shortcut.

| Module id | Responsibility / original ideas | Depends on |
| --- | --- | --- |
| loading-states | Shared honest initial skeletons; keep existing/cached data on refresh (10) | Existing read gates |
| week-discovery | Grouped searchable week choices and month calendar/list archive (5–6) | loading-states |
| viewer-reading | Mobile Summary/Details tabs, named cards, pinned PC name column (1, 3–4) | loading-states, week-discovery |
| dashboard-workflow | OCR progress, row action popovers, contextual brand preview (7–9) | loading-states, week-discovery, viewer-reading |

Build order: loading-states → week-discovery → viewer-reading → dashboard-workflow → integrated staging.

User approved this map and explicitly delegated detailed specification/planning and complete staging implementation without further step-by-step approvals. Final staging visual approval is still required before any production promotion.

Shared boundaries: frontend only; no API/backend/Apps Script/OAuth/schema/environment/dependency changes. Preserve exact response/week identity, confirmations, verified-read gates, permissions, local drafts/Undo, search/sort and routes. Tests use synthetic external transport, not live writes/OCR.

## Shared implementation contract
Objective: improve finding, reading and operating the existing menu UI, not rebuild its identity.
Commands: in meal-viewer, npm test (Vite build + native/API scripts); in mealform-preview, npx playwright test --config playwright.production.config.ts, npm run test:ui, npm test, npm run build-storybook.
Structure: meal-viewer/src is runtime; ui-model.mjs contains display-only calculations; existing models/controllers remain authority. Browser tests live in mealform-preview/tests/ui; native regressions in meal-viewer. Runtime styles reuse existing brand variables and motion levels.
Style example: export function monthKeys(weeks) { return [...new Set(weeks.flatMap(weekMonths))].sort().reverse(); } Small named JSX presenters, native buttons/popovers, existing hooks; no new library.
Testing: observe RED before new logic/UI implementation. Check month/year boundary, duplicate names, holidays, full/day/meal projections, unauthorized/cache/loading states and identical mutation identities. Validate PC/mobile light/dark and all old regressions.
Always: reuse data/services and maintain accessibility/44px controls. Ask first: new dependencies, backend/config changes, production promotion. Never: store secrets, infer serving dates from array index, merge people by name, bypass authorization or write to real Forms/Sheets during QA.
