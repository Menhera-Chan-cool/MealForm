import { foldSearchText } from './viewer-model.mjs';
const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();

export function isAppsScriptPermissionError(message) {
  return /you do not have permission to call|authorization is required to perform that action|required permissions?:\s*https:\/\/www\.googleapis\.com\/auth\/|(?:thiếu|chưa (?:cấp|được cấp)) quyền Apps Script/i.test(String(message || ''));
}

export function groupDashboardWeeks(weeks, now = Date.now()) {
  const date = new Date(now + 7 * 3600000);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  const start = date.toISOString().slice(0, 10);
  date.setUTCDate(date.getUTCDate() + 7);
  const next = date.toISOString().slice(0, 10);
  const result = { current: null, next: null, past: [], other: [] };
  for (const week of weeks || []) {
    const key = String(week.weekKey || '').split('_')[0];
    if (key === start) result.current = week;
    else if (key === next) result.next = week;
    else if (/^\d{4}-\d{2}-\d{2}$/.test(key) && key < start) result.past.push(week);
    else result.other.push(week);
  }
  result.past.sort((a,b) => b.weekKey.localeCompare(a.weekKey));
  return result;
}

export function filterAuditHistory(events, filters = {}) {
  const start = filters.from ? Date.parse(`${filters.from}T00:00:00+07:00`) : -Infinity;
  const end = filters.to ? Date.parse(`${filters.to}T00:00:00+07:00`) + 86400000 : Infinity;
  if ((filters.from && dateKey(filters.from) !== filters.from) || (filters.to && dateKey(filters.to) !== filters.to) || start >= end) return [];
  return (events || []).filter(event => Number(event.at) >= start && Number(event.at) < end
    && (!filters.actor || foldSearchText(event.actor).includes(foldSearchText(filters.actor)))
    && (!filters.action || event.action === filters.action)
    && (!filters.errorsOnly || /(?:-pending|-review|-failed)$|^partial$/.test(event.action))
    && (!filters.note || foldSearchText([event.note, ...describeHistoryNote(event.note)].join(' ')).includes(foldSearchText(filters.note))));
}

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

export function compareResponseVersions(before,after) {
  if(!before?.week?.weekKey||before.week.weekKey!==after?.week?.weekKey||before.responseVersionBinding!==after.responseVersionBinding)return null;
  const read=values=>{
    if(!Array.isArray(values))return null;
    const map=new Map();
    for(const value of values){if(!Array.isArray(value)||value.length!==2||typeof value[0]!=='string'||!value[0]||map.has(value[0])||!(/^[a-f0-9]{64}$/).test(value[1]))return null;map.set(value[0],value[1]);}
    return map;
  };
  const previous=read(before.responseVersions),current=read(after.responseVersions);
  if(!previous||!current)return null;
  let added=0,missing=0,changed=0;
  for(const[id,version]of current){if(!previous.has(id))added++;else if(previous.get(id)!==version)changed++;}
  for(const id of previous.keys())if(!current.has(id))missing++;
  return{added,missing,changed};
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
      dateError, missingMealSlots: day?.closed === true ? [] : [0, 1, 2].filter(slot => !meals[slot]),
      mealError: day?.closed !== true && (count < 2 || count > 3) ? 'Cần ít nhất 2 món và tối đa 3 món để tạo Form.' : ''
    };
  });
  const dateError = days.length !== 5 || dayIssues.some(issue => issue.dateError)
    ? 'Ngày phải đủ từ Thứ 2 đến Thứ 6 và liên tiếp trong cùng tuần.' : '';
  const missingMealDays = days.filter(day => day.closed !== true && (day?.meals || []).map(clean).filter(Boolean).length < 3).map(day => clean(day.day));
  const invalidMealDays = days.filter(day => {
    const count = (day?.meals || []).map(clean).filter(Boolean).length;
    return day.closed !== true && (count < 2 || count > 3);
  }).map(day => clean(day.day));
  return {
    dateError,
    missingMealDays,
    invalidMealDays,
    dayIssues,
    servingError: days.length && days.every(day => day.closed === true) ? 'Cả tuần không phục vụ; không cần tạo Form đăng ký.' : '',
    canCreate: !dateError && days.some(day => day.closed !== true) && !invalidMealDays.length && (allowMissingMeals || !missingMealDays.length)
  };
}

export function menuCalendarKey(menu) {
  return inspectMenu(menu).dateError ? '' : menu.days.map(day => dateKey(day.date)).join('_');
}

export function fillMenuMonday(menu, value) {
  const monday = dateKey(value);
  if (!monday || new Date(`${monday}T00:00:00Z`).getUTCDay() !== 1) throw new Error('Chọn ngày thứ Hai hợp lệ.');
  if (!Array.isArray(menu?.days) || menu.days.length !== 5) throw new Error('Cần có thực đơn đủ 5 ngày trước khi chọn thứ Hai.');
  return { ...menu, days: menu.days.map((day, i) => ({ ...day, date: plusDays(monday, i).split('-').reverse().join('/') })) };
}

export function responseMealDetails(response, week) {
  return (Array.isArray(response?.meals) ? response.meals : []).map((meal, i) => ({
    day: typeof week?.dayLabels?.[i] === 'string' && week.dayLabels[i] ? week.dayLabels[i] : `Lựa chọn ${i + 1} — chưa có nhãn ngày`,
    meal: String(meal || '') || 'Chưa chọn'
  }));
}

export function nearestViewAnchor(ids, anchor, index) {
  const found = ids.indexOf(anchor);
  return found >= 0 ? found : Math.max(0, Math.min(ids.length - 1, Number(index) || 0));
}

export function applyRegionResult(menu, target, result) {
  if (!menu?.days?.[target?.dayIndex] || !Number.isInteger(target.dayIndex) || !['day','meal'].includes(target.mode)) throw new Error('Chọn ngày/ô món hợp lệ.');
  const bounded = value => { if (typeof value !== 'string' || value.length > 500) throw new Error('Kết quả món không hợp lệ hoặc quá dài.'); return value.trim(); };
  const previous = menu.days[target.dayIndex];
  let next;
  if (target.mode === 'meal') {
    if (!Number.isInteger(target.mealIndex) || target.mealIndex < 0 || target.mealIndex > 2) throw new Error('Chọn ô món hợp lệ.');
    const meals = [...previous.meals]; meals[target.mealIndex] = bounded(result?.text);
    next = { ...previous, meals };
  } else {
    if (typeof result?.date !== 'string' || result.date.length > 40 || !Array.isArray(result.meals) || result.meals.length !== 3) throw new Error('Kết quả ngày không hợp lệ.');
    next = { ...previous, date: result.date.trim(), meals: result.meals.map(bounded) };
  }
  return { ...menu, days: menu.days.map((day, index) => index === target.dayIndex ? next : day) };
}

export function cropPixelRect(rect, width, height) {
  if (![width,height].every(value => Number.isFinite(value) && value > 0) || !['x','y','width','height'].every(key => Number.isFinite(rect?.[key])) || rect.x < 0 || rect.y < 0 || rect.width <= 0 || rect.height <= 0 || rect.x + rect.width > 100 || rect.y + rect.height > 100) throw new Error('Vùng chọn phải nằm trong ảnh.');
  const pixels = { x: Math.floor(rect.x * width / 100), y: Math.floor(rect.y * height / 100), width: Math.floor(rect.width * width / 100), height: Math.floor(rect.height * height / 100) };
  if (pixels.width < 8 || pixels.height < 8) throw new Error('Vùng chọn quá nhỏ; hãy khoanh lại.');
  return pixels;
}

export function accountRoleLabel(account) {
  return account?.role === 'owner' ? 'Chủ sở hữu' : account?.role === 'manager' && (account.permissions?.create || account.permissions?.manageResponses) ? 'Quản trị' : 'Chỉ xem';
}

export function isNewBuild(latest, current) {
  return typeof latest?.id === 'string' && /^[\w-]{1,100}$/.test(latest.id) && latest.id !== current;
}

export function readTextSize(storage) {
  try { storage||=globalThis.localStorage;return storage?.getItem('meal-text-size') === 'large' ? 'large' : 'normal'; } catch { return 'normal'; }
}

export function writeTextSize(value,storage) {
  try { storage||=globalThis.localStorage;storage?.setItem('meal-text-size',value==='large'?'large':'normal'); } catch { /* Presentation still changes if storage is unavailable. */ }
}

export function dashboardCommands(account) {
  if (!['owner','manager'].includes(account?.role) || account.permissions?.view === false) return [];
  const permissions=account.permissions || {create:true,manageResponses:true};
  const tabs=[['overview','Tổng quan'],['delete','Lượt gửi và lịch sử'],['reconcile','Đối soát']];
  if(permissions.create)tabs.push(['create','Tạo tuần bằng OCR']);
  if(account.role==='owner')tabs.push(['form','Điều khiển Form'],['notice','Thông báo tuần'],['branding','Thương hiệu'],['health','Hệ thống'],['access','Quyền Gmail']);
  return [...tabs.map(([tab,label])=>({id:`tab-${tab}`,kind:'tab',tab,label})),...(account.weeks||[]).map(week=>({id:`week-${week.weekKey}`,kind:'week',weekKey:week.weekKey,label:`Mở ${week.name||week.weekKey}`}))];
}

export function createReadWait(changed=()=>{}) {
  let version=0;const pending=new Set();
  return {
    begin(){const controller=new AbortController(),ticket={version,controller,signal:controller.signal};pending.add(ticket);changed(pending.size);return ticket;},
    current(ticket){return ticket.version===version&&!ticket.signal.aborted;},
    finish(ticket){pending.delete(ticket);changed(pending.size);},
    cancel(){version++;for(const ticket of pending)ticket.controller.abort();pending.clear();changed(0);}
  };
}

export function activeWeekNotice(notice,now=Date.now()) {
  return typeof notice?.text==='string'&&notice.text.trim()&&notice.text.length<=500&&Number.isFinite(notice.expiresAt)&&notice.expiresAt>now?{text:notice.text,expiresAt:notice.expiresAt}:null;
}
