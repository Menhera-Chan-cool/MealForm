# Spec: ocr-error-jump
## Objective
List current OCR date errors, missing meal fields and whole-week validation problems above review days. Clicking an issue moves focus to its actual editable field; correcting/Undo updates the list. Navigation never fixes text, changes allowMissing or creates a Form.
## Commands
`cd meal-viewer; npm test`; `cd mealform-preview; npx playwright test --config playwright.production.config.ts`.
## Structure and style
Dashboard uses inspectMenu dayIssues as the sole source. Stable IDs on date/meal fields and week controls, literal issue links/buttons. Preserve OcrReviewDay reviewed-content stamp and invalid-day expansion.
## Testing
RED/GREEN focus on correct day/date/missing meal, duplicate labels/holiday days, corrections/Undo, current busy guards and keyboard/mobile; no create or server writes from navigation.
## Boundaries and success
Always retain original validation and draft history. Ask before changing OCR/validation semantics. Never guess corrected content or use the issue list to bypass review. Warnings for an optional third meal are distinct from blocking errors; whole-week issues point to relevant week control rather than a guessed day.
