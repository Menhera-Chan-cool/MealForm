import assert from 'node:assert/strict';
let nav;try{nav=await import('./src/dashboard-navigation.mjs');}catch{}
assert.equal(typeof nav?.readDashboardLocation,'function');
const tabs=['overview','delete','create'],weeks=[{weekKey:'registered-week'}],fallback={tab:'overview',week:'registered-week'};
assert.deepEqual(nav.readDashboardLocation('?tab=delete&week=registered-week&query=private',tabs,weeks,fallback),{tab:'delete',week:'registered-week'});
assert.deepEqual(nav.readDashboardLocation('?tab=access&week=unregistered',tabs,weeks,fallback),fallback);
assert.equal(nav.dashboardHref('delete','registered-week'),'/dashboard?tab=delete&week=registered-week');
assert.equal(nav.readDashboardHistory({account:'a',index:2,at:100,tab:'delete',week:'registered-week'},'a',101)?.index,2);
assert.equal(nav.readDashboardHistory({account:'a',index:2,at:100},'b',101),null);
assert.equal(nav.readDashboardHistory({account:'a',index:2,at:100},'a',86400100),null);
assert.equal(nav.readDashboardHistory({account:'a',index:-1,at:100},'a',101),null);
console.log('Only allowed Dashboard tabs/registered weeks and bounded same-account history are accepted');
