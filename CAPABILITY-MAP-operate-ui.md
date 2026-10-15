# Capability map: selected UI improvements, 15/10/2026

User-approved boundaries are exactly ideas 1, 2, 4, 6 and 7. The user explicitly requests implementation, merge to main and production; prior project instructions delegate detailed planning without separate step approvals. Preserve the incumbent Operate design, APIs, permissions and identities.

| Module | User-approved responsibility | Depends on |
|---|---|---|
| field-help | Explicit, keyboard/touch-accessible help at important fields | — |
| sidebar-collapse | PC icon rail with accessible labels and real focus/hover hints | — |
| table-columns | PC display-only column choices for viewer, submissions, history | — |
| filter-recovery | Honest empty states and clearing one criterion without changing others | — |
| notice-preview | Local draft preview using actual notice presentation and current branding | field-help |

Build order: field-help → sidebar-collapse → table-columns → filter-recovery → notice-preview → integration/tests → exact-artifact release.

Assumptions: sidebar/column choices are in-memory for this page visit; no new server preferences or cross-device sync. All columns remain available on mobile. Required identity/context/action columns cannot be hidden; archive calendars are not data tables. Draft preview never saves or publishes. The user may correct these assumptions while implementation proceeds.

Specs: SPEC-field-help.md, SPEC-sidebar-collapse.md, SPEC-table-columns.md, SPEC-filter-recovery.md, SPEC-notice-preview.md. Plan/tasks: tasks/plan.md and tasks/todo.md.
