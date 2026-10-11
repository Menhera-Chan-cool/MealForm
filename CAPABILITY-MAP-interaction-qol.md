# Approved Dashboard interaction QoL (2026-10-11)

| Module id | Responsibility | Depends on |
|---|---|---|
| response-cards | Thẻ mobile và nhãn ngày | Existing dashboard/models |
| accent-search | Tìm không dấu | Existing dashboard/models |
| monday-fill | Chọn thứ Hai | Existing dashboard/models |
| week-search | Tìm tuần | accent-search |
| table-density | Bảng gọn/rộng | Existing dashboard/models |
| new-response-highlight | Tô lượt mới | Existing dashboard/models |
| response-quick-view | Xem nhanh | response-cards |
| dashboard-view-state | Nhớ vị trí | response-cards, table-density |

Build: accent-search + response-cards -> monday-fill + week-search -> table-density + new-response-highlight + response-quick-view -> dashboard-view-state.
User approved all eight modules and continuous implementation/deployment. No actual student-response mutations, new credentials, dependencies or permissions. Preserve all current features and clean-template configuration.
