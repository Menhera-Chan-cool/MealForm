const PREFIX = 'meal-dashboard-cache-v1:';
const TTL = 24 * 60 * 60 * 1000;
const keyFor = (account, week) => `${PREFIX}${encodeURIComponent(account)}:${encodeURIComponent(week)}`;

// Cache is display-only; never persist deletion credentials or restore eligibility.
function displayData(data) {
  const fields = (value, names) => Object.fromEntries(names.filter(name => value?.[name] !== undefined).map(name => [name, value[name]]));
  return {
    week: fields(data?.week, ['weekKey', 'name', 'formStatus', 'lockAt']),
    responseCount: Number(data?.responseCount) || 0,
    responseIds: Array.isArray(data?.responseIds) ? data.responseIds.filter(id => typeof id === 'string') : [],
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
    return { ...value, data: displayData(value.data) };
  } catch { return null; }
}

export function lastDashboardWeek(account, availableWeeks, storage) {
  try {
    storage ||= globalThis.localStorage;
    const week = storage.getItem(`${PREFIX}${encodeURIComponent(account)}:last`);
    return availableWeeks.includes(week) && readDashboardCache(account, week, storage) ? week : '';
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
    const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(key => key?.startsWith(prefix) && !key.endsWith(':last') && key !== keyFor(account, week));
    while (keys.length >= 5) storage.removeItem(keys.shift());
    storage.setItem(keyFor(account, week), value);
    storage.setItem(`${prefix}last`, week);
  } catch { /* Storage denial/quota must not break the live Dashboard. */ }
}

export function clearDashboardCache(storage) {
  try {
    storage ||= globalThis.localStorage;
    const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i));
    keys.filter(key => key?.startsWith(PREFIX)).forEach(key => storage.removeItem(key));
  } catch { /* The browser may disallow local storage. */ }
}
