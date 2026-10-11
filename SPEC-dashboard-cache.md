# Spec: dashboard-cache

## Objective
After fresh session/authorization, show last viewed account/week snapshot immediately and revalidate in background. Initial authorization includes only registered-week metadata, not expensive Form/Sheet counts; full overview refreshes independently. Persist bounded display-only snapshots up to 24 hours in browser; clear on logout/authorization loss. Keep rows on network errors, visibly stale and non-actionable.
## Commands
`cd meal-viewer; node dashboard-qol.test.mjs`; `npm test`; `npm run build`.
## Structure
src/dashboard-cache.mjs handles storage; Dashboard.jsx owns fresh/cached state and async generations; App.jsx clears cache on session loss/logout. No authentication cache.
## Style
Whitelist display fields. Never persist delete tokens, restorable flags, or credentials. Account id comes only from live authorized overview.
## Testing
Account/week separation, expiry/future timestamp, malformed/quota-denied storage, secret stripping, stale request responses/unmount/account switches, failure keeps rows but disables actions.
## Boundaries
Always label cached state, require new live data for delete/restore/links. Ask before cloud storage. Never show cached data before authorization or overwrite unrelated local storage.
## Success
Reopen last viewed week with visible cached rows before delayed week request; refresh retains table; logout and revoked access clear snapshots.
