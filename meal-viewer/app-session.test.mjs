import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import * as security from './api/security.mjs';
assert.equal(typeof security.createSessionHandler,'function','Google session handler must use the durable registry');
const now=Date.parse('2026-10-18T02:00:00Z'),secret='a'.repeat(40),clientId='test-client',account='google-sub',email='owner@example.com',requests=[];
const reply=()=>({headers:{},setHeader(key,value){this.headers[key]=value;},status(code){this.code=code;return this;},json(body){this.body=body;return this;}});
const headers={host:'example.com',origin:'https://example.com','user-agent':'Mozilla/5.0 (Windows NT 10.0) Chrome/128.0.0.0 Safari/537.36'};
const records=new Map();let fail=false;
const callGas=async payload=>{
  requests.push(payload);if(fail)throw Error('Store down PRIVATE_SECRET');
  const key=payload.accountKey+':'+payload.sessionKey;
  if(payload.action==='dashboard-authorize')return {sessionActive:records.has(payload.session.accountKey+':'+payload.session.sessionKey)};
  if(payload.action==='session-register'){records.set(key,payload.label);return {active:true};}
  if(payload.action==='session-revoke'){if(!records.has(key))return {active:false};records.delete(payload.accountKey+':'+payload.targetId);return {active:true,revoked:true};}
  return {active:records.has(key),sessions:records.has(key)?[{id:payload.sessionKey,current:true,label:records.get(key),createdAt:now,lastSeen:now,expiresAt:now+2592000000}]:[]};
};
const verifyGoogle=async()=>({sub:account,email,email_verified:true,aud:clientId,iss:'https://accounts.google.com',iat:now/1000,exp:now/1000+3600});
const handler=security.createSessionHandler({secret,clientId,callGas,verifyGoogle,now:()=>now});
const badBody=reply();await handler({method:'POST',headers,body:'{'},badBody);assert.equal(badBody.code,400);assert.equal(requests.length,0);
const atCapacity=security.createSessionHandler({secret,clientId,verifyGoogle,now:()=>now,callGas:async()=>{throw Error('MEAL_SESSION_LIMIT');}}),capacity=reply();await atCapacity({method:'POST',headers,body:{credential:'google-proof'}},capacity);assert.equal(capacity.code,409);assert.match(capacity.body.error,/8 phiên/);assert.equal(capacity.headers['Set-Cookie'],undefined);
const login=reply();await handler({method:'POST',headers,body:{credential:'google-proof',sessionKey:'attacker',accountKey:'attacker'}},login);
assert.equal(login.code,200);assert.match(login.headers['Set-Cookie'],/HttpOnly; SameSite=Lax; Max-Age=2592000; Secure/);
const cookie=login.headers['Set-Cookie'].split(';')[0],identity=security.readSessionToken(cookie.slice('meal_session='.length),secret,now);
const legacyPayload=Buffer.from(JSON.stringify({sub:account,email,exp:now/1000+3600})).toString('base64url'),legacyCookie='meal_session='+legacyPayload+'.'+createHmac('sha256',secret).update(legacyPayload).digest('base64url');
const legacy=reply(),beforeLegacy=requests.length;await handler({method:'GET',headers:{...headers,cookie:legacyCookie}},legacy);assert.equal(legacy.body.authenticated,false);assert.equal(legacy.headers['Set-Cookie'],undefined);assert.equal(requests.length,beforeLegacy,'legacy cookie cannot bootstrap a new registry record');
assert.match(identity.sid,/^[A-Za-z0-9_-]{43}$/);assert.equal(records.size,1);
assert.equal(requests.some(payload=>JSON.stringify(payload).includes(identity.sid)||JSON.stringify(payload).includes('google-proof')),false);
const current=reply();await handler({method:'GET',headers:{...headers,cookie},query:{}},current);assert.equal(current.body.authenticated,true);
assert.equal(security.readSessionToken(current.headers['Set-Cookie'].split(';')[0].slice('meal_session='.length),secret,now).sid,identity.sid);
const list=reply();await handler({method:'GET',headers:{...headers,cookie},query:{list:'1'}},list);assert.equal(list.body.sessions.length,1);assert.equal(JSON.stringify(list.body).includes(identity.sid),false);
const csrf=reply();await handler({method:'DELETE',headers:{...headers,cookie,origin:'https://attacker.example'},query:{}},csrf);assert.equal(csrf.code,403);assert.equal(records.size,1);
fail=true;const offline=reply();await handler({method:'GET',headers:{...headers,cookie},query:{}},offline);assert.equal(offline.code,503);assert.equal(offline.headers['Set-Cookie'],undefined);assert.equal(JSON.stringify(offline.body).includes('PRIVATE_SECRET'),false);
fail=false;const out=reply();await handler({method:'DELETE',headers:{...headers,cookie},query:{}},out);assert.equal(out.code,200);assert.match(out.headers['Set-Cookie'],/Max-Age=0/);
const revoked=reply();await handler({method:'GET',headers:{...headers,cookie},query:{}},revoked);assert.equal(revoked.body.authenticated,false);assert.equal(revoked.headers['Set-Cookie'],undefined);
const calls=requests.length;const expired=reply();await handler({method:'GET',headers:{...headers,cookie:'meal_session='+security.createSessionToken({...identity},secret,now-31*86400000)},query:{}},expired);assert.equal(expired.body.authenticated,false);assert.equal(requests.length,calls);
for(const name of ['createDashboardHandler','createHistoryHandler','createViewerHandler']){
  const res=reply();let reads=0;const privateHandler=security[name]({secret,now:()=>now,callGas:async payload=>{reads++;return callGas(payload);},readViewerData:async()=>{reads++;throw Error('MEAL_SESSION_REVOKED');}});
  await privateHandler({method:'GET',headers:{cookie},query:name==='createViewerHandler'?{view:'sheet'}:{}},res);
  assert.equal(res.code,401);assert.equal(reads,1,'revocation must be checked before reading private records');
}
console.log('Session API: verified Google registration, same-ID renewal, scoped listing, CSRF and fail-closed revoke passed');
