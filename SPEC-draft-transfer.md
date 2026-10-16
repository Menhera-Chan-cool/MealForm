# Spec: draft-transfer

## Objective and acceptance
Paste copied tab-delimited text with column mapping and preview; copy meals source→target in draft.

Bounded textual TSV, quoted cells, explicit header/date/meal mappings, exactly five dates, existing calendar validation before apply; no HTML execution, spreadsheet formulas or remote imports. ISO and dd/mm/yyyy accepted, serial dates not guessed. Preview required, stale proposal rejected. Whole replacement/copy is one Undo step. Copy preserves dates/holiday flags; closed source/target unavailable. Standalone table drafts need no image, original snapshot known, legacy image drafts remain valid.

## Commands / tests
App: `npm test` in meal-viewer (native/API/GAS and build). Actual entrypoint: `.\\node_modules\\.bin\\playwright.cmd test --config .playwright-cli/reading-polish.config.ts` in mealform-preview. Preview: `npm test`, `npm run build`, `npm run build-storybook`; built compatibility: `.\\node_modules\\.bin\\playwright.cmd test --config .playwright-cli/reading-polish-compat.config.ts`. Add meaningful native and browser RED before implementation; fixtures only at external APIs/images. Run builds/browser serially; PC/mobile/light/dark/narrow/forced-colors batched visual inspection then one confirmation. Deployed immutable assets tested before pinned merge/same-artifact promotion; genuine smoke GET-only.

## Structure and style
Existing React19/Vite modules: draft-tools.mjs, DraftTransfer.jsx, Dashboard.jsx. Tests in meal-viewer/*.test.mjs and mealform-preview/tests/ui/production-ui.spec.ts. Reuse reducer, semantic tokens, existing native dialogs and components. Example: `dispatchMenu({type:'edit',value:proposal.menu})` commits one verified proposal instead of reconstructing values during confirmation.

## Boundaries
Always validate untrusted pasted/draft data and snapshots, preserve account/role/date/meal checks and exact row identities. Ask before dependencies, backend/schema/auth/CI changes. Never store credentials in history/cache/messages, queue/replay mutations, auto-run OCR/create, modify vendor files or mutate real owner records during QA. Physical hardware/assistive-tech and Chromatic cloud are not certified by emulation.
