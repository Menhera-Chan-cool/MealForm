import assert from 'node:assert/strict';

const actualFetch = globalThis.fetch;
const { readLoginState } = await import('./src/session-client.mjs');
const reply=(status,body)=>({status,ok:status>=200&&status<300,json:async()=>body});
try {
  for(const [status,expected] of [[401,'anonymous'],[403,'forbidden'],[502,'error']]) {
    let requests=0;
    globalThis.fetch=async(_, options)=>{
      assert.equal(options.method || 'GET', 'GET', 'checking a timed-out session must never delete its cookie');
      return ++requests===1?reply(200,{authenticated:true}):reply(status,{error:'test failure'});
    };
    assert.equal((await readLoginState(true)).auth,expected,'distinguish session, permission and network errors');
  }
  globalThis.fetch=async()=>{throw new TypeError('network unavailable');};
  assert.equal((await readLoginState(true)).auth,'error','network failure must not force a Google login');
  globalThis.fetch=async()=>reply(200,{authenticated:false});
  assert.equal((await readLoginState(true)).auth,'anonymous');
  const dashboard={role:'owner',weeks:[],permissions:{view:true,create:true,manageResponses:true}};
  globalThis.fetch=async url=>url==='/api/session'?reply(200,{authenticated:true}):reply(200,dashboard);
  assert.deepEqual(await readLoginState(true),{auth:'authenticated',dashboardData:dashboard,message:''});
} finally {globalThis.fetch=actualFetch;}
console.log('Session recovery distinguishes expired login, forbidden access and transient failures');
