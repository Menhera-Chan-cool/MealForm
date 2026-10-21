# Reading layouts — approved 2026-10-21

User approved all17 items in six groups, autonomous specs/planning/implementation/verification and GitHub main/production. Frontend only; no API/GAS or live-data mutation QA.

| Module id | Responsibility | Depends on |
|---|---|---|
| week-reading | Compact old-week rows; current/next stay prominent | Existing app contracts |
| ocr-matrix | Wide editor has Date / Meal1 / Meal2 / Meal3 columns on a shared grid | Existing app contracts |
| settings-preview | Notice editor PC content-left/preview-right, mobile Content/Display accessible tabs; hidden pane remains mounted, validation reveals content | Existing app contracts |
| system-controls | Form summary week/status/links precedes existing guarded actions; no false deadline | Existing app contracts |
| attention-navigation | Attention popover needs-attention/viewed groups reflect actual in-memory events only, no fabricated history | Existing app contracts |
| confirmation-scope | PC explanation left / exact affected object right; mobile object first | Existing app contracts |

Build order: week-reading → ocr-matrix → settings-preview → system-controls → attention-navigation → confirmation-scope. These modules do not depend on each other; shared controls remain the boundary. Each SPEC-reading-<module>.md is authoritative for this approved scope. No new dependencies, Figma writes or paid cloud services.
