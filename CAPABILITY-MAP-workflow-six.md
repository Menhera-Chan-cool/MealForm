# Six workflow controls — 2026-10-17

User approved all six capabilities, autonomous specifications/planning/implementation/testing, GitHub/main and production, including scoped Apps Script verification changes.

| Module | Responsibility | Depends on |
|---|---|---|
| filter-recovery | For zero matches, compute each single-condition removal with the same matching rules and current loaded snapshot | — |
| draft-meal-order | Reorder slots within one serving day by a dedicated drag grip or Up/Down buttons | — |
| brand-contrast | Use actual light/dark branding theme pairs | — |
| brand-favicon | Use saved branding logo for a single managed favicon, no-referrer image check, local SVG fallback | — |
| column-order | Validated permutation of column indices in existing device-only bounded layout preferences, backward compatible | — |
| mutation-receipt | GAS emits additive structured per-store result with actual post-mutation verification, including partial/already-deleted/unknown/duplicate/read-failure | — |

Build order: filter-recovery → draft-meal-order → brand-contrast → brand-favicon → column-order → mutation-receipt → serial regression → GAS deployment → immutable Vercel artifact verification → merge/promotion → readonly smoke/docs.
