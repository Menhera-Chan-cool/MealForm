import assert from 'node:assert/strict';
import * as viewer from './src/viewer-model.mjs';
import {sameDisplayDay,calendarDayChoices} from './src/reading-ui.mjs';
import {viewerPageTitle,compactDayLabel} from './src/ui-clarity.mjs';
const now='2026-10-28T03:00:00Z';
const labels=['26','27','28','29','30'].map((day,index)=>'Thứ '+(index+2)+' ('+day+'.10.2026)');
assert.equal(viewer.todayDayLabel(labels,now),labels[2],'dot-formatted service dates must enable Today without changing the raw label');
assert.equal(typeof viewer.parseServingDay,'function');
assert.deepEqual(viewer.parseServingDay(labels[2]),{key:'2026-10-28',text:'28.10.2026'});
for(const separator of ['/','.','-']){
 const label='Thứ 4 (28'+separator+'10'+separator+'2026)';
 assert.equal(viewer.todayDayLabel([label],now),label);
 assert.equal(sameDisplayDay(label,'28/10/2026'),true);
 assert.equal(compactDayLabel(label),'T4 · 28/10');
}
for(const bad of ['31.02.2026','29/02/2026','28/10.2026','128.10.2026','28.10.20260','not a date'])assert.equal(viewer.parseServingDay(bad),null,bad);
assert.deepEqual(viewer.parseServingDay('29.02.2028'),{key:'2028-02-29',text:'29.02.2028'});
assert.equal(viewer.todayDayLabel(labels,'2026-10-27T16:59:59Z'),labels[1]);
assert.equal(viewer.todayDayLabel(labels,'2026-10-27T17:00:00Z'),labels[2]);
assert.equal(viewer.todayDayLabel(labels,'2026-11-01T03:00:00Z'),'');
assert.deepEqual(calendarDayChoices([labels[0],labels[2]],['27/10/2026'],[labels[2],labels[1],labels[0]]),[labels[0],'27/10/2026',labels[2]]);
assert.equal(viewerPageTitle({calendarDays:labels},'Fallback'),'Tuần 26–30/10/2026 · Thực đơn');
const formUrl='https://docs.google.com/forms/d/e/synthetic/viewform';
assert.equal(viewer.mealRegistrationTarget({formStatus:'closed',nextForm:{formStatus:'open',formUrl,days:[{day:'Thứ 2 (02.11.2026)'},{day:'Thứ 6 (06.11.2026)'}]}},true).dates,'02.11.2026 – 06.11.2026');
const data={headers:['Timestamp','Họ tên',...labels],days:labels.map(day=>({day,meals:['Cơm','Bún']})),rows:[['time','A',...labels.map(()=>'Cơm')]]},before=JSON.stringify(data);
const model=viewer.buildDetailModel(data,{...viewer.readViewerFilters(''),day:viewer.todayDayLabel(data.days,now)});
assert.equal(model.rows.length,1);assert.equal(JSON.stringify(data),before,'display parsing must not normalize stored headers, dates or response identity');
console.log('Serving dates accept real dot/slash/dash labels, reject invalid/mixed dates and preserve exact source filters');
