async page => {
  const p=await page.context().newPage();
  let existing=false,posts=[];
  const key='2026-10-12_2026-10-13_2026-10-14_2026-10-15_2026-10-16';
  const menu={title:'Tuần thử',days:[12,13,14,15,16].map((date,i)=>({day:`Thứ ${i+2}`,date:`${date}/10/2026`,meals:['GÀ KHO','CÁ KHO','BÚN']}))};
  const week={weekKey:existing?key:'2026-10-05_2026-10-06_2026-10-07_2026-10-08_2026-10-09',name:'Tuần đã đăng ký',formStatus:'open',lockAt:'2030-10-12T00:00:00+07:00',formUrl:'https://docs.google.com/forms/d/e/test/viewform',spreadsheetUrl:'https://docs.google.com/spreadsheets/d/test/edit'};
  await p.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{if(window.failCopy)throw Error('clipboard denied');window.safeCopied=text;}}});});
  await p.route('**/api/session',r=>r.fulfill({json:{authenticated:true}}));
  await p.route('**/api/branding',r=>r.fulfill({json:{schoolName:'',logoUrl:'',primaryColor:'#087f5b',updatedAt:0}}));
  await p.route('**/api/dashboard*',r=>{
    if(r.request().method()!=='GET'){posts.push(r.request().postDataJSON());return r.fulfill({status:502,json:{error:'SECRET_TOKEN private@example.com STUDENT_NAME'}});}
    const url=r.request().url();
    if(url.includes('?week='))return r.fulfill({json:{week:{...week,weekKey:existing?key:week.weekKey},responseIds:[],responses:Array.from({length:28},(_,i)=>({responseId:`record-${i}`,timestamp:Date.now(),name:`Người thử ${i}`,meals:['Cơm gà'],deletable:false})),history:[]}});
    return r.fulfill({json:{role:'owner',accountId:'editor-qol-fixture',permissions:{view:true,create:true,manageResponses:true},weeks:[{...week,weekKey:existing?key:week.weekKey}],allowedEmails:[]}});
  });
  const results=[];
  try {
    for(const width of [1280,390]){
      existing=false;await p.setViewportSize({width,height:844});await p.goto('http://127.0.0.1:5176/dashboard?tab=create');
      await p.getByRole('heading',{name:'Tạo tuần từ ảnh thực đơn'}).waitFor();
      await p.evaluate(async menu=>{
        const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('meal-ocr-drafts',1);r.onupgradeneeded=()=>r.result.createObjectStore('drafts',{keyPath:'accountId'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
        await new Promise((resolve,reject)=>{const tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put({version:1,accountId:'editor-qol-fixture',image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jmAAAAABJRU5ErkJggg==',filename:'test.png',menu,savedAt:Date.now()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
      },menu);
      await p.reload();await p.getByLabel('Tiêu đề tuần',{exact:true}).waitFor();
      await p.getByLabel('Tiêu đề tuần',{exact:true}).fill('Tuần mới');await p.getByLabel('Tiêu đề tuần',{exact:true}).fill('Tuần mới hơn');
      await p.getByRole('button',{name:'Hoàn tác',exact:true}).click();if(await p.getByLabel('Tiêu đề tuần',{exact:true}).inputValue()!=='Tuần thử')throw Error('Undo typing group failed');
      await p.getByRole('button',{name:'Làm lại',exact:true}).click();
      const first=p.locator('.menu-day').nth(0);await first.getByLabel('Không phục vụ ngày này').check();
      if(await first.getByLabel('Món 1',{exact:true}).count())throw Error('Closed day still requires meals');
      await p.getByRole('button',{name:'Hoàn tác',exact:true}).click();if(await first.getByLabel('Món 1',{exact:true}).inputValue()!=='GÀ KHO')throw Error('Undo lost original meals');
      await p.getByRole('button',{name:'Làm lại',exact:true}).click();
      await p.locator('.menu-day').nth(2).getByLabel('Không phục vụ ngày này').check();
      for(const index of [1,3,4])await p.locator('.menu-day').nth(index).getByLabel('Không phục vụ ngày này').check();
      if(!await p.getByRole('button',{name:'Tạo Form và Sheet',exact:true}).isDisabled())throw Error('All-holiday empty Form enabled');
      for(let i=0;i<3;i++)await p.getByRole('button',{name:'Hoàn tác',exact:true}).click();
      const create=p.getByRole('button',{name:'Tạo Form và Sheet',exact:true});if(await create.isDisabled())throw Error('Valid holiday menu blocked');
      await create.click();await p.getByRole('button',{name:'Sao chép báo lỗi',exact:true}).waitFor();
      if(posts.at(-1).menu.days.length!==5||posts.at(-1).menu.days[0].meals.length!==0||posts.at(-1).menu.days[2].closed!==true)throw Error('Wrong holiday submission');
      await p.getByRole('button',{name:'Sao chép báo lỗi',exact:true}).click();
      const copied=await p.evaluate(()=>window.safeCopied);if(!copied?.includes('HTTP_502')||/SECRET_TOKEN|private@example|STUDENT_NAME|GÀ KHO|test.png/.test(copied))throw Error('Diagnostic data leak');
      await p.evaluate(()=>{window.failCopy=true;});await p.getByRole('button',{name:'Sao chép báo lỗi',exact:true}).click();await p.getByLabel('Báo lỗi đã loại thông tin riêng tư').waitFor();
      existing=true;await p.reload();await p.locator('.existing-week-warning').waitFor();
      if(!await create.isDisabled())throw Error('Existing week creation not disabled');
      if(await p.locator('.existing-week-warning').getByRole('link',{name:'Mở Form',exact:true}).getAttribute('href')!==week.formUrl)throw Error('Existing Form link missing');
      await p.locator('.menu-day').nth(0).getByLabel('Ngày',{exact:true}).fill('26/10/2026');
      if(await p.locator('.existing-week-warning').count())throw Error('Invalid partial dates must hide stale week warning');
      await p.getByRole('button',{name:'Hoàn tác',exact:true}).click();await p.locator('.existing-week-warning').waitFor();
      await p.getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();await p.getByRole('cell',{name:'Người thử 0',exact:true}).waitFor();
      await p.evaluate(()=>window.scrollTo(0,document.querySelector('.dashboard-sticky-tools').getBoundingClientRect().top+scrollY+300));
      const bounds=await p.locator('.dashboard-sticky-tools').boundingBox();
      if(width===390&&(bounds.y < -1 || bounds.y>30 || bounds.height>220))throw Error('Sticky toolbar not compact or not pinned');
      await p.getByPlaceholder('Nhập tên cần tìm').fill('Người thử 2');
      if(width===390){const focused=await p.locator('.dashboard-sticky-tools').boundingBox();if(focused.height>120)throw Error('Focused search did not compact for keyboard');}
      await p.getByPlaceholder('Nhập tên cần tìm').blur();
      if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal page overflow');
      if(width===390)await p.screenshot({path:'editor-qol-mobile.png',fullPage:false});
      results.push({width,groupedUndo:true,holidayUndoPreservesMeals:true,calendarSubmission:true,duplicateWarning:true,safeCopy:true,clipboardFallback:true,mobileToolbar:true});
    }
    await p.route('**/api/viewer*',r=>r.fulfill({json:{title:'Tuần thử',formStatus:'closed',formUrl:'',headers:['Timestamp','Họ và tên','Thứ 3 (13/10/2026)','Thứ 5 (15/10/2026)','Thứ 6 (16/10/2026)'],rows:[['11/10/2026 12:00:00','Người thử','GÀ KHO','CÁ KHO','BÚN']],days:[{day:'Thứ 3 (13/10/2026)',meals:['GÀ KHO']},{day:'Thứ 5 (15/10/2026)',meals:['CÁ KHO']},{day:'Thứ 6 (16/10/2026)',meals:['BÚN']}],calendarDays:[12,13,14,15,16].map((date,i)=>`Thứ ${i+2} (${date}/10/2026)`),closedDays:['Thứ 2 (12/10/2026)','Thứ 4 (14/10/2026)']}}));
    await p.goto('http://127.0.0.1:5176/next');await p.locator('.closed-days-note').waitFor();
    if(!(await p.locator('.week-date-range').innerText()).includes('12/10/2026 – 16/10/2026'))throw Error('Holiday shortened calendar range');
    results.push({holidayViewerCalendar:true,closedDayBanner:true});
    return results;
  } finally {await p.close();}
}
