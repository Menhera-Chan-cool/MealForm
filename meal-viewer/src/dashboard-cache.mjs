const PREFIX = 'meal-dashboard-cache-v1:';
const TTL = 24 * 60 * 60 * 1000;
const keyFor = (account, week) => `${PREFIX}${encodeURIComponent(account)}:${encodeURIComponent(week)}`;

// Cache is display-only; never persist deletion credentials or restore eligibility.
function displayData(data) {
  const fields = (value, names) => Object.fromEntries(names.filter(name => value?.[name] !== undefined).map(name => [name, value[name]]));
  return {
    week: fields(data?.week, ['weekKey', 'name', 'formStatus', 'lockAt', 'dayLabels', 'closedDays', 'weekNotice', 'serverNow']),
    responseCount: Number(data?.responseCount) || 0,
    ...(data?.page ? {page:fields(data.page,['offset','nextOffset','matchedCount','total','query','sort','revision','snapshotAt'])} : {}),
    ...(data?.historyPage ? {historyPage:fields(data.historyPage,['offset','nextOffset','matchedCount','total','filters','actions'])} : {}),
    responseIds: Array.isArray(data?.responseIds) ? data.responseIds.filter(id => typeof id === 'string') : [],
    ...(typeof data?.responseVersionBinding==='string'&&/^[a-f0-9]{64}$/.test(data.responseVersionBinding)?{responseVersionBinding:data.responseVersionBinding}:{}),
    ...(Array.isArray(data?.responseVersions)?{responseVersions:data.responseVersions.filter(value=>Array.isArray(value)&&value.length===2&&typeof value[0]==='string'&&typeof value[1]==='string'&&/^[a-f0-9]{64}$/.test(value[1])).map(value=>[value[0],value[1]])}:{}),
    responses: (Array.isArray(data?.responses) ? data.responses : []).map(row => fields(row, ['responseId', 'timestamp', 'name', 'meals', 'rowNumber', 'partial', 'note'])),
    history: (Array.isArray(data?.history) ? data.history : []).map(event => fields(event, ['id', 'entryId', 'action', 'at', 'actor', 'originalTimestamp', 'name', 'meals', 'note']))
  };
}

export function readDashboardCache(account, week, storage, now = Date.now()) {
  if (!account || !week) return null;
  try {
    storage ||= globalThis.localStorage;
    const value = JSON.parse(storage.getItem(keyFor(account, week)) || 'null');
    if (!value || value.account !== account || value.week !== week || !Number.isFinite(value.savedAt) || now < value.savedAt || now - value.savedAt >= TTL || value.data?.week?.weekKey !== week || !Array.isArray(value.data.responses) || !Array.isArray(value.data.history)) return null;
    const data=displayData(value.data);
    if (Number.isFinite(data.week.serverNow)) data.week.serverNow += now-value.savedAt;
    return { ...value, data };
  } catch { return null; }
}

export function lastDashboardWeek(account, availableWeeks, storage) {
  try {
    storage ||= globalThis.localStorage;
    const week = storage.getItem(`${PREFIX}${encodeURIComponent(account)}:last`);
    return availableWeeks.includes(week) && (readDashboardCache(account, week, storage) || readDashboardView(account, week, storage)) ? week : '';
  } catch { return ''; }
}

export function writeDashboardCache(account, week, data, storage, now = Date.now()) {
  if (!account || !week || data?.week?.weekKey !== week) return;
  try {
    storage ||= globalThis.localStorage;
    const value = JSON.stringify({ account, week, savedAt: now, data: displayData(data) });
    if (value.length > 1_000_000) return;
    // Bound storage to five recent week snapshots per account; unrelated preferences remain untouched.
    const prefix = `${PREFIX}${encodeURIComponent(account)}:`;
    const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(key => key?.startsWith(prefix) && !key.endsWith(':last') && !key.endsWith(':view') && key !== keyFor(account, week));
    while (keys.length >= 5) storage.removeItem(keys.shift());
    storage.setItem(keyFor(account, week), value);
    storage.setItem(`${prefix}last`, week);
  } catch { /* Storage denial/quota must not break the live Dashboard. */ }
}

export function clearDashboardCache(storage, preserveViews = false) {
  try {
    storage ||= globalThis.localStorage;
    const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i));
    keys.filter(key => key?.startsWith(PREFIX) && !(preserveViews && (key.endsWith(':view') || key.endsWith(':last')))).forEach(key => storage.removeItem(key));
  } catch { /* The browser may disallow local storage. */ }
}

export const DEFAULT_DASHBOARD_VIEW = { query: '', sort: 'newest', density: 'comfortable', anchor: '', index: 0, offset: 0, windowY: 0, listY: 0 };

function displayView(value) {
  const number = (key, max, signed = false) => typeof value?.[key] === 'number' && Number.isFinite(value[key]) ? Math.max(signed ? -max : 0, Math.min(max, value[key])) : 0;
  return { ...(value?.nameMatch==='exact'?{nameMatch:'exact'}:{}),...(['today','yesterday','custom'].includes(value?.sentPreset)?{sentPreset:value.sentPreset}:{}),...Object.fromEntries(['sentFrom','sentTo'].filter(key=>typeof value?.[key]==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value[key])).map(key=>[key,value[key]])),query: typeof value?.query === 'string' ? value.query.slice(0, 200) : '', sort: ['newest','oldest','name'].includes(value?.sort) ? value.sort : 'newest', density: value?.density === 'compact' ? 'compact' : 'comfortable', anchor: typeof value?.anchor === 'string' ? value.anchor.slice(0, 512) : '', index: Math.floor(number('index', 20000)), offset: number('offset', 10000, true), windowY: number('windowY', 10000000), listY: number('listY', 10000000) };
}

export function readDashboardView(account, week, storage, now = Date.now()) {
  if (!account || !week) return null;
  try {
    storage ||= globalThis.localStorage;
    const value = JSON.parse(storage.getItem(keyFor(account, week) + ':view') || 'null');
    if (!value || value.account !== account || value.week !== week || !Number.isFinite(value.savedAt) || now < value.savedAt || now - value.savedAt >= TTL) return null;
    return displayView(value.view);
  } catch { return null; }
}

export function writeDashboardView(account, week, view, storage, now = Date.now()) {
  if (!account || !week) return;
  try {
    storage ||= globalThis.localStorage;
    const prefix = `${PREFIX}${encodeURIComponent(account)}:`;
    const key = keyFor(account, week) + ':view';
    const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(k => k?.startsWith(prefix) && k.endsWith(':view') && k !== key);
    while (keys.length >= 5) storage.removeItem(keys.shift());
    storage.setItem(key, JSON.stringify({ account, week, savedAt: now, view: displayView(view) }));
    storage.setItem(`${prefix}last`, week);
  } catch { /* Preferences must not block the live Dashboard. */ }
}
