# Grouped toolbars

## Objective / success
Responses toolbar DOM order is context/week, search/filter, reload/actions. Related controls form min-width-zero groups; groups stack together on mobile, no CSS visual reordering that contradicts keyboard order. Archive groups context, month/status and view/reload. Viewer keeps navigation/context then filters then action row, including contextual empty state.
## Commands / structure / style
Reuse SPEC-layout-foundations.md commands/boundaries. Dashboard.jsx, HistoryArchive.jsx and task-layout.css; reuse existing handlers/refs and filters. Example <div role="group" aria-label="Tìm và lọc lượt gửi">…</div>.
## Verification
Test group order and narrow bounds at 320/390/900/1440, long labels/large text. Search composition, selection, applied filter state, reload gating and pending reads must remain unchanged; no added automatic calls.
