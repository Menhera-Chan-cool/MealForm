import {registeredDashboardHandler} from './test-helpers/registered-session.mjs';
import assert from 'node:assert/strict';
import { errorMessage, spreadsheetIdFromUrl } from './src/viewer-model.mjs';
import { cookieValue, createDashboardGasClient, createDashboardHandler, createGasReader, createSessionToken, readSessionToken, requestBody } from './api/security.mjs';

assert.equal(cookieValue('other=1; meal_session=abc123; theme=dark', 'meal_session'), 'abc123');
assert.deepEqual(requestBody('{"credential":"id-token"}'), { credential: 'id-token' });
assert.deepEqual(requestBody({ credential: 'id-token' }), { credential: 'id-token' });

const id = '1Gcaid98LLWxdugJJHGeE0kxZn41rnOoKhUKzQJYfYfA';
assert.equal(spreadsheetIdFromUrl(`https://docs.google.com/spreadsheets/d/${id}/edit?gid=110666635#gid=110666635`), id);
assert.equal(spreadsheetIdFromUrl(id), id);
assert.equal(spreadsheetIdFromUrl('https://example.com/not-a-sheet'), '');
assert.equal(errorMessage({ message: 'Sai mã Spreadsheet' }, 'fallback'), 'Sai mã Spreadsheet');
assert.equal(errorMessage({ error: { message: 'Không có quyền xem' } }, 'fallback'), 'Không có quyền xem');
assert.equal(errorMessage({ code: 403 }, 'fallback'), 'fallback');

const requests = [];
const readViewerData = createGasReader({
  url: 'https://script.google.com/macros/s/test/exec',
  secret: 'test-secret',
  now: () => 1789991800000,
  fetchImpl: async (url, options) => {
    requests.push({ url: String(url), options });
    if (requests.length === 1) {
      return { status: 302, ok: false, headers: { get: name => name === 'location' ? 'https://script.googleusercontent.com/macros/echo?x=1' : '' }, text: async () => '' };
    }
    return { status: 200, ok: true, headers: { get: () => '' }, text: async () => JSON.stringify({ data: { rows: [] } }) };
  }
});
await readViewerData(id);
assert.equal(requests.length, 2);
assert.equal(requests[0].options.method, 'POST');
assert.equal(requests[1].options.method, 'GET');
assert.equal(requests[1].options.body, undefined);

async function rejectsQuietly(operation, pattern) {
  const reportError = console.error;
  console.error = () => {};
  try { await assert.rejects(operation(), pattern); }
  finally { console.error = reportError; }
}

for (const action of ['dashboard-week', 'dashboard-batch', 'dashboard-delete']) {
  const signedRequests = [];
  let results = 0;
  const client = createDashboardGasClient({ url: 'https://script.google.com/macros/s/test/exec', secret: 'test-secret', fetchImpl: async (url, options) => {
    if (options.method === 'POST') {
      assert.equal(Boolean(options.signal), action !== 'dashboard-delete', 'only read calls receive an abort deadline');
      signedRequests.push(JSON.parse(options.body));
      return { status: 302, ok: false, headers: { get: () => 'https://script.googleusercontent.com/macros/echo?read=test' } };
    }
    results++;
    return { status: 200, ok: true, text: async () => results === 1 ? '<html><title>Temporary Google error</title></html>' : JSON.stringify({ data: { responseCount: 23 } }) };
  } });
  if (action !== 'dashboard-delete') {
    assert.equal((await client({ action })).responseCount, 23);
    assert.equal(signedRequests.length, 2);
    assert.notEqual(signedRequests[0].nonce, signedRequests[1].nonce, 'read retry must not replay the signed envelope');
  } else {
    await rejectsQuietly(() => client({ action }), /invalid data/);
    assert.equal(signedRequests.length, 1, 'never retry a deletion after an uncertain response');
  }
}
let failedReadAttempts = 0;
const unavailableReader = createGasReader({url:'https://script.google.com/macros/s/test/exec',secret:'test-secret',fetchImpl:async()=>{
  failedReadAttempts++;
  return {status:404,ok:false,text:async()=>'<html>Temporary Google error</html>'};
}});
await rejectsQuietly(() => unavailableReader(id), /request failed/);
assert.equal(failedReadAttempts, 2, 'stop after one read retry');

const sessionSecret = 'session-secret-long-enough-for-this-test';
const session = createSessionToken({ sub: 'google-sub', email: 'owner@example.com' }, sessionSecret, 1789991800000);
assert.equal(readSessionToken(session, sessionSecret, 1789991800000).email, 'owner@example.com');

const calls = [];
const dashboard = registeredDashboardHandler({
  secret: sessionSecret,
  now: () => 1789991800000,
  callGas: async payload => {
    calls.push(payload);
    if (payload.action === 'dashboard-authorize') return { role: payload.email === 'owner@example.com' ? 'owner' : '' };
    return { weeks: [] };
  }
});
const response = () => ({ headers: {}, statusCode: 0, body: null,
  setHeader(name, value) { this.headers[name] = value; },
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; }
});
const denied = response();
await dashboard({ method: 'GET', headers: {}, query: {} }, denied);
assert.equal(denied.statusCode, 401);
assert.equal(calls.length, 0);

const forbidden = response();
const managerSession = createSessionToken({ sub: 'member-sub', email: 'member@example.com' }, sessionSecret, 1789991800000);
await dashboard({ method: 'GET', headers: { cookie: `meal_session=${managerSession}` }, query: {} }, forbidden);
assert.equal(forbidden.statusCode, 403);
assert.equal(calls.length, 1);
assert.equal(calls[0].action, 'dashboard-authorize');

const allowed = response();
await dashboard({ method: 'GET', headers: { cookie: `meal_session=${session}` }, query: {} }, allowed);
assert.equal(allowed.statusCode, 200);
assert.deepEqual(allowed.body.weeks, []);
assert.equal(calls.at(-1).action, 'dashboard-overview');

const ownerCalls = [];
const ownerDashboard = registeredDashboardHandler({
  secret: sessionSecret,
  now: () => 1789991800000,
  callGas: async payload => {
    ownerCalls.push(payload);
    if (payload.action === 'dashboard-authorize') return { role: 'owner' };
    if (payload.action === 'dashboard-script-auth') return { authorizationRequired: true, authorizationUrl: 'https://script.google.com/oauth/authorize' };
    return { deleted: true };
  }
});
const scriptAuth = response();
await ownerDashboard({
  method: 'POST',
  headers: { cookie: `meal_session=${session}`, origin: 'https://menutaythanh.vercel.app', host: 'menutaythanh.vercel.app' },
  body: { action: 'authorize-script' }
}, scriptAuth);
assert.equal(scriptAuth.statusCode, 200);
assert.deepEqual(scriptAuth.body, { authorizationRequired: true, authorizationUrl: 'https://script.google.com/oauth/authorize' });
assert.equal(ownerCalls.at(-1).action, 'dashboard-script-auth');

const managerCalls = [];
const managerDashboard = registeredDashboardHandler({
  secret: sessionSecret,
  now: () => 1789991800000,
  callGas: async payload => {
    managerCalls.push(payload);
    return payload.action === 'dashboard-authorize' ? { role: 'manager' } : { authorizationRequired: true };
  }
});
const managerAuth = response();
await managerDashboard({
  method: 'POST',
  headers: { cookie: `meal_session=${managerSession}`, origin: 'https://menutaythanh.vercel.app', host: 'menutaythanh.vercel.app' },
  body: { action: 'authorize-script' }
}, managerAuth);
assert.equal(managerAuth.statusCode, 403);
assert.equal(managerCalls.length, 1);

const ownerDelete = response();
await ownerDashboard({
  method: 'DELETE',
  headers: { cookie: `meal_session=${session}`, origin: 'https://menutaythanh.vercel.app', host: 'menutaythanh.vercel.app' },
  body: { action: 'dashboard-add-email', email: 'attacker@example.com', weekKey: '2026-09-21' }
}, ownerDelete);
assert.equal(ownerDelete.statusCode, 200);
assert.equal(ownerCalls.at(-1).action, 'dashboard-delete');
assert.equal(ownerCalls.at(-1).email, 'owner@example.com');
console.log('Viewer, dashboard authorization, and session-email checks passed');
