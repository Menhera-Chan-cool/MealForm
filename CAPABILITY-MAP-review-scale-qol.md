# Capability Map: Review and scale QoL

Scope approved by the user on 12/10/2026; continuous implementation and verification authorized.

| Module id | Responsibility | Depends on |
|---|---|---|
| account-badge | Authenticated Gmail, owner/admin/read-only role and effective capability labels; never public viewer data | — |
| audit-filters | Selected-week history by administrator, action, Vietnam date range and notes; incomplete/error-only toggle | — |
| response-batches | First 50 responses, explicit load-more; server-side global search/sort, bounded payloads and fewer redundant service calls; preserve current identity/auth/scroll guards | account-badge |
| region-ocr | Select target day/meal and image region on desktop/mobile; authorized cropped-image OCR, editable before/after preview, explicit replace as one Undo; no automatic Form/Sheet edit | — |
| version-notice | Detect newer web build without automatic refresh; explicit update flushes current OCR draft and waits for success, storage failure prevents reload | region-ocr |

Build order: account-badge -> audit-filters + response-batches -> region-ocr -> version-notice -> integration/regression/readonly deployment checks.

Assumptions to approve: history is scoped to the selected week, dates use Vietnam time, 50 responses per batch, filters/search/sort cover all relevant server data rather than only loaded rows; Gmail comes only from the verified session; each region OCR requires an explicit button and may use paid provider quota; the existing local-only draft model stays unchanged; no new external services or dependencies. No automatic repairs, deletions, submissions, name merging or content changes to existing weekly Forms/Sheets.
