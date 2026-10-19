# Layout foundations

## Objective / success
Keep Operate identity and semantic tokens. Response/reconciliation areas fill available main width; branding/system/access/notice constrain reading width, login is centered and narrower. Independent sections retain one outer surface; ordinary inner groups use spacing/dividers, not nested cards. Preserve tables' own scroll and temporary-layer boundaries.
## Commands / structure
Source meal-viewer/src; real-entrypoint tests mealform-preview/tests/ui/production-ui.spec.ts. Dev/test: npm exec -- playwright test --config playwright.production.config.ts (mealform-preview). Build/native: npm test && npm run build (meal-viewer). Preview: npm test && npm run build && npm run build-storybook.
## Style
Reuse semantic CSS, JSX and native elements; e.g. <main data-section={tab}>. No new dependencies, public copy or backend contracts.
## Verification / boundaries
Watch responsive width/grouping assertions fail before implementation; retain existing functional suites. Inspect one batched light/dark PC/mobile/large/short/forced-color pass plus at most one correction confirmation. Always preserve accessible names, dialogs, validation and cache guards. Ask for schema/dependency changes; never commit secrets or mutate real owner data during QA.
