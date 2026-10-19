# Task layouts — approved 2026-10-19

User approved all eight selected layout ideas, four groups, autonomous specs/plan/testing and GitHub main/production.

| Module | Responsibility | Depends on |
| --- | --- | --- |
| layout-foundations | Task-based width, flat inner sections | — |
| settings-layout | Explanation/control columns, linear fields, page contents | layout-foundations |
| grouped-toolbars | Context → search/filter → actions; whole-group reflow | layout-foundations |
| archive-workspace | Desktop list/detail, mobile separate page/return state, contextual empty | layout-foundations, grouped-toolbars |

Build order as listed. All are frontend only; no API/GAS/schema/auth or dependency change. Preserve draft/Undo/dirty guards, concrete-record identity, readonly failures, dates and theme/comfort. Do not restore retired focus mode or day strip.
