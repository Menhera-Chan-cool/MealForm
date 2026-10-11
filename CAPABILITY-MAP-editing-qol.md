# Approved editing and mobile QoL (2026-10-11)

| Module id | Responsibility | Depends on |
|---|---|---|
| holiday-days | Ngày không phục vụ | Existing UI/backend |
| ocr-undo | Hoàn tác và làm lại | holiday-days |
| existing-week-warning | Cảnh báo tuần đã có | Existing UI/backend |
| mobile-toolbar | Thanh công cụ mục lượt gửi | Existing UI/backend |
| safe-error-report | Sao chép báo lỗi | Existing UI/backend |

Build order: holiday-days -> ocr-undo -> existing-week-warning -> mobile-toolbar -> safe-error-report.
User approved the whole scope and continuous implementation. No live weekly Form changes or paid OCR runs for testing. Deploy backend before web; synchronize clean template/README/GitHub.
