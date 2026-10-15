# Spec: column-resize
## Objective
PC users resize viewer/submission/history columns by pointer or a focused separator. Original data, hidden-column choices, sort and row identity remain intact; one reset restores default sizing.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Structure and style
Shared TableWorkspace sizing context and ColumnResizeHandle in real headers. Pointer capture, widths bounded from 144px to the larger of 720px and the initial natural column widths, fixed-layout CSS scoped to one workspace and PC media only. No new library or colgroup that creates ghost hidden columns.
## Testing
RED/GREEN real geometry, keyboard Left/Right/Home/End, drag cancel/Escape, reset, all three callers, hidden columns, expansion, projection reset, viewport/unmount cleanup and full mobile values.
## Boundaries
Always keep required columns and actions. Ask before persistence/export changes. Never write Sheet widths, infer record identity from column position or add a day strip.
## Success
Resizing one column does not reorder data or unexpectedly resize others; mobile restores normal card layout. State is temporary for the current table signature/view.
