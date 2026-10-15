# Spec: table-edge-shadows
## Objective
Show only a subtle left/right shadow where the table viewport has more horizontal content. No instructional text, arrow, button or new accessible control. No shadow when content fits; mobile cards stay unchanged.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Structure and style
Shared TableScroll wraps the existing .table-wrap viewport in viewer/submission/history tables, preserving refs on the actual scrolling element. ResizeObserver watches viewport/table plus passive scroll; narrow noninteractive pseudo-element edge shadows use brand-derived foreground transparency. No extra controls, overlays that intercept clicks, or changes to table geometry.
## Testing
RED/GREEN start/middle/end geometry, fit/no overflow, width resizing/hiding, expansion, projection/reload and mobile cleanup; all three workspaces. Shadows are decoration only.
## Boundaries and success
Always measure scrollWidth/clientWidth/scrollLeft with rounding tolerance; preserve scroll/focus/column sizing. Ask before non-table scroll changes. Never add the rejected hint copy or alter data. Stop observers/listeners on replacement/unmount.
