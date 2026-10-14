import assert from 'node:assert/strict';
const ui=await import('./src/ui-clarity.mjs').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;});
assert.equal(typeof ui.highlightPieces,'function','literal highlights need original-text ranges');
for(const [text,query,want] of [
  ['Trường An','truong',['Trường']],['Đặng Đạt','dang',['Đặng']],['a+b [a+b]','a+b',['a+b','a+b']],
  ['Cơm  gà','com ga',['Cơm  gà']],['a😀b😀','😀',['😀','😀']],['Tru\u031Bo\u031B\u0300ng','truong',['Tru\u031Bo\u031B\u0300ng']],
  ['<img src=x>','img',['img']],['Cơm gà','Tất cả',[]],['','x',[]],['abc','',[]]
]){
  const parts=ui.highlightPieces(text,query);
  assert.equal(parts.map(part=>part.text).join(''),text);
  assert.deepEqual(parts.filter(part=>part.match).map(part=>part.text),want);
}
assert.deepEqual(ui.highlightPieces('GÀ','ga',false).filter(part=>part.match),[]);
assert.equal(ui.displayHeader('Timestamp'),'Thời điểm gửi');
assert.equal(ui.displayHeader('Họ và tên'),'Họ và tên');
assert.equal(ui.displayHeader('Mã riêng của trường'),'Mã riêng của trường');
console.log('Safe original-text highlight ranges and display-only Vietnamese headers passed');
assert.equal(typeof ui.archiveWeekHref,'function');
assert.equal(ui.archiveWeekHref('2026-09-28_2026-10-02','2026-10','calendar'),'/history?week=2026-09-28_2026-10-02&month=2026-10&layout=calendar');
assert.equal(ui.archiveBackHref('2026-09-28_2026-10-02','?month=2026-10&layout=calendar'),'/history?month=2026-10&layout=calendar');
assert.equal(ui.archiveBackHref('2026-09-28_2026-10-02','?month=2027-10&layout=unsafe'),'/history?month=2026-09');
assert.deepEqual(ui.archiveMetadata({responseCount:0,formStatus:'closed'}),{count:'0 lượt gửi',status:'Form đã đóng'});
for(const responseCount of [undefined,null,'0',-1,NaN,Infinity])assert.equal(ui.archiveMetadata({responseCount}).count,'Chưa đọc được số lượt');
assert.equal(ui.archiveMetadata({formStatus:'surprise'}).status,'Chưa xác định Form');
assert.equal(ui.viewerPageTitle({calendarDays:['Thứ 2 (12/10/2026)','Thứ 6 (16/10/2026)']},'Tuần này'),'Tuần 12–16/10/2026 · Thực đơn');
assert.equal(ui.viewerPageTitle({calendarDays:['Thứ 2 (28/09/2026)','Thứ 6 (02/10/2026)']},'Tuần cũ'),'Tuần 28/09/2026–02/10/2026 · Thực đơn');
assert.equal(ui.viewerPageTitle({calendarDays:['31/02/2026']},'Tuần này'),'Tuần này');
assert.equal(typeof ui.brandHasEdits,'function');
assert.equal(ui.brandHasEdits({schoolName:'Trường',logoUrl:'',primaryColor:'#087f5b',updatedAt:2},{schoolName:'Trường',logoUrl:'',primaryColor:'#087f5b',updatedAt:1}),false);
assert.equal(ui.brandHasEdits({schoolName:'Trường ',logoUrl:'',primaryColor:'#087f5b'},{schoolName:'Trường',logoUrl:'',primaryColor:'#087f5b'}),true);
assert.equal(ui.brandHasEdits({logoUrl:'invalid'},{logoUrl:''}),true);
