import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as security from './api/security.mjs';

const oldKey = '2026-09-28_2026-09-29_2026-09-30_2026-10-01_2026-10-02';
const registry = { [oldKey]: { formId: 'old-form', spreadsheetId: 'old-sheet', weekFolderName: 'Tuần 28/9–2/10', spreadsheetUrl: 'private-editor' }, '2026-10-05_week': { formId: 'current', spreadsheetId: 'current' }, '2026-10-12_week': { formId: 'next', spreadsheetId: 'next' }, '2026-09-21_week': { formId: 'trash', spreadsheetId: 'trash' } };
const gas = vm.createContext({
  PropertiesService: { getUserProperties: () => ({ getProperty: () => JSON.stringify(registry) }) },
  Utilities: { formatDate: () => '2026-10-08' },
  DriveApp: { getFileById: id => ({ isTrashed: () => id === 'trash' }) }
});
vm.runInContext(fs.readFileSync(new URL('../MealForm.gs', import.meta.url), 'utf8'), gas);
assert.equal(typeof gas.getMealHistoryWeeks_, 'function');
const weeks = JSON.parse(JSON.stringify(gas.getMealHistoryWeeks_()));
assert.deepEqual(weeks, [{ weekKey: oldKey, name: 'Tuần 28/9–2/10', startDate: '2026-09-28', endDate: '2026-10-02' }]);
assert.throws(() => gas.getMealHistoryViewerData_('unregistered'), /đăng ký/);
assert.throws(() => gas.getMealHistoryViewerData_('2026-10-12_week'), /tuần cũ/);
gas.getViewerData_ = id => ({ title: id, rows: [] });
assert.equal(gas.getMealHistoryViewerData_(oldKey).title, 'old-sheet');
assert.equal(typeof security.createHistoryHandler, 'function');
const secret = 'history-session-secret';
const token = security.createSessionToken({ sub: 'viewer', email: 'viewer@example.com' }, secret);
const calls = [];
const handler = security.createHistoryHandler({ secret, readViewerData: async (key, _refresh, action) => {
  calls.push({ key, action });
  return action === 'read-history' ? { weeks } : { title: 'Old week', headers: ['Họ tên', 'Email'], rows: [['An', 'private@example.com']], days: [] };
} });
const res = () => ({ setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
const guest = res(); await handler({ method: 'GET', headers: {}, query: {} }, guest);
assert.equal(guest.code, 401); assert.equal(calls.length, 0);
const list = res(); await handler({ method: 'GET', headers: { cookie: `meal_session=${token}` }, query: {} }, list);
assert.equal(list.code, 200); assert.deepEqual(list.body.weeks, weeks);
const detail = res(); await handler({ method: 'GET', headers: { cookie: `meal_session=${token}` }, query: { week: oldKey } }, detail);
assert.equal(detail.code, 200); assert.deepEqual(detail.body.rows, [['An']]);
assert.equal(calls.at(-1).action, 'read-history-viewer');
console.log('Registered past-week archive, authenticated API and email filtering passed');
