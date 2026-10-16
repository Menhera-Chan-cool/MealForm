# Spec: responsive-accessibility

## Objective / acceptance
Responsive foundations, requirements 6, 12, 21, 22, 23; depends on —.

Keep incumbent semantic colors; support 320 CSS px / 400% equivalent layout, landscape low-height, user text-spacing, forced-colors system palette and stable image/logo/loading geometry. Tables alone may scroll horizontally; no clipped text or inaccessible controls. No new settings or motion world.

## Structure / style
React 19/Vite existing source; main.jsx, operate-accessibility.css, BrandingProvider.jsx, image/status styles. Native components, existing semantic --meal-ui-* variables, Noto Sans and motion preferences. Reuse helpers/controllers; e.g. `onClick={()=>onConfirm(snapshot)}` retains verified snapshot rather than rebuilding identity from visible text.

## Commands / verification
`npm test` in meal-viewer; focused/full actual-entrypoint Playwright via `npx playwright test --config .playwright-cli/reading-polish.config.ts` in mealform-preview; then `npm test`, `npm run build`, `npm run build-storybook` and compatibility suite there. Meaningful native/real-UI RED before implementation, then GREEN. Synthetic service boundaries only for owner writes; deployed-asset and genuine GET smoke before promotion. Test malformed inputs, role/busy/stale/dirty conditions, PC/mobile and preserved state.

## Boundaries
Always preserve API payloads, source identities, validation, draft/Undo, school branding and accessible keyboard/touch behavior. Ask before dependency/API/schema/auth changes. Never store tokens/student lists in URL/history/cache, auto-run OCR or mutate live data during QA. Browser emulation does not certify physical IME/mobile/assistive hardware.
