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
assert.equal(nav.DEFAULT_DASHBOARD_TAB,'delete');
const shellTabs=['delete','reconcile','create'],fb={tab:'delete',week:'w1'};
assert.deepEqual(nav.readDashboardLocation('?tab=overview&week=w1',shellTabs,[{weekKey:'w1'}],fb),{tab:'delete',week:'w1'});
assert.deepEqual(nav.readDashboardLocation('?tab=overview&week=w1',['overview','delete'],[{weekKey:'w1'}],{tab:'overview',week:'w1'}),{tab:'overview',week:'w1'});
assert.deepEqual(nav.readDashboardLocation('?tab=branding&week=w1',shellTabs,[{weekKey:'w1'}],fb),fb,'owner-only tab absent from the allowed list falls back');
console.log('Only allowed Dashboard tabs/registered weeks and bounded same-account history are accepted');
