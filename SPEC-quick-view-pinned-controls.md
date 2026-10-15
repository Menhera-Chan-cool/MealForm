# quick-view-pinned-controls

Objective: keep Close and existing loaded-list previous/next navigation reachable while long readonly response content scrolls on PC/mobile, large text/light-dark.

Implementation: existing native dialog becomes bounded flex column; header and navigation stay outside one scrolling body; use existing visual-viewport helper, semantic runtime colors, native Escape/focus return. Preserve same-name identity and disabled-boundary reasons. No added keyboard shortcuts or data loads.

Verify: from mealform-preview run `./node_modules/.bin/playwright.cmd test --config playwright.production.config.ts --grep reading-context`, scroll long records on PC and 360px, navigate and close/Escape with original focus restored. Also full existing suite/build.

Boundaries: always preserve fresh-record resolution and required data; never mutate or fetch on navigation, add dependencies, or release externally without approval. Files: ResponseQuickView.jsx, ui-clarity.css, existing production-ui.spec.ts. Reuse existing code style.
