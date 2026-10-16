# Spec: focused-workspaces

## Objective and acceptance
PC readable nonmodal response side panel, full mobile modal; focus editor without remounting content.

Keep one response DOM and current fresh responseId lookup, before/next limited to loaded filtered rows. PC table gets actual space rather than hidden behind panel; close returns opener. Mobile showModal focus containment, safe Escape. From an already expanded table, PC also uses a modal above that parent to preserve native top-layer access; normal PC pages retain the nonmodal side panel. Editor focus only create tab, hides unrelated shell, explicit exit and Escape outside dialogs/popovers, restores exact window position; menu/image DOM, Undo and draft unchanged. Never embed delete writes in readonly quick view.

## Commands / tests
App: `npm test` in meal-viewer (native/API/GAS and build). Actual entrypoint: `.\\node_modules\\.bin\\playwright.cmd test --config .playwright-cli/reading-polish.config.ts` in mealform-preview. Preview: `npm test`, `npm run build`, `npm run build-storybook`; built compatibility: `.\\node_modules\\.bin\\playwright.cmd test --config .playwright-cli/reading-polish-compat.config.ts`. Add meaningful native and browser RED before implementation; fixtures only at external APIs/images. Run builds/browser serially; PC/mobile/light/dark/narrow/forced-colors batched visual inspection then one confirmation. Deployed immutable assets tested before pinned merge/same-artifact promotion; genuine smoke GET-only.

## Structure and style
Existing React19/Vite modules: ResponseQuickView.jsx, DashboardLayout.jsx, Dashboard.jsx, draft-tools.css. Tests in meal-viewer/*.test.mjs and mealform-preview/tests/ui/production-ui.spec.ts. Reuse reducer, semantic tokens, existing native dialogs and components. Example: `dispatchMenu({type:'edit',value:proposal.menu})` commits one verified proposal instead of reconstructing values during confirmation.

## Boundaries
Always validate untrusted pasted/draft data and snapshots, preserve account/role/date/meal checks and exact row identities. Ask before dependencies, backend/schema/auth/CI changes. Never store credentials in history/cache/messages, queue/replay mutations, auto-run OCR/create, modify vendor files or mutate real owner records during QA. Physical hardware/assistive-tech and Chromatic cloud are not certified by emulation.
