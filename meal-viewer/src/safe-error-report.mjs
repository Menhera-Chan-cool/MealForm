const operations = {
  ocr: 'Đọc ảnh thực đơn', create: 'Tạo Form và Sheet', week: 'Tải lượt gửi', overview: 'Tải tổng quan',
  updates: 'Kiểm tra lượt gửi mới', locate: 'Tìm hàng Sheet', reconcile: 'Đối soát Form–Sheet',
  delete: 'Xóa lượt gửi', restore: 'Khôi phục lượt gửi', 'form-control': 'Điều khiển Form',
  'set-branding': 'Lưu thương hiệu', 'add-email': 'Cấp quyền Dashboard', 'remove-email': 'Gỡ quyền Dashboard',
  'set-permissions': 'Đổi quyền Dashboard', 'authorize-script': 'Kiểm tra quyền Apps Script',
  health: 'Kiểm tra cấu hình', session: 'Kiểm tra đăng nhập', viewer: 'Tải trang xem', draft: 'Lưu hoặc khôi phục nháp OCR', dashboard: 'Thao tác Dashboard'
};

export function safeErrorReport(operation, error, at = Date.now()) {
  const status = Number(error?.status);
  const code = Number.isInteger(status) && status >= 400 && status <= 599 ? `HTTP_${status}`
    : ['TimeoutError', 'AbortError'].includes(error?.name) ? 'TIMEOUT'
      : error?.name === 'SyntaxError' ? 'INVALID_RESPONSE' : error?.name === 'TypeError' ? 'NETWORK_ERROR' : 'OPERATION_ERROR';
  const id = globalThis.crypto?.randomUUID?.().slice(0, 8) || Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return { id: `MF-${id.toUpperCase()}`, code, at: Number(at), operation: Object.hasOwn(operations, operation) ? operation : 'dashboard' };
}

export function formatErrorReport(report) {
  const id = /^MF-[a-f0-9]{8}$/i.test(report?.id || '') ? report.id : 'MF-UNKNOWN';
  const code = /^(HTTP_[45]\d\d|TIMEOUT|INVALID_RESPONSE|NETWORK_ERROR|OPERATION_ERROR)$/.test(report?.code || '') ? report.code : 'OPERATION_ERROR';
  const date = new Date(Number(report?.at));
  const time = Number.isFinite(date.getTime()) ? date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Không xác định';
  const operation = Object.hasOwn(operations, report?.operation) ? operations[report.operation] : operations.dashboard;
  return `MealForm — Báo lỗi\nMã báo lỗi: ${id}\nMã lỗi: ${code}\nThời gian: ${time} (giờ Việt Nam)\nThao tác: ${operation}\nKhông kèm nội dung Form, danh sách học sinh, tài khoản hoặc khóa bí mật.`;
}

export function dashboardOperation(url, options = {}) {
  if (options.method === 'DELETE') return 'delete';
  if (options.body) {
    try { const action = JSON.parse(options.body).action; return Object.hasOwn(operations, action) ? action : 'dashboard'; }
    catch { return 'dashboard'; }
  }
  try {
    const query = new URL(url || '/api/dashboard', 'https://example.invalid').searchParams;
    return ['updates', 'locate', 'reconcile', 'health', 'week'].find(key => query.has(key)) || 'overview';
  } catch { return 'dashboard'; }
}
