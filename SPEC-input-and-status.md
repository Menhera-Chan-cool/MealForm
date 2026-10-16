# Spec: input-and-status

## Objective / acceptance
Field and result feedback, requirements 9, 11, 15, 16, 25, 29; depends on interaction-safety.

Accessible error summary links to exact fields with matching inline text; submitted invalid form focuses summary, ordinary editing never steals focus. Optional labels and persistent hints, suitable native keyboard hints. Announce concise result counts without moving focus or reading whole records; preserve IME buffering. Noninteractive status tags are not disabled action lookalikes.

## Structure / style
React 19/Vite existing source; FormErrorSummary.jsx, SearchInput.jsx, FilterControls.jsx, status components, helpers/tests. Native components, existing semantic --meal-ui-* variables, Noto Sans and motion preferences. Reuse helpers/controllers; e.g. `onClick={()=>onConfirm(snapshot)}` retains verified snapshot rather than rebuilding identity from visible text.

## Commands / verification
`npm test` in meal-viewer; focused/full actual-entrypoint Playwright via `npx playwright test --config .playwright-cli/reading-polish.config.ts` in mealform-preview; then `npm test`, `npm run build`, `npm run build-storybook` and compatibility suite there. Meaningful native/real-UI RED before implementation, then GREEN. Synthetic service boundaries only for owner writes; deployed-asset and genuine GET smoke before promotion. Test malformed inputs, role/busy/stale/dirty conditions, PC/mobile and preserved state.

## Boundaries
Always preserve API payloads, source identities, validation, draft/Undo, school branding and accessible keyboard/touch behavior. Ask before dependency/API/schema/auth changes. Never store tokens/student lists in URL/history/cache, auto-run OCR or mutate live data during QA. Browser emulation does not certify physical IME/mobile/assistive hardware.
