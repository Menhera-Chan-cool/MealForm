import assert from 'node:assert/strict';
const ui=await import('./src/ui-clarity.mjs').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;});
const layouts=await import('./src/table-layout.mjs').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;});
assert.equal(typeof layouts.tableLayoutSchema,'function','table layout memory needs a stable non-content schema');
const schema=layouts.tableLayoutSchema(['Timestamp','Họ tên','Thứ 2 (12/10/2026)'],[1]);
assert.equal(schema,layouts.tableLayoutSchema(['Timestamp','Họ tên','Thứ 2 (19/10/2026)'],[1]));
assert.notEqual(schema,layouts.tableLayoutSchema(['Timestamp','Họ tên','Thứ 4 (14/10/2026)'],[1]));
let layoutJson=layouts.updateTableLayouts('',schema,3,[1],{hidden:[0,1,9,-1],widths:[180,320,240],name:'Never persist this'});
assert.deepEqual(layouts.readTableLayout(layoutJson,schema,3,[1]),{hidden:[0],widths:[180,320,240],order:[0,1,2]});assert.equal(layoutJson.includes('Never persist'),false);assert.equal(layoutJson.includes('Họ tên'),false);
assert.deepEqual(layouts.readTableLayout('{broken',schema,3,[1]),{hidden:[],widths:null,order:[0,1,2]});assert.deepEqual(layouts.readTableLayout(layoutJson,schema,2,[1]),{hidden:[],widths:null,order:[0,1]});
assert.deepEqual(layouts.readTableLayout(JSON.stringify({version:1,layouts:{[schema]:{count:3,hidden:[1,0,-1,99],widths:[180,Infinity,240]}}}),schema,3,[1]),{hidden:[0],widths:null,order:[0,1,2]});
for(let i=0;i<12;i++)layoutJson=layouts.updateTableLayouts(layoutJson,'s'+i,3,[1],{hidden:[],widths:[180,320,240]});assert.equal(Object.keys(JSON.parse(layoutJson).layouts).length,8);
layoutJson=layouts.updateTableLayouts(layoutJson,'s11',3,[1],null);assert.deepEqual(layouts.readTableLayout(layoutJson,'s11',3,[1]),{hidden:[],widths:null,order:[0,1,2]});
assert.equal(typeof ui.groupAuditDays,'function');
const early={id:'a',at:Date.parse('2026-10-14T16:59:59Z'),action:'deleted'},late={id:'b',at:Date.parse('2026-10-14T17:00:00Z'),action:'delete-review'};
assert.deepEqual(ui.groupAuditDays([late,early,{id:'c',at:'bad',action:'delete-failed'}]).map(group=>[group.key,group.events.map(event=>event.id),group.attention]),[['2026-10-15',['b'],1],['2026-10-14',['a'],0],['unknown',['c'],1]]);
assert.equal(ui.groupAuditDays([{at:'',action:'deleted'}])[0].key,'unknown');
assert.equal(typeof ui.archiveFormStatus,'function');for(const [value,want] of [['open','open'],['closed','closed'],[undefined,'unknown'],['','unknown'],['closed-ish','unknown']])assert.equal(ui.archiveFormStatus({formStatus:value}),want);
assert.equal(ui.archiveWeekHref('past','2026-10','calendar','unknown'),'/history?week=past&month=2026-10&layout=calendar&status=unknown');assert.equal(ui.archiveBackHref('2026-09-28_2026-10-02','?month=2026-10&layout=calendar&status=closed'),'/history?month=2026-10&layout=calendar&status=closed');
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
  [{day:'Thứ 4 (14/10/2026)'},{responses:3,choices:2}],
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

assert.equal(typeof ui.reviewChanges,'function');
assert.deepEqual(ui.reviewChanges({name:'Cũ',color:'#123456',ignored:'secret'},{name:'<b>Mới</b>',color:'#123456',ignored:'different'},{name:'Tên',color:'Màu'}),[{label:'Tên',before:'Cũ',after:'<b>Mới</b>'}]);
assert.deepEqual(ui.reviewChanges({}, {name:''},{name:'Tên'}),[]);
assert.equal(typeof ui.viewerLinkIssue,'function');
for(const [path,search,want] of [
  ['/not-a-page','','route'],['/','?view=','invalid'],['/','?view=bad!','invalid'],['/','?view=synthetic',null],['/history','?week=', 'invalid'],['/history','?week=bad%21','invalid'],['/history','?week=2026-10-12_2026-10-16',null],['/next','',null],['/history','',null]
])assert.equal(ui.viewerLinkIssue(path,search),want);
for(const [status,message,want] of [[400,'','invalid'],[403,'','forbidden'],[404,'','missing'],[502,'Không tìm thấy tuần đã đăng ký.','missing'],[502,'Chỉ xem tuần cũ trong kho.','archive-only'],[502,'Không thể kết nối.','connection'],[0,'offline','connection']])assert.equal(ui.viewerProblemKind(status,message),want);
const {buildDetailModel,ALL}=await import('./src/viewer-model.mjs');
const exactData={headers:['Thời điểm','Họ tên','Thứ 2 (12/10/2026)'],days:[{day:'Thứ 2 (12/10/2026)',meals:['CƠM','CƠM GÀ']}],rows:[['08/10/2026','A','CƠM'],['08/10/2026','B','CƠM GÀ']]};
assert.equal(buildDetailModel(exactData,{name:ALL,day:'Thứ 2 (12/10/2026)',meal:'CƠM'},'newest',true).rows.length,1,'summary drilldown must not include a different prefix-matching meal');
assert.equal(buildDetailModel(exactData,{name:ALL,day:ALL,meal:'CƠM'}).rows.length,2,'typed substring search retains its current behavior');
assert.equal(typeof ui.ocrReviewLinks,'function');
const linkMenu={days:[{day:'Thứ 2',closed:false},{day:'Thứ 3',closed:true}]};
const linkValidation={dateError:'Cần đủ 5 ngày',servingError:'',dayIssues:[{dateError:'Ngày sai',mealError:'Cần ít nhất 2 món',missingMealSlots:[1,2]},{dateError:'',mealError:'',missingMealSlots:[]}]};
assert.deepEqual(ui.ocrReviewLinks(linkMenu,linkValidation,false).map(value=>[value.id,value.blocking]),[['ocr-date-0',true],['ocr-meal-0-1',true],['ocr-meal-0-2',true],['ocr-monday',true]]);
assert.deepEqual(ui.ocrReviewLinks({days:[{day:'Thứ 2'}]},{dateError:'',servingError:'',dayIssues:[{dateError:'',mealError:'',missingMealSlots:[2]}]},true).map(value=>[value.id,value.blocking]),[['ocr-meal-0-2',false]]);
