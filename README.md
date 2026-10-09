# MealForm

## Cập nhật ngày 09/10/2026

Mã backend đã đồng bộ đến Apps Script phiên bản 71, gồm điều khiển Form theo tuần, đối soát chỉ đọc và cấu hình thương hiệu. Các luồng phiên đăng nhập, OCR, lịch khóa, quyền và xóa/khôi phục vẫn được kiểm thử hồi quy. Repo này vẫn là bản template độc lập: người nhận tự điền cấu hình và deploy, không có khóa hoặc dữ liệu production trong mã.

Điều hướng dùng nút xanh đồng bộ trên điện thoại và máy tính. Kho tuần cũ ở `/history` yêu cầu đăng nhập; `/old` đã ngừng phục vụ thực đơn và chuyển hướng về kho tuần. Không xóa dữ liệu các tuần cũ.

## Tính năng mới trong bản này

- Chủ sở hữu điều khiển mở/đóng Form và hạn từng tuần, có xác nhận, kiểm tra trạng thái mới nhất và lịch sử; hạn tùy chỉnh không bị lịch thứ Hai ghi đè. Mở lại tuần quá hạn phải chọn hạn tương lai theo giờ Việt Nam.
- Đối soát Form–Sheet theo tuần: lượt chỉ ở một nơi hoặc ghép không duy nhất. Chỉ đọc, không tự sửa/xóa. Thao tác có toast nổi và trạng thái tại hàng đang xử lý.
- Thương hiệu: chủ đổi tên trường, URL ảnh logo HTTPS và màu chủ đạo. Chỉ cấu hình hiển thị được đọc công khai; không lưu hoặc công khai khóa. Chưa hỗ trợ upload logo.
- Ghi nhớ đăng nhập 30 ngày bằng cookie HttpOnly/Secure; tự gia hạn khi quay lại hoặc mở lại tab. Dashboard có nút Đăng xuất. Lỗi kết nối có nút Kiểm tra lại, không buộc đăng xuất; phiên hết hạn trở về đăng nhập. Không lưu mật khẩu Google. Máy dùng chung nên đăng xuất sau khi dùng; xóa cookie hoặc chế độ ẩn danh không giữ phiên lâu dài.
- Nháp OCR tự lưu ảnh và món trong IndexedDB theo danh tính đã xác minh. Reload giữ nội dung; cần rà soát lại checkbox thiếu món. Có nút Xóa nháp; tạo thành công xóa nháp, lỗi tạo giữ lại. Chỉ lưu trên thiết bị/origin này, không mã hóa riêng hoặc đồng bộ giữa máy.
- `/history`: đăng nhập Google, chọn tháng/tuần cũ trong registry và dùng lại viewer. Không hiện tuần tương lai hoặc dò Drive; khách không đọc lịch sử.
- Quyền Gmail: mới thêm chỉ xem; chủ bật riêng OCR/tạo và xóa/khôi phục. Gmail cũ giữ quyền đến khi chủ chỉnh. API và Apps Script đều kiểm tra quyền. Chỉ chủ xem private health/cấp quyền/quản lý Gmail.
- `/setup`: hướng dẫn cài đặt mở được khi chưa có cấu hình; chẩn đoán riêng sau đăng nhập chủ. Không có form nhập secrets. Có cấu hình OCR chưa có nghĩa OCR đã được đọc thử thành công.

## 1. Những gì có trong gói

- `MealForm.gs`: toàn bộ backend Apps Script: OCR, tạo tuần, tổng hợp, quyền Gmail, lịch khóa Form, xóa/khôi phục và lịch sử.
- `appsscript.json`: manifest V8, múi giờ Việt Nam và các quyền cần dùng.
- `meal-viewer/`: mã nguồn React/Vite và API máy chủ Vercel. Phải deploy cả thư mục này, không chỉ `dist`.
- `ScriptProperties.example.json`: danh sách thuộc tính cần nhập ở Apps Script; chỉ là ví dụ, không tự import.
- `meal-viewer/.env.example`: danh sách biến cần nhập ở Vercel.
- `New-Secrets.ps1`: tạo ba khóa ngẫu nhiên riêng trên máy người nhận; không ghi khóa vào file.
- Các kiểm thử cho cấu hình bản chia sẻ, quyền, API, OCR, phân tuần, UI và xóa bản ghi/lịch sử; fixture đã cập nhật theo chức năng hiện tại.

Trong bản chia sẻ, folder ID và domain không còn gắn cứng trong mã; đọc từ Script Properties. Apps Script `/exec` mở Dashboard trên domain người nhận, không cần file HTML quản trị cũ. Chỉ bản template được thay đổi; không cập nhật project production của người gửi.

## 2. Các giá trị bắt buộc thay

| Giá trị | Chỗ nhập | Cách lấy |
|---|---|---|
| `MEAL_FORM_ROOT_FOLDER_ID` | Apps Script → Script Properties | Tạo thư mục Drive riêng; lấy phần ID sau `/folders/`, không nhập cả URL |
| `MEAL_VIEWER_ORIGIN` | Apps Script → Script Properties | Domain production riêng, ví dụ `https://menu-tenban.vercel.app`; không có `/dashboard`, query hoặc fragment |
| `VILAO_API_KEY` | Apps Script → Script Properties | API key của tài khoản ViLao riêng |
| `VILAO_BASE_URL` | Apps Script → Script Properties | Base URL HTTPS theo dashboard ViLao; mã tự nối `/chat/completions` |
| `VILAO_MODEL` | Apps Script → Script Properties | ID model hỗ trợ ảnh, tương thích Chat Completions, tài khoản có quyền dùng |
| `MEAL_VIEWER_HMAC_SECRET` | Apps Script → Script Properties | Khóa `VIEWER_HMAC` tạo ở bước 3 |
| `MEAL_DASHBOARD_HMAC_SECRET` | Apps Script → Script Properties | Khóa `DASHBOARD_HMAC` tạo ở bước 3 |
| `MEAL_FORM_OWNER_EMAIL` | Apps Script → Script Properties | Hàm `initializeMealFormOwner()` tự ghi email chủ mới; không chép email/placeholder của người khác |
| `GAS_API_URL` | Vercel → Environment Variables | URL `/exec` của Apps Script mới |
| `GAS_HMAC_SECRET` | Vercel → Environment Variables | Cùng giá trị với `MEAL_VIEWER_HMAC_SECRET` |
| `GAS_DASHBOARD_HMAC_SECRET` | Vercel → Environment Variables | Cùng giá trị với `MEAL_DASHBOARD_HMAC_SECRET` |
| `SESSION_SECRET` | Vercel → Environment Variables | Khóa thứ ba, khác hai khóa HMAC |
| `GOOGLE_OAUTH_CLIENT_ID` | Vercel → Environment Variables | Client ID Web application của người nhận |
| `VITE_GOOGLE_OAUTH_CLIENT_ID` | Vercel → Environment Variables | Cùng Client ID với dòng trên |

Không dùng các chuỗi `REPLACE_WITH_...`/`YOUR_PROJECT` làm cấu hình thật. API key và HMAC chỉ ở máy chủ. Chỉ Google Client ID công khai dùng tiền tố `VITE_`; không thêm `VITE_` cho khóa bí mật.

## 3. Tạo HMAC và SESSION_SECRET

Mở PowerShell trong thư mục giải nén, chạy:

```powershell
.\New-Secrets.ps1
```

Nếu chính sách Windows chặn file script, mở `New-Secrets.ps1`, dán nội dung trực tiếp vào PowerShell; không cần tắt Execution Policy trên máy.

Kết quả là ba chuỗi ngẫu nhiên 64 ký tự hex. Giữ bí mật, không gửi vào chat hay commit. Nhập giá trị, không gồm dấu ngoặc kép/khoảng trắng. Hai cặp HMAC phải khớp nguyên văn giữa Apps Script và Vercel. Không dùng chung ba khóa.

## 4. Tạo project Vercel để có domain riêng

Hai cách: đưa bộ mã sạch lên repository của người nhận rồi Import trên Vercel, hoặc dùng CLI Vercel trong `meal-viewer`. Không chép `.vercel` hay token deploy từ người gửi.

Nếu import repository chứa cả bộ mã:

- Root Directory: `meal-viewer`.
- Framework Preset: Vite.
- Install Command: `npm ci`.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- Node.js: 22.x hoặc 24.x; không dùng Node 18.

Vercel tạo domain riêng. Bản đầu chưa cấu hình OAuth/API sẽ chưa đăng nhập hoặc đọc dữ liệu được — hoàn tất các bước sau rồi Redeploy.

## 5. Tạo Apps Script và cấp quyền

1. Dùng tài khoản Google sẽ sở hữu Form/Sheet, tạo project độc lập tại https://script.google.com/.
2. Chép nội dung `MealForm.gs` vào file `.gs` trong editor. Xóa hàm `myFunction` mặc định nếu không cần. Không chép các file kiểm thử vào Apps Script.
3. Settings → bật Show `appsscript.json` manifest file in editor. Chép manifest trong gói vào file này và Save. Bản này không cần tạo file HTML.
4. Tạo thư mục Google Drive riêng; nhập các dòng mẫu ở `ScriptProperties.example.json` vào Project Settings → Script Properties bằng giá trị thật. `MEAL_VIEWER_ORIGIN` dùng domain production ở bước 4.
5. Chọn hàm `initializeMealFormOwner`, bấm Run và hoàn tất cấp quyền bằng tài khoản chủ mới.
6. Chọn `authorizeMealViewerAccess`, bấm Run. Hàm yêu cầu toàn bộ scope đã khai báo và kiểm tra thư mục riêng; không tạo Form hoặc gọi OCR. Cấp các quyền cần thiết; nếu từ chối một quyền, chức năng liên quan có thể lỗi.
7. Chạy `setupMealFormAutomation`. Khi chưa có tuần, sổ tuần sẽ trống; lúc tạo tuần, ứng dụng sẽ cài trigger cho tuần đó.
8. Deploy → New deployment → Web app → Execute as Me → Who has access Anyone → Deploy. Lấy Web app URL kết thúc `/exec`, không lấy `/dev` hoặc URL editor.

Apps Script chạy dưới tài khoản người deploy; dữ liệu và quota Google thuộc tài khoản đó. Endpoint cần cho Vercel gọi không có cookie Google, nhưng các yêu cầu dữ liệu/thao tác vẫn kiểm tra HMAC; Dashboard kiểm tra email ở máy chủ. Không bỏ kiểm tra chữ ký hoặc quyền để chữa lỗi.

Nếu Workspace không cho triển khai Anyone, hỏi quản trị viên; không đổi thành execute-as-user để né giới hạn vì registry/quyền sẽ khác.

## 6. Thiết lập ViLao

Tại https://vilao.ai/ tạo tài khoản và API key riêng. Chọn model hỗ trợ ảnh, lấy đúng ID model và Base URL từ dashboard/tài liệu. Kiểm tra quota/số dư và quyền dùng model theo tài khoản.

Điền ba biến `VILAO_*` ở Apps Script, không đưa API key lên frontend hoặc Vercel dưới tên `VITE_`. Ví dụ: nếu endpoint đầy đủ là `https://example.com/v1/chat/completions` thì Base URL là `https://example.com/v1`, không nhập phần `/chat/completions` hai lần. Đọc ảnh sẽ gửi ảnh thực đơn tới ViLao và có thể phát sinh phí theo tài khoản.

## 7. Google OAuth Client ID

1. Vào https://console.cloud.google.com/, tạo/chọn project riêng.
2. Google Auth Platform → Branding: nhập tên ứng dụng, email hỗ trợ/liên hệ. Audience: chọn External khi dùng Gmail cá nhân; thêm Test users nếu cấu hình đang hạn chế thử nghiệm.
3. Clients → Create client → Web application.
4. Authorized JavaScript origins: thêm chính xác domain production, ví dụ `https://menu-tenban.vercel.app`, không kèm đường dẫn. Nếu dùng custom domain/preview để đăng nhập, thêm từng origin cần dùng; tránh dùng URL preview ngẫu nhiên mỗi lần deploy.
5. Copy Client ID dạng `...apps.googleusercontent.com`, nhập giống nhau vào hai biến Google ở Vercel. Bản này dùng callback JavaScript, không cần redirect URI hay Client Secret.

Website chỉ xác minh danh tính với email/profile/openid; không xin quyền Drive/Forms/Sheets của người đăng nhập. Các quyền đó được chủ cấp riêng cho Apps Script. Gmail được chủ thêm trong Dashboard là quyền quản trị dữ liệu cùng bản triển khai, không phải mỗi Gmail có Drive riêng.

## 8. Hoàn tất Vercel và kiểm tra

1. Vercel → Project → Settings → Environment Variables: điền đủ sáu biến trong `meal-viewer/.env.example`; chọn Production. Lấy `GAS_API_URL` từ bước 5.
2. Redeploy để cập nhật cấu hình, kể cả Client ID frontend.
3. Mở `/dashboard`, đăng nhập bằng email chủ mới; Dashboard → Hệ thống kiểm tra cấu hình/quyền.
4. OCR một ảnh có đủ ngày; đối chiếu ảnh, sửa tên món/ngày và xác nhận trước khi Tạo Form và Sheet. Ngày sai hoặc ít hơn hai món bị chặn.
5. Kiểm tra thư mục tuần được tạo trong Drive riêng, Form và Spreadsheet liên kết đúng. Bản hiện tại tạo một Form và một Spreadsheet cho mỗi tuần, không tự tạo hai Form.
6. Kiểm tra `/newest` tuần hiện tại, `/next` tuần kế tiếp và `/history` để chọn tuần cũ sau đăng nhập; chưa có tuần tương ứng thì hiện chưa có thực đơn. `/old` chỉ chuyển hướng về kho tuần. Không tự chuyển tuần tương lai thành tuần này.
7. Khi tuần bắt đầu thứ Hai 00:00 theo giờ Việt Nam, Form tuần đó được lên lịch đóng. Trigger Google có thể chạy trễ; truy cập dữ liệu cũng kiểm tra và đóng Form đến hạn. Không tự xóa Form/Sheet.
8. Chủ thêm/gỡ và bật quyền từng người qua tab Quyền Gmail. Gmail mới chỉ xem; bật OCR/tạo và xóa/khôi phục nếu cần. Chỉ test xóa/khôi phục trên lượt thử của bản mới, không sao chép registry hoặc dữ liệu của người gửi.
9. Mở `/setup` xem hướng dẫn/kiểm tra bằng tài khoản chủ; `/history` cần Google login và chỉ có tuần trước tuần hiện tại.

Chính sách trang xem giữ nguyên: các URL tuần xem được cho khách, gồm tên và món đã chọn (email bị loại khỏi dữ liệu công khai); Dashboard vẫn bắt buộc Google và kiểm tra quyền. Đánh giá nhu cầu riêng tư trước khi đưa dữ liệu thật lên bản mới.

## 9. Tùy chỉnh giao diện và chạy kiểm thử

- Đổi tên tab trình duyệt: sửa `<title>` trong `meal-viewer/index.html`.
- Đổi màu: `meal-viewer/src/styles.css`, `dashboard.css`, `mobile-cards.css`.
- Tiêu đề thực đơn/ngày: nhập tại Dashboard sau OCR; tiêu đề Form/Sheet suy ra từ thực đơn.
- Múi giờ và tuần: đang cố định Việt Nam; chỉ thay nếu có yêu cầu riêng, cần kiểm thử cả frontend lẫn backend.
- Muốn domain khác: sửa `MEAL_VIEWER_ORIGIN`, Authorized JavaScript origins Google, và cấu hình domain Vercel; không cần thay URL trong từng component.

Kiểm tra bằng Node.js 22/24, mở terminal trong `meal-viewer`:

```powershell
npm ci
npm test
```

Kiểm thử chạy cục bộ với dữ liệu giả, không gọi ViLao, tạo Google Form/Sheet hoặc xóa dữ liệu thật. Build và kiểm thử không thay thế xác nhận quyền/deployment thực tế bằng tài khoản người nhận.

## 10. Lỗi thường gặp

| Lỗi | Kiểm tra |
|---|---|
| Yêu cầu bị từ chối | Hai cặp HMAC đúng tên, đúng giá trị? Vercel đã Redeploy? URL `/exec` đúng bản mới? |
| Google login báo origin không hợp lệ | Domain đang mở có trong Authorized JavaScript origins? Hai Client ID có khớp? |
| Gmail chưa được cấp quyền | Email chủ do `initializeMealFormOwner` ghi có đúng? Gmail quản trị đã được chủ thêm? |
| Thiếu quyền Google | Manifest đã Save? Chủ chạy `authorizeMealViewerAccess` và cấp đủ quyền? |
| Không đọc được dữ liệu | API đã deploy Me + Anyone? `/exec` không phải `/dev`? Deployment production Vercel có bị platform chặn khách? |
| Tuần mới trống | Chưa OCR/tạo đúng tuần lịch hiện tại; không phải cứ Form tạo gần nhất sẽ vào `/newest` |
| OCR lỗi 401/403/429 | Key, endpoint, model, quyền dùng/quota ViLao và hạn mức Google |

Khi sửa Apps Script: Manage deployments → chọn đúng deployment → Edit → New version → Deploy; giữ URL khi cập nhật cùng deployment. Nếu tạo deployment mới, cập nhật `GAS_API_URL` và Redeploy Vercel.

## Tài liệu chính thức

- Apps Script quyền: https://developers.google.com/apps-script/concepts/scopes
- Apps Script Web app: https://developers.google.com/apps-script/guides/web
- Google Login: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
- Vercel/Vite: https://vercel.com/docs/frameworks/frontend/vite
- Vercel biến môi trường: https://vercel.com/docs/environment-variables
- ViLao: https://vilao.ai/vi/docs
