async page => {
  const p=await page.context().newPage();let requests=0,newRecord=false,missingId='',stage='start';
  const keys=['2026-10-12_2026-10-13_2026-10-14_2026-10-15_2026-10-16','2026-10-19_2026-10-20_2026-10-21_2026-10-22_2026-10-23'];
  const weeks=keys.map((weekKey,i)=>({weekKey,name:i?'Tuần 19/10/2026 - 23/10/2026':'Tuần 12/10/2026 - 16/10/2026',formStatus:'open',lockAt:'2030-10-12T00:00:00+07:00'}));
  await p.addInitScript(()=>{if(location.search.includes('resetFixture=1'))Object.keys(localStorage).filter(key=>key.startsWith('meal-dashboard-cache-v1:interaction-qol:')).forEach(key=>localStorage.removeItem(key));});
  await p.route('**/api/session',r=>r.fulfill({json:{authenticated:r.request().method()!=='DELETE'}}));
  await p.route('**/api/branding',r=>r.fulfill({json:{schoolName:'',logoUrl:'',primaryColor:'#087f5b',updatedAt:0}}));
  await p.route('**/api/dashboard*',r=>{
    if(r.request().method()!=='GET')return r.fulfill({status:405,json:{error:'QA forbids mutations'}});
    requests++;
    const url=r.request().url();
    if(url.includes('?week=')){
      const index=url.includes(encodeURIComponent(keys[1]))?1:0;
      const rows=Array.from({length:30},(_,i)=>({responseId:`${index}-${i}`,timestamp:Date.now()-i*1000,name:i===0?'Trường Lâm':`Đặng An ${i}`,meals:['Cơm gà rất ngon và tên món dài để kiểm tra không bị cắt','Mì xào'],deletable:true,deleteToken:'DO_NOT_SAVE',rowNumber:i+2})).filter(row=>row.responseId!==missingId);
      if(newRecord&&index===0)rows.unshift({responseId:'new-id',timestamp:Date.now(),name:'Trường mới',meals:['Cơm gà','Mì xào'],deletable:true,deleteToken:'DO_NOT_SAVE',rowNumber:32});
      return r.fulfill({json:{week:{...weeks[index],dayLabels:['Thứ 3 (13/10/2026)','Thứ 5 (15/10/2026)'],closedDays:['Thứ 2 (12/10/2026)','Thứ 4 (14/10/2026)','Thứ 6 (16/10/2026)']},responseIds:rows.map(v=>v.responseId),responses:rows,responseCount:rows.length,history:[]}});
    }
    return r.fulfill({json:{role:'owner',accountId:'interaction-qol',permissions:{view:true,create:true,manageResponses:true},weeks,allowedEmails:[]}});
  });
  const result=[];
  try {
    for(const width of [1280,390]){
      stage=`${width}: initial`;newRecord=false;missingId='';await p.setViewportSize({width,height:844});await p.goto('http://127.0.0.1:5176/dashboard?resetFixture=1');await p.evaluate(()=>history.replaceState({},'', '/dashboard'));
      await p.getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
      await p.getByPlaceholder('Nhập tên cần tìm').fill('truong');
      await p.locator('[data-response-id]').filter({hasText:'Trường Lâm'}).waitFor();
      if(await p.locator('[data-response-id]').count()!==1)throw Error('Accent filtering failed');
      await p.getByRole('button',{name:'Xem nhanh',exact:true}).click();await p.getByRole('dialog').waitFor();
      const text=await p.getByRole('dialog').innerText();
      if(!text.includes('Thứ 3 (13/10/2026)')||!text.includes('Thứ 5 (15/10/2026)')||text.includes('Thứ 2: Cơm'))throw Error('Quick view guessed a holiday weekday');
      if(await p.getByRole('dialog').getByRole('button',{name:/Xóa|Khôi phục/}).count())throw Error('Quick view contains a mutation');
      await p.keyboard.press('Escape');
      if(!await p.getByRole('button',{name:'Xem nhanh',exact:true}).evaluate(el=>el===document.activeElement))throw Error('Quick view lost focus');
      if(width===390){
        const card=p.locator('[data-response-id]').first();
        const box=await card.boundingBox();if(box.width>390||await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile cards overflow');
        if(await card.locator('.response-meals').evaluate(el=>el.scrollWidth>el.clientWidth))throw Error('Meal text clipped');
      }
      await p.getByPlaceholder('Nhập tên cần tìm').fill('');await p.getByPlaceholder('Nhập tên cần tìm').blur();
      if(await p.locator('.new-response').count())throw Error('Initial rows were highlighted');
      await p.screenshot({path:`.playwright-cli/interaction-cards-${width}.png`,fullPage:false});
      const before=requests;await p.getByRole('combobox',{name:'Tìm tuần',exact:true}).fill('19/10');
      if(requests!==before)throw Error('Week typing caused API reads');
      stage=`${width}: choose second`;await p.getByRole('option',{name:weeks[1].name,exact:true}).click();
      await p.waitForFunction(()=>document.querySelector('[data-response-id]')?.dataset.responseId==='1-0');
      await p.getByPlaceholder('Nhập tên cần tìm').fill('dang');
      await p.getByPlaceholder('Nhập tên cần tìm').blur();
      await p.getByLabel('Sắp xếp',{exact:true}).selectOption('oldest');
      if(width===1280)await p.getByRole('button',{name:'Gọn',exact:true}).click();
      await p.evaluate(()=>{const list=document.querySelector('.dashboard-response-list');if(list.scrollHeight>list.clientHeight)list.scrollTop=240;else window.scrollTo(0,list.getBoundingClientRect().top+scrollY+700);});
      await p.waitForTimeout(220);
      const savedScroll=await p.evaluate(()=>({windowY:scrollY,listY:document.querySelector('.dashboard-response-list').scrollTop,view:JSON.parse(Object.keys(localStorage).filter(k=>k.includes('2026-10-19')&&k.endsWith(':view')).map(k=>localStorage.getItem(k))[0]||'null')?.view}));
      stage=`${width}: back first`;await p.getByRole('combobox',{name:'Tìm tuần',exact:true}).fill('12/10');
      const option=p.getByRole('option',{name:weeks[0].name,exact:true});
      await option.evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished)));
      const optionBox=await option.boundingBox();
      // Use an actual visible pointer tap: locator.click scrolls sticky descendants back to their layout origin.
      await p.mouse.click(optionBox.x+optionBox.width/2,optionBox.y+optionBox.height/2);
      await p.waitForFunction(()=>document.querySelector('[data-response-id]')?.dataset.responseId==='0-0');
      stage=`${width}: restore second`;await p.getByRole('combobox',{name:'Tìm tuần',exact:true}).fill('19/10');await p.getByRole('option',{name:weeks[1].name,exact:true}).click();
      if(await p.getByPlaceholder('Nhập tên cần tìm').inputValue()!=='dang'||await p.getByLabel('Sắp xếp',{exact:true}).inputValue()!=='oldest')throw Error('Per-week preferences not restored');
      await p.waitForFunction(()=>[...document.querySelectorAll('[data-response-id]')].some(el=>el.dataset.responseId==='1-1'));
      await p.waitForTimeout(100);
      const scroll=await p.evaluate(()=>({windowY:scrollY,listY:document.querySelector('.dashboard-response-list').scrollTop}));
      if(width===1280&&scroll.listY<100)throw Error('List scroll not restored');
      if(width===390&&scroll.windowY<200)throw Error('Mobile window scroll not restored '+JSON.stringify(savedScroll));
      stage=`${width}: deleted anchor reload`;missingId=savedScroll.view.anchor;await p.reload();await p.getByPlaceholder('Nhập tên cần tìm').waitFor();
      if(await p.getByPlaceholder('Nhập tên cần tìm').inputValue()!=='dang')throw Error('Reload lost view query');
      await p.waitForFunction(()=>document.querySelector('.dashboard-hint')?.textContent.includes('Dữ liệu đã xác minh'));
      await p.waitForTimeout(100);
      if(await p.locator(`[data-response-id="${missingId}"]`).count())throw Error('Removed anchor still rendered');
      const restored=await p.evaluate(()=>({windowY:scrollY,listY:document.querySelector('.dashboard-response-list').scrollTop}));
      if(width===390?restored.windowY<200:restored.listY<100)throw Error('Deleted anchor lost nearest scroll position');
      await p.getByRole('combobox',{name:'Tìm tuần',exact:true}).fill('12/10');await p.getByRole('option',{name:weeks[0].name,exact:true}).click();
      await p.waitForFunction(()=>document.querySelector('[data-response-id]')?.dataset.responseId==='0-0');
      stage=`${width}: highlight`;newRecord=true;await p.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await p.locator('[data-response-id="new-id"].new-response').waitFor();
      if(width===1280)await p.waitForFunction(()=>!document.querySelector('.new-response'),{timeout:10000});
      await p.getByRole('button',{name:'Tạo tuần bằng OCR',exact:true}).click();
      await p.evaluate(async()=>{
        const db=await new Promise(resolve=>{const r=indexedDB.open('meal-ocr-drafts',1);r.onupgradeneeded=()=>r.result.createObjectStore('drafts',{keyPath:'accountId'});r.onsuccess=()=>resolve(r.result);});
        await new Promise(resolve=>{const tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put({version:1,accountId:'interaction-qol',image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jmAAAAABJRU5ErkJggg==',filename:'test.png',menu:{title:'Test menu',days:[12,13,14,15,16].map((date,i)=>({day:`Thứ ${i+2}`,date:`${date}/10/2026`,meals:['Gà','Cá','Bún'],...(i===2?{closed:true}:{})}))},savedAt:Date.now()});tx.oncomplete=resolve;});db.close();
      });
      stage=`${width}: Monday`;await p.goto('http://127.0.0.1:5176/dashboard?tab=create');await p.getByLabel('Chọn thứ Hai',{exact:true}).waitFor();
      await p.getByLabel('Chọn thứ Hai',{exact:true}).fill('2026-11-02');
      if(await p.locator('.menu-day').nth(4).getByLabel('Ngày',{exact:true}).inputValue()!=='06/11/2026')throw Error('Monday did not fill all dates');
      if(!await p.locator('.menu-day').nth(2).getByLabel('Không phục vụ ngày này').isChecked())throw Error('Monday lost holiday');
      await p.getByRole('button',{name:'Hoàn tác',exact:true}).click();
      if(await p.locator('.menu-day').nth(0).getByLabel('Ngày',{exact:true}).inputValue()!=='12/10/2026')throw Error('Monday Undo is not atomic');
      result.push({width,accentSearch:true,holidayQuickView:true,readonlyDialog:true,cards:true,explicitWeekSelection:true,viewRestore:scroll,newIdHighlight:true,mondayUndo:true});
    }
    await p.getByRole('button',{name:'Đăng xuất',exact:true}).click();await p.getByRole('heading',{name:'Đăng nhập để quản trị'}).waitFor();
    if(await p.evaluate(()=>Object.keys(localStorage).some(key=>key.startsWith('meal-dashboard-cache-v1:'))))throw Error('Logout left view preferences');
    result.push({logoutClearedPreferences:true});return result;
  } catch(error) {const state=await p.evaluate(()=>({query:document.querySelector('input[placeholder="Nhập tên cần tìm"]')?.value,sort:document.querySelector('select[aria-label="Sắp xếp"]')?.value,ids:[...document.querySelectorAll('[data-response-id]')].slice(0,3).map(el=>el.dataset.responseId)}));throw Error(stage+' '+error.message+' '+JSON.stringify(state));}
  finally {await p.close();}
}
