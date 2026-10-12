# Spec: response-batches

## Objective and success
Opt-in batch API returns 50 responses with global UI-folded search and stable sort, total/matched counts and a snapshot revision; only selected responses get deletion tokens. Shared exact matching is indexed once, not quadratic, preserving same-second/name/meal ambiguity semantics. Private short-lived token-free server snapshots use bounded cache chunks with safe eviction fallback. Cursor revision mismatch requires refresh; every request authorizes; mutation invalidates cache and continues fresh Form+Sheet verification. Cache is display-only in browser; fresh preload may recover previously loaded view rows in 50-row requests. Legacy unpaged/reconcile/location clients remain compatible.
## Commands
`cd meal-viewer; npm test`; `npm run build`; preview: `npx vite --host 127.0.0.1 --port 5176`.
## Structure and style
MealForm.gs, meal-viewer/api/security.mjs, existing Dashboard/model/cache/draft components and narrow native presentation helpers. Tests use Node assert/VM and Edge browser fixtures. Immutable edits and safe React text; e.g. `dispatchMenu({type:'edit', value:next})`. Reuse house dropdown, authorization, request-generation and Undo guards. No new dependencies or persistent schema.
## Verification
Observe RED before implementation; full old regression plus 1280/390px browser fixtures. Cover permission/input failures, whole-dataset criteria, matching duplicates and orphan rows, cursor shifts/cache eviction, token-free caching, stale replies, crop clamping/coordinates, explicit preview/Undo, account identity, version equality/malformed response and blocked draft persistence.
## Boundaries
Always authorize, validate input and keep mutation checks fresh. Ask for new services/scopes/schema beyond this approved scope. Never commit secrets, auto-reload edited drafts, bypass ambiguity, write real responses or invoke paid OCR during QA. Deploy backend before web; synchronize clean template and README/GitHub with read-only production proof.
