# Operating feedback — approved seven UI capabilities

User selected all seven features and approved GitHub/main plus production on 2026-10-16. Preserve Operate design and original business contracts. Shared acceptance/style/test/boundary policy below applies to each module spec.

| Module | Responsibility | Depends on |
|---|---|---|
| image-budget | Real decoded image bytes and remaining slots | — |
| image-pan | Mouse drag the real zoomed viewport | — |
| table-crosshair | PC day-column/row reading guide | — |
| field-budget | Remaining characters with original limits | — |
| system-summary | Result summary with expandable instructions/details | — |
| loaded-warnings | Week-scoped, loaded-only navigation warning badges | system-summary |
| readable-time | Vietnam today/yesterday plus full timestamp | — |

Build order follows table order. Source: meal-viewer/src, API/GAS unchanged. Native tests in meal-viewer/operating-ui.test.mjs; real-entrypoint browser tests in mealform-preview/tests/ui/production-ui.spec.ts. Reuse React/native pointer capture/details/progress/Intl; no dependencies. Example style: `const remaining = limit - value.length;`. Specs are SPEC-<module>.md. Plan/tasks: tasks/plan.md and tasks/todo.md.

Verify RED before implementation, GREEN for helpers and actual consumers, then `npm test` in meal-viewer; TypeScript/Vite/Storybook build, token tests and complete production/compatibility Playwright suites in mealform-preview. Inspect one batched PC/mobile light/dark matrix, repair once if needed. No new visible browser windows or real owner mutations during QA.

Always preserve source values, real weekday identity, keyboard/touch controls, focus return, validation, role guards and destructive confirmation. Ask before schema/dependency/CI/auth changes. Never commit secrets, weaken tests or automatically run OCR/create/delete. Publication: tested-source upload validation, immutable Vercel artifact smoke, pinned PR merge, promote same artifact, genuine readonly smoke, docs/rollback. Keep local school-specific GAS/index and dirty original clone intact. No RAR rebuild.
