import {registeredDashboardHandler,registeredViewerHandler} from './test-helpers/registered-session.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as model from './src/viewer-model.mjs';
import { createViewerHandler, createDashboardHandler, createSessionToken } from './api/security.mjs';

assert.equal(typeof model.todayDayLabel, 'function');
const days = [{ day: 'Thứ 2 (05/10/2026)' }, { day: 'Thứ 3 (6/10/2026)' }];
assert.equal(model.todayDayLabel(days, '2026-10-05T16:59:59Z'), days[0].day);
assert.equal(model.todayDayLabel(days, '2026-10-05T17:00:00Z'), days[1].day);
assert.equal(model.todayDayLabel(days, '2026-10-04T00:00:00Z'), '');
const formUrl = 'https://docs.google.com/forms/d/e/example/viewform';
const registration = model.mealRegistrationTarget({ formUrl, formStatus: 'closed', nextForm: { formUrl, formStatus: 'open', days } }, true);
assert.equal(registration.label, 'Đăng ký tuần sau');
assert.equal(registration.dates, '05/10/2026 – 6/10/2026');
assert.equal(model.mealRegistrationTarget({ formUrl, formStatus: 'closed', nextForm: { formUrl: 'javascript:alert(1)', formStatus: 'open', days } }, true).label, 'Chọn món');

const response = () => ({ setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
const readActions = [];
const handler = registeredViewerHandler({ secret: 'test', readViewerData: async (_id, _refresh, action) => {
  readActions.push(action);
  return action === 'read-next-viewer' ? { formUrl, formStatus: 'open', days, rows: [['private-next-row']] } : { formUrl, formStatus: 'closed', days: [], rows: [] };
} });
const result = response();
await handler({ method: 'GET', headers: {}, query: { newest: '1' } }, result);
assert.equal(result.code, 200);
assert.deepEqual(readActions, ['read-latest-viewer', 'read-next-viewer']);
assert.equal(result.body.nextForm.formUrl, formUrl);
assert.equal(result.body.nextForm.rows, undefined);

let now = Date.parse('2026-10-04T16:59:59Z');
class ClockDate extends Date { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }
const weekKey = '2026-10-05_2026-10-06_2026-10-07_2026-10-08_2026-10-09';
const registry = { [weekKey]: { formId: 'form', spreadsheetId: 'sheet', lockAt: '2026-10-02T13:30:00+07:00' } };
let open = true;
let failLock = false;
const invalidations = [];
const context = vm.createContext({
  Date: ClockDate,
  PropertiesService: { getUserProperties: () => ({ getProperty: () => JSON.stringify(registry), setProperty: (_key, value) => { Object.assign(registry, JSON.parse(value)); } }) },
  DriveApp: { getFileById: () => ({ isTrashed: () => false }) },
  FormApp: { openById: () => ({ setAcceptingResponses(value) { if (failLock) throw new Error('denied'); open = value; } }) },
  CacheService: { getScriptCache: () => ({ remove: key => invalidations.push(key) }) }
});
context.LockService = { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) };
vm.runInContext(fs.readFileSync(new URL('../MealForm.gs', import.meta.url), 'utf8'), context);
assert.equal(context.getMealFormLockAt_({ days: [{ date: '05/10/2026' }] }), '2026-10-05T00:00:00+07:00');
context.lockScheduledMealForms_();
assert.equal(open, true, 'must remain open before Monday even with a legacy Friday deadline');
now += 1000;
failLock = true;
context.lockScheduledMealForms_({ triggerUid: 'clock-event' });
assert.notEqual(registry[weekKey].locked, true, 'failed closure remains retryable');
failLock = false;
context.lockScheduledMealForms_({ triggerUid: 'clock-event' });
assert.equal(open, false, 'clock-trigger event closes the week at rollover');
assert.equal(registry[weekKey].locked, true);
assert.equal(registry[weekKey].lockAt, '2026-10-05T00:00:00+07:00');
assert.deepEqual(invalidations, ['meal-viewer-v2:sheet']);
registry[weekKey].locked = false;
open = true;
let cached = JSON.stringify({ formStatus: 'open' });
context.CacheService = { getScriptCache: () => ({ remove() { cached = null; }, get: () => cached, put() {} }) };
context.readViewerData_ = () => ({ formStatus: open ? 'open' : 'closed' });
assert.equal(context.getViewerData_('sheet').formStatus, 'closed', 'due Form must close and evict its stale open-status cache before a viewer response');
assert.equal(typeof context.getMealDashboardHealth_, 'function');
const secretValue = 'never-return-this-ocr-key';
context.PropertiesService.getScriptProperties = () => ({ getProperty: key => ({
  VILAO_API_KEY: secretValue, VILAO_BASE_URL: 'https://example.com/v1', VILAO_MODEL: 'vision',
  MEAL_FORM_ROOT_FOLDER_ID: 'recipient-folder',
  MEAL_FORM_OWNER_EMAIL: 'owner@example.com', MEAL_VIEWER_HMAC_SECRET: secretValue, MEAL_DASHBOARD_HMAC_SECRET: secretValue
})[key] || '' });
context.ScriptApp = { AuthMode: { FULL: 'FULL' }, AuthorizationStatus: { REQUIRED: 'REQUIRED' }, getAuthorizationInfo: () => ({ getAuthorizationStatus: () => 'NOT_REQUIRED' }), getProjectTriggers: () => [] };
context.DriveApp.getFolderById = () => ({ getName: () => 'root' });
context.SpreadsheetApp = { openById: () => ({ getName: () => 'week', getSheets: () => [{ getFormUrl: () => formUrl }] }) };
context.FormApp.openById = () => ({ isAcceptingResponses: () => open });
const health = context.getMealDashboardHealth_(weekKey);
assert.ok(health.checks.some(check => check.id === 'ocr' && check.status === 'ok'));
assert.ok(health.checks.some(check => check.id === 'sheet' && check.status === 'ok'));
assert.equal(JSON.stringify(health).includes(secretValue), false);
assert.equal(open, false, 'health checks must not open a Form');
assert.throws(() => context.getMealDashboardHealth_('unregistered'), /đăng ký/);

const sessionSecret = 'qol-session-secret';
const token = createSessionToken({ sub: 'owner', email: 'owner@example.com' }, sessionSecret, now);
const healthActions = [];
const dashboard = registeredDashboardHandler({ secret: sessionSecret, now: () => now, callGas: async payload => {
  healthActions.push(payload.action);
  return payload.action === 'dashboard-authorize' ? { role: 'owner' } : { checks: [{ id: 'ocr', status: 'ok' }] };
}, readViewerData: async () => ({ days: [] }), configuration: { session: true, viewer: true, dashboard: true } });
const healthResponse = response();
await dashboard({ method: 'GET', headers: { cookie: `meal_session=${token}` }, query: { health: '1', week: weekKey } }, healthResponse);
assert.equal(healthResponse.code, 200);
assert.deepEqual(healthActions, ['dashboard-authorize', 'dashboard-health']);
assert.ok(healthResponse.body.checks.some(check => check.id === 'viewer-api'));
const anonymous = response();
await dashboard({ method: 'GET', headers: {}, query: { health: '1' } }, anonymous);
assert.equal(anonymous.code, 401);
const brokenDashboard = registeredDashboardHandler({ secret: sessionSecret, now: () => now, callGas: async () => { throw new Error(secretValue); } });
const broken = response();
await brokenDashboard({ method: 'GET', headers: { cookie: `meal_session=${token}` }, query: { health: '1' } }, broken);
assert.equal(broken.code, 502);
assert.equal(broken.body.checks[0].status, 'error');
assert.equal(JSON.stringify(broken.body).includes(secretValue), false);
console.log('Today shortcut, next-week registration, and rollover Form closure checks passed');
