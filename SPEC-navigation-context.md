# Spec: navigation-context

## Objective / acceptance
Dashboard history and archive visited states, requirements 19, 28; depends on settings-workflow, ocr-workspace.

Native Back/Forward traverses Dashboard tab/week without leaving unexpectedly; URL stores only validated tab/week, never student names/email/search notes/tokens. Retain account/week display preferences and guards. Dirty/busy navigation cancellation restores history index without duplicate prompts/posts; allow after explicit discard and invalidate stale reads. Direct links role-gated. Archive visited style means opened, not verified/checked, preserves theme contrast and browser privacy.

## Structure / style
React 19/Vite existing source; dashboard-navigation.mjs/hook, Dashboard.jsx navigate, HistoryArchive/ArchiveCalendar styles. Native components, existing semantic --meal-ui-* variables, Noto Sans and motion preferences. Reuse helpers/controllers; e.g. `onClick={()=>onConfirm(snapshot)}` retains verified snapshot rather than rebuilding identity from visible text.

## Commands / verification
`npm test` in meal-viewer; focused/full actual-entrypoint Playwright via `npx playwright test --config .playwright-cli/reading-polish.config.ts` in mealform-preview; then `npm test`, `npm run build`, `npm run build-storybook` and compatibility suite there. Meaningful native/real-UI RED before implementation, then GREEN. Synthetic service boundaries only for owner writes; deployed-asset and genuine GET smoke before promotion. Test malformed inputs, role/busy/stale/dirty conditions, PC/mobile and preserved state.

## Boundaries
Always preserve API payloads, source identities, validation, draft/Undo, school branding and accessible keyboard/touch behavior. Ask before dependency/API/schema/auth changes. Never store tokens/student lists in URL/history/cache, auto-run OCR or mutate live data during QA. Browser emulation does not certify physical IME/mobile/assistive hardware.
