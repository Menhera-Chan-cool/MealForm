# OCR navigation — selected 4, 6, 8 (2026-10-16)

User selected these three exact capabilities and approved GitHub/main and production. Preserve the current Operate design and business contracts.

| Module | Responsibility | Depends on |
|---|---|---|
| ocr-image-order | Reorder accepted sources before retained OCR results | — |
| loaded-attention | Overview of existing scoped warning snapshots | — |
| ocr-find | Accent-folded find/navigation over actual editable OCR fields | — |

Build/test in map order. Source meal-viewer/src; native tests meal-viewer/ocr-navigation.test.mjs; consumer tests mealform-preview/tests/ui/production-ui.spec.ts. Native HTML drag/drop and buttons, existing warnings/read-time scopes, foldSearchText, SearchInput and jumpToReview; no dependency/API/GAS changes. Style example: `const next = images.slice(); next.splice(to, 0, next.splice(from, 1)[0]);`. Preserve validation, Undo, role gating, unsaved guards and explicit OCR/create confirmation.

RED/GREEN then `npm test` in both app copies, full actual-entrypoint and compatibility browser suites, preview TypeScript/Vite/Storybook and token checks, one bounded light/dark PC/mobile review. Plan/tasks are appended in tasks/plan.md and tasks/todo.md. Ask before dependencies/auth/schema/CI changes; never store credentials, auto-run OCR/create/delete, guess fresh health or modify unrelated local changes. Publication uses a committed-input-checked immutable Vercel artifact, pinned PR merge, promotion of the same artifact, genuine GET-only smoke and docs/rollback. No new visible browser windows or old RAR rebuild.
