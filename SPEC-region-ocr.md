# Spec: region-ocr

## Objective and success
Native dialog lets users pick an existing day or meal slot, drag a rectangle on the original image on PC/mobile, or set percentage bounds with keyboard. Canvas crops on device; explicit OCR button sends cropped pixels only. Server validates mode, image and permission and parses bounded output. Editable before/after fields require explicit apply, bound to the opening menu/image; one Undo transaction. Preserve other days, title, closed flag, and original image. Never edit existing Form/Sheet or invoke paid OCR during QA.
## Commands
`cd meal-viewer; npm test`; `npm run build`; preview: `npx vite --host 127.0.0.1 --port 5176`.
## Structure and style
MealForm.gs, meal-viewer/api/security.mjs, existing Dashboard/model/cache/draft components and narrow native presentation helpers. Tests use Node assert/VM and Edge browser fixtures. Immutable edits and safe React text; e.g. `dispatchMenu({type:'edit', value:next})`. Reuse house dropdown, authorization, request-generation and Undo guards. No new dependencies or persistent schema.
## Verification
Observe RED before implementation; full old regression plus 1280/390px browser fixtures. Cover permission/input failures, whole-dataset criteria, matching duplicates and orphan rows, cursor shifts/cache eviction, token-free caching, stale replies, crop clamping/coordinates, explicit preview/Undo, account identity, version equality/malformed response and blocked draft persistence.
## Boundaries
Always authorize, validate input and keep mutation checks fresh. Ask for new services/scopes/schema beyond this approved scope. Never commit secrets, auto-reload edited drafts, bypass ambiguity, write real responses or invoke paid OCR during QA. Deploy backend before web; synchronize clean template and README/GitHub with read-only production proof.
