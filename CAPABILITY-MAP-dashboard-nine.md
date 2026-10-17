# Dashboard nine controls

User selected all nine UI improvements and confirmed GitHub/main + production delivery on 2026-10-17. Seven boundaries proposed in chat; repeated proceed/release instruction accepted for this exact scope. No additional design approval required.

| Module | Responsibility | Depends on |
|---|---|---|
| access-draft | Stage each Gmail permission change locally; show exact additions/removals | Existing shared infrastructure |
| column-config-tabs | Split the shared ColumnChooser into accessible Show/Hide, Order, Width tabs | Existing shared infrastructure |
| image-replace-status | Replace exactly one image after whole candidate-set count/type/size/decode validation; preserve other entries, replaced label, menu, Undo and active image selection | Existing shared infrastructure |
| device-data | Owner System panel exposes OCR draft for current account, Dashboard snapshots for current account, and origin table layout preferences separately | Existing shared infrastructure |
| submission-search-controls | Add contains/exact full-name display-only matching and send-time presets Today/Yesterday/custom local datetime (Vietnam UTC+7) | Existing shared infrastructure |
| system-connection-map | Read-only semantic Web -> Apps Script -> Form/Sheet with OCR branch | Existing shared infrastructure |
| audit-filter-shortcuts | Actor/action event buttons call existing audit filters preserving date/note/error selections, reset history pagination, preserve input focus semantics, never mutate event/data | Existing shared infrastructure |

Build order: access-draft -> column-config-tabs -> image-replace-status -> device-data -> submission-search-controls -> system-connection-map -> audit-filter-shortcuts -> integration/release.

No new dependency, API action, GAS scope, live-data QA mutation, or login window. Production is promoted only after fixed-source regression and immutable-artifact tests.
