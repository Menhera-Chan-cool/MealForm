# Spec: context-status

## Objective and acceptance
Extra week option descriptions, per-session messages and honest offline state.

Committed picker label and accessible exact option name remain unchanged. Count only finite nonnegative known responseCount, real open/closed/unknown status; no extra fetch. Feedback bounded RAM list scoped to mounted account, time/context, no tokens/storage, no replay or pretend audit. navigator offline is a device hint not server failure/auth expiry. Existing permitted snapshot remains visible with actual saved time where known; block service writes before side effects; online return never auto repeats writes. No service worker or new offline cache.

## Commands / tests
App: `npm test` in meal-viewer (native/API/GAS and build). Actual entrypoint: `.\\node_modules\\.bin\\playwright.cmd test --config .playwright-cli/reading-polish.config.ts` in mealform-preview. Preview: `npm test`, `npm run build`, `npm run build-storybook`; built compatibility: `.\\node_modules\\.bin\\playwright.cmd test --config .playwright-cli/reading-polish-compat.config.ts`. Add meaningful native and browser RED before implementation; fixtures only at external APIs/images. Run builds/browser serially; PC/mobile/light/dark/narrow/forced-colors batched visual inspection then one confirmation. Deployed immutable assets tested before pinned merge/same-artifact promotion; genuine smoke GET-only.

## Structure and style
Existing React19/Vite modules: FilterControls.jsx, DashboardWeekPicker.jsx, SessionFeedback.jsx, ConnectionNotice.jsx, App.jsx, Dashboard.jsx. Tests in meal-viewer/*.test.mjs and mealform-preview/tests/ui/production-ui.spec.ts. Reuse reducer, semantic tokens, existing native dialogs and components. Example: `dispatchMenu({type:'edit',value:proposal.menu})` commits one verified proposal instead of reconstructing values during confirmation.

## Boundaries
Always validate untrusted pasted/draft data and snapshots, preserve account/role/date/meal checks and exact row identities. Ask before dependencies, backend/schema/auth/CI changes. Never store credentials in history/cache/messages, queue/replay mutations, auto-run OCR/create, modify vendor files or mutate real owner records during QA. Physical hardware/assistive-tech and Chromatic cloud are not certified by emulation.
