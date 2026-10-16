# Spec: image-labels

## Objective and success
Each image has an optional editable secondary label (max 100 UTF-16 units) below its unmodified original filename. Label belongs to image entry, not its index/name/data URL. Reorder, append, remove and local account-scoped draft restore preserve correct association, including duplicate filenames. Label edits leave active preview, OCR menu/history and byte budget unchanged. Empty label is allowed; old version-1 drafts remain valid. Reject malformed/oversized labels at draft boundary rather than silently losing edits.

## Structure and style
ImageInput.jsx, Dashboard.jsx and ocr-draft.mjs; retain optional `{dataUrl,name,label}` in existing version-1 IndexedDB draft, no DB upgrade. Existing moveImage already preserves entry objects. Native labeled text field with existing theme/44px targets; no new service payload.

## Commands and tests
`node ocr-draft.test.mjs` and `npm test` in meal-viewer. Production-ui Playwright covers label edit, order, append/remove, reload and original image-only OCR request.

## Boundaries
Always preserve original filename/image/source order and role/busy gates. Ask before cloud sync. Never send labels to OCR, Form or Sheet. Labels are local browser drafts only.
