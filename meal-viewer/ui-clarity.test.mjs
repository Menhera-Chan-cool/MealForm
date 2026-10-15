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

const viewer=await import('./src/viewer-model.mjs');
assert.equal(typeof viewer.detailResultCounts,'function','counts must distinguish source submissions from projected meal choices');
const countData={headers:['Timestamp','Họ tên','Thứ 2 (12/10/2026)','Thứ 4 (14/10/2026)','Thứ 6 (16/10/2026)'],days:[{day:'Thứ 2 (12/10/2026)'},{day:'Thứ 4 (14/10/2026)'},{day:'Thứ 6 (16/10/2026)'}],rows:[['08/10/2026 10:00','An','Cơm','Bún','Cơm'],['08/10/2026 11:00','An','Cơm','','Phở'],['08/10/2026 12:00','Bình','Bún','Cơm','Bún']]};
for(const [filters,want] of [
  [{},{responses:3,choices:8}],
  [{meal:'Cơm'},{responses:3,choices:4}],
  [{day:'Thứ 4 (14/10/2026)'},{responses:2,choices:2}],
  [{day:'Thứ 4 (14/10/2026)',meal:'Cơm'},{responses:1,choices:1}],
  [{name:'An'},{responses:2,choices:5}],
  [{name:'Không có'},{responses:0,choices:0}]
])assert.deepEqual(viewer.detailResultCounts(viewer.buildDetailModel(countData,filters)),want);
assert.deepEqual(viewer.detailResultCounts(viewer.buildDetailModel(null,{})),{responses:0,choices:0});

assert.equal(typeof ui.compactDayLabel,'function','mobile date labels must use the actual source weekday, not column position');
for(const [full,want] of [
  ['Thứ 2 (12/10/2026)','T2 · 12/10'],['Thứ 4 (14/10/2026)','T4 · 14/10'],
  ['Thứ Sáu (16/10/2026)','T6 · 16/10'],['Chủ nhật (18/10/2026)','CN · 18/10'],
  ['Thứ Năm · 29/02/2024','T5 · 29/02'],['Thứ 2 (31/02/2026)','Thứ 2 (31/02/2026)'],
  ['Thứ 2 (12/13/2026)','Thứ 2 (12/13/2026)'],['Thứ 2','Thứ 2'],['Ngày tùy chỉnh','Ngày tùy chỉnh']
])assert.equal(ui.compactDayLabel(full),want);

assert.equal(typeof ui.filterConditions,'function','empty-state recovery needs concrete independent criteria');
assert.deepEqual(ui.filterConditions({name:'Trường',day:'Tất cả',meal:'  '}),[{key:'name',label:'Họ tên',value:'Trường'}]);
assert.deepEqual(ui.filterConditions({actor:'a@example.com',errorsOnly:true,from:'',unexpected:'ignore'},{actor:'Người quản trị',errorsOnly:'Chỉ lỗi/chưa hoàn tất',from:'Từ ngày'}),[{key:'actor',label:'Người quản trị',value:'a@example.com'},{key:'errorsOnly',label:'Chỉ lỗi/chưa hoàn tất',value:'Đang bật'}]);
assert.deepEqual(ui.filterConditions({name:null,day:false,meal:{unsafe:true}}),[]);
assert.equal(typeof ui.noticePreview,'function','draft notice preview must validate calendar dates and Vietnam expiry');
const previewNow=Date.parse('2026-10-15T01:00:00Z');
assert.deepEqual(ui.noticePreview('Thứ Tư nghỉ\n<b>Không phải HTML</b>','2026-10-15',previewNow),{notice:{text:'Thứ Tư nghỉ\n<b>Không phải HTML</b>',expiresAt:Date.parse('2026-10-15T16:59:59.999Z')},message:''});
for(const [text,date,now,want] of [
  ['  ','2026-10-18',previewNow,'Chưa có nội dung để xem trước.'],
  ['Nghỉ','2026-02-31',previewNow,'Chọn ngày hết hạn hợp lệ để xem trước.'],
  ['Nghỉ','2026-10-14',previewNow,'Thông báo đã hết hạn; sẽ không hiện trên trang xem.'],
  ['x'.repeat(501),'2026-10-18',previewNow,'Nội dung vượt quá 500 ký tự.'],
  ['Nghỉ','2024-02-29',Date.parse('2024-02-29T17:00:00Z'),'Thông báo đã hết hạn; sẽ không hiện trên trang xem.']
])assert.deepEqual(ui.noticePreview(text,date,now),{notice:null,message:want});
