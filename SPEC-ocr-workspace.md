# Spec: ocr-workspace

## Objective / acceptance
Image/OCR review and completion, requirements 1, 2, 4, 17, 20, 26, 27; depends on input-and-status, responsive-accessibility.

Inline date and each missing-meal explanation beside inputs, real inspectMenu validation unchanged. Remove reviewed-day checkbox/collapse, keep all days/editors available. Desktop source left/editor right; mobile Photo/Edit tabs preserve both DOM nodes and per-pane scroll, zoom, selected image, draft and Undo. Error/search jumps reveal editor pane. Image errors identify exact original file and preserve existing draft/batch. Short filename keeps extension, full accessible name available on tap/keyboard without renaming. Only review/create explicitly calls services. Successful creation retains exact created week/result links and next actions from verified response, never blindly first overview week.

## Structure / style
React 19/Vite existing source; Dashboard.jsx OCR section, OcrReviewDay.jsx, image-import.mjs, ImageInput.jsx, filename/workspace/receipt components. Native components, existing semantic --meal-ui-* variables, Noto Sans and motion preferences. Reuse helpers/controllers; e.g. `onClick={()=>onConfirm(snapshot)}` retains verified snapshot rather than rebuilding identity from visible text.

## Commands / verification
`npm test` in meal-viewer; focused/full actual-entrypoint Playwright via `npx playwright test --config .playwright-cli/reading-polish.config.ts` in mealform-preview; then `npm test`, `npm run build`, `npm run build-storybook` and compatibility suite there. Meaningful native/real-UI RED before implementation, then GREEN. Synthetic service boundaries only for owner writes; deployed-asset and genuine GET smoke before promotion. Test malformed inputs, role/busy/stale/dirty conditions, PC/mobile and preserved state.

## Boundaries
Always preserve API payloads, source identities, validation, draft/Undo, school branding and accessible keyboard/touch behavior. Ask before dependency/API/schema/auth changes. Never store tokens/student lists in URL/history/cache, auto-run OCR or mutate live data during QA. Browser emulation does not certify physical IME/mobile/assistive hardware.
