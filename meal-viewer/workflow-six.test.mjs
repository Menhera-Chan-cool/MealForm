import assert from 'node:assert/strict';
import * as viewer from './src/viewer-model.mjs';
import * as drafts from './src/draft-tools.mjs';
import * as brand from './src/branding.mjs';
import * as layout from './src/table-layout.mjs';
import {menuHistoryReducer} from './src/menu-history.mjs';
import {test} from 'node:test';
import {normalizeMutationReceipt} from './src/mutation-receipt.mjs';
import {createDashboardGasClient} from './api/security.mjs';

test('single-filter recovery counts preserve the remaining conditions',()=>{
assert.equal(typeof viewer.viewerFilterRecovery,'function','zero results must offer single-filter recovery with real counts');
const data={headers:['Time','Tên','Thứ 2','Thứ 3'],days:['Thứ 2','Thứ 3'],rows:[['','An','Cơm','Bún'],['','Bình','Gà','Cơm']]};
assert.deepEqual(viewer.viewerFilterRecovery(data,{name:'An',day:'Thứ 2',meal:'Bún'}),[{key:'day',count:1},{key:'meal',count:1}]);
assert.deepEqual(viewer.viewerFilterRecovery(data,{name:'Không tồn tại',day:'Thứ 2',meal:'Bún'}),[]);
assert.equal(data.rows[0][2],'Cơm');
});

test('draft meal movement preserves slots and is one Undo',()=>{
assert.equal(typeof drafts.moveDraftMeal,'function');
const menu={title:'Nháp',days:[{day:'Thứ 2',date:'19/10/2026',meals:['A','','C']},{day:'Thứ 3',closed:true,meals:['D','E']}]};
const moved=drafts.moveDraftMeal(menu,0,2,0);assert.deepEqual(moved.days[0].meals,['C','A','']);assert.equal(moved.days[1],menu.days[1]);assert.deepEqual(menu.days[0].meals,['A','','C']);
assert.equal(drafts.moveDraftMeal(menu,1,0,1),menu);assert.equal(drafts.moveDraftMeal(menu,0,-1,1),menu);
assert.deepEqual(drafts.moveDraftMeal({days:[{meals:['A','B']}]},0,1,2).days[0].meals,['A','','B']);
let state=menuHistoryReducer(undefined,{type:'reset',value:menu});state=menuHistoryReducer(state,{type:'edit',value:moved});assert.deepEqual(menuHistoryReducer(state,{type:'undo'}).present,menu);
});

test('theme contrast measures actual pairs and offers only passing candidates',()=>{
assert.equal(typeof brand.contrastRatio,'function');assert.equal(brand.contrastRatio('#000000','#ffffff'),21);assert.equal(brand.contrastRatio('#ffffff','#ffffff'),1);
assert.equal(typeof brand.brandContrastReport,'function');assert.equal(typeof brand.suggestBrandColor,'function');
for(const color of ['#ffffff','#000000','#ffff00','#087f5b','#357185']){const report=brand.brandContrastReport(color);assert.equal(report.length,8);assert.ok(report.every(pair=>Number.isFinite(pair.ratio)&&pair.target>=3));const suggested=brand.suggestBrandColor(color);assert.ok(suggested===null||/^#[0-9a-f]{6}$/.test(suggested));if(suggested)assert.ok(brand.brandContrastReport(suggested).every(pair=>pair.ratio>=pair.target));}
assert.ok(brand.brandContrastReport('#ffffff').some(pair=>pair.ratio<pair.target));
});

test('column order is a validated identity permutation with old preference fallback',()=>{
assert.equal(typeof layout.moveTableColumn,'function');assert.deepEqual(layout.moveTableColumn([0,1,2,3],3,2),[0,1,3,2]);
const schema=layout.tableLayoutSchema(['Time','Name','Mon','Tue'],[1]);const saved=layout.updateTableLayouts('',schema,4,[1],{hidden:[2],widths:[144,160,180,200],order:[1,3,0,2]});
assert.deepEqual(layout.readTableLayout(saved,schema,4,[1]),{hidden:[2],widths:[144,160,180,200],order:[1,3,0,2]});
const corrupt=JSON.stringify({version:1,layouts:{[schema]:{count:4,order:[0,0,2,3]}}});assert.deepEqual(layout.readTableLayout(corrupt,schema,4,[1]).order,[0,1,2,3]);
assert.deepEqual(layout.readTableLayout('',schema,4,[1]).order,[0,1,2,3]);
});

test('failed GAS operation propagates only the scoped structured receipt and never retries a write',async()=>{
  const receipt={version:1,operation:'delete',weekKey:'week',recordId:'response',form:'absent',sheet:'present',verified:true,checkedAt:123,secret:'DO_NOT_RETURN'};
  let calls=0;const client=createDashboardGasClient({url:'https://script.example.test/exec',secret:'test-key',fetchImpl:async()=>{calls++;return {ok:true,status:200,text:async()=>JSON.stringify({error:'Partial operation',receipt})};}});
  await assert.rejects(()=>client({action:'dashboard-delete',weekKey:'week',responseId:'response'}),error=>error.receipt?.form==='absent'&&error.receipt?.sheet==='present'&&error.receipt?.verified===false&&!('secret' in error.receipt));assert.equal(calls,1);
  await assert.rejects(()=>client({action:'dashboard-delete',weekKey:'other',responseId:'response'}),error=>error.receipt===null);assert.equal(calls,2);
  assert.equal(normalizeMutationReceipt({...receipt,checkedAt:'123'}),null);assert.equal(normalizeMutationReceipt(undefined),null);
  assert.equal(normalizeMutationReceipt({...receipt,form:'unexpected'}).form,'unknown');
});
