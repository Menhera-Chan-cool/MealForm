# Approved Dashboard QoL (2026-10-11)

| Module id | Responsibility | Depends on |
|---|---|---|
| dashboard-cache | Account-scoped 24-hour display cache; fresh-state mutation guards | Existing authenticated Dashboard |
| response-updates | Visible-tab 60-second read-only response identity check, badge, existing refresh button | dashboard-cache |
| sheet-locations | Resolve current matching Sheet rows on demand, never guess ambiguous matches | Existing registered-week matching |
| audit-readability | Optional operation reason and readable legacy/new audit events | Existing Form controls and deletion audit |

Build order: audit-readability -> sheet-locations -> dashboard-cache -> response-updates.
User approved all implementation and verification in one pass. No new dependencies, privilege expansion, real response mutations for tests, or public sharing of Sheets.
