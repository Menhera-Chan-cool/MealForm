# expanded-table-context

Objective: keep the actual week and applied filter summary visible in expanded Viewer, Dashboard responses, and audit history. Never clone controls or tables, or reset filters/sort/scroll.

Implementation: optional readonly React context content on TableWorkspace; callers pass current week, actual applied filters and sort. Header wraps and stays outside the scrolling body. Inputs still live in their original place.

Verify: from mealform-preview run `./node_modules/.bin/playwright.cmd test --config playwright.production.config.ts --grep reading-context`. Check filtered Viewer, responses and history after scrolling/closing. Existing React/semantic CSS conventions and runtime theme tokens only.

Boundaries: always preserve controls/focus and escaped text; ask before external release; never modify record identity, permissions or persisted data. Source: meal-viewer/src/{TableWorkspace,App,Dashboard}.jsx; browser tests in mealform-preview/tests/ui/production-ui.spec.ts. No new dependencies.
