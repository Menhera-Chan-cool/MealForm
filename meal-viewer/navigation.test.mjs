import {registeredViewerHandler} from './test-helpers/registered-session.mjs';
import assert from 'node:assert/strict';
import { rootRedirectTarget, weekNavigation, viewerApiUrl } from './src/viewer-model.mjs';
import { createViewerHandler } from './api/security.mjs';

assert.equal(rootRedirectTarget('/old', ''), '/history');
assert.equal(rootRedirectTarget('/old/', '?view=old-sheet'), '/history');
assert.equal(viewerApiUrl('/old', '?view=old-sheet'), '', 'retired route must not request old data');
assert.equal(weekNavigation('/newest').some(link => link.href === '/old'), false);
assert.deepEqual(weekNavigation('/newest'), [{ href: '/next', label: 'Tuần sau' }]);
assert.deepEqual(weekNavigation('/old'), []);
const result = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
let reads = 0;
await registeredViewerHandler({ secret: 'test', readViewerData: async () => { reads++; return {}; } })({ method: 'GET', headers: {}, query: { old: '1' } }, result);
assert.equal(result.code, 410);
assert.equal(reads, 0, 'old query must not bypass authenticated history');
console.log('Retired old URL and API, history redirect and week navigation passed');
