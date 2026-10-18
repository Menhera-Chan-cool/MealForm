import assert from 'node:assert/strict';
import { OAuth2Client } from 'google-auth-library';

import { createSessionToken, readSessionToken } from './api/security.mjs';

const now = Date.now();
const day = 86400000;
const secret = 'test-session-secret-at-least-32-characters';
const identity = {sub:'test-user',email:'owner@example.com'};
const token = createSessionToken(identity,secret,now);
assert.equal(readSessionToken(token,secret,now+2*day)?.email,'owner@example.com','remember login beyond the old one-hour expiry');
assert.equal(readSessionToken(token,secret,now+30*day),null);
const savedEnv = {GAS_API_URL:process.env.GAS_API_URL,GAS_DASHBOARD_HMAC_SECRET:process.env.GAS_DASHBOARD_HMAC_SECRET,SESSION_SECRET:process.env.SESSION_SECRET,GOOGLE_OAUTH_CLIENT_ID:process.env.GOOGLE_OAUTH_CLIENT_ID,NODE_ENV:process.env.NODE_ENV};
Object.assign(process.env,{GAS_API_URL:'https://script.google.com/macros/s/session-test/exec',GAS_DASHBOARD_HMAC_SECRET:secret,SESSION_SECRET:secret,GOOGLE_OAUTH_CLIENT_ID:'test-client',NODE_ENV:'production'});
const response = () => ({headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(body){this.body=body;return this;}});
const headers = {origin:'https://example.com',host:'example.com','x-forwarded-proto':'https'};
const verify = OAuth2Client.prototype.verifyIdToken,actualFetch=globalThis.fetch;
const active=new Set();globalThis.fetch=async(_url,options)=>{const request=JSON.parse(JSON.parse(options.body).payload),key=request.accountKey+':'+request.sessionKey;if(request.action==='session-register')active.add(key);const data={active:active.has(key),...(request.action==='session-revoke'?{revoked:true}: {})};if(request.action==='session-revoke')active.delete(request.accountKey+':'+request.targetId);return {ok:true,status:200,text:async()=>JSON.stringify({data})};};
const {default:sessionHandler}=await import('./api/session.js?registered-fixture');
try {
  OAuth2Client.prototype.verifyIdToken = async () => ({getPayload:()=>({ ...identity,email_verified:true,aud:'test-client',iss:'https://accounts.google.com',iat:Math.floor(now/1000),exp:Math.floor(now/1000)+3600 })});
  const signedIn=response();
  await sessionHandler({method:'POST',headers,body:{credential:'test-google-credential'}},signedIn);
  assert.equal(signedIn.code,200);
  assert.match(signedIn.headers['Set-Cookie'],/HttpOnly; SameSite=Lax; Max-Age=2592000; Secure/);
  const returning=response();
  const signedCookie=signedIn.headers['Set-Cookie'].split(';')[0].slice('meal_session='.length),registeredIdentity=readSessionToken(signedCookie,secret,now);
  const older=createSessionToken(registeredIdentity,secret,now-20*day);
  await sessionHandler({method:'GET',headers:{cookie:`meal_session=${older}`}},returning);
  assert.equal(returning.body.authenticated,true);
  const renewed=returning.headers['Set-Cookie'].split(';')[0].slice('meal_session='.length);
  assert.equal(readSessionToken(renewed,secret,now+29*day)?.email,'owner@example.com','renew on return');
  const expired=response();
  await sessionHandler({method:'GET',headers:{cookie:`meal_session=${createSessionToken(identity,secret,now-31*day)}`}},expired);
  assert.equal(expired.body.authenticated,false);
  assert.equal(expired.headers['Set-Cookie'],undefined,'never renew expired sessions');
  const denied=response();
  await sessionHandler({method:'DELETE',headers:{...headers,origin:'https://attacker.example'}},denied);
  assert.equal(denied.code,403);
  assert.equal(denied.headers['Set-Cookie'],undefined);
  const signedOut=response();
  await sessionHandler({method:'DELETE',headers},signedOut);
  assert.match(signedOut.headers['Set-Cookie'],/Max-Age=0; Secure/);
  const cleared=response();
  await sessionHandler({method:'GET',headers:{cookie:'meal_session='}},cleared);
  assert.equal(cleared.body.authenticated,false);
} finally {
  OAuth2Client.prototype.verifyIdToken=verify;globalThis.fetch=actualFetch;
  for(const [key,value] of Object.entries(savedEnv))if(value===undefined)delete process.env[key];else process.env[key]=value;
}
console.log('Persistent session, renewal, expiry, cookie security and explicit logout passed');
