# Task workspaces — approved 2026-10-19

User approved all13 selections in five groups, autonomous specification/plan/verification, main/production and a read-only API/Apps Script extension for reconciliation.

| Module id | Responsibility | Depends on |
| --- | --- | --- |
| workspace-shell | Contextual title, tablet rail, More grid, task-oriented overview | Existing role/navigation |
| response-audit | Retained-filter response/history tabs, timeline, identity column | workspace-shell |
| ocr-media | Source filmstrip/current source controls, fullscreen tool rail | workspace-shell |
| viewer-help | Archive hierarchy, Viewer sign-in choices, help drawer | workspace-shell |
| reconciliation-read | Bounded verified pair reads and side-by-side presentation | Existing auth/matcher, workspace-shell |

Build in listed order; provider before consumer inside reconciliation-read. Specs: SPEC-<module-id>.md. Keep original API/GAS operations except the explicitly approved additive readonly comparison fields. No new dependencies, real Form/Sheet/OCR/session QA writes, automatic name matching or speculative reads.
