# Spec: audit-filters

## Objective and success
Selected-week history filters all stored events by administrator, action, inclusive Vietnam calendar date range and note search, with explicit error/pending/review/partial-only states. Batch API filters before returning 50 matching events; explicit history load-more never transfers the entire audit log. Preserve restoration guards including later attempts outside the visible page, and clear criteria on week switch.
## Commands
`cd meal-viewer; npm test`; `npm run build`; preview: `npx vite --host 127.0.0.1 --port 5176`.
## Structure and style
MealForm.gs, meal-viewer/api/security.mjs, existing Dashboard/model/cache/draft components and narrow native presentation helpers. Tests use Node assert/VM and Edge browser fixtures. Immutable edits and safe React text; e.g. `dispatchMenu({type:'edit', value:next})`. Reuse house dropdown, authorization, request-generation and Undo guards. No new dependencies or persistent schema.
## Verification
Observe RED before implementation; full old regression plus 1280/390px browser fixtures. Cover permission/input failures, whole-dataset criteria, matching duplicates and orphan rows, cursor shifts/cache eviction, token-free caching, stale replies, crop clamping/coordinates, explicit preview/Undo, account identity, version equality/malformed response and blocked draft persistence.
## Boundaries
Always authorize, validate input and keep mutation checks fresh. Ask for new services/scopes/schema beyond this approved scope. Never commit secrets, auto-reload edited drafts, bypass ambiguity, write real responses or invoke paid OCR during QA. Deploy backend before web; synchronize clean template and README/GitHub with read-only production proof.
