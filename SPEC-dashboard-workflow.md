# Spec: dashboard-workflow
## Objective
Ideas 7–9: show truthful OCR phase, keep Quick View prominent and move secondary row actions into native popovers, and preview branding on representative viewer/Dashboard desktop/mobile light/dark frames.
## Commands
Shared commands, step-state assertions, exact synthetic delete/restore payload and cancel tests, isolated preview checks.
## Structure
OcrProgress.jsx, RowActionMenu.jsx, BrandingPreview.jsx, Dashboard.jsx and existing SheetRowButton/confirmation callbacks.
## Code style
Reuse current handlers and primitives. Preview is explicitly illustrative, token-bound and read-only, not an embedded authenticated controller.
## Testing
Initial image/read/review/create/error/success progress; opening a menu makes no request; cache/roles disable mutations; delete/restore preserve key/token/reason and cancel never writes. Preview choices never save or change global appearance.
## Boundaries
No automatic OCR/create/navigation or eager Sheet lookup. Keep all confirmation/verified-read rules. No real records inside branding examples and no recursive Dashboard/App mounting.
## Success criteria
Three-step progress follows actual state. Row menus remain visible/usable within viewport and honor full/light/off motion. Preview supports both surfaces, device layouts and themes; only the existing Save action persists branding.
