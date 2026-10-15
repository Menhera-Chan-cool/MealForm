# Reading tools — selected 1, 2, 10, 5, 6

User selected all five capabilities and previously delegated detailed planning. Delivery authority for main/production is requested separately; implementation/testing can proceed locally. No per-step design question is needed within these boundaries.

| Module | Responsibility | Depends on |
|---|---|---|
| table-layout-memory | Device-local hidden columns/widths with validated schemas and reset | — |
| quick-view-navigation | Previous/next among current loaded filtered responses by concrete ID | — |
| logo-input-feedback | Inline syntax/loading/failure/success feedback and explicit retry | — |
| audit-day-groups | Vietnam-date groups with collapse, honest loaded counts and issue indicator | — |
| archive-status-filter | Explicit open/closed/unknown status with filter/return context | — |

Build order: table-layout-memory → quick-view-navigation → logo-input-feedback → audit-day-groups → archive-status-filter → regression → authorized release.

No new dependency, backend/API, OAuth, secret or live business-data mutation. Preserve semantic branding, complete mobile data, confirmation/dirty/conflict guards and original record identity. Specs: SPEC-table-layout-memory.md, SPEC-quick-view-navigation.md, SPEC-logo-input-feedback.md, SPEC-audit-day-groups.md, SPEC-archive-status-filter.md. Plan/checklist: tasks/plan.md and tasks/todo.md.
