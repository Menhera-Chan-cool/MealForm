# MealForm

## Bốn cải tiến UI — đã phát hành 15/10/2026

- Bộ đếm phân biệt lượt gửi với lựa chọn món theo bộ lọc hiện tại; không đếm người theo tên và không coi số hàng chiếu theo món là số lượt gửi. Nhãn từng món ghi rõ “lựa chọn”.
- Form tuần đang xem và Form đăng ký tuần sau có nhóm ngày/trạng thái riêng; giữ nguyên quy tắc chọn Form và liên kết an toàn.
- Ngày trên thẻ mobile rút gọn như `T4 · 14/10`, chạm để mở lại ngày đầy đủ. Dashboard/Xem nhanh dùng đúng ngày phục vụ, không đoán theo vị trí cột; PC vẫn giữ ngày đầy đủ. Không thêm lại thanh chọn ngày.
- Menu “…” có mục “Có gì mới?” mở theo yêu cầu, đóng menu sẽ thu gọn; không tự bật, không tải thêm dữ liệu.

Phạm vi: ý tưởng 2, 3, 7, 10; chỉ frontend. Đã merge [PR #7](https://github.com/Menhera-Chan-cool/MealForm/pull/7) vào `main` và đưa đúng artifact đã kiểm thử lên [production](https://menutaythanh.vercel.app), không build lại khi chuyển tên miền. Build, 29 bộ kiểm thử ứng dụng/API, 44 kiểm thử trình duyệt và kiểm tra chỉ đọc trên website thật đều đạt. Xem `SPEC-viewer-reading.md` và `VERIFICATION-viewer-context-2026-10-15.md`. API, Apps Script, dữ liệu thật, phân quyền và dependency giữ nguyên; RAR cũ không tự cập nhật.

## 13 cải tiến UI bổ sung — đã phát hành 14/10/2026

- Tô nổi từ khóa tên/món và nút × xóa riêng từng ô tìm kiếm, không đổi dữ liệu hay tuần đã chọn.
- Kho tuần có đường dẫn ngữ cảnh, quay lại đúng tháng/chế độ xem; thẻ có số lượt/trạng thái khi API cung cấp. Thiếu dữ liệu ghi “Chưa đọc được”, không giả 0 và không tự quét Form.
- Bộ lọc mobile thành bảng trượt từ dưới, đóng/mở giữ lựa chọn; thông báo dài có Xem thêm/Thu gọn. Vẫn không thêm thanh chọn ngày.
- Nhãn hiển thị tiếng Việt, tên tab theo tuần/mục Dashboard và biểu tượng liên kết mở tab mới.
- Thương hiệu/thông báo có dấu Chưa lưu và cảnh báo rời mục/trang. Lỗi lưu giữ nội dung; xung đột thông báo cần tải lại rõ ràng trước khi lưu phiên bản mới. Không tự lưu cấu hình lên máy chủ.
- Ngày OCR đã rà soát có thể thu gọn; ngày lỗi vẫn mở. Chỉnh nội dung/Undo hoặc OCR mới không được dùng dấu rà soát để bỏ qua kiểm tra ngày/món.
- Bảng PC phóng rộng giữ cùng dữ liệu, bộ lọc và vị trí; chân hộp xác nhận luôn trong vùng nhìn khi nội dung cuộn hoặc bàn phím mở.

Đã merge [PR #6](https://github.com/Menhera-Chan-cool/MealForm/pull/6) và chuyển đúng artifact đã kiểm tra lên [production](https://menutaythanh.vercel.app), không build lại và không yêu cầu vòng duyệt preview. Hồ sơ kiểm thử/phát hành: `VERIFICATION-ui-clarity-2026-10-14.md`. Chỉ đổi frontend; API, Apps Script, quyền, cấu hình và dependency giữ nguyên. Bản RAR cũ không tự cập nhật.

## Chín cải tiến UI — đã phát hành 14/10/2026

- Viewer mobile có tab Tổng hợp/Chi tiết, giữ bộ lọc và sắp xếp; thẻ đặt tên ở đầu và thời điểm bên dưới. PC ghim cột Họ tên khi cuộn ngang.
- Bộ tìm tuần Dashboard phân nhóm Tuần này/Tuần sau/Tuần đã qua/Tuần khác, giữ đúng tuần được chọn. Kho tuần có Danh sách/Lịch tháng; tuần giao tháng xuất hiện trong cả hai tháng và mở đúng URL cũ.
- OCR có ba bước Ảnh → Rà soát → Tạo Form/Sheet theo trạng thái thực; không tự chạy OCR/tạo. Lỗi tạo giữ bản nháp.
- Mỗi lượt gửi giữ Xem nhanh và menu “…”, dùng lại thao tác Sheet/xóa có kiểm tra quyền và xác nhận cũ. Khôi phục trong lịch sử giữ đúng bản ghi và xác nhận cũ.
- Thương hiệu có khung minh họa Trang xem/Dashboard, Điện thoại/PC, Sáng/Tối; chỉ nút Lưu thương hiệu mới áp dụng.
- Khung chờ chỉ hiện khi chưa có dữ liệu. Tải lại giữ bản đã xem và khóa thao tác cho tới khi xác minh xong.

Theo yêu cầu mới, **không thêm thanh chọn ngày trong tuần**. Bộ lọc Ngày, nút Hôm nay và thông báo ngày nghỉ hiện có vẫn giữ. Bản này chỉ đổi frontend, không đổi API, Apps Script, quyền, cấu hình hay dependency. PR #5 đã merge sau khi chủ dự án duyệt; đúng artifact staging đã được chuyển lên [website production](https://menutaythanh.vercel.app), không build lại. Chi tiết kiểm thử/phát hành ở `VERIFICATION-ui-bundle-2026-10-14.md`. Các RAR đã phát hành trước đây không tự cập nhật.

## Khung chọn ảnh ngày 13/10/2026

Tab OCR dùng khung chọn ảnh lớn với icon upload tròn và nội dung căn giữa. Bấm khung/Duyệt ảnh để chọn nhiều ảnh; không hiện nút chọn file mặc định. Icon lấy đúng màu chủ đạo, chữ dùng sắc độ tương phản của thương hiệu cho Sáng/Tối. Giữ PNG/JPEG/WEBP, tối đa 5 ảnh/tổng 2,8 MB, dán/kéo thả, thêm/bỏ ảnh và nháp. Chọn lại thay bộ ảnh; hủy chọn không xóa ảnh, OCR chỉ chạy khi bấm Đọc thực đơn.

## Menu hiển thị ngày 13/10/2026

Lệnh nhanh, cỡ chữ, giao diện và mức hiệu ứng nằm trong nút ba chấm ở góc phải. Menu nổi dưới nút, bấm lại/bấm ngoài/Esc để đóng; hỗ trợ bàn phím và tự giới hạn kích thước trên mobile. Ctrl/⌘ K vẫn mở Lệnh nhanh trực tiếp, không chồng hai hộp lên nhau. Giữ nguyên thiết lập đang lưu theo trình duyệt. Bản sửa frontend, không cần đổi Apps Script hoặc quyền.

## Sửa giao diện tối ngày 13/10/2026

Rà soát thêm trạng thái tuần trống/đăng nhập trên mọi trang, toàn bộ tab Dashboard và hộp thoại. Sửa nền sáng còn sót ở nút có dữ liệu mới/cảnh báo, chữ xem ảnh/khôi phục nháp, lỗi cập nhật và chữ gợi ý tìm kiếm khi màu chủ đạo sáng. Kiểm tra độ tương phản trên PC/mobile; không đổi dữ liệu hay quyền.

Nền trang, panel, ô nhập, bảng, dropdown, viền focus và màu chữ tối được tính theo màu chủ đạo đang lưu, không còn cố định xanh lá. Đổi màu khi đang ở chế độ Tối cập nhật ngay; Theo hệ thống dùng cùng bảng màu. Giữ màu nhận biết riêng cho Form mở/đóng, cảnh báo và lỗi. Đây là bản sửa frontend, Apps Script vẫn phiên bản 78; không cần thêm quyền hay đổi cấu hình backend.

## Cập nhật ngày 12/10/2026

Mã backend đã đồng bộ đến Apps Script phiên bản 78: thêm đối chiếu thay đổi toàn tuần, dán/kéo thả ảnh, ghép OCR nhiều ảnh, giao diện Sáng/Tối/Theo hệ thống và mức hiệu ứng Đầy đủ/Nhẹ/Tắt. Giữ các cải tiến Dashboard, bộ lọc lịch sử, OCR từng vùng, tải từng đợt, ngày nghỉ và Undo. Repo này vẫn là bản template độc lập: người nhận tự điền cấu hình và deploy, không có khóa hoặc dữ liệu production trong mã.

Điều hướng dùng nút xanh đồng bộ trên điện thoại và máy tính. Kho tuần cũ ở `/history` yêu cầu đăng nhập; `/old` đã ngừng phục vụ thực đơn và chuyển hướng về kho tuần. Không xóa dữ liệu các tuần cũ.

## Tính năng mới trong bản này

- Sau tải lại thủ công thành công trong cùng tuần, Dashboard báo lượt Form mới/đã mất/thay đổi so với lần xác minh trước. Đối chiếu ID và dấu nội dung của toàn tuần, không bị giới hạn bởi 50 hàng đã tải hoặc tìm kiếm; không dùng tên để gộp người và không tự sửa/xóa. Chỉ báo lượt Form, không suy mất lượt từ hàng Sheet bị di chuyển. Lần đầu, bản lưu cũ, tuần khác, lỗi/hủy tải hoặc đổi khóa ký không tạo kết luận thay đổi; đổi khóa tạo mốc đối chiếu mới. Không lưu token xóa trong cache.
- Tab OCR nhận ảnh qua chọn file, Ctrl/⌘ V ngoài ô nhập hoặc kéo thả vào khung. Chọn file thay bộ ảnh; Thêm ảnh/dán/thả giữ ảnh hiện có. Tối đa 5 ảnh PNG/JPEG/WEBP, tổng 2,8 MB; ảnh lỗi/quá lớn hoặc hủy chọn không xóa nháp. Dán chữ trong ô nhập vẫn bình thường. Có chọn/bỏ ảnh nguồn, nháp nhiều ảnh lưu trên thiết bị theo tài khoản; nháp ảnh đơn cũ vẫn đọc được.
- Đọc từ hai ảnh trở lên mở bản xem trước ghép OCR, có nguồn cho từng giá trị, ô trùng, ngày thiếu và xung đột ngày/món/ngày nghỉ. Chọn nguồn hoặc sửa tay để giải quyết xung đột trước khi áp dụng; không tự đoán phần không đọc được hoặc ghi đè nháp. Áp dụng là một lượt Undo/Redo, kể cả nháp ban đầu trống. Tạo Form vẫn qua rà soát và kiểm tra tuần/ngày/món hiện có. Mỗi ảnh dùng một lượt đọc của nhà cung cấp, có thể tăng thời gian/quota; lỗi một ảnh giữ nháp cũ. Chỉ tài khoản có quyền OCR/tạo được gọi, API và Apps Script đều kiểm tra. Không thêm OAuth scope; bản xem trước chưa áp dụng không tự lưu.
- Giao diện Sáng/Tối/Theo hệ thống nhớ riêng trên trình duyệt, mặc định Theo hệ thống. Giữ màu chủ đạo của trường, đổi nền/chữ/viền và trạng thái cảnh báo/lỗi cho cả trang xem, kho tuần, Dashboard, cài đặt và hộp thoại; không chỉnh màu ảnh gốc hay cấu hình thương hiệu trên server.
- Hiệu ứng Đầy đủ/Nhẹ/Tắt dùng chung toàn web. Nếu chưa chọn, theo cài đặt giảm chuyển động của hệ thống; lựa chọn Đầy đủ cũ được giữ. Nhẹ bỏ chuỗi trang trí, phản hồi ngắn 0,16 giây; Tắt đổi trạng thái ngay, vẫn hiện chữ Form và đóng menu đúng, không để timer đóng treo. Lựa chọn thủ công không phụ thuộc cài đặt hệ điều hành và không thay dữ liệu.

- Lệnh nhanh: Ctrl/⌘ K hoặc nút trên điện thoại; tìm tuần đã đăng ký, tab Dashboard theo quyền và trang xem/cài đặt. Chỉ điều hướng, không xóa, tạo hay đọc OCR bằng phím tắt. Escape đóng và trả focus, phím mũi tên/Enter chọn lệnh. Chặn khi đang xử lý hoặc có hộp thoại khác; chờ lưu nháp OCR trước khi chuyển trang, lỗi lưu giữ nguyên trang.
- Cỡ chữ Bình thường/Lớn dùng chung cho PC/mobile và hộp thoại, nhớ trên trình duyệt. Nếu trình duyệt chặn lưu thì vẫn đổi cỡ chữ trong lần mở hiện tại. Không thay dữ liệu hoặc đồng bộ tùy chọn giữa thiết bị.
- Chủ sở hữu thêm/sửa/xóa thông báo văn bản tối đa 500 ký tự cho từng tuần đã đăng ký, có xác nhận và lịch sử. Ngày hết hạn là hết ngày Việt Nam; trang xem tự ẩn nội dung khi hết hạn, kể cả bản lưu. Lưu trong Script Properties riêng `MEAL_WEEK_NOTICE_<weekKey>`, không đổi câu trả lời Form/Sheet và không thêm OAuth scope. Thông báo là công khai: không nhập thông tin học sinh hoặc secrets. Hai phiên cùng sửa phải tải lại nếu phiên bản đã đổi; lỗi ghi lịch sử sau khi lưu được báo cần kiểm tra, không giả báo chưa thay đổi.
- Dừng chờ dữ liệu: ngừng chờ các lượt đọc trên trình duyệt trong Dashboard/trang xem/kho tuần, giữ bản đúng tuần chỉ đọc và yêu cầu tải lại để xác minh trước khi thao tác. Bỏ qua phản hồi muộn, kể cả lỗi đăng nhập của lượt đã dừng. Không áp dụng cho xóa/khôi phục, sửa Form, lưu thông báo hoặc OCR; không hủy hay tự thử lại tác vụ backend.

- Đầu Dashboard hiện Gmail từ phiên đăng nhập đã xác minh, vai trò Chủ sở hữu/Quản trị/Chỉ xem và quyền thực tế. Không nhận Gmail từ nội dung do trình duyệt gửi, không thêm danh tính này vào API trang xem công khai hoặc cache trình duyệt.
- Lượt gửi tải 50 bản ghi mỗi đợt, có nút Tải thêm. Tìm tên không dấu/sắp xếp xử lý trên toàn bộ tuần ở backend; không chỉ lọc phần đã tải. Ghép Form–Sheet dùng chỉ mục cùng giây/tên/món chính xác như trước, vẫn từ chối ghép không duy nhất. Cache riêng của tài khoản thực thi giữ bản đối chiếu tối đa 30 giây, tách khỏi cache chống lặp yêu cầu, không chứa token xóa; chỉ cấp token cho trang trả về. Cache mất thì đọc lại; dữ liệu đổi giữa hai trang yêu cầu tải lại. Xóa/khôi phục vẫn đối chiếu dữ liệu thật ngay trước thao tác, không tin cache.
- Lịch sử trong tuần đang chọn lọc theo Gmail quản trị, loại thao tác, khoảng ngày Việt Nam và ghi chú, hỗ trợ tìm chữ không dấu trong phần ghi chú đã giải mã. Chỉ lỗi/chưa hoàn tất gồm thất bại, cần kiểm tra, xử lý dở và đang chờ. Backend lọc toàn bộ log rồi trả 50 sự kiện, Tải thêm lịch sử lấy phần tiếp theo; danh sách loại thao tác lấy từ toàn tuần. Không tự sửa/xóa log hoặc bỏ qua kiểm tra khôi phục.
- Đọc lại vùng ảnh trong màn hình OCR: chọn ngày hoặc ô món, kéo vùng trên PC/mobile hoặc sửa tọa độ phần trăm bằng bàn phím. Cắt ảnh trên thiết bị, chỉ gửi vùng chọn; giữ ảnh gốc. Kết quả trước–sau sửa được và phải bấm Áp dụng, mỗi lần thay là một Undo. Giữ ngày khác, tiêu đề và dấu ngày nghỉ; không sửa Form/Sheet đã có. Cần quyền OCR/tạo và mỗi lần đọc dùng thêm quota/phí của nhà cung cấp. Preview chưa áp dụng không được lưu thành nháp.
- Có bản cập nhật: kiểm tra version.json khi mở/quay lại trang và mỗi 5 phút lúc trang hiển thị. Không tự reload. Trong Dashboard, nút cập nhật chờ lưu nháp OCR hiện tại thành công và ghi vị trí xem; lỗi lưu giữ nguyên trang. Tạm chặn cập nhật khi đang xử lý hoặc mở hộp xác nhận/OCR vùng. version.json chỉ chứa ID build, không có secrets; cần deploy toàn bộ frontend/API mới để dùng.

- Lượt gửi Dashboard trên điện thoại là thẻ: đủ tên, thời điểm, từng ngày/món và nút thao tác; không kéo ngang. PC vẫn là bảng, có Gọn/Rộng; mobile không bị chế độ Gọn làm khó đọc.
- Tìm tên không cần dấu trong Dashboard và bộ lọc trang xem: `truong` tìm được `Trường`, `dang` tìm được `Đặng`. Chỉ chuẩn hóa khi tìm kiếm; giữ nguyên tên, không gộp người hoặc đổi cách ghép/xóa Form–Sheet.
- Chọn thứ Hai một lần để điền đủ năm ngày OCR, giữ món và dấu ngày nghỉ. Là một lượt Hoàn tác; ngày không phải thứ Hai bị từ chối.
- Tìm nhanh tuần theo tháng/ngày trong danh sách xanh đồng bộ. Gõ chỉ lọc danh sách trên thiết bị; chọn một mục mới tải tuần, không gọi API theo từng ký tự.
- Nhớ từ khóa, sắp xếp, Gọn/Rộng và vị trí cuộn theo tài khoản/tuần trên trình duyệt, tối đa năm tuần trong 24 giờ. Hàng đang xem mất thì dùng vị trí hàng gần nhất. Đăng xuất/mất quyền xóa bản lưu; thao tác thay dữ liệu chỉ xóa snapshot, giữ tùy chọn xem. Không đồng bộ liên thiết bị và không mã hóa riêng: máy dùng chung phải đăng xuất.
- Sau bấm Tải lại dữ liệu trong cùng tuần, lượt có ID Form mới được tô xanh nhẹ và nhãn Mới trong tám giây. Không tô toàn bộ lần tải đầu, không nhấp nháy, không suy lượt mới bằng tên hoặc thời gian.
- Xem nhanh mở hộp thoại chỉ đọc, tên/thời điểm/ngày/món thực tế và thông báo ngày nghỉ, dữ liệu lưu hoặc Form đã mất lượt. Escape/Đóng trả focus về nút mở; không có xóa/khôi phục trong hộp thoại. Bản lưu cũ thiếu nhãn ngày ghi rõ, không đoán thứ tự ngày.

- Ngày nghỉ: đánh dấu “Không phục vụ ngày này” khi rà soát OCR. Giữ đủ năm ngày lịch để định danh tuần, nhưng Form không có câu hỏi chọn món ngày nghỉ; Sheet chỉ tính những ngày phục vụ và ghi rõ ngày nghỉ, web giữ khoảng thứ Hai–thứ Sáu và hiện thông báo. Không tạo Form trống nếu cả tuần nghỉ. Chỉ áp dụng cho tuần mới; không đổi Form/Sheet đã đăng ký.
- Hoàn tác/làm lại nội dung sửa OCR bằng nút hoặc Ctrl/⌘ Z, Ctrl/⌘ Shift Z: tiêu đề, ngày, món và dấu nghỉ. Gộp thao tác gõ trong cùng ô, tối đa 50 thay đổi trong lần mở hiện tại; đổi ảnh/OCR/tài khoản hoặc reload sẽ bắt đầu lịch sử mới. Nháp hiện tại vẫn tự lưu, gồm dấu ngày nghỉ, nhưng không lưu toàn bộ lịch sử Undo.
- Tuần đã có được cảnh báo ngay khi đủ năm ngày hợp lệ trùng sổ tuần đã xác minh, có liên kết Form/Sheet và nút tải lại sổ tuần; chặn tạo trùng ở giao diện. Backend vẫn kiểm tra trùng tuần để xử lý trường hợp vừa được tạo trên thiết bị khác; không ghi đè.
- Thanh chọn tuần, tìm tên và tải lại bám khi cuộn ở mục “Lượt gửi & lịch sử” trên mobile. Chỉ có một bộ điều khiển và cùng trạng thái lọc; khi tìm tên được focus, thu gọn để dành chỗ cho bàn phím.
- Báo lỗi chỉ sao chép mã tham chiếu trên thiết bị, mã HTTP/mạng/timeout/định dạng, giờ Việt Nam và loại thao tác cố định. Không lấy raw message, stack, URL/query/body, danh sách học sinh, ảnh, cookie, khóa hoặc tài khoản. Nếu clipboard bị chặn, hiện ô nội dung an toàn để sao chép thủ công. Mã tham chiếu không phải token hay mã tra log server.

- Dashboard lưu bản xem gần nhất theo tài khoản/tuần trên trình duyệt để hiển thị tối đa 24 giờ, sau khi xác minh đăng nhập và quyền hiện tại. Bước vào trang không đợi quét toàn bộ các Sheet; tổng quan tải nền. Bản lưu không chứa token xóa hoặc quyền khôi phục, bị xóa khi đăng xuất/mất quyền; lỗi mạng giữ bảng chỉ đọc. Không mã hóa riêng dữ liệu tên/món đã lưu trên thiết bị; máy dùng chung phải đăng xuất.
- Trong “Lượt gửi & lịch sử”, kiểm tra danh tính lượt Form mới mỗi 60 giây khi tab đang hiển thị, không đọc câu trả lời/lịch sử đầy đủ cho lần kiểm tra. Hiện “Có … lượt gửi mới”, dùng “Tải lại dữ liệu”; không tự đổi bảng đang xem. Xóa một lượt đồng thời có lượt mới không làm sai số báo.
- Nút “Mở hàng trong Sheet” cạnh lượt gửi/đối soát đọc lại vị trí hiện tại và đúng trang câu trả lời (gid). Nếu nhiều hàng cùng phù hợp, hiện từng ứng viên thay vì chọn bừa; không còn hàng thì báo rõ. Nút không cấp thêm quyền Drive hoặc công khai Sheet.
- Khi mở/đóng Form, đổi hạn hoặc xóa lượt, có xác nhận kèm lý do tùy chọn tối đa 500 ký tự. Giữ cấu trúc 12 cột lịch sử cũ; hiển thị trạng thái/hạn trước–sau và lý do thay cho JSON. Mobile dùng thẻ lịch sử, PC dùng bảng. Lý do vẫn được giữ khi thao tác chưa hoàn tất.

Khi cập nhật, deploy Apps Script trước rồi deploy toàn bộ frontend/API Vercel. Bản RAR cũ không tự cập nhật theo repository; hãy đóng gói lại nếu muốn gửi bản mới.

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

### UI Dashboard và viewer — đợt 14/10/2026

Frontend được chuyển sang bộ UI đã duyệt, giữ nguyên API, Apps Script và các chốt phân quyền/xác nhận. Đủ9 mục Dashboard, sidebar PC/điều hướng mobile và viewer tuần/kho tuần. Xem `SPEC-production-ui.md` và `VERIFICATION-production-ui-2026-10-14.md` để biết kiểm thử/trạng thái phát hành; có mã trên nhánh/PR không đồng nghĩa domain production đã chuyển bản.

Nguồn token duy nhất: `meal-viewer/design/tokens.json`; compiler Style Dictionary: `meal-viewer/scripts/build-tokens.mjs`. Màu runtime vẫn lấy từ Settings, không cố định màu mẫu. Trong `meal-viewer`, chạy `npm ci` rồi `npm test` hoặc `npm run build`.

Storybook/preview ở `mealform-preview`. Cài dependencies `meal-viewer` trước; sau đó trong `mealform-preview` chạy `npm ci`, `npm run storybook`. Nhóm Production UI dùng component thật với fixture development, không gửi thao tác ghi đến hệ thống thật. Kiểm tra browser: `npx playwright test --config playwright.production.config.ts`. Không đưa `.env`, `.vercel-global`, browser auth state hoặc ảnh kiểm thử vào Git.

### Liên kết nền tảng

- Apps Script quyền: https://developers.google.com/apps-script/concepts/scopes
- Apps Script Web app: https://developers.google.com/apps-script/guides/web
- Google Login: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
- Vercel/Vite: https://vercel.com/docs/frameworks/frontend/vite
- Vercel biến môi trường: https://vercel.com/docs/environment-variables
- ViLao: https://vilao.ai/vi/docs
