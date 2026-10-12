import assert from 'node:assert/strict';
import * as model from './src/dashboard-model.mjs';
import { createDashboardHandler, createSessionToken } from './api/security.mjs';

assert.equal(typeof model.filterAuditHistory,'function','whole-week audit filtering is missing');
const events=[
 {id:'a',actor:'owner@example.com',action:'deleted',at:Date.parse('2026-10-11T17:00:00Z'),note:'Sửa nhầm món'},
 {id:'b',actor:'admin@example.com',action:'delete-review',at:Date.parse('2026-10-12T16:59:59Z'),note:'Cần kiểm tra'},
 {id:'c',actor:'owner@example.com',action:'form-control-pending',at:Date.parse('2026-10-12T17:00:00Z'),note:''}
];
assert.deepEqual(model.filterAuditHistory(events,{from:'2026-10-12',to:'2026-10-12'}).map(e=>e.id),['a','b']);
assert.deepEqual(model.filterAuditHistory(events,{actor:'owner@example.com',note:'sua nham'}).map(e=>e.id),['a']);
assert.deepEqual(model.filterAuditHistory(events,{errorsOnly:true}).map(e=>e.id),['b','c']);
assert.deepEqual(model.filterAuditHistory(events,{action:'deleted'}).map(e=>e.id),['a']);
assert.deepEqual(model.filterAuditHistory(events,{from:'2026-10-13',to:'2026-10-12'}),[]);

assert.equal(typeof model.applyRegionResult,'function','atomic region replacement is missing');
const menu={title:'Keep',days:Array.from({length:5},(_,i)=>({day:`Thứ ${i+2}`,date:`${12+i}/10/2026`,meals:['Gà','Cá','Bún'],...(i===1?{closed:true}:{})}))};
const slot=model.applyRegionResult(menu,{mode:'meal',dayIndex:1,mealIndex:1},{text:'Cá mới'});
assert.deepEqual(slot.days[1].meals,['Gà','Cá mới','Bún']);assert.equal(slot.days[1].closed,true);assert.equal(slot.title,'Keep');assert.equal(menu.days[1].meals[1],'Cá');
const day=model.applyRegionResult(menu,{mode:'day',dayIndex:0},{date:'19/10/2026',meals:['Mì','Nui','Cơm']});
assert.equal(day.days[0].date,'19/10/2026');assert.deepEqual(day.days[1],menu.days[1]);
assert.throws(()=>model.applyRegionResult(menu,{mode:'meal',dayIndex:7,mealIndex:1},{text:'x'}));
assert.throws(()=>model.applyRegionResult(menu,{mode:'meal',dayIndex:0,mealIndex:1},{text:'x'.repeat(501)}));
assert.equal(typeof model.cropPixelRect,'function','crop coordinates are missing');
assert.deepEqual(model.cropPixelRect({x:25,y:10,width:50,height:40},1000,500),{x:250,y:50,width:500,height:200});
assert.throws(()=>model.cropPixelRect({x:90,y:0,width:50,height:30},1000,500));
assert.throws(()=>model.cropPixelRect({x:0,y:0,width:.1,height:.1},100,100));
assert.equal(typeof model.accountRoleLabel,'function');
assert.equal(model.accountRoleLabel({role:'owner'}),'Chủ sở hữu');
assert.equal(model.accountRoleLabel({role:'manager',permissions:{view:true,create:false,manageResponses:false}}),'Chỉ xem');
assert.equal(model.accountRoleLabel({role:'manager',permissions:{view:true,create:true,manageResponses:false}}),'Quản trị');
assert.equal(typeof model.isNewBuild,'function');
assert.equal(model.isNewBuild({id:'build-2'},'build-1'),true);assert.equal(model.isNewBuild({id:'build-1'},'build-1'),false);
assert.equal(model.isNewBuild({id:'<html>'},'build-1'),false);assert.equal(model.isNewBuild({},'build-1'),false);

const secret='test-session-secret';const token=createSessionToken({sub:'me',email:'verified@example.com'},secret);
const calls=[];const handler=createDashboardHandler({secret,callGas:async p=>{calls.push(p);return p.action==='dashboard-authorize'?{role:'manager',permissions:{view:true,create:false,manageResponses:false}}:{weeks:[],email:'untrusted@example.com'};}});
const response=()=>({setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}});
const headers={cookie:`meal_session=${token}`,origin:'https://example.com',host:'example.com'};
for(const query of [{access:'1'},{}]){const res=response();await handler({method:'GET',headers,query},res);assert.equal(res.body.email,'verified@example.com','badge identity must come from signed session');}
const invalid=response();await handler({method:'GET',headers,query:{week:'week',batch:'1',offset:'oops'}},invalid);assert.equal(invalid.code,400);
const valid=response();await handler({method:'GET',headers,query:{week:'week',batch:'1',offset:'50',query:'truong',sort:'name'}},valid);assert.equal(calls.at(-1).action,'dashboard-batch');assert.equal(calls.at(-1).offset,50);assert.equal(calls.at(-1).query,'truong');
const denied=response();const count=calls.length;await handler({method:'POST',headers,body:{action:'ocr-region',image:'fake',target:{mode:'meal',dayIndex:0,mealIndex:1}}},denied);assert.equal(denied.code,403);assert.equal(calls.length,count+1,'denied OCR region must not reach provider');
console.log('Audit criteria, region edits/crops, role/version contracts and private API validation passed');
