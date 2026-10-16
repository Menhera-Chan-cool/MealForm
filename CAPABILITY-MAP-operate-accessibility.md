# Capability map: complete Operate/accessibility bundle

User approved all 30 selected items, six groups, autonomous detailed specification/plan/implementation, GitHub/main and production on 2026-10-16. No further preview approval gate. Numbered requirements follow their exact order in the user message, including #4 removal of the reviewed-day control.

| Module | Review group | Requirements | Depends on |
| --- | --- | --- | --- |
| responsive-accessibility | Responsive foundations | 6, 12, 21, 22, 23 | — |
| interaction-safety | Shared safe interactions | 3, 7, 8, 10, 13, 14, 18, 24, 30 | responsive-accessibility |
| input-and-status | Field and result feedback | 9, 11, 15, 16, 25, 29 | interaction-safety |
| ocr-workspace | Image/OCR review and completion | 1, 2, 4, 17, 20, 26, 27 | input-and-status, responsive-accessibility |
| settings-workflow | Save/discard forms | 5 | input-and-status, interaction-safety |
| navigation-context | Dashboard history and archive visited states | 19, 28 | settings-workflow, ocr-workspace |

Build order: responsive-accessibility → interaction-safety → input-and-status → ocr-workspace/settings-workflow → navigation-context. Preserve APIs/GAS, exact record identity, auth, confirmations, date/meal checks, source images and account-scoped drafts. No new dependency, live owner mutations, visible browser windows or paid OCR during QA.
