# Spec: draft-inspection

## Objective and acceptance
Compare each editable title/date/day/holiday/meal field against the original successful OCR/source snapshot; optional simulation of registration without services.

Original snapshot persists with account-local draft; old drafts without snapshot say unavailable. Undo reduces diff. Linked changes reveal correct editor field, including hidden holiday meals. Simulator uses current dates/holidays/trimmed choices, never POST, allows edit-day return, preserves choices until draft changes and labels all results as simulation.

## Commands / tests
App: `npm test` in meal-viewer (native/API/GAS and build). Actual entrypoint: `.\\node_modules\\.bin\\playwright.cmd test --config .playwright-cli/reading-polish.config.ts` in mealform-preview. Preview: `npm test`, `npm run build`, `npm run build-storybook`; built compatibility: `.\\node_modules\\.bin\\playwright.cmd test --config .playwright-cli/reading-polish-compat.config.ts`. Add meaningful native and browser RED before implementation; fixtures only at external APIs/images. Run builds/browser serially; PC/mobile/light/dark/narrow/forced-colors batched visual inspection then one confirmation. Deployed immutable assets tested before pinned merge/same-artifact promotion; genuine smoke GET-only.

## Structure and style
Existing React19/Vite modules: draft-tools.mjs, DraftInspection.jsx, Dashboard.jsx, ocr-draft.mjs/useOcrDraft.js. Tests in meal-viewer/*.test.mjs and mealform-preview/tests/ui/production-ui.spec.ts. Reuse reducer, semantic tokens, existing native dialogs and components. Example: `dispatchMenu({type:'edit',value:proposal.menu})` commits one verified proposal instead of reconstructing values during confirmation.

## Boundaries
Always validate untrusted pasted/draft data and snapshots, preserve account/role/date/meal checks and exact row identities. Ask before dependencies, backend/schema/auth/CI changes. Never store credentials in history/cache/messages, queue/replay mutations, auto-run OCR/create, modify vendor files or mutate real owner records during QA. Physical hardware/assistive-tech and Chromatic cloud are not certified by emulation.
