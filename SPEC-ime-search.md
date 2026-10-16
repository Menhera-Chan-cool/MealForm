# Spec: ime-search

## Objective and success
Vietnamese composition stays visible in the focused search input without updating matching options, tables, server searches or OCR highlights until composition ends. Commit the final text on compositionend or blur; ordinary typing stays immediate. Enter/Arrow/Escape while composing must not run parent search/navigation shortcuts. Clear/selection cancels buffered text. External value changes discard stale composition. Cover shared SearchInput, ComboSelect, command palette, week/archive search and OCR find without remounting fields.

## Structure and style
React 19/Vite; reuse a small shared hook in meal-viewer/src and existing components. Keep callback events synchronous: `onChange(event)`. Native browser composition is authoritative; no key-to-accent parser or debounce.

## Commands and tests
`npm test` in meal-viewer; `npx playwright test --config .playwright-cli/reading-polish.config.ts --grep ime-access-labels` in mealform-preview. Real UI tests dispatch composition/input/key events, assert stable results/focus/caret then final filtering and normal clear.

## Boundaries
Always preserve selection, holiday and readonly guards. Ask before dependencies/API changes. Never write or merge student records through search.
