async page => {
 const p=await page.context().newPage(),key='2026-10-12_2026-10-13_2026-10-14_2026-10-15_2026-10-16';let changed=false,posts=[],stage='';
 const week={weekKey:key,name:'Tuần 12/10/2026 - 16/10/2026',formStatus:'open',dayLabels:['Thứ 2 (12/10/2026)']};
 const versions=()=>Array.from({length:120},(_,i)=>['id-'+i,(changed&&i===119?'b':'a').repeat(64)]).filter(([id])=>!changed||id!=='id-118').concat(changed?[['new-id','c'.repeat(64)]]:[]);
 const days=[12,13,14,15,16].map((date,i)=>({day:`Thứ ${i+2}`,date:`${date}/10/2026`,meals:['GÀ','CÁ','BÚN']}));
 await p.route('**/api/session',r=>r.fulfill({json:{authenticated:true}}));await p.route('**/api/branding',r=>r.fulfill({json:{schoolName:'School',logoUrl:'',primaryColor:'#087f5b',updatedAt:1}}));
 await p.route('**/api/dashboard*',r=>{
  if(r.request().method()!=='GET'){
   const body=r.request().postDataJSON();posts.push(body);
   if(body.action==='ocr-images')return r.fulfill({json:{fragments:body.images.map((_,i)=>({imageIndex:i,title:'Ảnh ghép thử',days:i===0?days:[{...days[0],meals:['GÀ','BÒ','BÚN']},{...days[1],date:'14/10/2026'}]}))}});
   if(body.action==='ocr')return r.fulfill({json:{title:'Ảnh đơn',days}});
   return r.fulfill({status:405,json:{error:'No real mutations in QA'}});
  }
  if(r.request().url().includes('batch=1'))return r.fulfill({json:{week,responseIds:versions().map(v=>v[0]),responseVersions:versions(),responseCount:120,responses:[{responseId:'id-0',name:'Fixture',timestamp:Date.now(),meals:['GÀ'],deletable:false}],history:[],page:{offset:0,nextOffset:null,total:120,matchedCount:1,query:'',sort:'newest',revision:'d'.repeat(64),snapshotAt:Date.now()}}});
  return r.fulfill({json:{role:'owner',email:'owner@example.com',accountId:'import-fixture',permissions:{view:true,create:true,manageResponses:true},weeks:[week],allowedEmails:[]}});
 });
 await p.route('**/api/viewer*',r=>r.fulfill({json:{days,headers:['Time','Name','Thứ 2'],rows:[['now','Fixture','GÀ']],formStatus:'open'}}));
 const results=[];
 async function addImage(mode){await p.evaluate(async mode=>{
  const canvas=document.createElement('canvas');canvas.width=200;canvas.height=100;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,200,100);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));const file=new File([blob],`image-${Date.now()}.png`,{type:'image/png'}),transfer=new DataTransfer();transfer.items.add(file);
  if(mode==='file'){const input=document.querySelector('.dashboard-file input');input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));}
  else if(mode==='paste')document.body.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:transfer}));
  else document.querySelector('.image-dropzone').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:transfer}));
 },mode);}
 try{
  for(const width of [1280,390,320]){
   changed=false;stage=`${width}: preference`;await p.setViewportSize({width,height:844});await p.emulateMedia({colorScheme:'light',reducedMotion:'no-preference'});await p.goto('http://127.0.0.1:5176/dashboard');await p.locator('.dashboard-account').waitFor();
   await p.getByLabel('Giao diện',{exact:true}).selectOption('dark');await p.waitForFunction(()=>document.documentElement.dataset.colorScheme==='dark');
   if(await p.evaluate(()=>getComputedStyle(document.querySelector('main')).backgroundColor)==='rgb(255, 255, 255)')throw Error('Dark surface stayed white');
   await p.getByLabel('Giao diện',{exact:true}).selectOption('system');await p.emulateMedia({colorScheme:'dark'});await p.waitForFunction(()=>document.documentElement.dataset.colorScheme==='dark');await p.getByLabel('Giao diện',{exact:true}).selectOption('light');await p.emulateMedia({colorScheme:'dark'});if(await p.evaluate(()=>document.documentElement.dataset.colorScheme)!=='light')throw Error('Explicit light followed system');
   await p.getByLabel('Hiệu ứng',{exact:true}).selectOption('off');await p.reload();await p.locator('.dashboard-account').waitFor();if(await p.getByLabel('Hiệu ứng',{exact:true}).inputValue()!=='off')throw Error('Motion preference lost');
   stage=`${width}: changes`;await p.getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();await p.getByText(/^Dữ liệu đã xác minh\./).waitFor();changed=true;await p.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await p.getByText('1 mới · 1 đã mất · 1 thay đổi',{exact:false}).waitFor();
   stage=`${width}: import`;await p.getByRole('button',{name:'Tạo tuần bằng OCR',exact:true}).click();await p.getByRole('heading',{name:'Tạo tuần từ ảnh thực đơn',exact:true}).waitFor();await p.waitForFunction(()=>!document.querySelector('.dashboard-file input')?.disabled);await addImage('file');await p.waitForFunction(()=>document.querySelectorAll('.image-source').length===1);
   await addImage('paste');await p.waitForFunction(()=>document.querySelectorAll('.image-source').length===2);
   await p.getByLabel('Giao diện',{exact:true}).selectOption('dark');await p.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await p.getByRole('dialog',{name:'Rà soát ghép ảnh OCR',exact:true}).waitFor();
   await p.waitForFunction(()=>document.documentElement.dataset.colorScheme==='dark');
   const pane=await p.locator('.merge-dialog .menu-image-pane').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,ink:getComputedStyle(el.querySelector('h3')).color}));
   if(pane.bg==='rgb(255, 255, 255)')throw Error('Dark dialog has unreadable white image pane');
   if(width===390)await p.screenshot({path:'.playwright-cli/import-dark-mobile.png',fullPage:true});
   if(!await p.getByRole('button',{name:'Áp dụng bản ghép vào nháp',exact:true}).isDisabled())throw Error('Unresolved conflict applied');
   if(await p.locator('.menu-review').count())throw Error('OCR auto-replaced draft');
   stage=`${width}: apply`;await p.getByRole('button',{name:'BÒ',exact:true}).click();await p.getByRole('button',{name:'13/10/2026',exact:true}).click();await p.getByRole('button',{name:'Áp dụng bản ghép vào nháp',exact:true}).click();await p.getByLabel('Tiêu đề tuần',{exact:true}).waitFor();
   if(await p.locator('.menu-day').first().getByLabel('Món 2',{exact:true}).inputValue()!=='BÒ')throw Error('Selected merge source ignored');
   stage=`${width}: undo`;await p.getByRole('button',{name:'Hoàn tác',exact:true}).click();if(await p.locator('.menu-review').count())throw Error('Initial merge Undo not atomic');await p.getByRole('button',{name:'Làm lại',exact:true}).click();await p.getByLabel('Tiêu đề tuần',{exact:true}).waitFor();
   await p.getByLabel('Tiêu đề tuần',{exact:true}).focus();const textPaste=await p.evaluate(()=>{const transfer=new DataTransfer();transfer.setData('text/plain','normal text');const event=new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:transfer});document.querySelector('.menu-review>label input').dispatchEvent(event);return event.defaultPrevented;});if(textPaste)throw Error('Normal input paste intercepted');
   await addImage('drop');await p.waitForFunction(()=>document.querySelectorAll('.image-source').length===3);await p.getByRole('button',{name:'Bỏ ảnh 3',exact:true}).click();await p.waitForFunction(()=>document.querySelectorAll('.image-source').length===2);
   const oldTitle=await p.getByLabel('Tiêu đề tuần',{exact:true}).inputValue();await p.evaluate(()=>{const transfer=new DataTransfer();transfer.items.add(new File(['invalid'],'bad.png',{type:'image/png'}));const input=document.querySelector('.dashboard-file input');input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));});await p.getByText('Ảnh bị lỗi hoặc kích thước quá lớn; nháp cũ được giữ.',{exact:true}).first().waitFor();if(await p.getByLabel('Tiêu đề tuần',{exact:true}).inputValue()!==oldTitle||await p.locator('.image-source').count()!==2)throw Error('Bad image cleared draft');
   stage=`${width}: draft reload`;await p.goto('http://127.0.0.1:5176/dashboard?tab=create');await p.getByLabel('Tiêu đề tuần',{exact:true}).waitFor();await p.waitForFunction(()=>document.querySelectorAll('.image-source').length===2);
   if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Page overflow');
   results.push({width,wholeWeekChanges:true,pasteDrop:true,mergeConflictUndo:true,draftRestored:true,preferences:true});
  }
  stage='viewer motion';await p.goto('http://127.0.0.1:5176/newest');await p.getByLabel('Hiệu ứng',{exact:true}).selectOption('off');await p.getByLabel('Form đang mở',{exact:true}).waitFor();if(await p.locator('.form-status-message').evaluate(el=>getComputedStyle(el).opacity)!=='1')throw Error('Off hid status text');
  await p.getByRole('button',{name:'Mở tổng hợp',exact:true}).click();await p.getByRole('button',{name:'Đóng tổng hợp',exact:true}).click();if(await p.locator('#summary-panel').evaluate(el=>el.classList.contains('closing')))throw Error('Off retained disclosure closing timer');
  return{passed:true,results,ocrRequests:posts.length,realWrites:0};
 }catch(error){const info=await p.evaluate(()=>({dialogs:[...document.querySelectorAll('dialog[open]')].map(d=>d.textContent.slice(0,120)),forms:document.querySelectorAll('.menu-review').length,sources:document.querySelectorAll('.image-source').length,draft:document.querySelector('.draft-toolbar p')?.textContent,alerts:[...document.querySelectorAll('[role=alert]')].map(d=>d.textContent.slice(0,120))}));throw Error(stage+': '+error.message+' '+JSON.stringify(info));}finally{await p.close();}
}
