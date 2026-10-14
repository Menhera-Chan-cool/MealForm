import assert from 'node:assert/strict';
const ui=await import('./src/ui-model.mjs').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;});
assert.equal(typeof ui.weekChoices,'function','grouped choices must preserve every concrete week identity');
const weeks=[
  {weekKey:'2026-10-19_2026-10-23',name:'Trùng'},
  {weekKey:'broken',name:'Chưa rõ ngày'},
  {weekKey:'2026-10-12_2026-10-16',name:'Tuần này'},
  {weekKey:'2026-09-28_2026-10-02',name:'Trùng'}
];
const choices=ui.weekChoices(weeks,Date.parse('2026-10-14T00:00:00Z'));
assert.deepEqual(choices.map(w=>w.group),['Tuần này','Tuần sau','Tuần đã qua','Tuần khác']);
assert.deepEqual(new Set(choices.map(w=>w.weekKey)),new Set(weeks.map(w=>w.weekKey)));
assert.equal(new Set(choices.map(w=>w.label)).size,4);
assert.equal(ui.weekChoices([weeks[0]],Date.parse('2026-10-18T17:00:00Z'))[0].group,'Tuần này');
assert.equal(ui.weekChoices([{weekKey:'2026-02-31_2026-03-04',name:'Ngày lỗi'}],Date.parse('2026-10-14T00:00:00Z'))[0].group,'Tuần khác');
assert.deepEqual(ui.weekMonths(weeks[3]),['2026-09','2026-10']);
assert.deepEqual(ui.weekMonths({weekKey:'2026-12-28_2027-01-01'}),['2026-12','2027-01']);
assert.deepEqual(ui.weekMonths({weekKey:'2026-02-31_2026-03-04'}),[]);
assert.deepEqual(ui.weekMonths({startDate:'2026-01-01',endDate:'2027-01-01'}),[]);
assert.deepEqual(ui.archiveMonths(weeks),['2026-10','2026-09']);
const rows=ui.monthRows('2026-10');
assert.equal(rows.length,6);assert.equal(rows[0].length,7);
assert.equal(rows[0][0].date,'2026-09-28');assert.equal(rows[0][0].inMonth,false);
assert.equal(rows[5][6].date,'2026-11-08');
assert.deepEqual(ui.monthRows('2026-13'),[]);
assert.deepEqual(ui.monthRows('invalid'),[]);
assert.equal(ui.weekOverlaps(weeks[3],'2026-10-01','2026-10-31'),true);
assert.equal(ui.weekOverlaps(weeks[0],'2026-09-01','2026-09-30'),false);
console.log('Week grouping, actual ranges and month/year boundary calendar projections passed');
const {buildDetailModel,ALL}=await import('./src/viewer-model.mjs');
const data={headers:['Timestamp','Họ tên','Thứ 2 (12/10/2026)','Thứ 4 (14/10/2026)'],days:[{day:'Thứ 2 (12/10/2026)'},{day:'Thứ 4 (14/10/2026)'}],rows:[['08/10/2026 10:00:00','Trường','Gà','Cá'],['08/10/2026 09:00:00','Trường','Cá','Gà']]};
const full=buildDetailModel(data,{name:ALL,day:ALL,meal:ALL});
assert.equal(full.nameIndex,1);assert.equal(full.timeIndex,0);
const day=buildDetailModel(data,{name:ALL,day:'Thứ 4 (14/10/2026)',meal:ALL});
assert.equal(day.nameIndex,0);assert.equal(day.timeIndex,-1);assert.deepEqual(day.rowTimes,['08/10/2026 10:00:00','08/10/2026 09:00:00']);
assert.deepEqual(day.rows,[['Trường','Cá'],['Trường','Gà']]);
const meal=buildDetailModel(data,{name:ALL,day:ALL,meal:'Gà'});
assert.deepEqual(meal.rowTimes,['08/10/2026 10:00:00','08/10/2026 09:00:00']);
assert.deepEqual(meal.rows,[['Trường','Thứ 2 (12/10/2026)','Gà'],['Trường','Thứ 4 (14/10/2026)','Gà']]);
assert.equal(typeof ui.ocrStage,'function');
assert.equal(ui.ocrStage(null,'idle'),0);
assert.equal(ui.ocrStage({days:[]},'idle'),1);
assert.equal(ui.ocrStage({days:[]},'creating'),2);
assert.equal(ui.ocrStage(null,'done'),2);
