const ALL = 'Tất cả';
export const shouldShowViewerMessage = message => message !== 'Đang tải dữ liệu…';
const clean = value => String(value ?? '').trim();
const dayName = day => typeof day === 'string' ? day : clean(day?.day);
const dayMeals = day => Array.isArray(day?.meals) ? day.meals.map(clean).filter(Boolean) : [];

// Search only: never use this fold for record identity or deletion matching.
export function foldSearchText(value) {
  return String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').replace(/[đĐ]/g, 'd').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
}

export function todayDayLabel(days, nowValue = Date.now()) {
  const today = new Date(new Date(nowValue).getTime() + 7 * 3600000).toISOString().slice(0, 10);
  return (days || []).map(dayName).find(label => {
    const date = label.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    return date && `${date[3]}-${date[2].padStart(2, '0')}-${date[1].padStart(2, '0')}` === today;
  }) || '';
}

export function mealRegistrationTarget(data, allowNext = false) {
  const safeUrl = value => /^https:\/\/(?:docs\.google\.com\/forms\/|forms\.gle\/)/i.test(value || '') ? value : '';
  const next = allowNext && data?.formStatus === 'closed' && data?.nextForm?.formStatus === 'open' && safeUrl(data.nextForm.formUrl);
  const target = next ? data.nextForm : data;
  const dates = (target?.calendarDays || target?.days || []).map(day => dayName(day).match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0]).filter(Boolean);
  return {
    formUrl: safeUrl(target?.formUrl), status: target?.formStatus || 'unknown',
    isNext: Boolean(next),
    label: next ? 'Đăng ký tuần sau' : 'Chọn món', dates: next && dates.length ? `${dates[0]} – ${dates.at(-1)}` : ''
  };
}

export function shouldDeferViewerUpdate(current, incoming) {
  const content = value => { const {serverNow,weekNotice,...rest}=value||{}; return rest; };
  return Boolean(current) && dayName(current.days?.[0]) === dayName(incoming.days?.[0]) && JSON.stringify(content(current)) !== JSON.stringify(content(incoming));
}

export function millisecondsUntilMealWeekRollover(nowValue = Date.now()) {
  const now = new Date(nowValue).getTime();
  const vietnam = new Date(now + 7 * 3600000);
  const nextMonday = Date.UTC(vietnam.getUTCFullYear(), vietnam.getUTCMonth(), vietnam.getUTCDate() + 7 - ((vietnam.getUTCDay() + 6) % 7));
  return nextMonday - 7 * 3600000 - now;
}

function responseTimestamp(value) {
  if (value instanceof Date) return value.getTime();
  const text = clean(value);
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), Number(match[4] || 0), Number(match[5] || 0), Number(match[6] || 0)).getTime();
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortResponses(rows, sortMode) {
  return [...rows].sort((left, right) => {
    const leftName = clean(left?.[1]);
    const rightName = clean(right?.[1]);
    if (sortMode === 'name') return leftName.localeCompare(rightName, 'vi', { sensitivity: 'base' }) || responseTimestamp(right?.[0]) - responseTimestamp(left?.[0]);
    const timeDifference = responseTimestamp(left?.[0]) - responseTimestamp(right?.[0]);
    return (sortMode === 'oldest' ? timeDifference : -timeDifference) || leftName.localeCompare(rightName, 'vi', { sensitivity: 'base' });
  });
}

export function matchOptions(values, query) {
  const needle = foldSearchText(query);
  return values.filter(value => !needle || foldSearchText(value).includes(needle));
}

export function errorMessage(value, fallback = 'Không thể thực hiện yêu cầu.') {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object') return errorMessage(value.message ?? value.error, fallback);
  return fallback;
}

export function readViewerFilters(raw) {
  const defaults = { name: ALL, day: ALL, meal: ALL };
  try {
    const saved = JSON.parse(raw || 'null');
    return Object.fromEntries(Object.keys(defaults).map(key => [
      key,
      typeof saved?.[key] === 'string' && saved[key].trim() ? saved[key].trim() : ALL
    ]));
  } catch { return defaults; }
}

export function rootRedirectTarget(pathname, search) {
  const path = String(pathname || '/').replace(/\/+$/, '') || '/';
  if (path === '/old') return '/history';
  return path === '/' && !new URLSearchParams(search || '').has('view') ? '/newest' : '';
}

export function weekNavigation(pathname) {
  const path = String(pathname || '/').replace(/\/+$/, '') || '/';
  if (path === '/newest') return [{ href: '/next', label: 'Tuần sau' }];
  if (path === '/next') return [{ href: '/newest', label: 'Tuần này' }];
  return [];
}

export function formatFilterSummary(filters) {
  const active = [];
  for (const [key, label] of [['name', 'Họ tên'], ['day', 'Ngày'], ['meal', 'Món']]) {
    const value = clean(filters?.[key]);
    if (value && value !== ALL) active.push(`${label}: ${value}`);
  }
  return active.length ? active.join(' · ') : 'Không có bộ lọc';
}

export function viewerApiUrl(pathname, search, forceRefresh = false, guest = false) {
  const path = String(pathname || '').replace(/\/+$/, '') || '/';
  const newest = path === '/newest';
  if (path === '/old') return '';
  const next = path === '/next';
  const week = newest ? 'newest' : next ? 'next' : '';
  let url = week ? `/api/viewer?${week}=1` : '';
  if (path === '/history') {
    const key = new URLSearchParams(search || '').get('week') || '';
    return key ? `/api/history?week=${encodeURIComponent(key)}${forceRefresh ? '&refresh=1' : ''}` : '';
  }
  if (!url) {
    const sheetId = new URLSearchParams(search || '').get('view') || '';
    if (!sheetId) return '';
    url = `/api/viewer?view=${encodeURIComponent(sheetId)}`;
  }
  return url + (week && guest ? '&guest=1' : '') + (forceRefresh ? '&refresh=1' : '');
}

export function spreadsheetIdFromUrl(value) {
  const text = clean(value);
  const urlMatch = text.match(/\/spreadsheets\/d\/([A-Za-z0-9_-]+)/i);
  if (urlMatch) return urlMatch[1];
  return /^[A-Za-z0-9_-]{20,}$/.test(text) ? text : '';
}

export function buildDetailModel(data, filters, sortMode = 'newest', exactMeal = false) {
  const headers = Array.isArray(data?.headers) ? data.headers : [];
  const rows = sortResponses(Array.isArray(data?.rows) ? data.rows : [], sortMode);
  const days = Array.isArray(data?.days) ? data.days : [];
  const selectedDay = clean(filters?.day) || ALL;
  const nameQuery = clean(filters?.name);
  const mealQuery = clean(filters?.meal);
  const wantedName = nameQuery !== ALL ? foldSearchText(nameQuery) : '';
  const wantedMeal = mealQuery !== ALL ? mealQuery.toLocaleLowerCase() : '';
  const matchesMeal=choice=>exactMeal?choice===mealQuery:choice.toLocaleLowerCase().includes(wantedMeal);
  const dayIndex = selectedDay === ALL ? -1 : days.findIndex(day => dayName(day) === selectedDay);
  const sourceRows = [];
  const mealRows = [];
  const mealTimes = [];

  rows.forEach(row => {
    const name = clean(row?.[1]);
    if (!name || (wantedName && !foldSearchText(name).includes(wantedName))) return;
    if (selectedDay !== ALL && dayIndex < 0) return;
    if (dayIndex >= 0) {
      const choice = clean(row?.[2 + dayIndex]);
      if (!choice || (wantedMeal && !matchesMeal(choice))) return;
      sourceRows.push(row);
      return;
    }
    if (wantedMeal) {
      let matched = false;
      days.forEach((day, index) => {
        const choice = clean(row?.[2 + index]);
        if (choice && matchesMeal(choice)) {
          matched = true;
          mealRows.push([name, dayName(day), choice]);
          mealTimes.push(clean(row[0]));
        }
      });
      if (matched) sourceRows.push(row);
      return;
    }
    sourceRows.push(row);
  });

  if (dayIndex >= 0) {
    return {
      headers: [headers[1] || 'Họ và tên', headers[2 + dayIndex] || selectedDay],
      rows: sourceRows.map(row => [clean(row[1]), clean(row[2 + dayIndex])]), sourceRows,
      nameIndex: 0, timeIndex: -1, mealIndexes:[1], rowTimes: sourceRows.map(row => clean(row[0]))
    };
  }
  if (wantedMeal) return { headers: ['Họ và tên', 'Ngày', 'Món'], rows: mealRows, sourceRows, nameIndex: 0, timeIndex: -1, mealIndexes:[2], rowTimes: mealTimes };
  return { headers, rows: sourceRows, sourceRows, nameIndex: 1, timeIndex: 0, mealIndexes:days.map((_day,index)=>index+2), rowTimes: sourceRows.map(row => clean(row[0])) };
}

export { ALL };

export function detailResultCounts(model) {
  return {
    responses: model.sourceRows.length,
    choices: model.rows.reduce((count,row) => count + model.mealIndexes.filter(index => clean(row[index])).length, 0)
  };
}
