# Thiết kế: giao diện quản trị theo tuần (phương án C)

Ngày 18/11/2026 · Trạng thái: **chờ bạn duyệt** · Chưa có dòng code nào được viết.

## 1. Mục đích

Bạn muốn làm lại UI/UX của MealForm trên menutaythanh.vercel.app. Chín video của Charles Liu (animation, chữ, thiết kế, "unslop") là tài liệu tham khảo. Bạn chọn **đổi cả bố cục** và chọn **phương án C**: chọn tuần một lần ở trên cùng, rồi làm việc ngay trong các tab áp dụng cho tuần đó. Thanh bên bị bỏ.

Bạn chưa nói rõ điều gì ở giao diện hiện tại làm bạn muốn đổi. Sáu vấn đề dưới đây là nhận định của tôi từ code và ảnh chụp trong `mealform-preview/review/`, không phải lời của bạn:

1. Trang Tổng quan là một cột dài toàn chữ; hai nhóm chỉ chứa nút "Mở …" lặp lại thanh bên.
2. Không có nút chính nổi rõ; gần như mọi nút viền giống nhau.
3. Thông tin quan trọng nhất (tuần này mở hay đóng, hạn đăng ký, số lượt) nằm trong thẻ, sau cả khối nút.
4. Đầu trang có email, nhãn vai trò, "Hướng dẫn mục này", "Thông báo phiên này" chiếm chỗ trước nội dung.
5. Trang xem thực đơn: ba ô lọc và bốn nút chiếm gần nửa màn hình trước khi thấy món.
6. Dòng "Kho tuần cũ" có các liên kết xếp lệch nhau.

**Thành công nghĩa là** nhân viên mở `/dashboard` và thấy ngay tuần đang làm cùng việc thường làm nhất, chọn tuần một lần, và không phải học lại cách làm các việc quan trọng (xác nhận, xóa, khôi phục, tạo tuần).

## 2. Mục tiêu, không phải mục tiêu, phản mục tiêu

**Mục tiêu**
1. `/dashboard` mở thẳng tab **Lượt gửi & lịch sử** của tuần đang chọn; không còn trang Tổng quan riêng.
2. Một thanh tuần dùng chung cho bốn tab: Lượt gửi & lịch sử, Điều khiển Form, Thông báo tuần, Đối soát.
3. Mỗi màn hình có đúng một nút chính nổi rõ; bỏ nhãn và nút lặp.
4. Điện thoại: thanh tab ở đáy, tuần ở trên cùng, không cuộn ngang ở 320px.
5. Lớp chuyển động, chữ và màu theo các quy tắc trong video (mục 5.5), tôn trọng "giảm chuyển động".
6. Không mất chức năng nào: bản đồ ở mục 5.2.

**Không phải mục tiêu**
- Đổi API, Apps Script (đang v82), HMAC, quyền, bước xác nhận hay dữ liệu.
- Thêm thư viện mới (dùng CSS thuần và `lucide-react` có sẵn).
- Màn hình Quét món (chỉ có ở nhánh thử), APK, Figma.

**Phản mục tiêu (nếu xảy ra thì coi như thất bại dù chạy được)**
- Đẹp hơn nhưng nhân viên chậm hơn: animation ở thao tác dùng liên tục, hoặc Form/Sheet bị giấu xa tầm tay.
- Mất một bước xác nhận, một dòng ghi lịch sử hay một cảnh báo an toàn.
- Màu cố định thay cho màu trường trong Cài đặt.
- Hỏng đường dẫn cũ, nút Back/Forward hay bộ lọc đã lưu.

## 3. Ràng buộc

- Giao diện tiếng Việt; màu chính lấy từ Cài đặt (`BrandingProvider`), không cố định.
- Giữ nguyên quyền owner/manager, mọi xác nhận, nháp OCR, Undo, các biện pháp an toàn danh tính lượt gửi (`PRODUCT.md`).
- Giữ các hỗ trợ tiếp cận đã làm: zoom 400%, chữ lớn, tương phản cao, bàn phím, trình đọc màn hình.
- Cơ sở mã là `origin/main` (commit `d012554`), **không** dùng nhánh quét mặt (55 commit chưa hợp nhất).
- Bản kiểm thử không ghi dữ liệu thật.
- Production chỉ nhận bản đã qua staging và được bạn duyệt bằng mắt.

## 4. Các cách dựng

| Cách | Nội dung | Được | Mất |
|---|---|---|---|
| **1. Thay lớp vỏ, giữ ruột (chọn)** | Viết lại `DashboardLayout.jsx` (thanh trên, thanh tuần, tab, menu ⚙); đưa `weekPicker()` lên lớp vỏ; bỏ `DashboardOverview`. Các panel và state trong `Dashboard.jsx` giữ nguyên. | `Dashboard.jsx` đã giữ một `weekKey` duy nhất và năm chỗ trong file đã tự gọi `weekPicker()`, nên đưa bộ chọn lên lớp vỏ là rẻ. Mọi guard (nháp, xác nhận, offline) giữ nguyên. | Phải sửa bộ kiểm thử bám vào lớp vỏ cũ. |
| 2. Viết lại cả cây thành phần | Mỗi tab một route mới, tách state. | Sạch hơn về lâu dài. | Đụng 921 dòng state có nhiều guard; rủi ro mất xác nhận hay nháp. |
| 3. Chỉ làm tinh CSS (phương án A) | Giữ cấu trúc. | An toàn nhất. | Bạn đã loại: bạn muốn đổi bố cục. |

Chọn **cách 1**.

## 5. Thiết kế

### 5.1 Khung giao diện

- **Thanh trên:** tên "Quản trị thực đơn" · bộ chọn tuần (tên tuần + nhãn trạng thái Đang mở/Đã đóng + hạn) · nút chính **＋ Tạo tuần** (chỉ khi có quyền tạo) · nút **⚙**.
- **Hàng tab** (PC: dưới thanh trên; điện thoại: ở đáy). Nhãn ngắn trên điện thoại ("Lượt gửi"). Số đếm cảnh báo hiện trên tab (dữ liệu `warnings` đã có).
- **Bộ chọn tuần:** PC là menu thả; điện thoại là bảng trượt từ dưới. Liệt kê tuần này, tuần sau, tuần cũ, mỗi dòng có trạng thái và số lượt; tuần chưa có thực đơn hiện "Chưa có thực đơn" kèm nút Tạo.
- **Nút ⋯ cạnh thanh tuần:** Mở Form · Mở Sheet · Mở thư mục của tuần đang chọn.
- **Menu ⚙:** thông tin tài khoản (email, vai trò, quyền), tùy chọn hiển thị, Hướng dẫn mục này, Thông báo phiên này, Cài MealForm, Phiên đăng nhập, Mở trang xem thực đơn, Đăng xuất; với owner có thêm **Thương hiệu, Hệ thống, Quyền Gmail**. Trong Dashboard, menu "…" hiện có (`DisplayPreferencesSlot`) được gộp vào đây; trang xem thực đơn vẫn giữ menu "…" của nó.
- Điểm gãy giữ như hiện nay: 700px và 1100px.
- Điều hướng dùng thẻ `<nav>` + `aria-current` như hiện nay, không dùng vai trò ARIA tab, vì mỗi tab đổi URL.

### 5.2 Bản đồ chức năng: chức năng hiện có nằm ở đâu

| Hiện có | Vị trí mới |
|---|---|
| Sổ tuần (tuần này/sau/cũ, trạng thái, số lượt) | Bộ chọn tuần |
| Liên kết Form, Sheet, Thư mục của từng tuần | Nút ⋯ cạnh thanh tuần (cho tuần đang chọn) |
| "Xem lượt gửi", "Điều khiển Form" cho từng tuần | Chọn tuần rồi bấm tab tương ứng |
| Các nút "Mở …" ở Tổng quan | Bỏ (trùng với tab) |
| "Chuẩn bị thực đơn / Mở tạo tuần" | Nút ＋ Tạo tuần |
| "Cần xử lý" (`LoadedAttention`) | Số đếm trên tab; nội dung đầy đủ, kể cả câu "chưa kiểm tra không đồng nghĩa với không có lỗi", đặt ở đầu tab Đối soát (và Hệ thống) |
| Email, vai trò, quyền | Đầu menu ⚙ |
| Hướng dẫn mục này, Thông báo phiên này | Menu ⚙ (giữ số đếm) |
| Tải lại sổ tuần | Mục "Tải lại danh sách tuần" trong bộ chọn tuần |
| Tuần chưa có thực đơn | Hàng "Chưa có thực đơn" + nút Tạo; tab Lượt gửi hiện trạng thái trống có nút Tạo |
| Thanh nháp, Đọc thực đơn, Hoàn tác, mọi thứ trong Tạo tuần | Giữ nguyên bên trong trang Tạo tuần (mở bằng ＋) |
| Quét món | Ngoài phạm vi (chỉ có ở nhánh thử); khi hợp nhất sẽ cần một chỗ trong menu ⚙ |

### 5.3 Vai trò

- **Owner:** bốn tab (Lượt gửi & lịch sử, Điều khiển Form, Thông báo tuần, Đối soát), ＋ Tạo tuần nếu có quyền tạo, ⚙ có Thương hiệu, Hệ thống, Quyền Gmail.
- **Manager:** hai tab (Lượt gửi & lịch sử, Đối soát), ＋ nếu có quyền tạo, ⚙ chỉ có mục chung.
- Cách tính quyền giữ nguyên (`allowedDashboardSections`, `permissions`); chỉ đổi nơi hiển thị.

### 5.4 Điều hướng và đường dẫn

- Giữ `/dashboard?tab=<id>&week=<key>`; các id tab (`delete`, `form`, `notice`, `reconcile`, `create`, `branding`, `health`, `access`) giữ nguyên.
- `?tab=overview` hoặc không có tab tự chuyển sang `delete` (thay thế mục lịch sử, không thêm mục).
- Back/Forward theo tab và tuần vẫn hoạt động; đổi tuần giữ nguyên tab.
- Trang xem thực đơn `/newest`, `/next`, `/history` giữ là trang riêng, dùng cùng thanh chọn tuần và cùng kiểu thẻ.

### 5.5 Lớp quy tắc từ video

**Áp dụng**
- Nút nhấn thu nhỏ nhẹ (khoảng 0.97, ease-out 150ms); xuất hiện từ scale 0.97 và độ mờ 0, không từ 0; chỉ animate `transform`/`opacity`.
- Bộ chọn tuần, menu, bảng trượt: ease-out, 150–250ms.
- Lỗi nhập: rung ngắn kèm đổi màu; báo lỗi sau khi nhập xong, không báo khi đang gõ.
- Tooltip: chỉ trễ lần đầu. Chuyển giao diện sáng/tối: tắt transition trong lúc đổi.
- Chữ: giữ chiều rộng tab khi in đậm (đỡ giật), gạch chân tránh chân chữ, cắt tên tệp ở giữa (vẫn đọc được tên đầy đủ), tiêu đề thẻ tối đa 2 dòng, dấu nháy cong, `text-box-trim` như cải tiến tùy chọn.
- Thiết kế: viền trong suốt thay màu đặc, bo góc lồng nhau, mờ dần mép thanh tab cuộn ngang, `100dvh`, nền tối dùng bề mặt sáng hơn thay cho bóng đổ.
- "Unslop": bỏ nhãn và huy hiệu thừa, nhóm bằng khoảng cách thay vì thẻ lồng, một nút chính mỗi màn.
- Luật UX: vùng bấm lớn trên điện thoại, ít lựa chọn cùng lúc, phản hồi trong 400ms (skeleton, `ElapsedWait` có sẵn), tab và thao tác lặp hằng ngày **ít hoặc không animation**.

**Không áp dụng**
- `hyphens: auto` với `lang="en"` (giao diện tiếng Việt), chữ thường nhỏ cho từ viết tắt, chuyển đổi icon có làm mờ.
- Bảng màu OKLCH nằm ở **giai đoạn 3, tùy chọn** (xem 5.7), vì chạm vào các kiểm tra tương phản thương hiệu.
- Mọi animation bị tắt khi hệ điều hành bật "giảm chuyển động".

### 5.6 Trang xem thực đơn

Đặt ô tìm tên và nút "Bộ lọc" gọn ở trên, hiện món và tổng hợp lựa chọn trước; các bộ lọc nâng cao thu vào bảng. Dòng "Kho tuần cũ" sắp lại thành một hàng thẻ rõ ràng. Không đổi dữ liệu, bộ lọc hay thứ tự hiện có.

### 5.7 Giai đoạn

1. **Vỏ + nền chuyển động:** thanh trên, tuần, tab, ⚙, chuyển hướng `overview`, bản điện thoại, hiệu ứng nhấn/xuất hiện. **Bạn duyệt staging lần 1.**
2. **Từng tab + trang xem:** áp quy tắc chữ/thiết kế, trạng thái trống, lỗi, tải. **Bạn duyệt staging lần 2.**
3. **(Tùy chọn) màu OKLCH từ màu Cài đặt:** chỉ làm nếu giữ được các kiểm tra tương phản; cần bạn đồng ý riêng.

## 6. Kiểm thử và nghiệm thu

- Bộ kiểm thử hiện có vẫn phải đạt: 80 tệp `*.test.mjs` và `mealform-preview/tests/ui/*.spec.ts`; chỉ sửa kiểm thử bám vào lớp vỏ cũ (`production-ui.spec.ts`, `ProductionUI.stories.tsx`), ghi rõ lý do.
- Thêm kiểm thử mới: tập tab theo vai trò; `?tab=overview` chuyển đúng; Back/Forward; đổi tuần giữ tab; bàn phím (Esc đóng bảng, trả focus); giảm chuyển động.
- Kiểm tra giao diện: sáng/tối, PC 1440×900, 1024, 768, điện thoại 390×844 và 320×568, chữ lớn, zoom 400%, màn hình ngang thấp, màu cưỡng bức; không cuộn ngang.
- Build: `npm test`, `npm run build` (meal-viewer), TypeScript/Vite/Storybook (mealform-preview).
- Website thật chỉ đọc, không ghi dữ liệu thật. Giới hạn ghi rõ: chưa chứng nhận trên điện thoại vật lý, trình đọc màn hình hay Chromatic cloud, như các lần trước.

## 7. Phát hành

- Nhánh mới tách từ `origin/main` (tên dự kiến `ui/week-first-shell-2026-11-18`), commit bản thiết kế này vào đó, mở PR vào `main`.
- Staging là bản Vercel build ở môi trường production nhưng **không gán tên miền**; bạn xem và duyệt bằng mắt.
- Chỉ sau khi bạn nói rõ "lên production", mới đưa đúng bản đã kiểm tra lên `menutaythanh.vercel.app` (không build lại).
- Cần bạn duyệt lại quyền Vercel cho team trước bước staging (liên kết cũ đã hết hạn; tôi tạo link mới khi tới bước đó).

## 8. Để người dựng quyết

Kích thước và khoảng cách cụ thể, thời lượng chính xác trong khoảng đã nêu, chọn biểu tượng `lucide-react`, tên lớp CSS, cách chia tệp CSS (tránh thêm tệp CSS rời nếu gộp được vào `production-ui.css`), thứ tự sửa kiểm thử.

## 9. Những điều tôi tự quyết (bạn kiểm tra)

1. Bỏ hẳn trang Tổng quan; chức năng chuyển theo bảng ở 5.2.
2. Tab ở đáy trên điện thoại, tuần ở trên cùng.
3. Liên kết Form/Sheet/Thư mục đặt ở nút ⋯ cạnh thanh tuần, không để trong bộ chọn tuần.
4. Trang xem thực đơn được làm lại trong cùng dự án (giai đoạn 2).
5. Màu OKLCH tách thành giai đoạn tùy chọn.
6. Làm theo hai lần duyệt staging (sau giai đoạn 1 và sau giai đoạn 2).
7. Chọn cách 1 (thay vỏ, giữ ruột) thay vì viết lại.
