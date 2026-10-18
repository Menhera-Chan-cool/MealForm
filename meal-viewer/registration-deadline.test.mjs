import {registeredViewerHandler,registeredHistoryHandler} from './test-helpers/registered-session.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as model from './src/viewer-model.mjs';
import {createViewerHandler,createHistoryHandler,createSessionToken} from './api/security.mjs';

assert.equal(typeof model.registrationDeadlineTime,'function');
assert.equal(typeof model.registrationRemaining,'function');
const now=Date.parse('2026-10-15T03:00:00Z'),deadline='2026-10-16T12:00:00+07:00';
assert.equal(model.registrationDeadlineTime(deadline),Date.parse('2026-10-16T05:00:00Z'));
for(const bad of [undefined,null,0,{},'', '2026-10-16', '2026-10-16T12:00:00','2026-02-30T12:00:00+07:00','2026-10-16T24:00:00Z','no-date'])assert.equal(model.registrationDeadlineTime(bad),null);
for(const [at,status,time,want] of [[deadline,'open',now,'Còn khoảng 1 ngày 2 giờ'],[deadline,'closed',now,''],[deadline,'unknown',now,''],[deadline,'open',Date.parse(deadline)-59000,'Còn dưới 1 phút'],[deadline,'open',Date.parse(deadline),'Đã đến hạn; trạng thái Form do máy chủ xác nhận.'],['','open',now,'']])assert.equal(model.registrationRemaining(at,status,time),want);

const response=()=>({setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}});
for(const invalid of [false,true]){
  const reply=response();await registeredViewerHandler({secret:'test',now:()=>now,readViewerData:async(_id,_refresh,action)=>({formStatus:action==='read-next-viewer'?'open':'closed',formUrl:'https://docs.google.com/forms/d/e/example/viewform',lockAt:invalid?'bad':action==='read-next-viewer'?deadline:'2026-10-12T00:00:00+07:00',calendarDays:['Thứ 2 (19/10/2026)'],closedDays:['Thứ 2 (19/10/2026)'],days:[{day:'Thứ 3 (20/10/2026)'}],rows:[['private']],customLockAt:'private'})})({method:'GET',headers:{},query:{newest:'1'}},reply);
  assert.equal(reply.body.lockAt,invalid?null:'2026-10-12T00:00:00+07:00');
  assert.equal(reply.body.nextForm.lockAt,invalid?null:deadline);
  assert.equal(reply.body.nextForm.serverNow,now);
  assert.deepEqual(reply.body.nextForm.calendarDays,['Thứ 2 (19/10/2026)']);
  assert.equal(reply.body.nextForm.rows,undefined);assert.equal(reply.body.customLockAt,undefined);
  const target=model.mealRegistrationTarget(reply.body,true);assert.equal(target.lockAt,invalid?null:deadline);assert.equal(target.serverNow,now);
}
const archived=response(),token=createSessionToken({email:'owner@example.com',sub:'owner'},'test',now);
await registeredHistoryHandler({secret:'test',now:()=>now,readViewerData:async()=>({lockAt:deadline})})({method:'GET',headers:{cookie:'meal_session='+token},query:{week:'2026-10-12_2026-10-13_2026-10-14_2026-10-15_2026-10-16'}},archived);
assert.equal(archived.body.lockAt,deadline);

const gas=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../MealForm.gs',import.meta.url),'utf8'),gas);
const key='2026-10-12_2026-10-13_2026-10-14_2026-10-15_2026-10-16',entry={formId:'form',customLockAt:deadline};
gas.getMealFormWeekKeyBySpreadsheetId_=()=>key;gas.getMealFormRegistry_=()=>({[key]:entry});
gas.FormApp={openById:()=>({isAcceptingResponses:()=>true})};
assert.equal(gas.getViewerFormInfo_('sheet',null,'').lockAt,deadline,'same customized deadline as Dashboard without extra Form reads');
const sheet={getFormUrl:()=> 'https://docs.google.com/forms/d/e/example/viewform',getLastColumn:()=>3,getLastRow:()=>1,getRange:()=>({getDisplayValues:()=>[['Timestamp','Họ và tên','Thứ 2 (12/10/2026)']]})};
gas.SpreadsheetApp={openById:()=>({getSheets:()=>[sheet],getName:()=> 'Tuần minh họa',getSheetByName:()=>null})};
gas.getMealClosedDaysForViewer_=()=>({});
assert.equal(gas.readViewerData_('sheet').lockAt,deadline,'deadline reaches the actual Apps Script viewer result');
delete entry.customLockAt;assert.equal(gas.getViewerFormInfo_('sheet',null,'').lockAt,'2026-10-12T00:00:00+07:00');
gas.FormApp.openById=()=>{throw Error('denied');};assert.equal(gas.getViewerFormInfo_('sheet',null,'').lockAt,'2026-10-12T00:00:00+07:00','known registry deadline survives unavailable Form status');
gas.getMealFormWeekKeyBySpreadsheetId_=()=>'';assert.equal(gas.getViewerFormInfo_('unregistered',null,'').lockAt,'','no made-up deadline for arbitrary sheets');
console.log('Actual configured deadline, public gateway, archive, next-week and remaining-time checks passed');
