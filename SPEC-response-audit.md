# Responses and audit

## Objective / acceptance
Shared selected week above two accessible tabs, Lượt gửi and Lịch sử; both panels keep mounted state/filters, hidden inactive content not focusable. Switching tabs performs no extra request; paging/reads remain explicit/existing. Response name and full timestamp share one identity column on PC; copyable and original record identity unchanged. Apply display-only identity grouping to registered Viewer where timestamp/name are identifiable; keep unknown source fields and all mobile information.
History becomes grouped chronological ol/articles, narrow time column on PC and stacked on mobile. Preserve event actor/action filter shortcuts, note/search, day-fold, errors, paging, restore eligibility and separate confirmation. Retire history table width/order/expansion controls (no longer apply), not its data/filters/restore protections. Table preferences remain available for remaining real tables; do not delete stored layouts.
## Structure / style
Dashboard.jsx, DetailTable/App presentation, timeline component, shared view helpers/CSS. Reuse existing filters, callbacks, FriendlyTime, RowActionMenu and validation. No Sheet header changes. Prefer CSS/subcomponents to duplicate controllers.
## Commands / testing
Same commands as SPEC-workspace-shell.md. Test tab keyboard/focus/state/no new requests, name/time readability/copy and identity-scoped deletion, paged history/restore/cancel, legacy table preferences vs new presentation. Revise retired history-table assertions to the equivalent timeline protections; no hidden fake table for tests.
## Boundaries
Always retain live verification before write and same-name identities. Ask before persistence schema/dependency changes. Never use display filtering or merged identity text to identify records.
