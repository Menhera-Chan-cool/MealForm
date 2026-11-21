# Kiểm chứng giao diện quản trị theo tuần

Giai đoạn 1 của phương án C trên nhánh `ui/week-first-shell-2026-11-18`, đối chiếu với `d012554`. Các API, Apps Script và cấu trúc dữ liệu nằm ngoài thay đổi của nhánh.

## Hành vi đã rà soát

- Dashboard mở vào Lượt gửi & lịch sử. Đường dẫn `?tab=overview` được thay thế trong lịch sử, giữ tuần hợp lệ đã yêu cầu kể cả khi quyền truy cập về trước danh sách tuần.
- Bốn mục theo tuần dùng cùng một bộ chọn. Nút dấu ba chấm mở liên kết HTTPS của tuần đang chọn. Tài khoản, trợ giúp, thông báo phiên và công cụ của chủ sở hữu nằm trong menu cài đặt.
- Người quản lý có Lượt gửi & lịch sử và Đối soát. Các kiểm thử xác minh mục dành riêng cho chủ sở hữu không xuất hiện và đường dẫn truy cập trực tiếp quay về mục được phép.
- Hủy xác nhận khi đổi tuần hoặc mở Viewer giữ nguyên nháp thông báo. Khi rời Dashboard trong cùng tab, ứng dụng lưu bố cục và chờ nháp OCR ghi xong. Trang phân biệt trường chưa tạo tuần nào với trường hợp danh sách chưa tải được.
- Điện thoại có thanh tab dưới cùng, nhãn ngắn và bảng chọn tuần/cài đặt mở từ đáy. Escape đóng bảng và trả focus. Thanh tab nhường chỗ khi bàn phím ảo mở.
- Nút dùng hiệu ứng nhấn nhẹ, các tab thường dùng đổi tức thời. Khi đổi sáng/tối, CSS ngưng transition trong lúc đổi. Theo thiết kế §5.5, thiết lập giảm chuyển động của hệ điều hành thắng mức chuyển động đã lưu. Kiểm thử cũ được đổi kỳ vọng cho điểm này và vẫn kiểm tra điều hướng, trạng thái inert và Escape.

## Kiểm thử

| Phạm vi | Lệnh hoặc bằng chứng | Kết quả |
|---|---|---|
| Đường chuẩn đã ghi trong bàn giao | `npm test`, Playwright production | Node đạt. Lượt chạy lại đường chuẩn UI đạt 260/260 |
| Task 6 | Playwright production, sau đó chạy lại nhóm vỏ và hai bài về menu | Lượt đầu 272/273. Sau khi sửa menu tránh tự đóng vì sự kiện cuộn đến muộn, nhóm chạy lại đạt 15/15 |
| Task 7 | Playwright tập trung vào bố cục hẹp, bảng mở từ đáy và quyền | 6/6 ở lượt chạy lại |
| Task 8 | Playwright tập trung vào chuyển động và `node import-appearance.test.mjs` | 8/8 UI, Node đạt |
| Dọn vỏ cũ và rà soát | Playwright production, lượt đầu 282 bài | 277 đạt. Một bài cũ đọc cả nhãn desktop và mobile ẩn được sửa để kiểm cùng danh sách quyền. Bốn bài còn lại được kiểm lại trên lượt ổn định, sau khi hoàn thành các build chạy song song |
| Rà soát các đường dẫn và nháp | Playwright production, 283 bài | 282 đạt. Bài bảng chọn cột bị đóng khi thao tác trong lượt song song và đạt 4/4 khi chạy riêng. Bài được cập nhật để chờ dữ liệu và tín hiệu bảng đã mở trước khi bấm. Giữ nguyên các khẳng định về cột bắt buộc, danh tính, lịch sử và không ghi dữ liệu |
| Bản nghiệm thu | `node node_modules/@playwright/test/cli.js test --config playwright.production.config.ts --fully-parallel --workers=4 --timeout=90000 --retries=1` trong `mealform-preview` | **283/283 đạt** trong 3,1 phút. Không có bài phải chạy lại |
| Dashboard và Viewer | `cd meal-viewer && npm test && npm run build` | Đạt sau bản sửa từ review |
| Prototype và Storybook | `cd mealform-preview && npm test && npm run build && npm run build-storybook` | Đạt. Mở bằng Chrome cục bộ và kiểm tra tiêu đề ở tám story quản trị |

Rà soát độc lập theo năm trường hợp của kế hoạch phát hiện mất tuần khi danh sách tải muộn, đường dẫn Viewer cần dùng chung luồng lưu nháp và trạng thái tuần trống cần phân biệt lỗi tải. Bài tái hiện tuần tải muộn hỏng trước bản sửa và đạt sau khi sửa, gồm đổi tab, Back và Forward. Sổ tiến độ cục bộ ghi chi tiết từng task và chỉ nằm trong `.superpowers/sdd/2026-11-18-week-first-shell/`.

Bộ ảnh ở `mealform-preview/review/week-first-shell/` gồm sáng/tối ở 1440×900, 1024×768, 768×1024, 390×844 và 320×568. Có ảnh riêng chữ lớn, màu cưỡng bức và bố cục rộng 320 CSS px, tương đương màn 1280 px ở mức zoom 400%. Các lượt chụp kiểm tra không cuộn ngang. Bộ Playwright chạy trên máy chủ cục bộ với dữ liệu mẫu và kiểm tra thao tác ghi qua giả lập.

## Kiểm thử cũ được chuyển sang cấu trúc mới

| Kiểm thử trước | Phạm vi tương ứng |
|---|---|
| Hướng dẫn Tổng quan | Hướng dẫn Lượt gửi mặc định trong menu cài đặt |
| Tooltip thanh bên gọn | Menu liên kết tuần, bàn phím, trỏ chuột và focus trở về |
| Menu Thêm trên điện thoại | Menu cài đặt trên điện thoại, quyền và bố cục từng hàng |
| Thu gọn thanh bên trên PC | Thanh tuần và chiều rộng nội dung |
| Các nhóm tác vụ Tổng quan | Điều hướng theo quyền và trạng thái cảnh báo đã tải |
| Chín công cụ quản trị qua thanh bên | Tám công cụ qua tab, Tạo tuần và menu cài đặt |
| Thanh bên thu gọn trên tablet | Tên tuần dài ở 1024 px với tên đầy đủ trong tooltip |
| Điều hướng cũ trên mobile | Các mục của vỏ mới và quyền trong menu cài đặt |
| Chuyển động với mức Đầy đủ khi OS yêu cầu giảm | Tôn trọng OS, vẫn kiểm tra điều hướng và Escape |

Điểm dừng là kiểm chứng cục bộ giai đoạn 1. Chưa kiểm thử trên điện thoại vật lý, trình đọc màn hình hoặc Chromatic cloud. Ảnh zoom dùng chiều rộng bố cục tương đương. Worktree riêng và bản bàn giao gốc được giữ để tiếp tục sau bước duyệt.
