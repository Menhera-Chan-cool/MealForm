# MealForm — preview UI riêng

Không kết nối Apps Script, Vercel production, đăng nhập thật hay dữ liệu học sinh. Không tạo/xóa Form hoặc Sheet. Mọi lượt, tài khoản và ngày trong preview đều là dữ liệu minh họa cố định để ảnh kiểm thử không đổi theo thời gian.

## Mở xem

Trong thư mục này, dùng Node 24:

```powershell
npm --prefix ../meal-viewer ci
npm ci
npm run dev
```

Preview tương tác: http://127.0.0.1:5174

Mở terminal thứ hai:

```powershell
npm run storybook
```

Storybook: http://127.0.0.1:6006. Chọn **MealForm → Viewer**, **Dashboard** hoặc **Components**. Có 45 stories: 19 viewer,12 admin/component và14 dùng component production thật. Stories mobile mở viewport390×960; toolbar viewport có thêm PC1440×960. Toolbar giao diện đổi sáng/tối, hoặc dùng nút “…” trong preview.

Tổng quan, Thêm, Lượt gửi và nhập ảnh là các bố cục có thể thử. Tìm/sắp xếp tên giả và Xem nhanh chạy cục bộ. Các công cụ còn lại chỉ mở trang ghi rõ “Bản xem bố cục”; các nút liên kết/thao tác báo mô phỏng thay vì truy cập dữ liệu thật. Chọn/kéo ảnh chỉ hiện tên file, không OCR hay upload.

## Figma và Tokens Studio Free

[File Figma chỉnh sửa được](https://www.figma.com/design/9gbz6BuArX7kyBTlbKMzuR) có 6 màn, native variables và component variants. Tab **Design** trong Storybook liên kết tới node tương ứng. Preview dùng link thay cho embed: lần kiểm tra bằng profile tạm, Figma embed trả 403 vì quyền/tài khoản; không đổi quyền chia sẻ thành công khai. Mở link trong trình duyệt đã đăng nhập để đối chiếu. Chỉ đổi `type: 'link'` thành `type: 'figma'` trong story nếu bạn đã kiểm tra quyền embed phù hợp.

Font preview là Noto Sans tự host, hỗ trợ tiếng Việt. Segoe UI/Arial không có trong renderer Figma được kết nối; font web thật không bị đổi. Component Figma là các thành phần cục bộ theo vocabulary shadcn, không phải kit chính thức được import. Code preview dùng source Button, Card, Badge, Sheet, DropdownMenu từ shadcn CLI 4.21.4; shell/sidebar/bottom navigation được dựng riêng cho MealForm. Sheet được chỉnh nút đóng sang tiếng Việt và vùng bấm 44px.

1. Trong Figma, mở plugin Tokens Studio bản Free.
2. Import file `../meal-viewer/design/tokens.json` bằng chức năng JSON import của plugin. Có 4 Token Sets: primitives, shared, light, dark; không có Pro Themes, không cần sync trả phí.
3. Chỉnh token hoặc export JSON rồi thay đúng file này trên máy. Plugin không được chạy hộ qua MCP; native variables trong Figma và JSON đã được chuẩn bị riêng. Không có đồng bộ tự động hai chiều Figma ↔ code.
4. Chạy `npm run tokens`, hoặc khởi động lại `dev`/`storybook`. Khi đang chạy server, JSON không được watch tự động: chạy lại `npm run tokens` sau mỗi lần sửa.

## Style Dictionary → CSS / Tailwind v4

Nguồn duy nhất: `../meal-viewer/design/tokens.json`. `scripts/build-tokens.mjs` dùng Style Dictionary 5 + `@tokens-studio/sd-transforms` để bỏ lớp Token Set, giải alias và thêm đơn vị.

Sinh ra:

- `src/generated/variables.css`: biến `--token-*` có namespace riêng, không đụng biến Tailwind.
- `src/generated/tailwind.css`: mapping light/dark và `@theme inline` theo vocabulary shadcn/ui, như `bg-primary`, `bg-card`, `text-foreground`, `rounded-lg`.

Không sửa tay file sinh ra. Màu chủ đạo mẫu `#357185` lấy từ Settings đã được kiểm tra lúc dựng thiết kế; preview không đọc Settings production trực tiếp. Đổi `primitives.brand.primary` và `hover` để thử thương hiệu khác. Các neutral light/dark là token riêng, không tự đổi sắc độ theo primary. Pipeline dừng nếu alias thiếu hoặc vòng lặp, thay vì xuất CSS hỏng.

## Chromatic — chuẩn bị, chưa upload

Chromatic so sánh Storybook với **baseline Storybook đã được duyệt**, không tự dùng ảnh Figma làm baseline và không tự sửa code. Figma là tài liệu đối chiếu cạnh nhau. Xem [visual tests](https://www.chromatic.com/docs/visual/) và [Figma integration](https://www.chromatic.com/docs/figma-in-chromatic/).

Đã cài CLI và cấu hình opt-in. `npm run chromatic` từ chối khi thiếu token; không tự chấp nhận thay đổi hay che lỗi bằng exit 0. Chưa tạo project/cloud baseline, chưa upload, chưa chạy CI. Thư mục hiện chưa ở Git; trước lần chạy cloud cần đặt preview vào repository riêng/nhánh được duyệt với commit hợp lệ, không commit `.env` hay dữ liệu thật.

Sau khi bạn tự tạo project Chromatic, đặt `CHROMATIC_PROJECT_TOKEN` bằng môi trường riêng hoặc secret của CI; không ghi khóa trong config, README hay chat. Sau đó chạy `npm run chromatic` từ thư mục này. Script không tự đọc `.env`. Đừng dùng tên bắt đầu `VITE_` cho token vì đó là biến phía trình duyệt.

Lần đầu là baseline cần bạn duyệt. Những lần sau xét diff rồi chấp nhận hoặc sửa và chạy lại. Đã đặt `diffThreshold: 0` để nhạy với thay đổi; không phải lời đảm bảo mọi sai khác 1px đều tương ứng lỗi thiết kế. Font/anti-aliasing có thể tạo nhiễu. Free hiện có 5.000 billed snapshots/tháng và Chrome theo [bảng giá chính thức](https://www.chromatic.com/pricing); không bật trình duyệt trả phí hay nâng gói.

## Kiểm thử

```powershell
npm test
npm run test:ui
npm run build
npm run build-storybook
```

UI tests dùng Chrome cài sẵn, profile tạm riêng; không mở profile tài khoản của bạn. Token tests kiểm tra alias, đổi màu, tính ổn định và dữ liệu lỗi. Không có script deploy. Storybook bundle có cảnh báo chunk lớn của công cụ preview; không được đưa vào bundle production.

## Giới hạn đối chiếu

Lần dựng admin trước gặp quota Starter, nên chưa đối chiếu được ảnh cuối của file admin. Viewer mới dùng MCP trực tiếp đã đọc lại cấu trúc và chụp ảnh được. Cả hai preview **không được chứng nhận khớp pixel**. Các công cụ admin ngoài story vẫn là placeholder có nhãn rõ. Chỉ chuyển sang implementation production sau khi bạn duyệt.

## Viewer tuần — tài khoản bituan25

[Figma viewer chỉnh sửa được](https://www.figma.com/design/W0eib9OIk99Ia0fweyf09e?node-id=12-2345), gồm22 màn/trạng thái PC/mobile, sáng/tối và thư viện component. File mới được tạo theo yêu cầu bằng tài khoản bituan25@gmail.com; không sửa file bi774733 cũ, không thay quyền Share.

[Preview viewer](http://127.0.0.1:5174/viewer) · [Storybook viewer](http://127.0.0.1:6006/?path=/story/mealform-viewer--desktop-light).

Thử chuyển Tuần này/Tuần sau/Kho tuần cũ, lọc theo tên/ngày/món, Hôm nay, sắp xếp, mở Tổng hợp, Nâng cao và menu “…”. Preview dùng trực tiếp model lọc/sắp xếp và ComboSelect hiện có; không đổi tên, ghép hay sửa người. Escape chỉ đóng danh sách, không xóa từ khóa. Hôm nay giữ quy tắc xóa bộ lọc tên/món rồi chọn ngày theo lịch mẫu. Kho tuần lọc theo tháng bắt đầu tuần; tuần vượt tháng vẫn hiện đúng ngày.

Ngày mẫu cố định12–16/10/2026 và Hôm nay13/10 để ảnh kiểm thử ổn định, **không thay quy tắc thời gian thực production**. Tuần mẫu tiếp theo19–23/10. Người và lượt gửi đều giả. Chọn món, đăng nhập, tải lại và mở Sheet chỉ báo mô phỏng, không gọi dịch vụ. `nextRegistration` là kịch bản mẫu, không tự kiểm tra trạng thái Form thật. Các nút/điều kiện thật sẽ được giữ khi triển khai sau duyệt.

Source mới nằm trong `src/ViewerPreview.tsx`, `src/viewer-preview.css`, `src/ViewerPreview.stories.tsx`. Test browser tự khởi động Vite và Storybook trên localhost nếu chưa có; dùng1 worker để tránh thiếu tài nguyên Chrome trên Windows. Ảnh kiểm tra nằm trong `review/viewer`. Noto Sans và các dependency vẫn chỉ ở preview, chưa được đưa vào web thật.


## Component production — 14/10/2026

Nhóm **MealForm → Production UI** dùng component từ frontend thật: đủ9 mục Dashboard và bảng/thẻ viewer. API được thay bằng fixture development, không gọi dịch vụ thật; thao tác ghi trong Storybook bị từ chối. Preview mẫu cũ vẫn giữ để đối chiếu thiết kế. Token JSON và compiler nay có một nguồn chung trong `../meal-viewer/design/tokens.json` và `../meal-viewer/scripts/build-tokens.mjs`.

Bản cải tiến UI đang chờ duyệt staging bổ sung tab Tổng hợp/Chi tiết mobile, thẻ có tên ở đầu, ghim cột Họ tên PC, tìm tuần phân nhóm, kho Lịch tháng/Danh sách, tiến trình OCR, menu thao tác từng lượt, xem trước thương hiệu và khung chờ lần đầu. Chủ dự án đã bỏ ý tưởng thanh chọn ngày; bộ lọc Ngày và nút Hôm nay cũ vẫn giữ. Có thêm stories Archive, Initial Loading và OCR Review. Khung thương hiệu là minh họa read-only theo ngữ cảnh/thiết bị/sáng-tối, không nhúng controller có quyền và không phải bản mô phỏng đúng từng pixel.

Kiểm tra frontend thật bằng `npx playwright test --config playwright.production.config.ts`. Bộ kiểm tra tự mở Vite frontend tại5175 và chặn API bằng dữ liệu giả, không dùng controller mô phỏng. Chưa được xem là kiểm thử ghi dữ liệu thật hoặc phát hành production.

Bundle UI clarity 13 mục tiếp tục dùng component thật cho sheet bộ lọc, tô từ khóa, nhãn tiếng Việt, kho tuần/ngữ cảnh, thông báo và trạng thái chưa lưu. Prototype viewer cũ chỉ được cập nhật tương thích các shared controls, không được coi là bản sao đủ tính năng production. Lần phát hành này không tạo preview/cloud baseline hay đồng bộ Figma; các build/kiểm thử local vẫn chạy để tránh làm hỏng bộ công cụ hiện có.
