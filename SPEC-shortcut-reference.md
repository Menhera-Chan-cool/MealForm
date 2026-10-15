# Spec: shortcut-reference
## Objective
Manual “Phím tắt” section in the existing display menu explains supported keys and their contexts. It introduces no destructive bindings or automatic popup.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Structure and style
ComfortProvider inline region with semantic kbd/dl and runtime colors, analogous to manual release notes.
## Testing
RED/GREEN open/close/reset, real Ctrl/Command K behavior, context-specific OCR/column keys, bounded mobile menu and no business writes.
## Boundaries
Always qualify shortcuts by focused widget/editor. Ask before new global bindings. Never intercept Delete/Backspace or claim every Enter is harmless navigation.
## Success
Users can find the reference without losing drafts; the text matches actual handlers and respects existing modal/busy guards.
