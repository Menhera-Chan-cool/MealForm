# OCR media layout

## Objective / acceptance
All thumbnails form a compact horizontally scrollable strip near the image viewer. Current source exposes original filename, optional label, replacement/removal and Lên/Xuống; other thumbnails remain selectable. Selecting, moving and replacing never auto-OCR; keep byte limits, immutable draft/Undo, ingestion errors and stale-result gates. Source labels follow exact entries after reorder.
Fullscreen PC keeps Close separate and tools beside image; narrow/short/zoomed layouts move tools to a wrapping horizontal row with a usable canvas, pan/scroll/minimap/range/region controls intact.
## Structure / style
ImageInput.jsx, MenuImagePreview.jsx and Dashboard/OcrWorkspace placement; reuse source props/handlers. If the strip is portaled, move only its presentation, no duplicated source state. Example active thumbnail aria-pressed plus visible current-source controls.
## Commands / testing
Same commands as SPEC-workspace-shell.md. RED/GREEN source selection/control visibility, labels/reorder/append/remove/replace/draft restore, no OCR writes, modal close/focus/zoom/pan/minimap at PC/mobile/short forced colors.
## Boundaries
Always original source/label association and required busy/offline gates. Ask before draft schema/dependency changes. Never drop images or Undo while moving UI.
