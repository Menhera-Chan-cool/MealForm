async page => {
 const p=await page.context().newPage();let update=false,posts=[],stage='initial',reset=false;
 const key='2026-10-12_2026-10-13_2026-10-14_2026-10-15_2026-10-16',revision='a'.repeat(64);
 const week={weekKey:key,name:'Tuần 12/10/2026 - 16/10/2026',formStatus:'open',lockAt:'2030-10-12T00:00:00+07:00',dayLabels:['Thứ 2 (12/10/2026)']};
 const history=[{id:'ok',actor:'owner@example.com',action:'deleted',at:Date.parse('2026-10-11T17:00:00Z'),name:'Lượt thử',meals:['Gà'],note:'Sửa nhầm món',restorable:false},{id:'problem',actor:'admin@example.com',action:'delete-review',at:Date.parse('2026-10-12T16:59:59Z'),name:'Lượt cần kiểm tra',meals:['Cá'],note:'Cần đối chiếu',restorable:false}];
 await p.addInitScript(()=>{if(location.search.includes('resetReviewFixture=1'))Object.keys(localStorage).filter(k=>k.startsWith('meal-dashboard-cache-v1:review-fixture:')).forEach(k=>localStorage.removeItem(k));});
 await p.route('**/version.json*',r=>update?r.fulfill({json:{id:'qa-new-build'}}):r.continue());
 await p.route('**/api/session',r=>r.fulfill({json:{authenticated:true}}));
 await p.route('**/api/branding',r=>r.fulfill({json:{schoolName:'',logoUrl:'',primaryColor:'#087f5b',updatedAt:0}}));
 await p.route('**/api/dashboard*',r=>{
  if(r.request().method()!=='GET'){const body=r.request().postDataJSON();posts.push(body);return body.action==='ocr-region'?r.fulfill({json:{text:'CÁ ĐỌC LẠI'}}):r.fulfill({status:405,json:{error:'QA forbids mutation'}});}
  const values=Object.fromEntries((r.request().url().split('?')[1]||'').split('&').filter(Boolean).map(part=>part.split('=').map(value=>decodeURIComponent(value.replace(/\+/g,' ')))));
  const q={get:key=>values[key],has:key=>key in values};
  if(q.has('week')){
   let rows=Array.from({length:120},(_,i)=>({responseId:`id-${i}`,timestamp:Date.parse('2026-10-12T00:00:00Z')-i*1000,name:`Bạn ${i}`,meals:['Gà'],rowNumber:i+2,deletable:false}));
   const needle=(q.get('query')||'').toLowerCase();rows=rows.filter(row=>row.name.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().includes(needle));
   if(q.get('sort')==='oldest')rows.reverse();
   const offset=Number(q.get('offset')||0);
   if(reset&&offset){reset=false;return r.fulfill({json:{resetRequired:true,weekKey:key}});}
   const audit=JSON.parse(q.get('audit')||'{}'),fold=value=>String(value||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
   const events=history.filter(e=>(!audit.note||fold(e.note).includes(fold(audit.note)))&&(!audit.action||e.action===audit.action)&&(!audit.actor||e.actor.includes(audit.actor))&&(!audit.errorsOnly||/-review$/.test(e.action))&&(!audit.from||e.at>=Date.parse(audit.from+'T00:00:00+07:00'))&&(!audit.to||e.at<Date.parse(audit.to+'T00:00:00+07:00')+86400000));
   return r.fulfill({json:{week,responseIds:Array.from({length:120},(_,i)=>`id-${i}`),responseCount:120,responses:rows.slice(offset,offset+50),history:offset?undefined:events,historyPage:{offset:0,nextOffset:null,matchedCount:events.length,total:history.length,filters:audit,actions:history.map(e=>e.action)},page:{offset,nextOffset:offset+50<rows.length?offset+50:null,total:120,matchedCount:rows.length,query:q.get('query')||'',sort:q.get('sort')||'newest',revision,snapshotAt:Date.now()}}});
  }
  return r.fulfill({json:{role:'owner',email:'owner@example.com',accountId:'review-fixture',permissions:{view:true,create:true,manageResponses:true},weeks:[week],allowedEmails:[]}});
 });
 const results=[];
 try{
  for(const width of [1280,390]){
   update=false;posts=[];stage=`${width}: account`;await p.setViewportSize({width,height:844});await p.goto('http://127.0.0.1:5176/dashboard?resetReviewFixture=1');await p.evaluate(()=>history.replaceState({},'','/dashboard'));
   await p.locator('.dashboard-account').filter({hasText:'owner@example.com'}).waitFor({timeout:3000});
   if(!(await p.locator('.dashboard-account').innerText()).includes('Chủ sở hữu'))throw Error('Role label missing');
   await p.getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
   await p.waitForFunction(()=>document.querySelectorAll('[data-response-id]').length===50);
   stage=`${width}: batches`;await p.getByRole('button',{name:'Tải thêm lượt gửi',exact:true}).click();await p.waitForFunction(()=>document.querySelectorAll('[data-response-id]').length===100);
   await p.getByPlaceholder('Nhập tên cần tìm').fill('ban 119');await p.getByPlaceholder('Nhập tên cần tìm').blur();await p.locator('[data-response-id="id-119"]').waitFor();
   if(await p.locator('[data-response-id]').count()!==1)throw Error('Global search failed');
   await p.getByPlaceholder('Nhập tên cần tìm').fill('');await p.getByPlaceholder('Nhập tên cần tìm').blur();await p.waitForFunction(()=>document.querySelectorAll('[data-response-id]').length===50);
   await p.getByLabel('Sắp xếp',{exact:true}).selectOption('oldest');await p.waitForFunction(()=>document.querySelector('[data-response-id]')?.dataset.responseId==='id-119');
   stage=`${width}: history`;await p.getByLabel('Chỉ lỗi/chưa hoàn tất').check();await p.locator('.dashboard-history-table').getByText('Lượt cần kiểm tra',{exact:true}).waitFor();
   if(await p.locator('.dashboard-history-table').getByText('Lượt thử',{exact:true}).count())throw Error('Error history filter failed');
   await p.getByLabel('Chỉ lỗi/chưa hoàn tất').uncheck();await p.getByLabel('Tìm ghi chú',{exact:true}).fill('sua nham');await p.locator('.dashboard-history-table').getByText('Lượt thử',{exact:true}).waitFor();
   if(await p.locator('.dashboard-history-table').getByText('Lượt cần kiểm tra',{exact:true}).count())throw Error('Note filter failed');
   await p.getByLabel('Từ ngày',{exact:true}).fill('2026-10-13');await p.waitForFunction(()=>document.querySelector('.dashboard-history-title span')?.textContent.includes('0 / 0 phù hợp'));await p.getByText('Không có thao tác phù hợp.',{exact:true}).waitFor({timeout:3000});
   await p.getByRole('button',{name:'Xóa bộ lọc lịch sử',exact:true}).click();
   stage=`${width}: crop`;await p.getByRole('button',{name:'Tạo tuần bằng OCR',exact:true}).click();
   await p.evaluate(async()=>{
    const canvas=document.createElement('canvas');canvas.width=800;canvas.height=500;const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,800,500);context.fillStyle='#123456';context.font='36px sans-serif';context.fillText('REGION TEST',100,100);
    const db=await new Promise(resolve=>{const r=indexedDB.open('meal-ocr-drafts',1);r.onupgradeneeded=()=>r.result.createObjectStore('drafts',{keyPath:'accountId'});r.onsuccess=()=>resolve(r.result);});await new Promise(resolve=>{const tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put({version:1,accountId:'review-fixture',filename:'fixture.png',image:canvas.toDataURL('image/png'),menu:{title:'Keep title',days:[12,13,14,15,16].map((date,i)=>({day:`Thứ ${i+2}`,date:`${date}/10/2026`,meals:['GÀ','CÁ','BÚN']}))},savedAt:Date.now()});tx.oncomplete=resolve;});db.close();
   });
   await p.goto('http://127.0.0.1:5176/dashboard?tab=create');await p.getByLabel('Tiêu đề tuần',{exact:true}).waitFor();
   await p.getByRole('button',{name:'Đọc lại vùng ảnh',exact:true}).click();await p.getByRole('dialog',{name:'Đọc lại vùng ảnh'}).waitFor();
   await p.getByLabel('Ô cần thay',{exact:true}).selectOption('meal-1');
   const box=await p.locator('.ocr-crop-stage').boundingBox();await p.mouse.move(box.x+box.width*.1,box.y+box.height*.1);await p.mouse.down();await p.mouse.move(box.x+box.width*.8,box.y+box.height*.5,{steps:4});await p.mouse.up();
   await p.getByRole('button',{name:'Đọc vùng đã chọn',exact:true}).click();await p.getByLabel('Món mới',{exact:true}).waitFor();
   if(posts.at(-1)?.target.mealIndex!==1)throw Error('Crop target wrong');
   const size=await p.evaluate(src=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve({width:i.naturalWidth,height:i.naturalHeight});i.src=src;}),posts.at(-1).image);
   if(size.width>=800||size.height>=500)throw Error('Full image sent rather than crop');
   if(await p.locator('.menu-day').first().getByLabel('Món 2',{exact:true}).inputValue()!=='CÁ')throw Error('OCR auto-applied without confirmation');
   await p.getByLabel('Món mới',{exact:true}).fill('CÁ ĐÃ KIỂM TRA');await p.getByRole('button',{name:'Áp dụng thay đổi',exact:true}).click();
   if(await p.locator('.menu-day').first().getByLabel('Món 2',{exact:true}).inputValue()!=='CÁ ĐÃ KIỂM TRA')throw Error('Confirmed crop not applied');
   await p.getByRole('button',{name:'Hoàn tác',exact:true}).click();if(await p.locator('.menu-day').first().getByLabel('Món 2',{exact:true}).inputValue()!=='CÁ')throw Error('Crop Undo not atomic');
   stage=`${width}: version`;await p.getByLabel('Tiêu đề tuần',{exact:true}).fill('Saved before refresh');update=true;await p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await p.getByText('Có bản cập nhật',{exact:true}).waitFor();
   await Promise.all([p.waitForEvent('load'),p.getByRole('button',{name:'Cập nhật trang',exact:true}).click()]);await p.getByLabel('Tiêu đề tuần',{exact:true}).waitFor();
   if(await p.getByLabel('Tiêu đề tuần',{exact:true}).inputValue()!=='Saved before refresh')throw Error('Update lost draft');
   if(width===390){
    stage='blocked draft update';let navigations=0;const track=frame=>{if(frame===p.mainFrame())navigations++;};p.on('framenavigated',track);
    await p.evaluate(()=>{window.qaDraftOpen=indexedDB.open;indexedDB.open=()=>{throw Error('simulated storage denial');};});
    await p.getByLabel('Tiêu đề tuần',{exact:true}).fill('Keep unsaved on screen');
    await p.getByRole('button',{name:'Cập nhật trang',exact:true}).click();await p.getByRole('alert').filter({hasText:'Chưa lưu nháp được; trang chưa tải lại.'}).waitFor();
    if(navigations||await p.getByLabel('Tiêu đề tuần',{exact:true}).inputValue()!=='Keep unsaved on screen')throw Error('Blocked storage refreshed or lost draft');
    await p.evaluate(()=>{indexedDB.open=window.qaDraftOpen;});p.off('framenavigated',track);
   }
   if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
   results.push({width,account:true,batches:true,globalSearchSort:true,auditFilters:true,cropOnly:true,explicitPreviewUndo:true,updateSavedDraft:true});
  }
  return results;
 }catch(error){throw Error(stage+' '+error.message);}finally{await p.close();}
}
