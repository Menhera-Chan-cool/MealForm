# Spec: settings-workflow

## Objective / acceptance
Save/discard forms, requirements 5; depends on input-and-status, interaction-safety.

Brand/notice contextual save bar exists only while draft differs from last server-confirmed saved snapshot. Save retains existing before/after confirmation, CAS revision and role/busy gates; failed save preserves dirty bar/content. Discard returns only that form to saved values, asks before loss, no POST. No duplicate save controls or autosave API. Inline validation and summary cover real field constraints; logo request failure stays distinct from invalid URL.

## Structure / style
React 19/Vite existing source; ContextualSaveBar.jsx, Dashboard.jsx branding, WeekNoticeEditor.jsx. Native components, existing semantic --meal-ui-* variables, Noto Sans and motion preferences. Reuse helpers/controllers; e.g. `onClick={()=>onConfirm(snapshot)}` retains verified snapshot rather than rebuilding identity from visible text.

## Commands / verification
`npm test` in meal-viewer; focused/full actual-entrypoint Playwright via `npx playwright test --config .playwright-cli/reading-polish.config.ts` in mealform-preview; then `npm test`, `npm run build`, `npm run build-storybook` and compatibility suite there. Meaningful native/real-UI RED before implementation, then GREEN. Synthetic service boundaries only for owner writes; deployed-asset and genuine GET smoke before promotion. Test malformed inputs, role/busy/stale/dirty conditions, PC/mobile and preserved state.

## Boundaries
Always preserve API payloads, source identities, validation, draft/Undo, school branding and accessible keyboard/touch behavior. Ask before dependency/API/schema/auth changes. Never store tokens/student lists in URL/history/cache, auto-run OCR or mutate live data during QA. Browser emulation does not certify physical IME/mobile/assistive hardware.
