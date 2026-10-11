const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();

export function describeHistoryNote(note) {
  const text = String(note || '').trim();
  if (!text) return [];
  const marker = text.lastIndexOf(' | Chưa hoàn tất:');
  let details;
  try { details = JSON.parse(marker < 0 ? text : text.slice(0, marker)); }
  catch { return [text.startsWith('{') ? 'Ghi chú kỹ thuật cũ không đúng định dạng; cần kiểm tra lịch sử trong Sheet.' : text]; }
  const lines = [];
  const status = value => ({ open: 'Đang mở', closed: 'Đã đóng' })[value] || 'Chưa xác định';
  const time = value => {
    const date = new Date(value || '');
    return Number.isNaN(date.getTime()) ? 'Chưa có hạn' : date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  };
  if (details?.before && details?.after) {
    lines.push(`Trạng thái: ${status(details.before.formStatus)} → ${status(details.after.formStatus)}`);
    lines.push(details.before.lockAt === details.after.lockAt
      ? `Hạn đăng ký: ${time(details.after.lockAt)} — không đổi`
      : `Hạn đăng ký: ${time(details.before.lockAt)} → ${time(details.after.lockAt)}`);
  }
  if (details?.reason) lines.push(`Lý do: ${details.reason}`);
  if (details?.diagnostic) lines.push(String(details.diagnostic));
  if (marker >= 0) lines.push(text.slice(marker + 3));
  return lines.length ? lines : ['Ghi chú kỹ thuật cũ; xem lịch sử trong Sheet nếu cần đối chiếu.'];
}

export function countNewResponseIds(ids, baseline) {
  const known = new Set(baseline || []);
  return [...new Set(ids || [])].filter(id => typeof id === 'string' && id && !known.has(id)).length;
}

export function sheetRowUrl(spreadsheetId, sheetId, row) {
  if (!/^[a-zA-Z0-9_-]+$/.test(spreadsheetId || '') || !Number.isInteger(sheetId) || sheetId < 0 || !Number.isInteger(row) || row < 2) return '';
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}&range=A${row}`;
}

function dateKey(value) {
  const text = clean(value);
  let match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  let year, month, day;
  if (match) [, day, month, year] = match.map(Number);
  else {
    match = text.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
    if (!match) return '';
    [, year, month, day] = match.map(Number);
  }
  if (year < 2000 || month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return '';
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function plusDays(key, offset) {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function inspectMenu(menu, allowMissingMeals = false) {
  const days = Array.isArray(menu?.days) ? menu.days : [];
  const expectedDays = ['THU 2', 'THU 3', 'THU 4', 'THU 5', 'THU 6'];
  const dates = days.map(day => dateKey(day?.date));
  const anchor = dates.findIndex((date, index) => date && new Date(`${date}T00:00:00Z`).getUTCDay() === index + 1);
  const weekStart = anchor >= 0 ? plusDays(dates[anchor], -anchor) : '';
  const dayIssues = days.map((day, index) => {
    const label = clean(day?.day).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    const expectedDate = weekStart ? plusDays(weekStart, index) : '';
    let dateError = '';
    if (!expectedDays[index] || !label.includes(expectedDays[index])) dateError = `Ngày phải theo đúng thứ tự Thứ ${index + 2}.`;
    else if (!dates[index]) dateError = 'Ngày không hợp lệ; hãy nhập ngày/tháng/năm đúng theo ảnh.';
    else if (expectedDate && dates[index] !== expectedDate) dateError = `Ngày cần là ${expectedDate.split('-').reverse().join('/')} để các ngày liên tiếp trong cùng tuần.`;
    else if (new Date(`${dates[index]}T00:00:00Z`).getUTCDay() !== index + 1) dateError = `Ngày này không phải Thứ ${index + 2}.`;
    const meals = Array.isArray(day?.meals) ? day.meals.map(clean) : [];
    const count = meals.filter(Boolean).length;
    return {
      dateError, missingMealSlots: [0, 1, 2].filter(slot => !meals[slot]),
      mealError: count < 2 || count > 3 ? 'Cần ít nhất 2 món và tối đa 3 món để tạo Form.' : ''
    };
  });
  const dateError = days.length !== 5 || dayIssues.some(issue => issue.dateError)
    ? 'Ngày phải đủ từ Thứ 2 đến Thứ 6 và liên tiếp trong cùng tuần.' : '';
  const missingMealDays = days.filter(day => (day?.meals || []).map(clean).filter(Boolean).length < 3).map(day => clean(day.day));
  const invalidMealDays = days.filter(day => {
    const count = (day?.meals || []).map(clean).filter(Boolean).length;
    return count < 2 || count > 3;
  }).map(day => clean(day.day));
  return {
    dateError,
    missingMealDays,
    invalidMealDays,
    dayIssues,
    canCreate: !dateError && !invalidMealDays.length && (allowMissingMeals || !missingMealDays.length)
  };
}
