import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as viewerModel from './src/viewer-model.mjs';
const { viewerApiUrl, weekNavigation, shouldDeferViewerUpdate, millisecondsUntilMealWeekRollover } = viewerModel;
import { createViewerHandler } from './api/security.mjs';

let clock = '2026-10-01T15:00:00Z';
class ClockDate extends Date {
  constructor(...args) { super(...(args.length ? args : [clock])); }
}
const registry = new Map();
const key = monday => `${monday}_week`;
const register = monday => registry.set(key(monday), { spreadsheetId: monday, formId: `form-${monday}` });
['2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12'].forEach(register);
const trashed = new Set();
const context = vm.createContext({
  Date: ClockDate,
  PropertiesService: { getUserProperties: () => ({ getProperty: () => JSON.stringify(Object.fromEntries(registry)) }), getScriptProperties: () => ({ getProperty: key => key === 'MEAL_VIEWER_ORIGIN' ? 'https://recipient.example' : '' }) },
  DriveApp: { getFileById: id => ({ isTrashed: () => trashed.has(id) }) },
  Utilities: { formatDate(date, zone, pattern) {
    assert.equal(zone, 'Asia/Ho_Chi_Minh');
    assert.equal(pattern, 'yyyy-MM-dd');
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date).map(part => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  } }
});
vm.runInContext(readFileSync(new URL('../MealForm.gs', import.meta.url), 'utf8'), context);

// A future OCR registration must not replace the current calendar week.
assert.equal(context.getLatestMealFormRegistration_().spreadsheetId, '2026-09-28');
assert.equal(context.getPreviousMealFormRegistration_().spreadsheetId, '2026-09-21');
assert.equal(context.getNextMealFormRegistration_().spreadsheetId, '2026-10-05');
assert.equal(context.getLatestMealFormRegistration_('2026-10-04T16:59:59Z').spreadsheetId, '2026-09-28');
assert.equal(context.getLatestMealFormRegistration_('2026-10-04T17:00:00Z').spreadsheetId, '2026-10-05');
assert.equal(context.getPreviousMealFormRegistration_('2026-10-04T17:00:00Z').spreadsheetId, '2026-09-28');
assert.equal(context.getNextMealFormRegistration_('2026-10-04T17:00:00Z').spreadsheetId, '2026-10-12');
assert.equal(context.getMealCalendarWeekStart_(0, '2027-01-01T00:00:00Z'), '2026-12-28');
assert.equal(context.getMealCalendarWeekStart_(1, '2027-01-01T00:00:00Z'), '2027-01-04');
registry.delete(key('2026-09-28'));
assert.equal(context.getLatestMealFormRegistration_(), null, 'missing current week must not fall back to a future week');
register('2026-09-28');
trashed.add('2026-10-05');
assert.equal(context.getNextMealFormRegistration_(), null, 'trashed next week must not fall back to another week');
trashed.clear();
assert.equal(context.getViewerUrl_('2026-10-05', { days: [{ date: '05/10/2026' }] }), 'https://recipient.example/next');
context.verifyMealViewerEnvelope_ = envelope => JSON.parse(envelope.payload);
context.createMealViewerJsonOutput_ = value => value;
context.getViewerData_ = spreadsheetId => ({ spreadsheetId });
for (const [action, expected] of [['read-latest-viewer', '2026-09-28'], ['read-previous-viewer', '2026-09-21'], ['read-next-viewer', '2026-10-05']]) {
  assert.equal(context.doPost({ postData: { contents: JSON.stringify({ payload: JSON.stringify({ action }) }) } }).data.spreadsheetId, expected);
}
clock = '2026-10-04T17:00:00Z';
registry.delete(key('2026-10-12'));
assert.equal(context.getLatestMealFormRegistration_().spreadsheetId, '2026-10-05');
assert.equal(context.getPreviousMealFormRegistration_().spreadsheetId, '2026-09-28');
assert.equal(context.getNextMealFormRegistration_(), null, 'next stays empty until the following week is created');
assert.equal(context.doPost({ postData: { contents: JSON.stringify({ payload: JSON.stringify({ action: 'read-next-viewer' }) }) } }).error, 'Chưa có thực đơn cho tuần sau.');
assert.equal(context.getViewerUrl_('2026-10-05', { days: [{ date: '05/10/2026' }] }), 'https://recipient.example/newest');
assert.equal(context.getViewerUrl_('2026-09-28', { days: [{ date: '28/09/2026' }] }), 'https://recipient.example/old');

assert.equal(viewerApiUrl('/next/', '', true, true), '/api/viewer?next=1&guest=1&refresh=1');
assert.ok(weekNavigation('/newest').some(link => link.href === '/next' && link.label === 'Tuần sau'));
assert.ok(weekNavigation('/next').some(link => link.href === '/newest'));
const visibleWeek = { days: [{ day: 'Thứ 2 (28/09/2026)' }], rows: [['An']] };
assert.equal(typeof shouldDeferViewerUpdate, 'function');
assert.equal(shouldDeferViewerUpdate(visibleWeek, { ...visibleWeek, rows: [['Bình']] }), true);
assert.equal(shouldDeferViewerUpdate(visibleWeek, { days: [{ day: 'Thứ 2 (05/10/2026)' }], rows: [] }), false, 'new week replaces the old menu without waiting for a manual refresh');
assert.equal(shouldDeferViewerUpdate(null, visibleWeek), false);
assert.equal(typeof millisecondsUntilMealWeekRollover, 'function');
assert.equal(millisecondsUntilMealWeekRollover('2026-10-04T16:59:59Z'), 1000);
assert.equal(millisecondsUntilMealWeekRollover('2026-10-04T17:00:00Z'), 7 * 86400000);
assert.equal(millisecondsUntilMealWeekRollover('2026-12-31T17:00:00Z'), 3 * 86400000);

const calls = [];
const handler = createViewerHandler({ secret: 'test', readViewerData: async (...args) => {
  calls.push(args);
  if (args[1]) throw new Error('Chưa có thực đơn cho tuần sau.');
  return { title: 'Tuần sau', headers: [], rows: [], days: [] };
} });
const response = () => ({ setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
const result = response();
await handler({ method: 'GET', headers: {}, query: { next: '1' } }, result);
assert.equal(result.code, 200, 'next week supports the same guest access as current week');
assert.equal(calls[0][2], 'read-next-viewer');
const missing = response();
await handler({ method: 'GET', headers: {}, query: { next: '1', refresh: '1' } }, missing);
assert.equal(missing.code, 404);
assert.equal(missing.body.error, 'Chưa có thực đơn cho tuần sau.');
const privateSheet = response();
await handler({ method: 'GET', headers: {}, query: { view: 'a'.repeat(30) } }, privateSheet);
assert.equal(privateSheet.code, 401);
console.log('Calendar week routing, Vietnam midnight rollover, and next-week API checks passed');
