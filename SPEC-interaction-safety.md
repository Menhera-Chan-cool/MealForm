# Spec: interaction-safety

## Objective / acceptance
Shared safe interactions, requirements 3, 7, 8, 10, 13, 14, 18, 24, 30; depends on responsive-accessibility.

Focused fields/controls remain within visual viewport and above sticky layers; 44px label hit areas. Destructive confirmations focus Cancel/static explanation and return to opener or logical surviving record. Keep exact tokens/revisions/one-submit guard; explicit action labels. Separate safe and destructive menu groups. Table widths gain click/tap alternatives, preserve pointer/keyboard cancellation. Readonly authorized data remain selectable, no credential exposure. Popovers remain hoverable and Escape dismissible. Ordinary actions remain click/up activation, not pointerdown writes.

## Structure / style
React 19/Vite existing source; ActionConfirmation.jsx, RowActionMenu.jsx, TableWorkspace.jsx, useAnchoredPopover.js, focus visibility hook. Native components, existing semantic --meal-ui-* variables, Noto Sans and motion preferences. Reuse helpers/controllers; e.g. `onClick={()=>onConfirm(snapshot)}` retains verified snapshot rather than rebuilding identity from visible text.

## Commands / verification
`npm test` in meal-viewer; focused/full actual-entrypoint Playwright via `npx playwright test --config .playwright-cli/reading-polish.config.ts` in mealform-preview; then `npm test`, `npm run build`, `npm run build-storybook` and compatibility suite there. Meaningful native/real-UI RED before implementation, then GREEN. Synthetic service boundaries only for owner writes; deployed-asset and genuine GET smoke before promotion. Test malformed inputs, role/busy/stale/dirty conditions, PC/mobile and preserved state.

## Boundaries
Always preserve API payloads, source identities, validation, draft/Undo, school branding and accessible keyboard/touch behavior. Ask before dependency/API/schema/auth changes. Never store tokens/student lists in URL/history/cache, auto-run OCR or mutate live data during QA. Browser emulation does not certify physical IME/mobile/assistive hardware.
