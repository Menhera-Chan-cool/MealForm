const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, 'MealForm.gs'), 'utf8');
const scriptProperties = new Map([['MEAL_FORM_OWNER_EMAIL', 'owner@example.com']]);
const userProperties = new Map([['MEAL_DASHBOARD_ALLOWED_EMAILS', '["manager@example.com"]']]);
let authorizationRequired = true;
let authorizationUrlReads = 0;
let authorizationChecks = 0;
const context = {
  PropertiesService: {
    getScriptProperties: () => ({ getProperty: key => scriptProperties.get(key) || '' }),
    getUserProperties: () => ({ getProperty: key => userProperties.get(key) || '' })
  },
  ScriptApp: {
    AuthMode: { FULL: 'FULL' },
    AuthorizationStatus: { REQUIRED: 'REQUIRED', NOT_REQUIRED: 'NOT_REQUIRED' },
    getAuthorizationInfo: mode => {
      authorizationChecks++;
      assert.equal(mode, 'FULL');
      return {
        getAuthorizationStatus: () => authorizationRequired ? 'REQUIRED' : 'NOT_REQUIRED',
        getAuthorizationUrl: () => { authorizationUrlReads++; return 'https://script.google.com/oauth/authorize'; }
      };
    }
  }
};
vm.runInNewContext(source, context);

assert.deepEqual(JSON.parse(JSON.stringify(context.handleMealDashboardRequest_({
  action: 'dashboard-script-auth', email: 'owner@example.com'
}))), { authorizationRequired: true, authorizationUrl: 'https://script.google.com/oauth/authorize' });
assert.throws(() => context.handleMealDashboardRequest_({
  action: 'dashboard-script-auth', email: 'manager@example.com'
}), /Chỉ chủ sở hữu/);
assert.equal(authorizationChecks, 1);
assert.equal(authorizationUrlReads, 1);

authorizationRequired = false;
assert.deepEqual(JSON.parse(JSON.stringify(context.handleMealDashboardRequest_({
  action: 'dashboard-script-auth', email: 'owner@example.com'
}))), { authorizationRequired: false, authorizationUrl: '' });
assert.equal(authorizationChecks, 2);
assert.equal(authorizationUrlReads, 1);
console.log('Apps Script permission-link owner guard checks passed');
