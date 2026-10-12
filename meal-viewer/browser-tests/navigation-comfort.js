async page => {
 const p=await page.context().newPage(),key='2026-10-12_2026-10-13_2026-10-14_2026-10-15_2026-10-16';let role='owner',stage='',posts=[];
 const week={weekKey:key,name:'Tuần 12/10/2026 - 16/10/2026',formStatus:'open',dayLabels:['Thứ 2 (12/10/2026)']};
 const rows=[{responseId:'row',timestamp:Date.now(),name:'Bạn kiểm thử có tên dài để kiểm tra giao diện điện thoại',meals:['MÓN KIỂM THỬ DÀI ĐỂ KIỂM TRA CỠ CHỮ'],deletable:true,deleteToken:'qa-only',rowNumber:2}];
 const dataset={week,responseCount:1,responseIds:['row'],responses:rows,history:[]};
 let notice={text:'',endsOn:'',expiresAt:0,updatedAt:0};
 await p.addInitScript(()=>{
  const original=window.fetch;
  if(location.search.includes('coldViewer=1'))window.qaViewerHold=true;
  window.fetch=(url,options)=>{
   if(window.qaArchiveHold&&String(url).includes('/api/history'))return new Promise(resolve=>{window.qaArchiveRelease=()=>resolve(new Response(JSON.stringify({weeks:[{weekKey:'late',name:'LATE ARCHIVE',startDate:'2026-10-05'}]}),{headers:{'Content-Type':'application/json'}}));});
   if(window.qaWriteHold&&String(url)==='/api/dashboard'&&options?.method==='POST')return new Promise(resolve=>{window.qaWriteSignal=Boolean(options.signal);const body=JSON.parse(options.body);window.qaWriteRelease=()=>resolve(new Response(JSON.stringify({notice:{text:body.text,endsOn:body.endsOn,expiresAt:Date.now()+100000,updatedAt:body.expectedUpdatedAt+1},serverNow:Date.now()}),{headers:{'Content-Type':'application/json'}}));});
   if(window.qaHold&&String(url).includes('/api/dashboard?')&&String(url).includes('batch=1'))return new Promise(resolve=>{window.qaRelease=()=>resolve(new Response(JSON.stringify(window.qaLate),{status:window.qaLateStatus||200,headers:{'Content-Type':'application/json'}}));});
   if(window.qaViewerHold&&String(url).includes('/api/viewer'))return new Promise(resolve=>{window.qaViewerRelease=()=>resolve(new Response(JSON.stringify(window.qaViewerLate),{headers:{'Content-Type':'application/json'}}));});
   return original(url,options);
  };
 });
 await p.route('**/api/session',r=>r.fulfill({json:{authenticated:true}}));
 await p.route('**/api/branding',r=>r.fulfill({json:{schoolName:'',logoUrl:'',primaryColor:'#087f5b',updatedAt:0}}));
 await p.route('**/api/history*',r=>r.fulfill({json:{weeks:[]}}));
 await p.route('**/api/viewer*',r=>r.fulfill({json:{title:'Fixture',days:['Thứ 2 (12/10/2026)'],headers:['Time','Name','Day'],rows:[['now','Original','Gà']],formStatus:'closed',serverNow:Date.now(),weekNotice:{text:'Thông báo thử tự ẩn',expiresAt:Date.now()+1800}}}));
 await p.route('**/api/dashboard*',r=>{
  const req=r.request(),keys=(req.url().split('?')[1]||'').split('&').map(part=>part.split('=')[0]);
  if(req.method()!=='GET'){
   const body=req.postDataJSON();posts.push(body);
   if(body.action!=='set-week-notice')return r.fulfill({status:405,json:{error:'QA forbids other writes'}});
   notice={text:body.text,endsOn:body.text?body.endsOn:'',expiresAt:body.text?Date.now()+100000:0,updatedAt:notice.updatedAt+1};return r.fulfill({json:{notice,serverNow:Date.now()}});
  }
  if(keys.includes('notice'))return r.fulfill({json:{notice,serverNow:Date.now()}});
  if(keys.includes('week'))return r.fulfill({json:dataset});
  return r.fulfill({json:{role,email:'owner@example.com',accountId:'comfort-fixture',permissions:{view:true,create:role==='owner',manageResponses:role==='owner'},weeks:[week],allowedEmails:[]}});
 });
 const results=[];
 try{
  for(const width of [1280,390,320]){
   stage=`${width}: font/palette`;await p.setViewportSize({width,height:844});await p.goto('http://127.0.0.1:5176/dashboard');await p.locator('.dashboard-account').waitFor();
   await p.getByRole('button',{name:'Lớn',exact:true}).click();
   const large=await p.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).fontSize));
   if(large<(width<700?21:18))throw Error('Large text did not change font');
   if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Large text overflow');
   await p.keyboard.press(width===1280?'Control+k':'Meta+k');await p.getByRole('dialog',{name:'Lệnh nhanh'}).waitFor();
   await p.getByRole('combobox',{name:'Tìm lệnh hoặc tuần'}).fill('luot gui');await p.keyboard.press('Enter');await p.getByRole('heading',{name:'Lượt gửi và lịch sử thao tác',exact:true}).waitFor();
   await p.locator('[data-response-id="row"]').waitFor();
   if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Cards overflow');
   await p.getByRole('button',{name:'Xem nhanh',exact:true}).click();await p.getByRole('dialog').waitFor();
   await p.keyboard.press('Control+k');if(await p.getByRole('dialog',{name:'Lệnh nhanh'}).count())throw Error('Palette opened behind modal');await p.keyboard.press('Escape');
   await p.getByRole('button',{name:'Lệnh nhanh',exact:true}).click();await p.keyboard.press('Escape');if(await p.getByRole('button',{name:'Lệnh nhanh',exact:true}).evaluate(el=>el!==document.activeElement))throw Error('Focus did not return');
   await p.reload();await p.locator('.dashboard-account').waitFor();if(await p.evaluate(()=>document.documentElement.dataset.textSize)!=='large')throw Error('Font preference lost');
   await p.getByRole('button',{name:'Bình thường',exact:true}).click();
   stage=`${width}: cancellation`;await p.getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();await p.getByText(/^Dữ liệu đã xác minh\./).waitFor();
   await p.evaluate(data=>{window.qaLate=data;window.qaHold=true;},dataset);
   await p.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await p.waitForFunction(()=>typeof window.qaRelease==='function');
   await p.getByRole('button',{name:'Dừng chờ dữ liệu',exact:true}).click();await p.locator('.dashboard-cache-status').filter({hasText:'chỉ xem'}).waitFor();
   if(!(await p.getByRole('button',{name:'Xóa lượt này',exact:true}).isDisabled()))throw Error('Cancelled cache became actionable');
   await p.evaluate(()=>{window.qaRelease();window.qaHold=false;});await p.waitForTimeout(100);
   if(!(await p.getByRole('button',{name:'Xóa lượt này',exact:true}).isDisabled()))throw Error('Unabortable late response reverified cancelled data');
   await p.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await p.getByText(/^Dữ liệu đã xác minh\./).waitFor();
   if(await p.getByRole('button',{name:'Xóa lượt này',exact:true}).isDisabled())throw Error('Fresh reload stayed readonly');
   stage=`${width}: notice`;await p.getByRole('button',{name:'Thông báo tuần',exact:true}).click();await p.getByLabel('Nội dung thông báo',{exact:true}).waitFor();await p.waitForFunction(()=>!document.querySelector('.week-notice-editor textarea')?.disabled);
   await p.getByLabel('Nội dung thông báo',{exact:true}).fill('Thứ Tư nghỉ\nNội dung thử an toàn');await p.getByLabel('Hiển thị hết ngày',{exact:true}).fill('2030-10-14');
   p.once('dialog',d=>d.dismiss());await p.getByRole('button',{name:'Lưu thông báo',exact:true}).click();const before=posts.length;
   p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Lưu thông báo',exact:true}).click();await p.getByText('Đã lưu thông báo tuần.',{exact:true}).first().waitFor();
   if(posts.length!==before+1||posts.at(-1).expectedUpdatedAt!==notice.updatedAt-1)throw Error('Notice confirmation/version broken');
   p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Xóa thông báo',exact:true}).click();await p.getByText('Đã xóa thông báo tuần.',{exact:true}).first().waitFor();
   if(posts.at(-1).text!=='')throw Error('Notice clear wrong');
   if(width===390)await p.screenshot({path:'.playwright-cli/comfort-mobile-editor.png',fullPage:true});
   results.push({width,font:large,cancelledReadonly:true,noticeConfirmed:true});
  }
  stage='write guard';await p.getByLabel('Nội dung thông báo',{exact:true}).fill('Mock guarded write');await p.getByLabel('Hiển thị hết ngày',{exact:true}).fill('2030-10-14');await p.evaluate(()=>{window.qaWriteHold=true;});p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Lưu thông báo',exact:true}).click();await p.waitForFunction(()=>typeof window.qaWriteRelease==='function');
  await p.waitForFunction(()=>[...document.querySelectorAll('button')].find(button=>button.textContent.startsWith('Lệnh nhanh'))?.disabled);
  if(await p.evaluate(()=>window.qaWriteSignal))throw Error('Mutation got read-cancel signal');
  if(await p.getByRole('button',{name:'Dừng chờ dữ liệu',exact:true}).count()&&!await p.getByRole('button',{name:'Dừng chờ dữ liệu',exact:true}).isDisabled())throw Error('Stop allowed during mutation');
  await p.evaluate(()=>{window.qaWriteRelease();window.qaWriteHold=false;});await p.getByRole('button',{name:'Lưu thông báo',exact:true}).waitFor();await p.waitForFunction(()=>!document.querySelector('.week-notice-editor button[type=submit]')?.disabled);
  stage='scheduled tab read after stop';role='owner';await p.getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();await p.getByText(/^Dữ liệu đã xác minh\./).waitFor();await p.getByRole('button',{name:'Thông báo tuần',exact:true}).click();await p.getByLabel('Nội dung thông báo',{exact:true}).waitFor();
  await p.evaluate(data=>{window.qaHold=true;window.qaLate=data;},dataset);
  await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Lượt gửi & lịch sử').click());
  await p.waitForFunction(()=>document.querySelector('.dashboard-refresh-bar'));
  await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Tải lại dữ liệu').click());await p.waitForFunction(()=>typeof window.qaRelease==='function');
  await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Dừng chờ dữ liệu').click());
  await p.waitForTimeout(650);
  if(await p.getByRole('button',{name:'Dừng chờ dữ liệu',exact:true}).count())throw Error('A scheduled tab read restarted after stop');
  await p.evaluate(()=>{window.qaRelease();window.qaHold=false;});
  stage='manager permissions';role='manager';await p.goto('http://127.0.0.1:5176/dashboard');await p.locator('.dashboard-account').waitFor();await p.getByRole('button',{name:'Lệnh nhanh',exact:true}).click();
  if(await p.getByRole('option',{name:'Thông báo tuần',exact:true}).count()||await p.getByRole('option',{name:'Tạo tuần bằng OCR',exact:true}).count())throw Error('Private owner/create commands leaked');await p.keyboard.press('Escape');
  stage='late cancelled unauthorized';await p.getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();await p.getByText(/^Dữ liệu đã xác minh\./).waitFor();
  await p.evaluate(()=>{window.qaHold=true;window.qaLateStatus=401;window.qaLate={error:'expired'};});await p.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await p.waitForFunction(()=>typeof window.qaRelease==='function');await p.getByRole('button',{name:'Dừng chờ dữ liệu',exact:true}).click();await p.evaluate(()=>{window.qaRelease();window.qaHold=false;});await p.waitForTimeout(100);if(!await p.locator('.dashboard-account').count())throw Error('Cancelled 401 changed login state');
  stage='cold cancelled read';await p.evaluate(()=>{Object.keys(localStorage).filter(k=>k.startsWith('meal-dashboard-cache-v1:comfort-fixture:')).forEach(k=>localStorage.removeItem(k));});await p.reload();await p.locator('.dashboard-account').waitFor();await p.evaluate(()=>{window.qaHold=true;window.qaLate={};});await p.getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();await p.waitForFunction(()=>typeof window.qaRelease==='function');await p.getByRole('button',{name:'Dừng chờ dữ liệu',exact:true}).click();await p.getByText('Chưa có dữ liệu đã xác minh. Hãy tải lại dữ liệu.',{exact:true}).waitFor();await p.evaluate(()=>window.qaRelease());
  stage='draft-safe palette navigation';role='owner';await p.goto('http://127.0.0.1:5176/dashboard?tab=create');await p.getByRole('heading',{name:'Tạo tuần từ ảnh thực đơn',exact:true}).waitFor();
  await p.evaluate(async()=>{
   const db=await new Promise(resolve=>{const request=indexedDB.open('meal-ocr-drafts',1);request.onupgradeneeded=()=>request.result.createObjectStore('drafts',{keyPath:'accountId'});request.onsuccess=()=>resolve(request.result);});
   await new Promise(resolve=>{const tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put({version:1,accountId:'comfort-fixture',image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jmAAAAABJRU5ErkJggg==',filename:'test.png',menu:{title:'Original',days:[12,13,14,15,16].map((date,i)=>({day:`Thứ ${i+2}`,date:`${date}/10/2026`,meals:['Gà','Cá','Bún']}))},savedAt:Date.now()});tx.oncomplete=resolve;});db.close();
  });await p.reload();await p.getByLabel('Tiêu đề tuần',{exact:true}).waitFor();await p.getByLabel('Tiêu đề tuần',{exact:true}).fill('Draft preserved by palette');
  await p.evaluate(()=>{window.qaOpen=indexedDB.open;indexedDB.open=()=>{throw Error('simulated blocked storage');};});
  await p.getByRole('button',{name:'Lệnh nhanh',exact:true}).click();await p.getByRole('combobox',{name:'Tìm lệnh hoặc tuần'}).fill('tuần sau');await p.getByRole('option',{name:'Tuần sau',exact:true}).click();await p.getByRole('alert').filter({hasText:'trang chưa chuyển'}).waitFor();if(!p.url().includes('/dashboard'))throw Error('Blocked draft navigation occurred');
  await p.evaluate(()=>{indexedDB.open=window.qaOpen;});await Promise.all([p.waitForURL('**/next'),p.getByRole('option',{name:'Tuần sau',exact:true}).click()]);
  await p.goto('http://127.0.0.1:5176/dashboard?tab=create');await p.getByLabel('Tiêu đề tuần',{exact:true}).waitFor();if(await p.getByLabel('Tiêu đề tuần',{exact:true}).inputValue()!=='Draft preserved by palette')throw Error('Palette lost OCR draft');
  stage='viewer notice and cancellation';await p.goto('http://127.0.0.1:5176/newest');await p.getByText('Thông báo thử tự ẩn',{exact:true}).waitFor();await p.getByText('Thông báo thử tự ẩn',{exact:true}).waitFor({state:'hidden',timeout:3500});
  await p.evaluate(()=>{window.qaViewerHold=true;window.qaViewerLate={title:'Late',days:['Thứ 2 (12/10/2026)'],rows:[['now','LATE SHOULD NOT APPLY','Gà']],headers:['Time','Name','Day'],formStatus:'open'};});
  await p.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await p.waitForFunction(()=>typeof window.qaViewerRelease==='function');await p.getByRole('button',{name:'Dừng chờ dữ liệu',exact:true}).click();await p.evaluate(()=>window.qaViewerRelease());await p.waitForTimeout(100);
  if(await p.getByText('LATE SHOULD NOT APPLY',{exact:true}).count())throw Error('Late viewer reply applied');
  stage='cold viewer stop';await p.goto('http://127.0.0.1:5176/newest?coldViewer=1');await p.getByRole('button',{name:'Dừng chờ dữ liệu',exact:true}).waitFor();await p.getByRole('button',{name:'Dừng chờ dữ liệu',exact:true}).click();await p.getByRole('heading',{name:'Chưa tải được dữ liệu tuần này.',exact:true}).waitFor();if(await p.getByLabel('Loading form',{exact:true}).count())throw Error('Stopped empty viewer kept loading Form');await p.evaluate(()=>{window.qaViewerLate={};window.qaViewerRelease();});
  stage='archive stop';await p.goto('http://127.0.0.1:5176/history');await p.getByRole('button',{name:'Tải lại',exact:true}).waitFor();await p.waitForFunction(()=>!document.querySelector('.archive-panel .section-heading button')?.disabled);await p.evaluate(()=>{window.qaArchiveHold=true;});await p.getByRole('button',{name:'Tải lại',exact:true}).click();await p.getByRole('button',{name:'Dừng chờ dữ liệu',exact:true}).click();await p.evaluate(()=>window.qaArchiveRelease());await p.waitForTimeout(100);if(await p.getByText('LATE ARCHIVE',{exact:true}).count())throw Error('Late archive reply applied');
  return {passed:true,results,posts:posts.length,publicExpiry:true,lateIgnored:true};
 }catch(error){const overflow=await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect();return r.right>innerWidth+1&&r.width>0;}).slice(0,12).map(el=>({tag:el.tagName,class:el.className,width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right})));throw Error(stage+': '+error.message+' '+JSON.stringify(overflow));}finally{await p.close();}
}
