# Direct UI — selected 1, 3 (edge shadow only), 4, 8

User selected these four capabilities, delegated detailed project planning earlier, and explicitly approved GitHub/main plus production for this release. No further per-step approval is required.

| Module | Responsibility | Depends on |
|---|---|---|
| summary-drilldown | Select an exact day/meal from summary, show details, return to previous filters | — |
| table-edge-shadows | Only edge shadows when the actual table viewport has horizontal content remaining | — |
| ocr-error-jump | List actual validation issues and focus their editable fields | — |
| disabled-reasons | Accessible manual explanations beside blocked business actions; preserve original guards | — |

Build order: summary-drilldown → table-edge-shadows → ocr-error-jump → disabled-reasons → full tests → exact-artifact release.

Scope: existing frontend, runtime brand/light-dark/motion, original APIs, authorization and confirmations. No day strip, new dependency, guessed OCR correction, automatic writes, changed data matching or expanded public access. Specs are SPEC-summary-drilldown.md, SPEC-table-edge-shadows.md, SPEC-ocr-error-jump.md and SPEC-disabled-reasons.md. Plan/checklist: tasks/plan.md, tasks/todo.md.
