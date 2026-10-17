import { test, expect } from '@playwright/test';

test.describe('workflow-six',()=>{
  test.setTimeout(20000);
  test('a saved branding event wins over an older pending branding read',async({page})=>{
    await interceptMealServices(page);let release=()=>{};const held=new Promise<void>(resolve=>release=resolve);await page.route('**/api/branding',async route=>{await held;await route.fulfill({json:{schoolName:'Old config',logoUrl:'',primaryColor:'#357185'}});});await page.route('https://logo.example.test/new.svg',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16"/></svg>'}));await page.goto('http://127.0.0.1:5175/newest');await expect(page.getByRole('heading',{name:'Thực đơn tuần này',exact:true})).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new CustomEvent('meal-branding-changed',{detail:{schoolName:'New saved config',logoUrl:'https://logo.example.test/new.svg',primaryColor:'#357185'}})));await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href','https://logo.example.test/new.svg');release();await expect(page.locator('.school-brand')).toHaveText('New saved config');await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href','https://logo.example.test/new.svg');
  });
  test('native meal drag moves the exact slot and remains one Undo without a create call',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await page.getByRole('button',{name:'Kéo món 1 ngày 1',exact:true}).dragTo(page.locator('#ocr-meal-0-2'));await expect(page.locator('#ocr-meal-0-0')).toHaveValue('Cơm cá');await expect(page.locator('#ocr-meal-0-2')).toHaveValue('CƠM GÀ');await page.getByRole('button',{name:'Hoàn tác',exact:true}).click();await expect(page.locator('#ocr-meal-0-2')).toHaveValue('Bún');expect(writes).toEqual([{action:'ocr'}]);
  });
  test('moved column width and hidden state follow its identity and reset restores canonical order',async({page})=>{
    await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/newest');const table=page.getByRole('region',{name:'Bảng chi tiết',exact:true});await table.getByRole('button',{name:'Cột hiển thị',exact:true}).click();
    const chooser=page.getByRole('dialog',{name:'Cột hiển thị · Bảng chi tiết',exact:true}),name=days[4].day,grip=chooser.getByRole('button',{name:`Kéo cột ${name}`,exact:true}),target=chooser.getByRole('checkbox',{name:days[0].day,exact:true});
    await grip.scrollIntoViewIfNeeded();const source=(await grip.boundingBox())!;await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(source.x+source.width/2+12,source.y+source.height/2-12,{steps:5});
    await target.scrollIntoViewIfNeeded();const destination=(await target.boundingBox())!;await page.mouse.move(destination.x+destination.width/2,destination.y+destination.height/2,{steps:5});await page.mouse.up();
    await expect(table.locator('thead th').nth(2)).toContainText('Thứ 6');await chooser.getByRole('spinbutton',{name:`Độ rộng ${name}`,exact:true}).fill('200');await chooser.getByRole('checkbox',{name,exact:true}).uncheck();await page.keyboard.press('Escape');await expect(table.locator('th[data-column="6"]')).toBeHidden();await expect(table.getByRole('separator',{name:`Độ rộng cột ${name}`,exact:true,includeHidden:true})).toHaveAttribute('aria-valuenow','200');await page.reload();await expect(table.locator('th[data-column="6"]')).toBeHidden();await table.getByRole('button',{name:'Cột hiển thị',exact:true}).click();await chooser.getByRole('button',{name:'Khôi phục bố cục',exact:true}).click();await page.keyboard.press('Escape');await expect(table.locator('thead th').nth(2)).toContainText('Thứ 2');await expect(table.locator('th[data-column="6"]')).toBeVisible();
  });
  test('Dashboard column order changes matching semantic cells without changing response identities',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');const table=page.getByRole('region',{name:'Bảng lượt gửi',exact:true});await table.getByRole('button',{name:'Cột hiển thị',exact:true}).click();const chooser=page.getByRole('dialog',{name:'Cột hiển thị · Bảng lượt gửi',exact:true});await chooser.getByRole('button',{name:'Chuyển cột Họ tên sang trái',exact:true}).click();await page.keyboard.press('Escape');await expect(table.locator('thead th').first()).toContainText('Họ tên');await expect(page.locator('[data-response-id=sample-a] td').first()).toContainText('Trường An');await expect(page.locator('[data-response-id=sample-a] td').first()).toHaveAttribute('data-label','Họ tên');expect(writes).toEqual([]);
  });
  test('late logo failure cannot replace a newer saved icon and clearing restores the fallback',async({page})=>{
    await interceptMealServices(page);let release=()=>{};const held=new Promise<void>(resolve=>release=resolve);await page.route('https://logo.example.test/old.svg',async route=>{await held;await route.abort();});await page.route('https://logo.example.test/new.svg',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16"/></svg>'}));await page.goto('http://127.0.0.1:5175/newest');await page.evaluate(()=>window.dispatchEvent(new CustomEvent('meal-branding-changed',{detail:{logoUrl:'https://logo.example.test/old.svg'}})));await page.evaluate(()=>window.dispatchEvent(new CustomEvent('meal-branding-changed',{detail:{logoUrl:'https://logo.example.test/new.svg'}})));await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href','https://logo.example.test/new.svg');release();await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href','https://logo.example.test/new.svg');await page.evaluate(()=>window.dispatchEvent(new CustomEvent('meal-branding-changed',{detail:{logoUrl:''}})));await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href',/^data:image\/svg\+xml/);
  });
  for(const kind of ['legacy','wrong-week'])test('receipt '+kind+' cannot claim either store verified or overall success',async({page})=>{
    await interceptMealServices(page);await page.route('**/api/dashboard',route=>route.request().method()==='DELETE'?route.fulfill({json:kind==='legacy'?{deleted:true}:{deleted:true,receipt:{version:1,operation:'delete',weekKey:'other',recordId:'sample-a',form:'absent',sheet:'absent',verified:true,checkedAt:Date.now()}}}):route.fallback());await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');await page.locator('[data-response-id=sample-a]').getByRole('button',{name:'Thao tác lượt gửi',exact:true}).click();await page.getByRole('dialog',{name:'Thao tác lượt gửi',exact:true}).getByRole('button',{name:'Xóa lượt này',exact:true}).click();await page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true}).getByRole('button',{name:'Xóa lượt gửi này',exact:true}).click();const receipt=page.getByRole('region',{name:'Kết quả xác minh Form và Sheet',exact:true});await expect(receipt.locator('dd')).toHaveText(['Chưa xác minh được','Chưa xác minh được']);await expect(page.locator('.dashboard-message')).toContainText('chưa xác minh');
  });
  test('restored receipt describes the newly verified Form and Sheet separately',async({page})=>{
    await interceptMealServices(page);const id='12345678-1234-1234-1234-123456789abc';await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('week')?route.fulfill({json:{week:{...weeks[0],formStatus:'open'},responses:[],history:[{id,entryId:id,action:'deleted',restorable:true,name:'Tên minh họa',at:1791467940000,originalTimestamp:1791467940000}]}}):route.fallback());let writes=0;await page.route('**/api/dashboard',route=>{if(route.request().method()!=='POST')return route.fallback();writes++;return route.fulfill({json:{restored:true,receipt:{version:1,operation:'restore',weekKey:key,recordId:id,form:'present',sheet:'present',verified:true,checkedAt:Date.now()}}});});await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');await page.getByRole('button',{name:'Thao tác lịch sử',exact:true}).click();page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Khôi phục',exact:true}).click();const receipt=page.getByRole('region',{name:'Kết quả xác minh Form và Sheet',exact:true});await expect(receipt).toContainText('Khôi phục lượt gửi');await expect(receipt.locator('dd')).toHaveText(['Đã xác minh có đúng một lượt','Đã xác minh có đúng một lượt']);expect(writes).toBe(1);
  });
  test('bounded visual review covers narrow theme samples and meal controls without page overflow',async({page})=>{
    test.setTimeout(60000);const errors:string[]=[],writes:object[]=[];page.on('pageerror',error=>errors.push(error.message));await navigationOcr(page,writes);
    for(const [width,height,theme,forced]of [[1440,900,'light',false],[390,844,'dark',false],[320,256,'light',false],[844,390,'dark',true]] as const){await page.setViewportSize({width,height});await page.emulateMedia({forcedColors:forced?'active':'none'});await page.addInitScript(({theme})=>{localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));localStorage.setItem('meal-text-size','large');},{theme});await page.goto('http://127.0.0.1:5175/dashboard?tab=branding');await page.locator('#brand-color').fill('#ffff00');await page.getByRole('region',{name:'Kiểm tra tương phản màu',exact:true}).scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`review/workflow-six/contrast-${width}-${theme}-${forced}.png`});await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await page.getByRole('button',{name:'Đưa món 2 ngày 1 lên',exact:true}).scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`review/workflow-six/meals-${width}-${theme}-${forced}.png`});}
    expect(errors).toEqual([]);expect(writes).toEqual(Array.from({length:4},()=>({action:'ocr'})));
  });
  test('empty viewer offers a counted single-filter recovery without relaxing until click',async({page})=>{
    await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/newest');const name=page.getByRole('combobox',{name:'Họ tên',exact:true});await name.fill('Không có tên');const empty=page.getByRole('status',{name:'Không có kết quả phù hợp',exact:true});await expect(empty).toContainText('Xóa từ khóa để xem 2 lượt gửi');await expect(name).toHaveValue('Không có tên');await empty.getByRole('button',{name:'Bỏ điều kiện Họ tên',exact:true}).click();await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(2);
  });
  test('meal buttons reorder only draft slots and Undo/Redo preserve values',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await page.getByRole('button',{name:'Đưa món 2 ngày 1 lên',exact:true}).click();await expect(page.locator('#ocr-meal-0-0')).toHaveValue('Cơm cá');await expect(page.locator('#ocr-meal-0-1')).toHaveValue('CƠM GÀ');await page.getByRole('button',{name:'Hoàn tác',exact:true}).click();await expect(page.locator('#ocr-meal-0-0')).toHaveValue('CƠM GÀ');await page.getByRole('button',{name:'Làm lại',exact:true}).click();await expect(page.locator('#ocr-meal-0-0')).toHaveValue('Cơm cá');await expect(page.locator('#ocr-date-0')).toHaveValue('19/10/2026');expect(writes).toEqual([{action:'ocr'}]);
  });
  test('contrast preview warns for white and candidate changes only unsaved color',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=branding');await page.locator('#brand-color').fill('#ffffff');const report=page.getByRole('region',{name:'Kiểm tra tương phản màu',exact:true});await expect(report).toContainText('Cần điều chỉnh');await expect(report.locator('[data-contrast-scheme]')).toHaveCount(2);await report.getByRole('button',{name:/Dùng màu gợi ý/}).click();await expect(page.locator('#brand-color')).not.toHaveValue('#ffffff');await expect(report).not.toContainText('Cần điều chỉnh');expect(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--meal-ui-primary').trim())).toBe('#357185');expect(writes).toEqual([]);
  });
  test('saved logo becomes the sole favicon and a failed updated logo falls back',async({page})=>{
    await interceptMealServices(page);await page.route('https://logo.example.test/ok.png',route=>route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64')}));await page.route('**/api/branding',route=>route.fulfill({json:{schoolName:'Trường thử',primaryColor:'#357185',logoUrl:'https://logo.example.test/ok.png'}}));await page.goto('http://127.0.0.1:5175/newest');await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href','https://logo.example.test/ok.png');await page.route('https://logo.example.test/fail.png',route=>route.abort());await page.evaluate(()=>window.dispatchEvent(new CustomEvent('meal-branding-changed',{detail:{schoolName:'Trường thử',primaryColor:'#357185',logoUrl:'https://logo.example.test/fail.png'}})));await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href',/^data:image\/svg\+xml/);await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
  });
  test('PC column move keeps cells widths and hiding attached to original day, mobile retains canonical order',async({page})=>{
    await interceptMealServices(page);await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:5175/newest');const table=page.getByRole('region',{name:'Bảng chi tiết',exact:true});await table.getByRole('button',{name:'Cột hiển thị',exact:true}).click();const chooser=page.getByRole('dialog',{name:'Cột hiển thị · Bảng chi tiết',exact:true});await chooser.getByRole('button',{name:'Chuyển cột Thứ 3 (13/10/2026) sang trái',exact:true}).click();await expect(table.locator('thead th').nth(2)).toContainText('Thứ 3');await expect(table.locator('tbody tr').first().locator('td').nth(2)).toHaveAttribute('data-column','3');await page.keyboard.press('Escape');await page.reload();await expect(table.locator('thead th').nth(2)).toContainText('Thứ 3');await page.setViewportSize({width:390,height:844});await expect(table.locator('thead th').nth(2)).toContainText('Thứ 2');
  });
  test('structured partial deletion displays each source without claiming overall success',async({page})=>{
    await interceptMealServices(page);await page.route('**/api/dashboard',route=>route.request().method()==='DELETE'?route.fulfill({status:502,json:{error:'Cần kiểm tra hai nguồn.',receipt:{version:1,operation:'delete',weekKey:key,recordId:'sample-a',form:'absent',sheet:'present',verified:false,checkedAt:Date.now()}}}):route.fallback());await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');await page.locator('[data-response-id=sample-a]').getByRole('button',{name:'Thao tác lượt gửi',exact:true}).click();await page.getByRole('dialog',{name:'Thao tác lượt gửi',exact:true}).getByRole('button',{name:'Xóa lượt này',exact:true}).click();await page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true}).getByRole('button',{name:'Xóa lượt gửi này',exact:true}).click();const receipt=page.getByRole('region',{name:'Kết quả xác minh Form và Sheet',exact:true});await expect(receipt).toContainText('Google Form');await expect(receipt).toContainText('Đã xác minh không còn lượt');await expect(receipt).toContainText('Google Sheet');await expect(receipt).toContainText('Vẫn còn dữ liệu');await expect(receipt).toContainText('Chưa hoàn tất');
  });
});

test.describe('draft-tools-context',()=>{
  test.setTimeout(25000);
  test('a fixed toolbar beside a field is not mistaken for an overlapping occluder',async({page})=>{
    await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/dashboard?tab=branding');const field=page.getByLabel('Tên trường',{exact:true});await field.scrollIntoViewIfNeeded();const before=await page.evaluate(()=>scrollY);await field.evaluate(node=>{const rect=node.getBoundingClientRect(),beside=document.createElement('div');beside.className='dashboard-sticky-tools';Object.assign(beside.style,{position:'fixed',left:'0',top:rect.top-10+'px',height:rect.height+20+'px',width:Math.max(1,rect.left-20)+'px',pointerEvents:'none'});document.body.append(beside);});await field.focus();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));expect(await page.evaluate(()=>scrollY)).toBe(before);await expect(field).toBeFocused();
  });
  test('focus inside a top-layer chooser is not scrolled away by a toolbar behind the popover',async({page})=>{
    await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');await page.getByRole('region',{name:'Bảng lịch sử thao tác',exact:true}).getByRole('button',{name:'Cột hiển thị',exact:true}).click();const panel=page.getByRole('dialog',{name:'Cột hiển thị · Bảng lịch sử thao tác',exact:true}),checkbox=panel.getByRole('checkbox',{name:'Thời gian',exact:true});await checkbox.scrollIntoViewIfNeeded();const before=await panel.evaluate(node=>node.scrollTop);await page.evaluate(()=>{const behind=document.createElement('div');behind.className='dashboard-sticky-tools';behind.setAttribute('aria-hidden','true');Object.assign(behind.style,{position:'fixed',top:'140px',height:'calc(100vh - 140px)',width:'100%',pointerEvents:'none',zIndex:'1'});document.body.append(behind);});await checkbox.focus();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));expect(await panel.evaluate(node=>node.scrollTop)).toBe(before);await expect(checkbox).toBeFocused();await page.keyboard.press('Escape');await expect(panel).toBeHidden();
  });
  test('a delayed root scroll notification without movement does not close an anchored column chooser',async({page})=>{
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');const table=page.getByRole('region',{name:'Bảng lịch sử thao tác',exact:true});await table.getByRole('button',{name:'Cột hiển thị',exact:true}).click();const chooser=page.getByRole('dialog',{name:'Cột hiển thị · Bảng lịch sử thao tác',exact:true});await expect(chooser).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('scroll')));await expect(chooser).toBeVisible();await page.evaluate(()=>{window.scrollBy(0,-8);window.dispatchEvent(new Event('scroll'));});await expect(chooser).toBeVisible();await chooser.getByRole('checkbox',{name:'Thời gian',exact:true}).uncheck();await expect(chooser.getByRole('checkbox',{name:'Thời gian',exact:true})).not.toBeChecked();await page.keyboard.press('Escape');await expect(chooser).toBeHidden();expect(errors).toEqual([]);
  });
  test('quick view opened from an expanded table remains above its parent modal and returns focus safely',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');await page.getByRole('button',{name:'Phóng rộng bảng lượt gửi',exact:true}).click();const parent=page.getByRole('dialog',{name:'Bảng lượt gửi',exact:true}),opener=parent.locator('[data-response-id=sample-a]').getByRole('button',{name:'Xem nhanh',exact:true});await opener.click();const quick=page.locator('.response-quick-dialog');expect(await quick.evaluate(node=>node.matches(':modal'))).toBe(true);await page.keyboard.press('Escape');await expect(quick).toHaveCount(0);await expect(parent).toBeVisible();await expect(opener).toBeFocused();expect(writes).toEqual([]);
  });
  test('PC quick-view Escape does not consume Vietnamese composition in a background search',async({page})=>{
    await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');await page.locator('[data-response-id=sample-a]').getByRole('button',{name:'Xem nhanh',exact:true}).click();const quick=page.getByRole('dialog',{name:'Chi tiết lượt gửi',exact:true}),search=page.getByRole('textbox',{name:'Tìm theo họ tên',exact:true});await search.focus();await search.dispatchEvent('compositionstart',{data:''});await search.dispatchEvent('keydown',{key:'Escape',code:'Escape',isComposing:true});await expect(quick).toBeVisible();await search.dispatchEvent('compositionend',{data:''});await page.keyboard.press('Escape');await expect(quick).toHaveCount(0);
  });
  test('short mobile quick view leaves readable content instead of trapping it between header and navigation',async({page})=>{
    await interceptMealServices(page);await page.setViewportSize({width:320,height:256});await page.addInitScript(()=>localStorage.setItem('meal-text-size','large'));await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');await page.locator('[data-response-id=sample-a]').getByRole('button',{name:'Xem nhanh',exact:true}).click();const panel=page.getByRole('dialog',{name:'Chi tiết lượt gửi',exact:true}),body=panel.getByRole('region',{name:'Nội dung lượt gửi',exact:true});expect(await body.evaluate(node=>node.clientHeight)).toBeGreaterThan(80);await body.getByRole('heading',{name:'Trường An',exact:true}).scrollIntoViewIfNeeded();await expect(body.getByRole('heading',{name:'Trường An',exact:true})).toBeVisible();await panel.getByRole('button',{name:'Lượt sau',exact:true}).click();await expect(body.getByRole('heading',{name:'Minh Anh',exact:true})).toBeInViewport();await panel.getByRole('button',{name:'Đóng',exact:true}).click();await expect(panel).toHaveCount(0);
  });
  test('stale copy preview cannot overwrite a later edit and invalid table mapping preserves the existing draft',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await page.getByRole('button',{name:'Sao chép món giữa ngày',exact:true}).click();await page.getByRole('button',{name:'Xem trước sao chép',exact:true}).click();await page.locator('#ocr-meal-1-0').fill('Sửa sau xem trước');await expect(page.getByRole('button',{name:'Áp dụng sao chép',exact:true})).toBeDisabled();await expect(page.locator('#ocr-meal-1-0')).toHaveValue('Sửa sau xem trước');await page.getByRole('button',{name:'Dán bảng vào nháp',exact:true}).click();await page.getByRole('textbox',{name:'Bảng ngày và món',exact:true}).fill('Ngày\tMón\n19/10/2026\tCơm');await page.getByRole('button',{name:'Xem trước bảng',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'5 ngày'})).toBeVisible();await expect(page.locator('#ocr-meal-1-0')).toHaveValue('Sửa sau xem trước');expect(writes).toEqual([{action:'ocr'}]);
  });
  test('legacy image draft without original remains editable but never invents a zero-change OCR baseline',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Đã lưu nháp trên thiết bị.'})).toBeVisible();await page.evaluate(()=>new Promise<void>((resolve,reject)=>{const request=indexedDB.open('meal-ocr-drafts',1);request.onsuccess=()=>{const db=request.result,tx=db.transaction('drafts','readwrite'),store=tx.objectStore('drafts'),read=store.get('synthetic-owner');read.onsuccess=()=>{const saved=read.result;delete saved.originalMenu;store.put(saved);};tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};}));await page.reload();await expect(page.locator('.draft-inspection')).toContainText('chưa có mốc so sánh gốc');await expect(page.getByText('Bạn đã sửa 0 ô',{exact:true})).toHaveCount(0);await page.locator('#ocr-meal-0-0').fill('Vẫn sửa được');await expect(page.locator('#ocr-meal-0-0')).toHaveValue('Vẫn sửa được');expect(writes).toEqual([{action:'ocr'}]);
  });
  test('session feedback is bounded, omits raw error secrets and vanishes on reload without replay',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');await expect(page.locator('[data-response-id=sample-a]')).toBeVisible();await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('week')?route.fulfill({status:500,json:{error:'Lỗi thử secret=PRIVATE_TEST_SECRET'}}):route.fallback());for(let i=1;i<=21;i++){await page.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await expect(page.getByRole('button',{name:`Thông báo phiên này (${Math.min(i,20)})`,exact:true})).toBeVisible();}await page.getByRole('button',{name:'Thông báo phiên này (20)',exact:true}).click();const list=page.getByRole('region',{name:'Thông báo phiên này',exact:true});await expect(list.locator('li')).toHaveCount(20);await expect(list).not.toContainText('PRIVATE_TEST_SECRET');await page.unroute('**/api/dashboard?**');await page.reload();await expect(page.getByRole('button',{name:'Thông báo phiên này (0)',exact:true})).toBeVisible();expect(writes).toEqual([]);
  });
  test('PC side-panel reading does not bypass the separate destructive confirmation',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');const row=page.locator('[data-response-id=sample-a]');await row.getByRole('button',{name:'Xem nhanh',exact:true}).click();const panel=page.getByRole('dialog',{name:'Chi tiết lượt gửi',exact:true});await row.getByRole('button',{name:'Thao tác lượt gửi',exact:true}).click();await page.getByRole('dialog',{name:'Thao tác lượt gửi',exact:true}).getByRole('button',{name:'Xóa lượt này',exact:true}).click();const confirmation=page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true});expect(await confirmation.evaluate(node=>node.matches(':modal'))).toBe(true);await expect(confirmation.getByRole('button',{name:'Hủy',exact:true})).toBeFocused();await page.keyboard.press('Escape');await expect(panel).toBeVisible();expect(writes).toEqual([]);
  });
  test('responsive review keeps simulated Form, focus editor, guides and side panel readable',async({page})=>{
    test.setTimeout(90000);const errors:string[]=[],writes:object[]=[];page.on('pageerror',error=>errors.push(error.message));await navigationOcr(page,writes);for(const [width,height,theme,forced]of [[1440,900,'light',false],[900,700,'dark',false],[390,844,'light',false],[320,256,'dark',false],[844,390,'dark',false],[390,700,'dark',true]] as const){await page.setViewportSize({width,height});await page.emulateMedia({forcedColors:forced?'active':'none'});await page.addInitScript(({theme})=>{localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));localStorage.setItem('meal-text-size','large');},{theme});await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await page.getByRole('button',{name:'Tập trung sửa thực đơn',exact:true}).click();await page.locator('#ocr-title').fill('Thực đơn kiểm thử với tên dài và nhiều nội dung để đối chiếu trên điện thoại');await page.getByRole('button',{name:'Xem thử Form',exact:true}).click();await page.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});const simulation=page.getByRole('dialog',{name:'Form mô phỏng',exact:true});await expect(simulation).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`review/draft-tools-context/simulation-${width}-${height}-${theme}-${forced}.png`});await simulation.getByRole('button',{name:'Đóng mô phỏng',exact:true}).click();await page.getByRole('button',{name:'Thoát chế độ tập trung',exact:true}).click();await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');await page.locator('[data-response-id=sample-a]').getByRole('button',{name:'Xem nhanh',exact:true}).click();await expect(page.getByRole('dialog',{name:'Chi tiết lượt gửi',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`review/draft-tools-context/panel-${width}-${height}-${theme}-${forced}.png`});await page.getByRole('dialog',{name:'Chi tiết lượt gửi',exact:true}).getByRole('button',{name:'Đóng',exact:true}).click();await page.getByRole('button',{name:'Hướng dẫn mục này',exact:true}).click();const guide=page.getByRole('dialog',{name:'Hướng dẫn mục hiện tại',exact:true});await expect(guide).toBeVisible();const box=(await guide.boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);if(forced)await page.screenshot({path:'review/draft-tools-context/guide-forced.png'});await page.keyboard.press('Escape');}expect(errors).toEqual([]);expect(writes).toEqual(Array.from({length:6},()=>({action:'ocr'})));
  });
  test('Overview guide has real visible steps and never starts by itself',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard');await page.getByRole('button',{name:'Hướng dẫn mục này',exact:true}).click();const guide=page.getByRole('dialog',{name:'Hướng dẫn mục hiện tại',exact:true});await expect(guide).toBeVisible();await expect(guide).toContainText('1 / 3');await guide.getByRole('button',{name:'Tiếp',exact:true}).click();await expect(page.locator('[data-guide-target]')).toHaveCount(1);await guide.getByRole('button',{name:'Bỏ qua / Đóng',exact:true}).click();await expect(guide).toHaveCount(0);expect(writes).toEqual([]);
  });
  test('viewer offline preserves loaded rows, shows the true last-read time and does not refetch on a disabled connection',async({page,context})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/newest');await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(2);await context.setOffline(true);const notice=page.getByRole('status',{name:'Trạng thái kết nối',exact:true});await expect(notice).toContainText('Đang xem bản lưu lúc');await page.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(2);await context.setOffline(false);await expect(notice).toHaveCount(0);expect(writes).toEqual([]);
  });
  test('original OCR diff follows edits and Undo, survives draft restore, and its link focuses the real cell',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await page.locator('#ocr-meal-0-0').fill('Món đã sửa');await page.getByText('Bạn đã sửa 1 ô',{exact:true}).click();const diff=page.getByRole('region',{name:'Thay đổi trong nháp',exact:true});await expect(diff).toContainText('CƠM GÀ');await expect(diff).toContainText('Món đã sửa');await diff.getByRole('button',{name:/Thứ 2 · Món 1/}).click();await expect(page.locator('#ocr-meal-0-0')).toBeFocused();await page.getByRole('button',{name:'Hoàn tác',exact:true}).click();await expect(page.getByText('Bạn đã sửa 0 ô',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Làm lại',exact:true}).click();await expect(page.getByText('Bạn đã sửa 1 ô',{exact:true})).toBeVisible();await expect(page.getByRole('status').filter({hasText:'Đã lưu nháp trên thiết bị.'})).toBeVisible();await page.reload();await expect(page.getByText('Bạn đã sửa 1 ô',{exact:true})).toBeVisible();expect(writes).toEqual([{action:'ocr'}]);
  });
  test('simulated registration uses current meals/holidays without writes and returns to the correct edit field',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await page.getByRole('button',{name:'Xem thử Form',exact:true}).click();const preview=page.getByRole('dialog',{name:'Form mô phỏng',exact:true});await expect(preview).toContainText('Không gửi lượt thật');await preview.getByRole('combobox',{name:'Thứ 2 · 19/10/2026',exact:true}).selectOption('CƠM GÀ');await expect(preview.getByRole('combobox',{name:/Thứ 4/})).toHaveCount(0);await preview.getByRole('button',{name:'Xem lựa chọn thử',exact:true}).click();await expect(preview.getByRole('region',{name:'Kết quả mô phỏng',exact:true})).toContainText('CƠM GÀ');await preview.getByRole('button',{name:'Sửa Thứ 2',exact:true}).click();await expect(preview).toHaveCount(0);await expect(page.locator('#ocr-date-0')).toBeFocused();expect(writes).toEqual([{action:'ocr'}]);
  });
  test('paste mapping requires preview, preserves source text, applies one Undo group and restores an imageless draft',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await page.getByRole('button',{name:'Dán bảng vào nháp',exact:true}).click();const input=page.getByRole('textbox',{name:'Bảng ngày và món',exact:true});await input.fill('Ngày\tMón 1\tMón 2\tMón 3\n'+['19','20','21','22','23'].map((day,i)=>`${day}/10/2026\tCơm ${i}\tBún ${i}\tCá ${i}`).join('\n'));await expect(page.locator('#ocr-date-0')).toHaveCount(0);await page.getByRole('button',{name:'Xem trước bảng',exact:true}).click();await expect(page.getByRole('region',{name:'Bảng sắp áp dụng',exact:true})).toContainText('Cơm 0');await page.getByRole('button',{name:'Áp dụng bảng vào nháp',exact:true}).click();await expect(page.locator('#ocr-meal-0-0')).toHaveValue('Cơm 0');await page.getByRole('button',{name:'Hoàn tác',exact:true}).click();await expect(page.locator('#ocr-meal-0-0')).toHaveCount(0);await page.getByRole('button',{name:'Làm lại',exact:true}).click();await expect(page.locator('#ocr-meal-0-0')).toHaveValue('Cơm 0');await expect(page.getByRole('status').filter({hasText:'Đã lưu nháp trên thiết bị.'})).toBeVisible();await page.reload();await expect(page.locator('#ocr-meal-0-0')).toHaveValue('Cơm 0');expect(writes).toEqual([]);
  });
  test('day copy previews old/new, keeps date/holiday flags and Undo restores the target',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await page.locator('#ocr-meal-0-0').fill('Món nguồn');await page.getByRole('button',{name:'Sao chép món giữa ngày',exact:true}).click();await page.getByRole('combobox',{name:'Ngày nguồn',exact:true}).selectOption('0');await page.getByRole('combobox',{name:'Ngày đích',exact:true}).selectOption('1');await page.getByRole('button',{name:'Xem trước sao chép',exact:true}).click();await expect(page.getByRole('region',{name:'Món sắp sao chép',exact:true})).toContainText('Món nguồn');await page.getByRole('button',{name:'Áp dụng sao chép',exact:true}).click();await expect(page.locator('#ocr-meal-1-0')).toHaveValue('Món nguồn');await expect(page.locator('#ocr-date-1')).toHaveValue('20/10/2026');await expect(page.locator('#ocr-closed-2')).toBeChecked();await page.getByRole('button',{name:'Hoàn tác',exact:true}).click();await expect(page.locator('#ocr-meal-1-0')).toHaveValue('CƠM GÀ');expect(writes).toEqual([{action:'ocr'}]);
  });
  test('focused editor retains real image/editor DOM and explicit exit restores shell without writes',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await page.locator('#ocr-title').fill('Nháp tập trung');const field=await page.locator('#ocr-title').elementHandle();await page.getByRole('button',{name:'Tập trung sửa thực đơn',exact:true}).click();await expect(page.locator('.ui-sidebar')).toBeHidden();await expect(page.locator('#ocr-title')).toHaveValue('Nháp tập trung');await page.getByRole('button',{name:'Thoát chế độ tập trung',exact:true}).click();expect(await field!.evaluate(node=>node.isConnected)).toBe(true);await expect(page.locator('.ui-sidebar')).toBeVisible();expect(writes).toEqual([{action:'ocr'}]);
  });
  test('quick view is a PC side panel with visible table and becomes a focus-contained full mobile dialog',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');const opener=page.locator('[data-response-id=sample-a]').getByRole('button',{name:'Xem nhanh',exact:true});await opener.click();const panel=page.getByRole('dialog',{name:'Chi tiết lượt gửi',exact:true});await expect(panel).toBeVisible();expect(await panel.evaluate(node=>node.matches(':modal'))).toBe(false);const p=(await panel.boundingBox())!,t=(await page.locator('[data-response-id=sample-a]').boundingBox())!;expect(t.x+t.width).toBeLessThanOrEqual(p.x);await page.setViewportSize({width:390,height:844});expect(await panel.evaluate(node=>node.matches(':modal'))).toBe(true);await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);await expect(opener).toBeFocused();expect(writes).toEqual([]);
  });
  test('week option descriptions distinguish real zero from unknown without changing committed labels',async({page})=>{
    await interceptMealServices(page);await page.route('**/api/dashboard?access=1',route=>route.fulfill({json:{accountId:'synthetic-owner',email:'admin@example.com',role:'owner',permissions:{view:true,create:true,manageResponses:true},weeks:[{...weeks[0],responseCount:0},{...weeks[1],responseCount:null,formStatus:'unknown'}]}}));await page.goto('http://127.0.0.1:5175/dashboard?tab=notice');const picker=page.getByRole('combobox',{name:'Tìm tuần',exact:true});await picker.click();const first=page.getByRole('option',{name:weeks[0].name,exact:true}),second=page.getByRole('option',{name:weeks[1].name,exact:true});await expect(first).toContainText('0 lượt · Form đã đóng');await expect(second).toContainText('Chưa đọc được số lượt');await second.click();await expect(picker).toHaveValue(weeks[1].name);
  });
  test('dismissed feedback stays in a bounded session-only list and clearing never writes',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');await page.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await expect(page.locator('.action-toast')).toBeVisible();await page.getByRole('button',{name:'Đóng thông báo',exact:true}).click();await page.getByRole('button',{name:/Thông báo phiên này/}).click();const list=page.getByRole('region',{name:'Thông báo phiên này',exact:true});await expect(list).toContainText('Không thay thế lịch sử quản trị');await expect(list.locator('li')).not.toHaveCount(0);await list.getByRole('button',{name:'Xóa thông báo phiên',exact:true}).click();await expect(list.locator('li')).toHaveCount(0);expect(writes).toEqual([]);
  });
  test('explicit contextual guide advances visible targets, closes safely and never activates an action',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');const opener=page.getByRole('button',{name:'Hướng dẫn mục này',exact:true});await expect(page.getByRole('dialog',{name:'Hướng dẫn mục hiện tại',exact:true})).toHaveCount(0);await opener.click();const guide=page.getByRole('dialog',{name:'Hướng dẫn mục hiện tại',exact:true});await expect(guide).toContainText('1 /');await guide.getByRole('button',{name:'Tiếp',exact:true}).click();await expect(guide).toContainText('2 /');await page.keyboard.press('Escape');await expect(guide).toHaveCount(0);await expect(opener).toBeFocused();expect(writes).toEqual([]);
  });
  test('known offline keeps permitted rows with saved time, disables writes and never queues them on reconnect',async({page,context})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');await expect(page.locator('[data-response-id=sample-a]')).toBeVisible();await context.setOffline(true);await expect(page.getByRole('status',{name:'Trạng thái kết nối',exact:true})).toContainText('ngoại tuyến');await expect(page.locator('[data-response-id=sample-a]')).toBeVisible();await page.locator('[data-response-id=sample-a]').getByRole('button',{name:'Thao tác lượt gửi',exact:true}).click();await expect(page.getByRole('dialog',{name:'Thao tác lượt gửi',exact:true}).getByRole('button',{name:'Xóa lượt này',exact:true})).toBeDisabled();await context.setOffline(false);await expect(page.getByRole('status',{name:'Trạng thái kết nối',exact:true})).toHaveCount(0);expect(writes).toEqual([]);
  });
});

test.describe('operate-accessibility',()=>{
  test.setTimeout(20000);
  test('Back restores each entry filter even after visiting the same week with another filter',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard');const nav=page.locator('.ui-sidebar'),query=page.getByRole('textbox',{name:'Tìm theo họ tên',exact:true});await nav.getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();await query.fill('truong');await nav.getByRole('button',{name:'Thương hiệu',exact:true}).click();await nav.getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();await query.fill('minh');await nav.getByRole('button',{name:'Tổng quan',exact:true}).click();await page.goBack();await expect(query).toHaveValue('minh');await page.goBack();await expect(page.getByLabel('Tên trường',{exact:true})).toBeVisible();await page.goBack();await expect(query).toHaveValue('truong');await expect(query).not.toBeFocused();expect(new URL(page.url()).search).not.toMatch(/truong|minh/);expect(writes).toEqual([]);
  });
  for(const scope of ['branding','notice'])test('malformed success cannot clear the '+scope+' draft or dirty save bar',async({page})=>{
    await interceptMealServices(page);await page.route('**/api/dashboard',route=>route.request().method()==='POST'?route.fulfill({json:{ok:true}}):route.fallback());await page.goto('http://127.0.0.1:5175/dashboard?tab='+scope);
    if(scope==='branding')await page.getByLabel('Tên trường',{exact:true}).fill('Chưa có xác nhận hợp lệ');else{const text=page.getByLabel('Nội dung thông báo',{exact:true});await expect(text).toBeEnabled();await text.fill('Chưa có xác nhận hợp lệ');await page.getByLabel('Hiển thị hết ngày',{exact:true}).fill('2026-10-23');}
    const bar=page.getByRole('region',{name:scope==='branding'?'Thay đổi thương hiệu chưa lưu':'Thay đổi thông báo chưa lưu',exact:true}),label=scope==='branding'?'Lưu thương hiệu':'Lưu thông báo';await bar.getByRole('button',{name:label,exact:true}).click();await page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true}).getByRole('button',{name:label,exact:true}).click();await expect(page.locator('.dashboard-message')).toContainText('Chưa nhận được xác nhận');await expect(bar).toBeVisible();await expect(scope==='branding'?page.getByLabel('Tên trường',{exact:true}):page.getByLabel('Nội dung thông báo',{exact:true})).toHaveValue('Chưa có xác nhận hợp lệ');
  });
  test('invalid deadline has the same linked summary and inline explanation without sending a mutation',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=form');await page.getByLabel('Hạn mới — giờ Việt Nam',{exact:true}).fill('2020-01-01T12:00');await page.getByRole('button',{name:'Lưu hạn đăng ký',exact:true}).click();const summary=page.getByRole('region',{name:'Lỗi cần sửa trước khi đổi hạn Form',exact:true});await expect(summary).toBeFocused();await summary.getByRole('button',{name:/Hạn mới/}).click();await expect(page.getByLabel('Hạn mới — giờ Việt Nam',{exact:true})).toBeFocused();await expect(page.locator('#dashboard-deadline-error')).toContainText('tương lai');expect(writes).toEqual([]);
  });
  test('filter announcements remain concise and do not move focus or expose whole records',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');const search=page.getByRole('textbox',{name:'Tìm theo họ tên',exact:true});await search.fill('truong');await expect(search).toBeFocused();const status=page.getByRole('status',{name:'Kết quả lọc lượt gửi',exact:true});await expect(status).toContainText('1 lượt gửi');await expect(status).not.toContainText('Trường An');await expect(status).toHaveAttribute('aria-atomic','true');await page.goto('http://127.0.0.1:5175/newest');const viewer=page.getByRole('combobox',{name:'Họ tên',exact:true});await viewer.fill('truong');await expect(viewer).toBeFocused();await expect(page.getByRole('status',{name:'Kết quả lọc',exact:true})).toContainText('1 lượt gửi');expect(writes).toEqual([]);
  });
  test('Escape closes an auto popover but keeps its parent expanded table open',async({page})=>{
    await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/newest');await page.getByRole('button',{name:'Phóng rộng bảng chi tiết',exact:true}).click();const table=page.getByRole('dialog',{name:'Bảng chi tiết',exact:true});await table.getByRole('button',{name:'Cột hiển thị',exact:true}).click();const chooser=page.getByRole('dialog',{name:'Cột hiển thị · Bảng chi tiết',exact:true});await expect(chooser).toBeVisible();await page.keyboard.press('Escape');await expect(chooser).toBeHidden();await expect(table).toBeVisible();await page.keyboard.press('Escape');await expect(table).toBeHidden();
  });
  test('long failure toast does not cover the dirty save bar or a focused mobile field',async({page})=>{
    await interceptMealServices(page);await page.setViewportSize({width:390,height:844});await page.route('**/api/dashboard',route=>route.request().method()==='POST'&&route.request().postDataJSON().action==='set-branding'?route.fulfill({status:500,json:{error:'Lỗi kết nối kiểm thử. Nội dung chưa được lưu và cần được giữ để thử lại. '.repeat(3)}}):route.fallback());await page.goto('http://127.0.0.1:5175/dashboard?tab=branding');await page.getByLabel('Tên trường',{exact:true}).fill('Bản sửa cần giữ');const bar=page.getByRole('region',{name:'Thay đổi thương hiệu chưa lưu',exact:true});await bar.getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();await page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true}).getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();const toast=page.locator('.action-toast.error');await expect(toast).toBeVisible();
    await expect.poll(async()=>{const t=(await toast.boundingBox())!,b=(await bar.boundingBox())!;return t.y+t.height<=b.y||b.y+b.height<=t.y;}).toBe(true);const field=page.getByLabel('URL ảnh logo HTTPS',{exact:true});await field.focus();await expect.poll(async()=>{const t=(await toast.boundingBox())!,f=(await field.boundingBox())!;return f.y+f.height<=t.y||t.y+t.height<=f.y;}).toBe(true);await expect(field).toBeFocused();
  });
  test('press-drag-release cannot confirm deletion, and a removed row returns focus to a surviving record',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);let deleted=false;await page.route('**/api/dashboard',route=>{if(route.request().method()==='DELETE'){deleted=true;writes.push(route.request().postDataJSON());return route.fulfill({json:{ok:true}});}return route.fallback();});
    await page.route('**/api/dashboard?**',route=>{if(!new URL(route.request().url()).searchParams.has('week'))return route.fallback();return route.fulfill({json:{week:{...weeks[0],dayLabels:days.map(day=>day.day)},responses:[...(!deleted?[{responseId:'sample-a',name:'A',timestamp:1791467940000,meals:['A'],deletable:true,deleteToken:'exact-token'}]:[]),{responseId:'sample-b',name:'B',timestamp:1791467880000,meals:['B'],deletable:true,deleteToken:'other-token'}],history:[]}});});await page.goto('http://127.0.0.1:5175/dashboard?tab=delete');await page.locator('[data-response-id=sample-a]').getByRole('button',{name:'Thao tác lượt gửi',exact:true}).click();await page.getByRole('dialog',{name:'Thao tác lượt gửi',exact:true}).getByRole('button',{name:'Xóa lượt này',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true}),confirm=dialog.getByRole('button',{name:'Xóa lượt gửi này',exact:true}),cancel=dialog.getByRole('button',{name:'Hủy',exact:true});await dialog.evaluate(node=>Promise.all(node.getAnimations().map(animation=>animation.finished.catch(()=>{}))));const c=(await confirm.boundingBox())!,b=(await cancel.boundingBox())!;await page.mouse.move(c.x+c.width/2,c.y+c.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.up();expect(writes).toEqual([]);await expect(dialog).toBeVisible();await confirm.click();await expect(page.locator('[data-response-id=sample-a]')).toHaveCount(0);await expect(page.locator('[data-response-id=sample-b]').getByRole('button',{name:'Xem nhanh',exact:true})).toBeFocused();expect(writes).toEqual([{weekKey:key,responseId:'sample-a',deleteToken:'exact-token',reason:''}]);
  });
  test('responsive review keeps OCR/save controls readable at narrow zoom-equivalent, landscape and forced colors',async({page})=>{
    test.setTimeout(90000);const errors:string[]=[],writes:object[]=[];page.on('pageerror',error=>errors.push(error.message));await navigationOcr(page,writes);
    for(const [width,height,theme,forced]of [[1440,900,'light',false],[900,700,'dark',false],[390,844,'light',false],[320,256,'dark',false],[844,390,'dark',false],[390,700,'dark',true]] as const){
      await page.setViewportSize({width,height});await page.emulateMedia({forcedColors:forced?'active':'none'});await page.addInitScript(({theme})=>{localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));localStorage.setItem('meal-text-size','large');},{theme});
      await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await page.locator('#ocr-date-0').fill('31/02/2026');await page.locator('#ocr-meal-0-0').fill('');await page.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});await page.getByRole('region',{name:'Lỗi cần sửa trước khi tạo tuần',exact:true}).scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`review/operate-accessibility/ocr-${width}-${height}-${theme}-${forced}.png`});
      await page.goto('http://127.0.0.1:5175/dashboard?tab=branding');await page.getByLabel('Tên trường',{exact:true}).fill('Trường kiểm thử chữ dài và khoảng cách');const bar=page.getByRole('region',{name:'Thay đổi thương hiệu chưa lưu',exact:true});await bar.scrollIntoViewIfNeeded();await expect(bar.getByRole('button',{name:'Lưu thương hiệu',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`review/operate-accessibility/save-${width}-${height}-${theme}-${forced}.png`});
      if(forced){await bar.getByRole('button',{name:'Bỏ thay đổi',exact:true}).focus();const colors=await bar.evaluate(node=>({background:getComputedStyle(node).backgroundColor,text:getComputedStyle(node).color}));expect(colors.background).not.toBe(colors.text);expect(await page.locator(':focus').evaluate(node=>getComputedStyle(node).outlineStyle)).not.toBe('none');}
    }expect(errors).toEqual([]);expect(writes).toEqual(Array.from({length:6},()=>({action:'ocr'})));
  });
  test('mobile visual viewport keeps the focused field above keyboard without stealing focus',async({page})=>{
    await page.addInitScript(()=>{const viewport=Object.assign(new EventTarget(),{height:844,width:390,offsetTop:0,offsetLeft:0,scale:1});Object.defineProperty(window,'visualViewport',{value:viewport});});await interceptMealServices(page);await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5175/dashboard?tab=branding');const field=page.getByLabel('URL ảnh logo HTTPS',{exact:true});await field.fill('https://example.test/logo.png');await field.focus();
    await page.evaluate(()=>{Object.assign(window.visualViewport!,{height:280});window.visualViewport!.dispatchEvent(new Event('resize'));});await expect.poll(async()=>{const box=(await field.boundingBox())!;return box.y>=0&&box.y+Math.min(box.height,200)<=280;}).toBe(true);await expect(field).toBeFocused();await expect(field).toHaveValue('https://example.test/logo.png');
  });
  test('compact sidebar tooltip remains readable under pointer and Escape dismisses it',async({page})=>{
    await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/dashboard');await page.getByRole('button',{name:'Thu gọn thanh bên',exact:true}).click();const trigger=page.locator('.ui-sidebar').getByRole('button',{name:'Thông báo tuần',exact:true});await trigger.hover();const tooltip=page.getByRole('tooltip',{name:'Thông báo tuần',exact:true});await expect(tooltip).toBeVisible();await tooltip.hover();await expect(tooltip).toBeVisible();await page.keyboard.press('Escape');await expect(tooltip).toBeHidden();
  });
  test('Gmail permission labels are touch-sized and filtering announces only loaded counts without moving input focus',async({page})=>{
    const writes:object[]=[];await discoveryFixture(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=access');const hit=page.locator('.member-permissions label').first();expect((await hit.boundingBox())!.height).toBeGreaterThanOrEqual(44);const search=page.getByRole('textbox',{name:'Tìm Gmail đã cấp quyền',exact:true});await search.fill('ocr');await expect(search).toBeFocused();const status=page.getByRole('status',{name:'Kết quả lọc quyền Gmail',exact:true});await expect(status).toContainText('1/3');await expect(status).not.toContainText('ocr@example.com');expect(writes).toEqual([]);
  });
  test('long source names show a preserved extension and disclose the exact copyable original',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);const png=await page.locator('.image-source img').getAttribute('src'),name='thuc-don-'+('phan-dau-tuan-'.repeat(8))+'.png';await page.locator('input[type=file]').first().setInputFiles({name,mimeType:'image/png',buffer:Buffer.from(png!.split(',')[1],'base64')});const row=page.locator('.image-source');await expect(row.getByRole('button',{name:'Ảnh 1: '+name,exact:true})).toContainText('…');await expect(row.locator('.source-filename-text').first()).toContainText('.png');await row.locator('details summary').focus();await page.keyboard.press('Enter');await expect(row.locator('.source-filename-full')).toHaveText(name);expect(writes).toEqual([]);
  });
  test('brand save bar appears only for dirty work, survives failure and discards only after confirmation',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.route('**/api/dashboard',route=>{if(route.request().method()==='POST'&&route.request().postDataJSON().action==='set-branding'){writes.push(route.request().postDataJSON());return route.fulfill({status:500,json:{error:'Lỗi lưu thử'}});}return route.fallback();});
    await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Thương hiệu',exact:true}).click();const bar=page.getByRole('region',{name:'Thay đổi thương hiệu chưa lưu',exact:true}),name=page.getByLabel('Tên trường',{exact:true});await expect(bar).toHaveCount(0);await name.fill('Tên đang sửa');await expect(bar).toBeVisible();await bar.getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();const confirm=page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true});await confirm.getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();await expect(page.locator('.dashboard-message')).toContainText('Lỗi lưu thử');await expect(bar).toBeVisible();await expect(name).toHaveValue('Tên đang sửa');
    await bar.getByRole('button',{name:'Bỏ thay đổi',exact:true}).click();await expect(confirm.getByRole('button',{name:'Hủy',exact:true})).toBeFocused();await confirm.getByRole('button',{name:'Bỏ thay đổi',exact:true}).click();await expect(name).toHaveValue('Trường minh họa');await expect(bar).toHaveCount(0);expect(writes).toHaveLength(1);
  });
  test('notice validation links to the exact field and conflict keeps the dirty bar and draft',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.route('**/api/dashboard',route=>{if(route.request().method()==='POST'&&route.request().postDataJSON().action==='set-week-notice'){writes.push(route.request().postDataJSON());return route.fulfill({status:409,json:{error:'Thông báo đã đổi trên máy chủ'}});}return route.fallback();});
    await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Thông báo tuần',exact:true}).click();const field=page.getByLabel('Nội dung thông báo',{exact:true});await expect(field).toBeEnabled();await field.fill('Nội dung cần giữ');const bar=page.getByRole('region',{name:'Thay đổi thông báo chưa lưu',exact:true});await bar.getByRole('button',{name:'Lưu thông báo',exact:true}).click();const summary=page.getByRole('region',{name:'Lỗi cần sửa trước khi lưu thông báo',exact:true});await expect(summary).toBeFocused();await summary.getByRole('button',{name:/Hiển thị hết ngày/}).click();await expect(page.getByLabel('Hiển thị hết ngày',{exact:true})).toBeFocused();expect(writes).toEqual([]);
    await page.getByLabel('Hiển thị hết ngày',{exact:true}).fill('2026-10-23');await bar.getByRole('button',{name:'Lưu thông báo',exact:true}).click();await page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true}).getByRole('button',{name:'Lưu thông báo',exact:true}).click();await expect(page.locator('.dashboard-message')).toContainText('Thông báo đã đổi');await expect(field).toHaveValue('Nội dung cần giữ');await expect(bar).toBeVisible();await expect(bar.getByRole('button',{name:'Lưu thông báo',exact:true})).toBeDisabled();expect(writes).toHaveLength(1);
  });
  test('creation receipt uses the created week and verified result links instead of first overview week',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.route('**/api/dashboard',route=>{if(route.request().method()==='POST'&&route.request().postDataJSON().action==='create'){writes.push(route.request().postDataJSON());return route.fulfill({json:{responseUrl:'https://docs.google.com/forms/d/e/created/viewform',spreadsheetUrl:'https://docs.google.com/spreadsheets/d/created/edit',weekFolderName:'Tuần 19/10/2026 - 23/10/2026'}});}return route.fallback();});
    await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await page.getByRole('button',{name:'Tạo Form và Sheet',exact:true}).click();const receipt=page.getByRole('region',{name:'Kết quả tạo tuần',exact:true});await expect(receipt).toContainText('19/10/2026 - 23/10/2026');await expect(receipt.getByRole('link',{name:/Mở Form/})).toHaveAttribute('href','https://docs.google.com/forms/d/e/created/viewform');await expect(receipt.getByRole('link',{name:/Mở Sheet/})).toHaveAttribute('href','https://docs.google.com/spreadsheets/d/created/edit');await expect(page.locator('.menu-review')).toHaveCount(0);expect(writes.map((body:any)=>body.action)).toEqual(['ocr','create']);
  });
  test('Dashboard Back and Forward restore tabs and cancelled dirty Back stays on the edited form',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard');const nav=page.locator('.ui-sidebar');await nav.getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();await expect(page).toHaveURL(/tab=delete/);await page.getByRole('textbox',{name:'Tìm theo họ tên',exact:true}).fill('truong');await nav.getByRole('button',{name:'Thương hiệu',exact:true}).click();const name=page.getByLabel('Tên trường',{exact:true});await name.fill('Chưa được bỏ');page.once('dialog',dialog=>dialog.dismiss());await page.goBack();await expect(name).toHaveValue('Chưa được bỏ');await expect(page).toHaveURL(/tab=branding/);
    page.once('dialog',dialog=>dialog.accept());await page.goBack();await expect(page.getByRole('textbox',{name:'Tìm theo họ tên',exact:true})).toHaveValue('truong');await page.goForward();await expect(name).toHaveValue('Trường minh họa');expect(new URL(page.url()).search).not.toContain('truong');expect(writes).toEqual([]);
  });
  test('destructive confirmation starts safely and menu separates deletion from Sheet lookup',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
    const row=page.locator('[data-response-id=sample-a]'),opener=row.getByRole('button',{name:'Thao tác lượt gửi',exact:true});await opener.click();const menu=page.getByRole('dialog',{name:'Thao tác lượt gửi',exact:true});
    await expect(menu.getByRole('group',{name:'Thao tác xóa',exact:true})).toContainText('Xóa lượt này');await menu.getByRole('button',{name:'Xóa lượt này',exact:true}).click();
    const confirm=page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true});await expect(confirm.getByRole('button',{name:'Hủy',exact:true})).toBeFocused();await expect(confirm.getByRole('button',{name:'Xóa lượt gửi này',exact:true})).toBeVisible();
    await page.keyboard.press('Escape');await expect(opener).toBeFocused();expect(writes).toEqual([]);
  });
  test('OCR fields stay available without reviewed controls and each error matches its summary target',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();
    await expect(page.getByRole('checkbox',{name:/Đã rà soát/})).toHaveCount(0);await expect(page.locator('#ocr-date-4')).toBeVisible();await page.locator('#ocr-date-0').fill('sai ngày');await page.locator('#ocr-meal-0-0').fill('');await page.locator('#ocr-meal-0-1').fill('');
    const field=page.locator('#ocr-meal-0-0'),errorId=await field.getAttribute('aria-describedby');expect(errorId).toBeTruthy();const inline=page.locator('[id="'+errorId+'"]');await expect(inline).toContainText('Cần ít nhất 2 món');
    await expect(page.getByRole('button',{name:'Tạo Form và Sheet',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Tạo Form và Sheet',exact:true}).click();const summary=page.getByRole('region',{name:'Lỗi cần sửa trước khi tạo tuần',exact:true});await expect(summary).toBeFocused();await expect(summary).toContainText('mục cần sửa');await summary.getByRole('button',{name:/Thứ 2 · Món 1/}).click();await expect(field).toBeFocused();await expect(inline).toBeVisible();expect(writes).toEqual([{action:'ocr'}]);
  });
  test('mobile Photo/Edit preserves editor and image DOM, zoom, scroll and unsaved text',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();
    const edit=page.getByRole('tab',{name:'Bản sửa',exact:true}),photo=page.getByRole('tab',{name:'Ảnh',exact:true});await expect(edit).toHaveAttribute('aria-selected','true');await page.locator('#ocr-title').fill('Bản sửa đang giữ');const handle=await page.locator('#ocr-title').elementHandle();
    await photo.click();await page.getByRole('button',{name:'Phóng to ảnh',exact:true}).first().click();await expect(page.locator('.menu-image-pane output').first()).toHaveText('125%');await edit.click();await expect(page.locator('#ocr-title')).toHaveValue('Bản sửa đang giữ');expect(await handle!.evaluate(node=>node.isConnected)).toBe(true);
    await photo.click();await expect(page.locator('.menu-image-pane output').first()).toHaveText('125%');await edit.click();await expect(page.locator('#ocr-date-4')).toBeVisible();expect(writes).toEqual([{action:'ocr'}]);
  });
  test('column width can be entered or clicked without dragging and data/filters remain unchanged',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/newest');const before=await page.getByRole('status',{name:'Kết quả lọc'}).textContent();await page.getByRole('button',{name:'Cột hiển thị',exact:true}).click();
    const chooser=page.getByRole('dialog',{name:'Cột hiển thị · Bảng chi tiết',exact:true}),width=chooser.getByRole('spinbutton',{name:'Độ rộng Họ tên',exact:true});await width.fill('300');await width.press('Enter');await expect(width).toHaveValue('300');await chooser.getByRole('button',{name:'Tăng độ rộng Họ tên',exact:true}).click();await expect(width).toHaveValue('316');await page.keyboard.press('Escape');await expect(page.getByRole('separator',{name:'Độ rộng cột Họ tên',exact:true})).toHaveAttribute('aria-valuenow','316');await expect(page.getByRole('status',{name:'Kết quả lọc'})).toHaveText(before!);expect(writes).toEqual([]);
  });
  test('failed named image leaves previous images and labels unchanged',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('textbox',{name:'Nhãn phụ ảnh 1',exact:true}).fill('Ảnh cần giữ');await page.locator('input[type=file]').first().setInputFiles({name:'menu-3.webp',mimeType:'image/webp',buffer:Buffer.from('not an image')});
    await expect(page.locator('.dashboard-message')).toContainText('menu-3.webp');await expect(page.locator('.image-source')).toHaveCount(1);await expect(page.getByRole('textbox',{name:'Nhãn phụ ảnh 1',exact:true})).toHaveValue('Ảnh cần giữ');expect(writes).toEqual([]);
  });
});

const navigationMenu={title:'Tuần thử',days:['19','20','21','22','23'].map((date,i)=>({day:`Thứ ${i+2}`,date:`${date}/10/2026`,meals:['CƠM GÀ','Cơm cá','Bún'],...(i===2?{closed:true}:{})}))};
async function navigationImages(page:import('@playwright/test').Page,count=1){await page.locator('button.image-upload-target:not(:disabled)').waitFor();const pngs=await page.evaluate(count=>Array.from({length:count},(_,i)=>{const c=document.createElement('canvas');c.width=20;c.height=20;const ctx=c.getContext('2d')!;ctx.fillStyle=['red','blue','green'][i%3];ctx.fillRect(0,0,20,20);return c.toDataURL('image/png').split(',')[1];}),count);await page.locator('input[type=file]').first().setInputFiles(pngs.map((png,i)=>({name:`${i+1}.png`,mimeType:'image/png',buffer:Buffer.from(png,'base64')})));await expect(page.locator('.image-source')).toHaveCount(count);}
async function navigationOcr(page:import('@playwright/test').Page,writes:object[]){await interceptMealServices(page,'owner','#357185',writes);await page.route('**/api/dashboard',route=>{const body=route.request().method()==='POST'?route.request().postDataJSON():null;if(body?.action!=='ocr')return route.fallback();writes.push({action:'ocr'});return route.fulfill({json:navigationMenu});});}

const discoveryMembers=[
  {email:'view@example.com',permissions:{view:true,create:false,manageResponses:false}},
  {email:'ocr@example.com',permissions:{view:true,create:true,manageResponses:false}},
  {email:'delete@example.com',permissions:{view:true,create:false,manageResponses:true}}
];
async function discoveryFixture(page:import('@playwright/test').Page,writes:object[]=[]){
  await interceptMealServices(page,'owner','#357185',writes);
  let members=discoveryMembers;
  await page.route('**/api/dashboard**',route=>{
    const request=route.request(),url=new URL(request.url());
    if(request.method()==='POST'){
      const body=request.postDataJSON();if(body.action!=='set-permissions')return route.fallback();
      writes.push({method:'POST',...body});members=members.map(member=>member.email===body.email?{...member,permissions:body.permissions}:member);
      return route.fulfill({json:{members,allowedEmails:members.map(member=>member.email)}});
    }
    return !url.search||url.searchParams.has('access')?route.fulfill({json:{accountId:'synthetic-owner',email:'admin@example.com',role:'owner',permissions:{view:true,create:true,manageResponses:true},weeks,members}}):route.fallback();
  });
}
test.describe('ime-access-labels',()=>{
  test.setTimeout(25000);
  test('viewer name composition keeps old rows/options and caret until final accented query',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/newest');
    const search=page.getByRole('combobox',{name:'Họ tên',exact:true}),rows=page.locator('.detail-wrap tbody tr');
    await expect(rows).toHaveCount(2);await search.focus();await search.dispatchEvent('compositionstart');
    await search.fill('zz');await expect(search).toHaveValue('zz');await expect(rows).toHaveCount(2);await expect(page.getByRole('option',{name:'Minh Anh',exact:true})).toBeVisible();
    await search.fill('Trường');await search.evaluate((node:HTMLInputElement)=>node.setSelectionRange(3,3));
    await search.dispatchEvent('keydown',{key:'ArrowDown',isComposing:true,keyCode:229});await expect(search).toBeFocused();
    expect(await search.evaluate((node:HTMLInputElement)=>node.selectionStart)).toBe(3);
    await search.dispatchEvent('compositionend',{data:'Trường'});await expect(rows).toHaveCount(1);await expect(rows).toContainText('Trường An');
    await page.getByRole('button',{name:'Xóa tìm kiếm Họ tên',exact:true}).click();await expect(search).toHaveValue('');await expect(rows).toHaveCount(2);expect(writes).toEqual([]);
  });
  test('selected week option query stays stable during composition and clear cancels pending text',async({page})=>{
    await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Thông báo tuần',exact:true}).click();
    const search=page.getByRole('combobox',{name:'Tìm tuần',exact:true});await search.focus();const menu=page.locator('#'+await search.getAttribute('aria-controls'));
    await expect(menu.getByRole('option')).toHaveCount(2);await search.dispatchEvent('compositionstart');await search.fill('không khớp');
    await expect(menu.getByRole('option')).toHaveCount(2);await search.dispatchEvent('keydown',{key:'Escape',isComposing:true,keyCode:229});await expect(search).toHaveAttribute('aria-expanded','true');
    await page.getByRole('button',{name:'Xóa tìm kiếm Tìm tuần',exact:true}).click();await expect(search).toHaveValue('');await expect(menu.getByRole('option')).toHaveCount(2);
    await search.dispatchEvent('compositionstart');await search.fill('05/10');await search.dispatchEvent('compositionend');await expect(menu.getByRole('option')).toHaveCount(1);
    await menu.getByRole('option').click();await expect(search).toHaveValue('Tuần 05/10/2026 - 09/10/2026');
  });
  test('shared OCR search never jumps focus on composing Enter and commits on blur',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();
    const search=page.getByRole('textbox',{name:'Tìm trong bản OCR',exact:true}),status=page.getByRole('status',{name:'Kết quả tìm OCR',exact:true});
    await search.fill('com');await expect(status).toContainText('8 ô khớp');await search.dispatchEvent('compositionstart');await search.fill('xyz');
    await expect(status).toContainText('8 ô khớp');await search.dispatchEvent('keydown',{key:'Enter',isComposing:true,keyCode:229});await expect(search).toBeFocused();
    await page.getByRole('heading',{name:'Tạo tuần từ ảnh thực đơn',exact:true}).click();await expect(status).toContainText('0 ô khớp');
    await search.fill('com');await search.dispatchEvent('keydown',{key:'Enter',isComposing:true,keyCode:229});await expect(search).toBeFocused();
    await search.press('Enter');await expect(page.locator('#ocr-meal-0-0')).toBeFocused();await expect(page.locator('#ocr-meal-0-0')).toHaveValue('CƠM GÀ');expect(writes).toEqual([{action:'ocr'}]);
  });
  test('Gmail search intersects loaded permission filters without writes and preserves mutation identity',async({page})=>{
    const writes:object[]=[];await discoveryFixture(page,writes);await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Quyền Gmail',exact:true}).click();
    const list=page.locator('.dashboard-email-list'),filter=page.getByLabel('Lọc theo quyền',{exact:true}),search=page.getByRole('textbox',{name:'Tìm Gmail đã cấp quyền',exact:true});
    await expect(list.locator('li')).toHaveCount(3);await filter.selectOption('create');await expect(list.locator('li')).toHaveCount(1);await expect(list).toContainText('ocr@example.com');
    await search.fill('DELETE');await expect(list.locator('li')).toHaveCount(0);await expect(page.getByRole('status',{name:'Kết quả lọc quyền Gmail'})).toContainText('0/3');
    await page.getByRole('button',{name:'Xóa tìm kiếm Tìm Gmail đã cấp quyền',exact:true}).click();await expect(filter).toHaveValue('create');await filter.selectOption('manageResponses');await expect(list).toContainText('delete@example.com');
    await filter.selectOption('view');await expect(list.locator('li')).toHaveCount(3);await search.dispatchEvent('compositionstart');await search.fill('ocr');await expect(list.locator('li')).toHaveCount(3);await search.dispatchEvent('compositionend');await expect(list.locator('li')).toHaveCount(1);
    // Permission boxes reflect the server acknowledgement, not an optimistic native check.
    expect(writes).toEqual([]);await list.getByRole('checkbox',{name:'Xóa / khôi phục',exact:true}).click();await expect(list.getByRole('checkbox',{name:'Xóa / khôi phục',exact:true})).toBeChecked();
    await expect.poll(()=>writes.length).toBe(1);expect(writes).toEqual([{method:'POST',action:'set-permissions',email:'ocr@example.com',permissions:{view:true,create:true,manageResponses:true}}]);
  });
  test('image secondary labels follow reorder and local restore without renaming files or entering OCR payloads',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);let submitted:Record<string,unknown>|null=null;await page.route('**/api/dashboard',route=>{const body=route.request().method()==='POST'?route.request().postDataJSON():null;if(body?.action!=='ocr-images')return route.fallback();submitted=body;return route.fulfill({json:{fragments:body.images.map((_:string,imageIndex:number)=>({imageIndex,title:'Minh họa',days:[]}))}});});
    await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page,2);
    await page.getByRole('textbox',{name:'Nhãn phụ ảnh 1',exact:true}).fill('Phần đầu tuần');await page.getByRole('textbox',{name:'Nhãn phụ ảnh 2',exact:true}).fill('Phần cuối tuần');
    const sources=await page.locator('.image-source img').evaluateAll(nodes=>nodes.map(n=>(n as HTMLImageElement).src));
    await page.getByRole('button',{name:'Di chuyển ảnh 1 xuống',exact:true}).click();await expect(page.getByRole('textbox',{name:'Nhãn phụ ảnh 1',exact:true})).toHaveValue('Phần cuối tuần');
    await expect(page.locator('.image-source [data-image-choice]')).toHaveText(['Ảnh 1: 2.png','Ảnh 2: 1.png']);await expect(page.locator('.menu-image-filename')).toHaveText('1.png');expect(writes).toEqual([]);
    await expect(page.locator('.draft-toolbar [role=status]')).toContainText('Đã lưu nháp');await page.reload();
    await expect(page.getByRole('textbox',{name:'Nhãn phụ ảnh 2',exact:true})).toHaveValue('Phần đầu tuần');await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();
    await expect.poll(()=>submitted).not.toBeNull();expect(submitted).toEqual({action:'ocr-images',images:[sources[1],sources[0]]});
  });
  test('labels survive append/remove and keep duplicate filename associations with original budget',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page,2);
    await page.getByRole('textbox',{name:'Nhãn phụ ảnh 1',exact:true}).fill('A');await page.getByRole('textbox',{name:'Nhãn phụ ảnh 2',exact:true}).fill('B');
    const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Thêm ảnh',exact:true}).click();const png=await page.locator('.image-source img').first().getAttribute('src');await(await chooser).setFiles({name:'1.png',mimeType:'image/png',buffer:Buffer.from(png!.split(',')[1],'base64')});
    await expect(page.locator('.image-source')).toHaveCount(3);await expect(page.getByRole('textbox',{name:'Nhãn phụ ảnh 3',exact:true})).toHaveValue('');await page.getByRole('textbox',{name:'Nhãn phụ ảnh 3',exact:true}).fill('C');
    const budget=await page.getByRole('status',{name:'Dung lượng bộ ảnh'}).textContent();await page.getByRole('button',{name:'Di chuyển ảnh 3 lên',exact:true}).click();await expect(page.getByRole('status',{name:'Dung lượng bộ ảnh'})).toHaveText(budget!);
    await expect(page.getByRole('textbox',{name:'Nhãn phụ ảnh 2',exact:true})).toHaveValue('C');await page.getByRole('button',{name:'Bỏ ảnh 1',exact:true}).click();
    await expect(page.getByRole('textbox',{name:'Nhãn phụ ảnh 1',exact:true})).toHaveValue('C');await expect(page.getByRole('textbox',{name:'Nhãn phụ ảnh 2',exact:true})).toHaveValue('B');expect(writes).toEqual([]);
  });
  test('command palette waits for composition and raw IME Enter never navigates',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/newest');await page.keyboard.press('Control+k');
    const search=page.getByRole('combobox',{name:'Tìm lệnh hoặc tuần',exact:true}),list=page.getByRole('listbox',{name:'Kết quả lệnh',exact:true});await expect(search).toBeFocused();const before=await list.getByRole('option').count();
    await search.dispatchEvent('compositionstart');await search.fill('Dashboard');await expect(list.getByRole('option')).toHaveCount(before);await search.dispatchEvent('keydown',{key:'Enter',isComposing:true,keyCode:229});await expect(search).toBeFocused();await expect(page).toHaveURL(/newest$/);
    await search.dispatchEvent('compositionend');await expect(list.getByRole('option')).toHaveCount(1);await search.press('Enter');await expect(page).toHaveURL(/dashboard$/);expect(writes).toEqual([]);
  });
  test('empty member scope is honest and non-owners never gain permission discovery controls',async({page})=>{
    await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Quyền Gmail',exact:true}).click();await expect(page.getByRole('status',{name:'Kết quả lọc quyền Gmail'})).toContainText('0/0');await expect(page.getByText('Chưa có Gmail được cấp quyền.',{exact:true})).toBeVisible();
    await interceptMealServices(page,'viewer');await page.goto('http://127.0.0.1:5175/dashboard');await expect(page.locator('.ui-sidebar').getByRole('button',{name:'Quyền Gmail',exact:true})).toHaveCount(0);await expect(page.getByRole('search',{name:'Tìm và lọc quyền Gmail'})).toHaveCount(0);
  });
  test('responsive batch keeps secondary labels and Gmail discovery readable in light/dark large text',async({page})=>{
    test.setTimeout(90000);const writes:object[]=[],errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await discoveryFixture(page,writes);
    for(const width of [360,900,1440])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:900});await page.addInitScript(({theme})=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));localStorage.setItem('meal-text-size','large');},{theme});
      await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page,2);await page.getByRole('textbox',{name:'Nhãn phụ ảnh 1',exact:true}).fill('Phần đầu tuần · đối chiếu ngày và món');await page.getByRole('textbox',{name:'Nhãn phụ ảnh 2',exact:true}).fill('Phần cuối tuần');
      const capture=async(label:string)=>{await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`review/ime-access-labels/${label}-${width}-${theme}.png`});};
      await page.locator('.image-source-list').scrollIntoViewIfNeeded();await capture('labels');
      if(width>700)await page.locator('.ui-sidebar').getByRole('button',{name:'Quyền Gmail',exact:true}).click();else{await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Thêm',exact:true}).click();await page.getByRole('dialog',{name:'Thêm chức năng',exact:true}).getByRole('button',{name:'Quyền Gmail',exact:true}).click();}
      await page.getByLabel('Lọc theo quyền',{exact:true}).selectOption('create');await page.getByRole('search',{name:'Tìm và lọc quyền Gmail'}).scrollIntoViewIfNeeded();await capture('members');await expect(page.locator('.dashboard-email-list li')).toHaveCount(1);
    }expect(errors).toEqual([]);expect(writes).toEqual([]);
  });
});

test.describe('ocr-navigation',()=>{
  test.setTimeout(20000);
  test('foreign and cancelled drags do nothing while mobile order buttons keep boundaries',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page,2);const transfer=await page.evaluateHandle(()=>{const data=new DataTransfer();data.setData('application/x-mealform-image-index','0');return data;});await page.locator('.image-source').nth(1).dispatchEvent('drop',{dataTransfer:transfer});await expect(page.locator('.image-source [data-image-choice]')).toHaveText(['Ảnh 1: 1.png','Ảnh 2: 2.png']);const handle=page.getByRole('button',{name:'Kéo để đổi vị trí ảnh 1',exact:true});await handle.dispatchEvent('dragstart',{dataTransfer:transfer});await handle.dispatchEvent('dragend',{dataTransfer:transfer});await page.locator('.image-source').nth(1).dispatchEvent('drop',{dataTransfer:transfer});await expect(page.locator('.image-source [data-image-choice]')).toHaveText(['Ảnh 1: 1.png','Ảnh 2: 2.png']);await expect(page.getByRole('button',{name:'Di chuyển ảnh 1 lên',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Di chuyển ảnh 2 xuống',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Di chuyển ảnh 1 xuống',exact:true}).click();await expect(page.locator('.image-source [data-image-choice]')).toHaveText(['Ảnh 1: 2.png','Ảnh 2: 1.png']);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(writes).toEqual([]);
  });
  test('clean loaded results are not presented as unchecked or as verified overall health, and roles stay scoped',async({page})=>{
    await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/dashboard');const region=page.getByRole('region',{name:'Cần xử lý',exact:true});await expect(region).toContainText('Chưa có kết quả kiểm tra');await page.locator('.ui-sidebar').getByRole('button',{name:'Hệ thống',exact:true}).click();await expect(page.getByRole('status',{name:'Tóm tắt hệ thống'})).toContainText('1 ổn');await page.locator('.ui-sidebar').getByRole('button',{name:'Tổng quan',exact:true}).click();await expect(region).toContainText('Trong các kết quả đã tải chưa có mục cần xử lý');await expect(region.getByRole('button')).toHaveCount(0);await interceptMealServices(page,'viewer');await page.goto('http://127.0.0.1:5175/dashboard');await expect(page.locator('.ui-sidebar').getByRole('button',{name:'Hệ thống',exact:true})).toHaveCount(0);await expect(region.getByRole('button',{name:'Mở Hệ thống',exact:true})).toHaveCount(0);
  });
  test('empty OCR find and clearing never change contents/history; new sources reset the query',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await expect(page.locator('#ocr-title')).toHaveValue('Tuần thử');const search=page.getByRole('textbox',{name:'Tìm trong bản OCR',exact:true}),find=page.getByRole('search',{name:'Tìm trong bản OCR',exact:true}),undo=page.getByRole('button',{name:'Hoàn tác',exact:true});await expect(undo).toBeDisabled();await search.fill('không có từ này');await expect(find).toContainText('0 ô khớp');await expect(find.getByRole('button',{name:'Kết quả sau',exact:true})).toBeDisabled();await search.press('Enter');await search.fill('COM');await expect(find).toContainText('8 ô khớp');await find.getByRole('button',{name:'Xóa tìm kiếm Tìm trong bản OCR',exact:true}).click();await expect(undo).toBeDisabled();await expect(page.locator('#ocr-title')).toHaveValue('Tuần thử');await search.fill('COM');await navigationImages(page);await expect(page.locator('.menu-review')).toHaveCount(0);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await expect(search).toHaveValue('');expect(writes).toEqual([{action:'ocr'},{action:'ocr'}]);
  });
  test('responsive batch keeps image ordering, loaded attention and matched OCR fields readable',async({page})=>{
    test.setTimeout(90000);const errors:string[]=[],writes:object[]=[];page.on('pageerror',error=>errors.push(error.message));await navigationOcr(page,writes);await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('health')?route.fulfill({json:{checkedAt:Date.now(),checks:[{id:'ocr',label:'OCR',status:'warning',message:'Chưa đọc ảnh thử'}]}}):route.fallback());
    for(const width of [360,900,1440])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:800});await page.addInitScript(({theme})=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));localStorage.setItem('meal-text-size','large');},{theme});
      const capture=async(label:string)=>{await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`review/ocr-navigation/${label}-${width}-${theme}.png`});};
      await page.goto('http://127.0.0.1:5175/dashboard?tab=health');await expect(page.getByRole('status',{name:'Tóm tắt hệ thống'})).toContainText('1 cần chú ý');if(width>700)await page.locator('.ui-sidebar').getByRole('button',{name:'Tổng quan',exact:true}).click();else await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Tổng quan',exact:true}).click();await page.getByRole('region',{name:'Cần xử lý',exact:true}).scrollIntoViewIfNeeded();await capture('attention');
      if(width>700)await page.locator('.ui-sidebar').getByRole('button',{name:'Tạo tuần bằng OCR',exact:true}).click();else await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Tạo tuần',exact:true}).click();await page.locator('button.image-upload-target:not(:disabled)').waitFor();if(await page.locator('.image-source').count()){page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Xóa nháp',exact:true}).click();await expect(page.locator('.image-source')).toHaveCount(0);}await navigationImages(page,2);await page.getByRole('button',{name:'Di chuyển ảnh 2 lên',exact:true}).click();await page.locator('.image-source-list').scrollIntoViewIfNeeded();await capture('image-order');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await expect(page.locator('#ocr-title')).toHaveValue('Tuần thử');await page.getByRole('textbox',{name:'Tìm trong bản OCR',exact:true}).fill('com');await page.getByRole('button',{name:'Kết quả sau',exact:true}).click();await expect(page.locator('#ocr-meal-0-0')).toBeFocused();await page.getByRole('search',{name:'Tìm trong bản OCR',exact:true}).scrollIntoViewIfNeeded();await capture('find');await page.locator('#ocr-meal-0-0').scrollIntoViewIfNeeded();await capture('match');
    }expect(errors).toEqual([]);expect(writes).toEqual(Array.from({length:6},()=>({action:'ocr'})));
  });
  test('image buttons and native drag preserve preview, budget and restored draft; explicit OCR uses displayed order',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);let submitted:string[]=[];await page.route('**/api/dashboard',route=>{const body=route.request().method()==='POST'?route.request().postDataJSON():null;if(body?.action!=='ocr-images')return route.fallback();submitted=body.images;writes.push({action:'ocr-images'});return route.fulfill({json:{fragments:body.images.map((_:string,imageIndex:number)=>({imageIndex,title:'Minh họa',days:[]}))}});});await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page,3);const sources=await page.locator('.image-source img').evaluateAll(nodes=>nodes.map(n=>(n as HTMLImageElement).src)),budget=await page.getByRole('status',{name:'Dung lượng bộ ảnh'}).textContent();await page.getByRole('button',{name:'Ảnh 2: 2.png',exact:true}).click();const active=await page.locator('.menu-image-viewport').first().locator('img').getAttribute('src');await page.getByRole('button',{name:'Di chuyển ảnh 3 lên',exact:true}).click();await expect(page.getByRole('button',{name:'Ảnh 2: 3.png',exact:true})).toBeFocused();await expect(page.locator('.image-source [data-image-choice]')).toHaveText(['Ảnh 1: 1.png','Ảnh 2: 3.png','Ảnh 3: 2.png']);await page.getByRole('button',{name:'Kéo để đổi vị trí ảnh 1',exact:true}).dragTo(page.locator('.image-source').nth(2));await expect(page.locator('.image-source [data-image-choice]')).toHaveText(['Ảnh 1: 3.png','Ảnh 2: 2.png','Ảnh 3: 1.png']);expect(await page.locator('.menu-image-viewport').first().locator('img').getAttribute('src')).toBe(active);await expect(page.locator('.menu-image-filename')).toHaveText('2.png');await expect(page.getByRole('status',{name:'Dung lượng bộ ảnh'})).toHaveText(budget!);expect(writes).toEqual([]);await expect(page.locator('.draft-toolbar [role=status]')).toContainText('Đã lưu nháp');await page.reload();await expect(page.locator('.image-source [data-image-choice]')).toHaveText(['Ảnh 1: 3.png','Ảnh 2: 2.png','Ảnh 3: 1.png']);await expect(page.locator('.menu-image-filename')).toHaveText('2.png');await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await expect.poll(()=>submitted.length).toBe(3);expect(submitted).toEqual([sources[2],sources[1],sources[0]]);await expect(page.locator('[aria-label="Di chuyển ảnh 2 lên"]')).toBeDisabled();expect(writes).toEqual([{action:'ocr-images'}]);
  });
  test('retained OCR disables ordering without changing source, meals or Undo state',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await expect(page.locator('#ocr-meal-0-0')).toHaveValue('CƠM GÀ');const undoWasDisabled=await page.getByRole('button',{name:'Hoàn tác',exact:true}).isDisabled(),png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=8;c.height=8;return c.toDataURL('image/png').split(',')[1];});const choosing=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Thêm ảnh',exact:true}).click();await (await choosing).setFiles({name:'extra.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await expect(page.getByRole('status',{name:'Dung lượng bộ ảnh'})).toContainText('2/5 ảnh');await expect(page.getByRole('button',{name:'Di chuyển ảnh 2 lên',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Kéo để đổi vị trí ảnh 1',exact:true})).toHaveAttribute('draggable','false');await expect(page.locator('#ocr-meal-0-0')).toHaveValue('CƠM GÀ');expect(await page.getByRole('button',{name:'Hoàn tác',exact:true}).isDisabled()).toBe(undoWasDisabled);expect(writes).toEqual([{action:'ocr'}]);
  });
  test('Overview combines only already loaded current-week issues and links to existing sections without background checks',async({page})=>{
    await interceptMealServices(page);let healthReads=0,reconcileReads=0;await page.route('**/api/dashboard?**',route=>{const q=new URL(route.request().url()).searchParams;if(q.has('health')){healthReads++;return route.fulfill({json:{checkedAt:Date.now(),checks:[{id:'ocr',label:'OCR',status:'warning',message:'Chưa đọc ảnh thử'}]}});}if(q.has('reconcile')){reconcileReads++;return route.fulfill({json:{formCount:2,sheetCount:0,matchedCount:0,issues:[{kind:'form-only',name:'A',timestamp:1791467000000,meals:['A']},{kind:'form-only',name:'B',timestamp:1791467000000,meals:['B']}]}});}return route.fallback();});await page.goto('http://127.0.0.1:5175/dashboard');const nav=page.locator('.ui-sidebar'),attention=page.getByRole('region',{name:'Cần xử lý',exact:true});await expect(attention).toContainText('Chưa có kết quả kiểm tra');expect([healthReads,reconcileReads]).toEqual([0,0]);await nav.getByRole('button',{name:'Hệ thống',exact:true}).click();await expect(page.getByRole('status',{name:'Tóm tắt hệ thống'})).toContainText('1 cần chú ý');await nav.getByRole('button',{name:'Đối soát',exact:true}).click();await page.getByRole('button',{name:'Đối soát tuần này',exact:true}).click();await expect(page.locator('.reconciliation-issues li')).toHaveCount(2);await nav.getByRole('button',{name:'Tổng quan',exact:true}).click();await expect(attention.getByRole('button',{name:'Mở Hệ thống',exact:true})).toBeVisible();await expect(attention.getByRole('button',{name:'Mở Đối soát',exact:true})).toBeVisible();await expect(attention).toContainText('Đã tải');await expect(attention).toContainText(weeks[0].name);expect([healthReads,reconcileReads]).toEqual([1,1]);await attention.getByRole('button',{name:'Mở Đối soát',exact:true}).click();await expect(page.getByRole('heading',{name:'Đối soát Form–Sheet',exact:true})).toBeVisible();expect(reconcileReads).toBe(1);await page.getByRole('combobox',{name:'Tìm tuần',exact:true}).click();await page.getByRole('option',{name:weeks[1].name,exact:true}).click();await nav.getByRole('button',{name:'Tổng quan',exact:true}).click();await expect(attention).toContainText(weeks[1].name);await expect(attention.getByRole('button',{name:'Mở Đối soát',exact:true})).toHaveCount(0);await expect(attention).toContainText('Chưa có kết quả kiểm tra');expect([healthReads,reconcileReads]).toEqual([1,1]);
  });
  test('OCR find keeps actual fields visible, folds accents and follows edits/Undo without submitting',async({page})=>{
    const writes:object[]=[];await navigationOcr(page,writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await navigationImages(page);await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await expect(page.locator('#ocr-meal-0-0')).toHaveValue('CƠM GÀ');const original=await page.locator('#ocr-title,[id^=ocr-date-],[id^=ocr-meal-]').evaluateAll(nodes=>nodes.map(n=>(n as HTMLInputElement).value));const search=page.getByRole('textbox',{name:'Tìm trong bản OCR',exact:true}),find=page.getByRole('search',{name:'Tìm trong bản OCR',exact:true});await search.fill('COM');await expect(find).toContainText('8 ô khớp');await expect(search).toBeFocused();await search.press('Enter');await expect(page.locator('#ocr-meal-0-0')).toBeFocused();await expect(page.locator('#ocr-meal-0-0')).toBeVisible();await find.getByRole('button',{name:'Kết quả sau',exact:true}).click();await expect(page.locator('#ocr-meal-0-1')).toBeFocused();expect(await page.locator('#ocr-title,[id^=ocr-date-],[id^=ocr-meal-]').evaluateAll(nodes=>nodes.map(n=>(n as HTMLInputElement).value))).toEqual(original);await page.locator('#ocr-meal-0-1').fill('Bún mới');await expect(find).toContainText('7 ô khớp');await page.locator('#ocr-meal-0-1').press('Control+z');await expect(find).toContainText('8 ô khớp');await find.getByRole('button',{name:'Xóa tìm kiếm Tìm trong bản OCR',exact:true}).click();await expect(page.locator('.ocr-search-hit')).toHaveCount(0);await search.fill('20/10');await search.press('Enter');await expect(page.locator('#ocr-date-1')).toBeFocused();await search.fill('tuan');await search.press('Enter');await expect(page.locator('#ocr-title')).toBeFocused();expect(writes).toEqual([{action:'ocr'}]);
  });
});

test.describe('operating-feedback',()=>{
  test.setTimeout(15000);
  test('older same-week health response cannot replace a newer explicit check',async({page})=>{
    await interceptMealServices(page);let release:()=>void=()=>{},calls=0;const held=new Promise<void>(resolve=>release=resolve);await page.route('**/api/dashboard?**',async route=>{if(!new URL(route.request().url()).searchParams.has('health'))return route.fallback();const first=++calls===1;if(first)await held;await route.fulfill({json:{checkedAt:Date.now(),checks:[{id:'health',label:'Google',status:first?'warning':'ok',message:first?'Kết quả cũ':'Kết quả mới'}]}});});await page.goto('http://127.0.0.1:5175/dashboard');const nav=page.locator('.ui-sidebar');await nav.getByRole('button',{name:'Hệ thống',exact:true}).click();await expect.poll(()=>calls).toBe(1);await nav.getByRole('button',{name:'Tổng quan',exact:true}).click();await nav.getByRole('button',{name:'Hệ thống',exact:true}).click();await expect(page.getByRole('status',{name:'Tóm tắt hệ thống'})).toContainText('1 ổn · 0 cần chú ý');const oldResponse=page.waitForResponse(response=>response.url().includes('health=1'));release();await oldResponse;await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await expect(page.getByRole('status',{name:'Tóm tắt hệ thống'})).toContainText('1 ổn · 0 cần chú ý');await expect(nav.getByLabel('Cảnh báo Hệ thống',{exact:true})).toHaveCount(0);
  });
  test('responsive batch covers loaded warnings, System details, budgets, crosshair and image pan',async({page})=>{
    test.setTimeout(90000);const errors:string[]=[],writes:object[]=[];page.on('pageerror',error=>errors.push(error.message));await interceptMealServices(page,'owner','#357185',writes);await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('health')?route.fulfill({json:{checkedAt:Date.now(),checks:[{id:'ok',label:'Google',status:'ok',message:'Kết nối minh họa'},{id:'ocr',label:'OCR',status:'warning',message:'Chưa đọc ảnh thử; không tự chạy OCR.'}]}}):route.fallback());
    for(const width of [360,900,1440])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:800});await page.addInitScript(({theme})=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));localStorage.setItem('meal-text-size','large');},{theme});
      const capture=async(label:string)=>{await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`review/operating-feedback/${label}-${width}-${theme}.png`});};
      await page.goto('http://127.0.0.1:5175/newest');if(width<700)await page.getByRole('tab',{name:'Chi tiết',exact:true}).click();await page.locator('.detail-wrap').scrollIntoViewIfNeeded();if(width>700){const cell=page.locator('.detail-wrap tbody tr').first().locator('td').nth(3),before=await cell.evaluate(n=>getComputedStyle(n).backgroundColor);await cell.hover();await expect(cell).toHaveAttribute('data-reading-column','true');expect(await cell.evaluate(n=>getComputedStyle(n).backgroundColor)).not.toBe(before);}await capture('table');
      await page.goto('http://127.0.0.1:5175/dashboard?tab=health');await expect(page.getByRole('status',{name:'Tóm tắt hệ thống'})).toContainText('1 cần chú ý');await page.locator('.system-report').scrollIntoViewIfNeeded();await capture('system');await page.locator('summary').filter({hasText:'Chi tiết kiểm tra'}).click();await expect(page.getByText('Chưa đọc ảnh thử; không tự chạy OCR.',{exact:true})).toBeVisible();
      async function navigate(label:string){if(width>700)await page.locator('.ui-sidebar').getByRole('button',{name:label,exact:true}).click();else{await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Thêm',exact:true}).click();await expect(page.getByRole('dialog',{name:'Thêm chức năng'}).getByLabel('Cảnh báo Hệ thống',{exact:true})).toBeVisible();await page.getByRole('dialog',{name:'Thêm chức năng'}).getByRole('button',{name:label,exact:true}).click();}}
      await navigate('Thương hiệu');await page.getByLabel('Tên trường',{exact:true}).fill('Trường minh họa '+'.'.repeat(81));await expect(page.getByLabel('Ký tự còn lại của Tên trường',{exact:true})).toHaveAttribute('data-warning','true');await page.locator('.branding-field-row').first().scrollIntoViewIfNeeded();await capture('counter');
      page.once('dialog',dialog=>dialog.accept());await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await page.locator('button.image-upload-target:not(:disabled)').waitFor();const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1200;c.height=2400;const ctx=c.getContext('2d')!;ctx.fillStyle='#357185';ctx.fillRect(0,0,1200,1200);ctx.fillStyle='#c99342';ctx.fillRect(0,1200,1200,1200);return c.toDataURL('image/png').split(',')[1];});await page.locator('input[type=file]').first().setInputFiles([1,2].map(i=>({name:i+'.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')})));await expect(page.getByRole('status',{name:'Dung lượng bộ ảnh'})).toContainText('2/5 ảnh');await page.locator('.image-budget').scrollIntoViewIfNeeded();await capture('image-budget');
      for(let i=0;i<4;i++)await page.getByRole('button',{name:'Phóng to ảnh',exact:true}).first().click();await page.getByRole('button',{name:'Mở ảnh lớn',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Ảnh gốc thực đơn'}),viewport=dialog.locator('.menu-image-viewport'),box=(await viewport.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+Math.min(100,box.height/2));await page.mouse.down();await page.mouse.move(box.x+box.width/2-40,box.y+20);await expect(viewport).toHaveAttribute('data-panning','true');await expect.poll(()=>viewport.evaluate(n=>n.scrollTop)).toBeGreaterThan(0);await page.keyboard.press('Escape');await page.mouse.up();await expect(viewport).toHaveAttribute('data-panning','false');await expect(dialog.getByRole('button',{name:'Di chuyển vùng xem ảnh'})).toBeVisible();await capture('image-pan');await expect(dialog.getByRole('button',{name:'Đóng ảnh',exact:true})).toBeInViewport();await page.keyboard.press('Escape');await expect(dialog).toBeHidden();
    }expect(errors).toEqual([]);expect(writes).toEqual([]);
  });
  test('late reconciliation results cannot attach a warning to another week',async({page})=>{
    await interceptMealServices(page);let release:()=>void=()=>{},started=false;const held=new Promise<void>(resolve=>release=resolve);await page.route('**/api/dashboard?**',async route=>{if(!new URL(route.request().url()).searchParams.has('reconcile'))return route.fallback();started=true;await held;await route.fulfill({json:{formCount:1,sheetCount:0,matchedCount:0,issues:[{kind:'form-only',name:'A',timestamp:1791467000000,meals:['A']}]}});});await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Đối soát',exact:true}).click();await page.getByRole('button',{name:'Đối soát tuần này',exact:true}).click();await expect.poll(()=>started).toBe(true);await page.getByRole('combobox',{name:'Tìm tuần',exact:true}).click();await page.getByRole('option',{name:weeks[1].name,exact:true}).click();release();await expect(page.getByRole('combobox',{name:'Tìm tuần',exact:true})).toHaveValue(weeks[1].name);await expect(page.getByLabel('Cảnh báo Đối soát',{exact:true})).toHaveCount(0);await expect(page.locator('.reconciliation-issues')).toHaveCount(0);
  });
  test('loaded health warning survives navigation but a confirmed mutation invalidates it',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('health')?route.fulfill({json:{checkedAt:Date.now(),checks:[{id:'warning',label:'OCR',status:'warning',message:'Chưa thử đọc ảnh'}]}}):route.fallback());await page.goto('http://127.0.0.1:5175/dashboard?tab=health');const nav=page.locator('.ui-sidebar'),badge=nav.getByLabel('Cảnh báo Hệ thống',{exact:true});await expect(badge).toContainText('1');await nav.getByRole('button',{name:'Thương hiệu',exact:true}).click();await expect(badge).toBeVisible();await page.getByLabel('Tên trường',{exact:true}).fill('Tên mới minh họa');await page.getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();await page.getByRole('dialog',{name:'Xác nhận thao tác'}).getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();await expect(badge).toHaveCount(0);expect(writes).toHaveLength(1);
  });
  test('image budget follows accepted, removed and rejected files without OCR',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await expect(page.getByRole('status',{name:'Dung lượng bộ ảnh'})).toContainText('0/5 ảnh');const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=10;c.height=10;return c.toDataURL('image/png').split(',')[1];});await page.locator('input[type=file]').first().setInputFiles([1,2,3].map(i=>({name:i+'.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')})));await expect(page.getByRole('status',{name:'Dung lượng bộ ảnh'})).toContainText('3/5 ảnh');await page.getByRole('button',{name:'Bỏ ảnh 2',exact:true}).click();await expect(page.getByRole('status',{name:'Dung lượng bộ ảnh'})).toContainText('2/5 ảnh');await page.locator('input[type=file]').first().setInputFiles({name:'broken.png',mimeType:'image/png',buffer:Buffer.from('broken')});await expect(page.locator('.dashboard-message')).toContainText('Ảnh bị lỗi');await expect(page.getByRole('status',{name:'Dung lượng bộ ảnh'})).toContainText('2/5 ảnh');expect(writes).toEqual([]);
  });
  test('mouse panning moves the zoomed viewport and releases on Escape, fit and fullscreen close',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1200;c.height=2400;return c.toDataURL('image/png').split(',')[1];});await page.locator('button.image-upload-target:not(:disabled)').waitFor();await page.locator('input[type=file]').first().setInputFiles({name:'pan.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});for(let i=0;i<4;i++)await page.getByRole('button',{name:'Phóng to ảnh',exact:true}).first().click();const viewport=page.locator('.menu-image-viewport').first(),source=await viewport.locator('img').getAttribute('src');await viewport.scrollIntoViewIfNeeded();await viewport.evaluate(n=>n.scrollTo(100,200));const box=(await viewport.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+80);await page.mouse.down();await page.mouse.move(box.x+box.width/2-60,box.y+30);await expect.poll(()=>viewport.evaluate(n=>n.scrollTop)).toBeGreaterThan(240);await expect(viewport).toHaveAttribute('data-panning','true');await page.keyboard.press('Escape');await expect(viewport).toHaveAttribute('data-panning','false');await page.mouse.up();await page.getByRole('button',{name:'Vừa khung',exact:true}).first().click();await expect.poll(()=>viewport.evaluate(n=>n.scrollTop)).toBe(0);expect(await viewport.locator('img').getAttribute('src')).toBe(source);expect(writes).toEqual([]);
  });
  test('PC reading guide highlights only an actual day and never changes filters or mobile cards',async({page})=>{
    await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/newest');const table=page.locator('.detail-wrap table'),cell=table.locator('tbody tr').first().locator('td').nth(3);await cell.hover();await expect(cell).toHaveAttribute('data-reading-column','true');await expect(table.locator('tbody tr').first()).toHaveAttribute('data-reading-row','true');await expect(table.locator('tbody tr').nth(1).locator('td').nth(3)).toHaveAttribute('data-reading-column','true');await table.locator('tbody tr').first().locator('td').nth(1).hover();await expect(table.locator('[data-reading-column=true]')).toHaveCount(0);await page.setViewportSize({width:390,height:844});await page.getByRole('tab',{name:'Chi tiết',exact:true}).click();await cell.hover();await expect(table.locator('[data-reading-column=true]')).toHaveCount(0);await expect(page.getByRole('status',{name:'Kết quả lọc'})).toContainText('10 lựa chọn món');
  });
  test('field counters warn at the original limits and cancelling reasons never writes',async({page})=>{
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard');const nav=page.locator('.ui-sidebar');await nav.getByRole('button',{name:'Thương hiệu',exact:true}).click();await page.getByLabel('Tên trường',{exact:true}).fill('a'.repeat(96));await expect(page.getByLabel('Ký tự còn lại của Tên trường',{exact:true})).toContainText('Còn 4');await expect(page.getByLabel('Ký tự còn lại của Tên trường',{exact:true})).toHaveAttribute('data-warning','true');await page.getByRole('button',{name:'Dùng lại tên trường đã lưu',exact:true}).click();await nav.getByRole('button',{name:'Thông báo tuần',exact:true}).click();await expect(page.getByRole('textbox',{name:'Nội dung thông báo',exact:true})).toBeEnabled();await page.getByRole('textbox',{name:'Nội dung thông báo',exact:true}).fill('b'.repeat(490));await expect(page.getByLabel('Ký tự còn lại của Nội dung thông báo',{exact:true})).toContainText('Còn 10');page.once('dialog',d=>d.accept());await nav.getByRole('button',{name:'Điều khiển Form',exact:true}).click();await page.locator('#dashboard-deadline').fill('2099-10-19T12:00');await page.getByRole('button',{name:'Mở Form',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Xác nhận thao tác'});await dialog.getByRole('textbox',{name:'Lý do (tùy chọn)',exact:true}).fill('c'.repeat(495));await expect(dialog.getByLabel('Ký tự còn lại của Lý do',{exact:true})).toContainText('Còn 5');await dialog.getByRole('button',{name:'Hủy',exact:true}).click();expect(writes).toEqual([]);
  });
  test('System summary expands technical/setup details without additional checks',async({page})=>{
    await interceptMealServices(page);let reads=0;await page.route('**/api/dashboard?**',route=>{if(!new URL(route.request().url()).searchParams.has('health'))return route.fallback();reads++;return route.fulfill({json:{checkedAt:Date.now(),checks:[{id:'one',label:'Kết nối',status:'ok',message:'Chi tiết kết nối minh họa'},{id:'two',label:'OCR',status:'warning',message:'Chưa thử đọc ảnh'},{id:'three',label:'Cấu hình',status:'error',message:'Cần kiểm tra cấu hình'}]}});});await page.goto('http://127.0.0.1:5175/dashboard?tab=health');const summary=page.getByRole('status',{name:'Tóm tắt hệ thống'});await expect(summary).toContainText('1 ổn');await expect(summary).toContainText('1 cần chú ý');await expect(summary).toContainText('1 lỗi');const before=reads;await expect(page.getByText('Chi tiết kết nối minh họa',{exact:true})).toBeHidden();await page.locator('summary').filter({hasText:'Chi tiết kiểm tra'}).click();await expect(page.getByText('Chi tiết kết nối minh họa',{exact:true})).toBeVisible();await page.locator('summary').filter({hasText:'Hướng dẫn cài đặt'}).click();await expect(page.locator('.setup-steps li')).toHaveCount(7);expect(reads).toBe(before);await expect(page.locator('.system-authorization')).toBeVisible();
  });
  test('loaded navigation warnings remain scoped to the chosen week and never fetch on their own',async({page})=>{
    await interceptMealServices(page);let reads=0;await page.route('**/api/dashboard?**',route=>{if(!new URL(route.request().url()).searchParams.has('reconcile'))return route.fallback();reads++;return route.fulfill({json:{formCount:2,sheetCount:0,matchedCount:0,issues:[{kind:'form-only',name:'A',timestamp:1791467000000,meals:['A']},{kind:'form-only',name:'B',timestamp:1791467000000,meals:['B']}]}});});await page.goto('http://127.0.0.1:5175/dashboard');const nav=page.locator('.ui-sidebar');await expect(page.getByLabel('Cảnh báo Đối soát',{exact:true})).toHaveCount(0);await nav.getByRole('button',{name:'Đối soát',exact:true}).click();expect(reads).toBe(0);await page.getByRole('button',{name:'Đối soát tuần này',exact:true}).click();const badge=nav.getByLabel('Cảnh báo Đối soát',{exact:true});await expect(badge).toContainText('2');await expect(badge).toHaveAttribute('title',/Đã tải/);await nav.getByRole('button',{name:'Tổng quan',exact:true}).click();await expect(badge).toBeVisible();await nav.getByRole('button',{name:'Đối soát',exact:true}).click();await page.getByRole('combobox',{name:'Tìm tuần',exact:true}).click();await page.getByRole('option',{name:weeks[1].name,exact:true}).click();await expect(page.getByLabel('Cảnh báo Đối soát',{exact:true})).toHaveCount(0);expect(reads).toBe(1);
  });
  test('submission time uses Vietnam days, expands exact values and rolls over at midnight',async({page})=>{
    await page.clock.install({time:new Date('2026-10-16T10:36:00+07:00')});await interceptMealServices(page);await page.route('**/api/viewer**',route=>route.fulfill({json:{headers:['Timestamp','Họ tên',days[0].day],rows:[['16/10/2026 10:35:22','A','Cơm'],['15/10/2026 23:59:01','B','Bún'],['không rõ','C','Phở']],days:[days[0]],formStatus:'closed'}}));await page.goto('http://127.0.0.1:5175/newest');await expect(page.locator('.detail-wrap')).toContainText('Hôm nay · 10:35');await expect(page.locator('.detail-wrap')).toContainText('Hôm qua · 23:59');const time=page.locator('.detail-wrap').getByRole('button',{name:'Hôm nay · 10:35',exact:true});await expect(time).toHaveAttribute('title','16/10/2026 10:35:22');await time.click();await expect(page.locator('.detail-wrap')).toContainText('16/10/2026 10:35:22');await page.locator('.detail-wrap').getByRole('button',{name:'16/10/2026 10:35:22',exact:true}).click();await page.clock.fastForward(48241000);await expect(page.locator('.detail-wrap')).toContainText('Hôm qua · 10:35');await expect(page.locator('.detail-wrap')).toContainText('15/10/2026 23:59:01');await expect(page.locator('.detail-wrap')).toContainText('không rõ');
  });
});

test('reading-polish: comparison follows a successful explicit save and logo reset preserves other edits',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);
  await page.route('**/api/dashboard',route=>{const body=route.request().postDataJSON();if(body?.action!=='set-branding')return route.fallback();writes.push(body);return route.fulfill({json:{...body.branding,updatedAt:2}});});
  await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Thương hiệu',exact:true}).click();
  await page.getByLabel('Tên trường',{exact:true}).fill('Đã lưu lần hai');await page.getByRole('region',{name:'Thay đổi thương hiệu chưa lưu',exact:true}).getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();
  await expect(page.getByRole('region',{name:'Thương hiệu đã lưu',exact:true})).toContainText('Đã lưu lần hai');await page.getByLabel('Tên trường',{exact:true}).fill('Chưa lưu lần ba');await page.getByLabel('URL ảnh logo HTTPS',{exact:true}).fill('http://invalid.test/logo.png');await page.getByRole('button',{name:'Dùng lại logo đã lưu',exact:true}).click();await expect(page.getByLabel('URL ảnh logo HTTPS',{exact:true})).toHaveValue('');await expect(page.getByLabel('Tên trường',{exact:true})).toHaveValue('Chưa lưu lần ba');await page.getByRole('button',{name:'Dùng lại tên trường đã lưu',exact:true}).click();await expect(page.getByLabel('Tên trường',{exact:true})).toHaveValue('Đã lưu lần hai');expect(writes).toHaveLength(1);
});

test('reading-polish: responsive visual batch covers comparison, holidays, empty cells and modal minimap',async({page})=>{
  test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);
  await page.route('**/api/viewer**',route=>route.fulfill({json:{headers:['Timestamp','Họ tên',days[0].day,days[1].day],rows:[['08/10/2026','Minh họa','',null]],days:[days[0],days[1]],closedDays:[days[2].day],calendarDays:days.map(day=>day.day),formStatus:'closed'}}));
  for(const width of [360,900,1440])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:800});await page.addInitScript(({theme})=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));localStorage.setItem('meal-text-size','large');},{theme});
    const capture=async(label:string)=>{await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`review/reading-polish/${label}-${width}-${theme}.png`,fullPage:false});};
    await page.goto('http://127.0.0.1:5175/newest');if(width<700)await page.getByRole('button',{name:'Bộ lọc',exact:true}).click();await page.getByRole('combobox',{name:'Ngày',exact:true}).click();await expect(page.getByRole('option',{name:days[2].day+' · Nghỉ',exact:true})).toBeDisabled();await capture('holiday');await page.keyboard.press('Escape');if(width<700)await page.getByRole('button',{name:'Đóng bộ lọc',exact:true}).click();if(width<700)await page.getByRole('tab',{name:'Chi tiết',exact:true}).click();await page.locator('.detail-wrap').scrollIntoViewIfNeeded();await expect(page.locator('.detail-wrap')).toContainText('Chưa đọc được');await capture('empty');
    await page.goto('http://127.0.0.1:5175/dashboard');if(width>700)await page.locator('.ui-sidebar').getByRole('button',{name:'Thương hiệu',exact:true}).click();else{await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Thêm',exact:true}).click();await page.getByRole('dialog',{name:'Thêm chức năng'}).getByRole('button',{name:'Thương hiệu',exact:true}).click();}
    await page.getByLabel('Tên trường',{exact:true}).fill('Trường đang sửa · đối chiếu với bản đã lưu');await page.getByLabel('Màu chủ đạo',{exact:true}).fill('#8c3c83');await page.getByRole('combobox',{name:'Thiết bị minh họa',exact:true}).selectOption(width>700?'pc':'phone');await page.getByRole('combobox',{name:'Giao diện minh họa',exact:true}).selectOption(theme);await page.locator('.branding-comparison').scrollIntoViewIfNeeded();await capture('brand-draft');if(width<700){await page.getByRole('button',{name:'Xem bản đã lưu',exact:true}).click();await capture('brand-saved');}else{const saved=(await page.getByRole('region',{name:'Thương hiệu đã lưu',exact:true}).boundingBox())!,draft=(await page.getByRole('region',{name:'Thương hiệu đang sửa',exact:true}).boundingBox())!;expect(saved.x+saved.width).toBeLessThanOrEqual(draft.x);}
    page.once('dialog',d=>d.accept());await page.goto('http://127.0.0.1:5175/dashboard?tab=create');const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1200;c.height=2400;const ctx=c.getContext('2d')!;ctx.fillStyle='#357185';ctx.fillRect(0,0,1200,1200);ctx.fillStyle='#c99342';ctx.fillRect(0,1200,1200,1200);return c.toDataURL('image/png').split(',')[1];});await page.locator('input[type=file]').first().setInputFiles({name:'map.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await page.getByRole('button',{name:'Phóng to ảnh',exact:true}).first().click();await page.getByRole('button',{name:'Mở ảnh lớn',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Ảnh gốc thực đơn',exact:true}),map=dialog.getByRole('button',{name:'Di chuyển vùng xem ảnh',exact:true});await expect(map).toBeVisible();await map.focus();await page.keyboard.press('End');await expect.poll(()=>dialog.locator('.menu-image-viewport').evaluate(n=>n.scrollTop)).toBeGreaterThan(0);await capture('minimap');await expect(dialog.getByRole('button',{name:'Đóng ảnh',exact:true})).toBeInViewport();await page.keyboard.press('Escape');
  }
  expect(errors).toEqual([]);expect(writes).toEqual([]);
});

test('reading-polish: empty meal states remain distinct and selected-day filtering retains empty submissions',async({page})=>{
  await interceptMealServices(page);const wed=days[2].day;await page.route('**/api/viewer**',route=>route.fulfill({json:{headers:['Timestamp','Họ tên',days[0].day,days[1].day,days[3].day,days[4].day,wed],rows:[['08/10/2026','Minh họa','',null,'Cá',null,'']],days:[days[0],days[1],days[3],days[4]],calendarDays:days.map(x=>x.day),closedDays:[wed],formStatus:'closed'}}));await page.goto('http://127.0.0.1:5175/newest');await expect(page.locator('.detail-wrap')).toContainText('Chưa chọn');await expect(page.locator('.detail-wrap')).toContainText('Chưa đọc được');await expect(page.locator('.detail-wrap')).toContainText('Không phục vụ');await page.getByRole('combobox',{name:'Ngày',exact:true}).click();await page.getByRole('option',{name:days[0].day,exact:true}).click();await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(1);await expect(page.locator('.detail-wrap')).toContainText('Chưa chọn');await expect(page.getByRole('status',{name:'Kết quả lọc'})).toContainText('0 lựa chọn món');
});

test('reading-polish: a holiday stays visible but disabled in PC and mobile day dropdowns',async({page})=>{
  await interceptMealServices(page);await page.route('**/api/viewer**',route=>route.fulfill({json:{headers:['Timestamp','Họ tên',days[0].day,days[3].day],rows:[['08/10/2026','Minh họa','A','B']],days:[days[0],days[3]],calendarDays:days.map(x=>x.day),closedDays:[days[2].day],formStatus:'closed'}}));
  for(const width of [1280,390]){await page.setViewportSize({width,height:844});await page.goto('http://127.0.0.1:5175/newest');await page.getByRole('button',{name:'Xóa bộ lọc',exact:true}).click();if(width<700)await page.getByRole('button',{name:'Bộ lọc',exact:true}).click();await page.getByRole('combobox',{name:'Ngày',exact:true}).click();const holiday=page.getByRole('option',{name:days[2].day+' · Nghỉ',exact:true});await expect(holiday).toBeVisible();await expect(holiday).toBeDisabled();await holiday.dispatchEvent('click');await expect(page.getByRole('combobox',{name:'Ngày',exact:true})).toHaveValue('');await page.getByRole('option',{name:days[3].day,exact:true}).click();await expect(page.getByRole('combobox',{name:'Ngày',exact:true})).toHaveValue(days[3].day);}
});

test('reading-polish: branding saved/draft comparison and independent field restore never save',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Thương hiệu',exact:true}).click();await page.getByLabel('Tên trường',{exact:true}).fill('Tên đang sửa');await page.getByLabel('Màu chủ đạo',{exact:true}).fill('#8c3c83');const saved=page.getByRole('region',{name:'Thương hiệu đã lưu',exact:true}),draft=page.getByRole('region',{name:'Thương hiệu đang sửa',exact:true});await expect(saved).toContainText('Trường minh họa');await expect(draft).toContainText('Tên đang sửa');await page.getByRole('button',{name:'Dùng lại tên trường đã lưu',exact:true}).click();await expect(page.getByLabel('Tên trường',{exact:true})).toHaveValue('Trường minh họa');await expect(page.getByLabel('Màu chủ đạo',{exact:true})).toHaveValue('#8c3c83');await expect(page.getByRole('status',{name:'Chưa lưu thương hiệu'})).toBeVisible();await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Xem bản đã lưu',exact:true}).click();await expect(saved).toBeVisible();await expect(draft).toBeHidden();await page.getByRole('button',{name:'Xem bản đang sửa',exact:true}).click();await expect(draft).toBeVisible();await expect(saved).toBeHidden();await page.getByRole('button',{name:'Dùng lại màu đã lưu',exact:true}).click();await expect(page.getByRole('status',{name:'Chưa lưu thương hiệu'})).toHaveCount(0);expect(writes).toEqual([]);
});

test('reading-polish: minimap navigates the real viewport by pointer and keyboard without changing source or OCR',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await page.locator('button.image-upload-target:not(:disabled)').waitFor();const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1200;c.height=2400;return c.toDataURL('image/png').split(',')[1];});await page.locator('input[type=file]').first().setInputFiles({name:'long.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});const viewport=page.locator('.menu-image-viewport').first(),source=await viewport.locator('img').getAttribute('src');await page.getByRole('button',{name:'Phóng to ảnh',exact:true}).first().click();const map=page.getByRole('button',{name:'Di chuyển vùng xem ảnh',exact:true}).first();await expect(map).toBeVisible();await map.scrollIntoViewIfNeeded();const box=(await map.locator('.minimap-paper').boundingBox())!;await page.mouse.click(box.x+box.width-2,box.y+box.height-2);await expect.poll(()=>viewport.evaluate(n=>n.scrollTop)).toBeGreaterThan(0);await map.focus();await page.keyboard.press('Home');await expect.poll(()=>viewport.evaluate(n=>n.scrollTop)).toBe(0);await page.keyboard.press('End');expect(await viewport.evaluate(n=>Math.abs(n.scrollTop+n.clientHeight-n.scrollHeight))).toBeLessThanOrEqual(1);await page.getByRole('button',{name:'Vừa khung',exact:true}).first().click();await expect(map).toBeHidden();expect(await viewport.locator('img').getAttribute('src')).toBe(source);expect(writes).toEqual([]);
});

test('reading-polish: archive login names its destination and the existing sign-in callback keeps its complete URL',async({page})=>{
  await interceptMealServices(page);let authenticated=false;const posts:object[]=[];await page.addInitScript(()=>{window.google={accounts:{id:{initialize(options:any){window.__testGsi=options.callback;},renderButton(root:HTMLElement){const button=document.createElement('button');button.textContent='Đăng nhập thử';button.onclick=()=>window.__testGsi({credential:'synthetic'});root.append(button);},disableAutoSelect(){}}}};});await page.route('**/api/session',route=>{if(route.request().method()==='POST'){posts.push(route.request().postDataJSON());authenticated=true;return route.fulfill({json:{ok:true}});}return route.fulfill({status:200,json:{authenticated}});});const path='/history?week='+key+'&month=2026-10&layout=calendar&status=closed';await page.goto('http://127.0.0.1:5175'+path);await expect(page.getByRole('region',{name:'Trang sẽ mở sau đăng nhập'})).toContainText('Tuần 12/10/2026 – 16/10/2026');await page.getByRole('button',{name:'Đăng nhập thử',exact:true}).click();await expect(page.locator('.detail-wrap')).toBeVisible();expect(new URL(page.url()).pathname+new URL(page.url()).search).toBe(path);expect(posts).toEqual([{credential:'synthetic'}]);
});

test('reading-context: expanded viewer keeps applied week/filter visible while scrolling and restores filters',async({page})=>{
  await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/newest');await page.getByRole('combobox',{name:'Họ tên',exact:true}).fill('truong');await page.getByRole('heading',{name:'Thực đơn tuần này',exact:true}).click();await page.getByRole('button',{name:'Phóng rộng bảng chi tiết',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Bảng chi tiết',exact:true}),context=dialog.getByRole('group',{name:'Ngữ cảnh bảng',exact:true});await expect(context).toContainText('12/10/2026');await expect(context).toContainText('16/10/2026');await expect(context).toContainText('Họ tên: truong');await expect(context).toContainText('Mới nhất');await dialog.locator('.workspace-body').evaluate(node=>node.scrollTop=10000);await expect(context).toBeInViewport();await page.keyboard.press('Escape');await expect(page.getByRole('combobox',{name:'Họ tên',exact:true})).toHaveValue('truong');await expect(page.getByRole('button',{name:'Phóng rộng bảng chi tiết',exact:true})).toBeFocused();
});

test('reading-context: both expanded dashboard tables show their own week and active filters',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();await page.getByRole('textbox',{name:'Tìm theo họ tên',exact:true}).fill('truong');await page.getByRole('button',{name:'Phóng rộng bảng lượt gửi',exact:true}).click();const responses=page.getByRole('dialog',{name:'Bảng lượt gửi',exact:true});await expect(responses.getByRole('group',{name:'Ngữ cảnh bảng'})).toContainText(weeks[0].name);await expect(responses.getByRole('group',{name:'Ngữ cảnh bảng'})).toContainText('Họ tên: truong');await page.keyboard.press('Escape');await page.getByRole('textbox',{name:'Người quản trị',exact:true}).fill('owner@example.com');await page.getByRole('button',{name:'Phóng rộng bảng lịch sử',exact:true}).click();const audit=page.getByRole('dialog',{name:'Bảng lịch sử thao tác',exact:true});await expect(audit.getByRole('group',{name:'Ngữ cảnh bảng'})).toContainText(weeks[0].name);await expect(audit.getByRole('group',{name:'Ngữ cảnh bảng'})).toContainText('Người quản trị: owner@example.com');await expect(audit.getByRole('group',{name:'Ngữ cảnh bảng'})).not.toContainText('Họ tên: truong');expect(writes).toEqual([]);
});

test('reading-context: actual deadlines stay separate for current/next and tick using server time, never auto-close',async({page})=>{
  await page.clock.install({time:new Date('2030-01-01T00:00:00Z')});await interceptMealServices(page);await page.route('**/api/viewer**',route=>route.fulfill({json:{headers:['Thời điểm','Họ tên',days[0].day],rows:[['08/10/2026','Minh họa','CƠM GÀ']],days,formStatus:'closed',formUrl:weeks[0].formUrl,lockAt:'2026-10-12T00:00:00+07:00',serverNow:Date.parse('2026-10-15T03:00:00Z'),nextForm:{formStatus:'open',formUrl:weeks[0].formUrl,days,lockAt:'2026-10-15T10:02:00+07:00',serverNow:Date.parse('2026-10-15T03:00:00Z')}}}));await page.goto('http://127.0.0.1:5175/newest');const current=page.getByRole('group',{name:'Form tuần đang xem',exact:true}),next=page.getByRole('group',{name:'Form đăng ký tuần sau',exact:true});await expect(current.locator('.registration-deadline')).toContainText('12/10/2026');await expect(current.locator('.registration-deadline')).not.toContainText('Còn');await expect(next.locator('.registration-deadline')).toContainText('10:02');await expect(next.locator('.registration-deadline')).toContainText('Còn khoảng 2 phút');await page.clock.fastForward(120000);await expect(next.locator('.registration-deadline')).toContainText('Đã đến hạn');await expect(next.getByRole('status',{name:'Form đang mở',exact:true})).toBeVisible();
});

test('reading-context: missing deadline is explicit instead of inferred from serving dates',async({page})=>{
  await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/newest');await expect(page.getByRole('group',{name:'Form tuần đang xem'}).locator('.registration-deadline')).toHaveText('Chưa có thông tin hạn đăng ký.');
});

test('reading-context: device-clock fallback is labelled and Dashboard deadline remains readonly',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.route('**/api/viewer**',route=>route.fulfill({json:{headers:['Thời điểm','Họ tên',days[0].day],rows:[['08/10/2026','Minh họa','CƠM GÀ']],days,formStatus:'open',formUrl:weeks[0].formUrl,lockAt:new Date(Date.now()+7200000).toISOString()}}));await page.goto('http://127.0.0.1:5175/newest');await expect(page.locator('.registration-deadline')).toContainText('Theo giờ thiết bị.');await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Điều khiển Form',exact:true}).click();await expect(page.locator('.registration-deadline')).toContainText('12/10/2026');await expect(page.locator('.registration-deadline')).not.toContainText('Còn');expect(writes).toEqual([]);
});

test('reading-context: responsive visual batch keeps context, deadline and pinned controls readable',async({page})=>{
  test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  for(const width of [360,900,1440])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:800});await page.addInitScript(({theme})=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));localStorage.setItem('meal-text-size','large');},{theme});await interceptMealServices(page);
    await page.route('**/api/viewer**',route=>route.fulfill({json:{headers:['Thời điểm','Họ tên',...days.map(day=>day.day)],rows:Array.from({length:30},(_,i)=>['08/10/2026','Minh họa '+i,...days.map(()=> 'CƠM GÀ')]),days,formStatus:'closed',formUrl:weeks[0].formUrl,lockAt:'2026-10-12T00:00:00+07:00',serverNow:Date.now(),nextForm:{formStatus:'open',formUrl:weeks[0].formUrl,days,lockAt:new Date(Date.now()+3600000).toISOString(),serverNow:Date.now()}}}));
    const capture=async(label:string)=>{await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`review/reading-context/${label}-${width}-${theme}.png`,fullPage:false});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);};
    await page.goto('http://127.0.0.1:5175/newest');await expect(page.locator('.registration-deadline').nth(1)).toContainText('Còn');await page.locator('.registration-contexts').scrollIntoViewIfNeeded();await capture('deadline');
    if(width>700){await page.getByRole('combobox',{name:'Họ tên',exact:true}).fill('minh');await page.getByRole('heading',{name:'Thực đơn tuần này',exact:true}).click();await page.getByRole('button',{name:'Phóng rộng bảng chi tiết',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Bảng chi tiết',exact:true});await dialog.locator('.workspace-body').evaluate(node=>node.scrollTop=node.scrollHeight);await expect(dialog.getByRole('group',{name:'Ngữ cảnh bảng'})).toBeInViewport();await capture('expanded');await page.keyboard.press('Escape');}
    await page.goto('http://127.0.0.1:5175/dashboard');if(width>700)await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();else await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Lượt gửi',exact:true}).click();await page.locator('[data-response-id=sample-a]').getByRole('button',{name:'Xem nhanh',exact:true}).click();await page.locator('.response-quick-body').evaluate(node=>node.scrollTop=node.scrollHeight);await expect(page.getByRole('dialog',{name:'Chi tiết lượt gửi'}).getByRole('button',{name:'Đóng',exact:true})).toBeInViewport();await capture('quick-view');await page.keyboard.press('Escape');
  }expect(errors).toEqual([]);
});

test('reading-context: deadline has its own readable line below registration controls on tablet PC',async({page})=>{
  await page.setViewportSize({width:900,height:800});await interceptMealServices(page);await page.route('**/api/viewer**',route=>route.fulfill({json:{headers:['Thời điểm','Họ tên',days[0].day],rows:[],days,formStatus:'open',formUrl:weeks[0].formUrl,lockAt:'2026-10-16T12:00:00+07:00',serverNow:Date.parse('2026-10-15T03:00:00Z')}}));await page.goto('http://127.0.0.1:5175/newest');const group=page.getByRole('group',{name:'Form tuần đang xem'});const controls=(await group.locator('.form-context-actions').boundingBox())!,deadline=(await group.locator('.registration-deadline').boundingBox())!;expect(deadline.y).toBeGreaterThanOrEqual(controls.y+controls.height);
});

test('reading-context: quick-view close/navigation remain reachable after long content scroll on PC/mobile',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('week')?route.fulfill({json:{week:{...weeks[0],dayLabels:days.map(day=>day.day)},responses:[{responseId:'long-a',timestamp:1791467000000,name:'A',meals:days.map(()=>('Món dài '.repeat(100)))},{responseId:'long-b',timestamp:1791466990000,name:'B',meals:['Món kế tiếp']}],history:[]}}):route.fallback());
  for(const width of [1280,360]){
    await page.setViewportSize({width,height:700});await page.goto('http://127.0.0.1:5175/dashboard');if(width>700)await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();else await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Lượt gửi',exact:true}).click();const opener=page.locator('[data-response-id=long-a]').getByRole('button',{name:'Xem nhanh',exact:true});await opener.click();const dialog=page.getByRole('dialog',{name:'Chi tiết lượt gửi',exact:true}),body=dialog.locator('.response-quick-body');await body.evaluate(node=>node.scrollTop=node.scrollHeight);await expect.poll(()=>body.evaluate(node=>node.scrollTop)).toBeGreaterThan(0);await expect(dialog.getByRole('button',{name:'Đóng',exact:true})).toBeInViewport();await expect(dialog.getByRole('button',{name:'Lượt sau',exact:true})).toBeInViewport();await dialog.getByRole('button',{name:'Lượt sau',exact:true}).click();await expect(dialog.getByRole('heading',{name:'B',exact:true})).toBeVisible();await expect.poll(()=>body.evaluate(node=>node.scrollTop)).toBe(0);await page.keyboard.press('Escape');await expect(opener).toBeFocused();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }expect(writes).toEqual([]);
});

const key = '2026-10-12_2026-10-13_2026-10-14_2026-10-15_2026-10-16';
const days = ['12','13','14','15','16'].map((day, i) => ({ day: `Thứ ${i+2} (${day}/10/2026)`, meals: ['CƠM GÀ', 'BÚN BÒ'] }));
const weeks = [key, '2026-10-05_2026-10-06_2026-10-07_2026-10-08_2026-10-09'].map((weekKey, i) => ({weekKey,name:i?'Tuần 05/10/2026 - 09/10/2026':'Tuần 12/10/2026 - 16/10/2026',responseCount:2,formStatus:'closed',formUrl:'https://docs.google.com/forms/d/e/synthetic/viewform',spreadsheetUrl:'https://docs.google.com/spreadsheets/d/synthetic/edit',lockAt:'2026-10-12T00:00:00+07:00'}));

export async function interceptMealServices(page: import('@playwright/test').Page, role = 'owner', primaryColor = '#357185', writes: object[] = []) {
  await page.route('https://accounts.google.com/**', route => route.abort());
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    let data: object = {};
    if(url.pathname === '/api/branding') data = {schoolName:'Trường minh họa',logoUrl:'',primaryColor};
    if(url.pathname === '/api/session') data = {authenticated:true};
    if(url.pathname === '/api/viewer'||url.pathname==='/api/history'&&url.searchParams.has('week')) data = {headers:['Thời điểm','Họ tên',...days.map(day=>day.day)],rows:[['08/10/2026 20:59:00','Trường An',...days.map(()=> 'CƠM GÀ')],['08/10/2026 20:58:00','Minh Anh',...days.map(()=> 'BÚN BÒ')]],days,calendarDays:days.map(day=>day.day),formStatus:'closed',formUrl:weeks[0].formUrl};
    if(url.pathname === '/api/history'&&!url.searchParams.has('week')) data = {weeks:[{...weeks[1],startDate:'2026-10-05',endDate:'2026-10-09'}]};
    if(url.pathname === '/api/dashboard') {
      if(route.request().method() !== 'GET') { const body=route.request().postDataJSON();writes.push({method:route.request().method(),...body}); data=body.action==='set-branding'?{...body.branding,updatedAt:8}:body.action==='set-week-notice'?{ok:true,notice:{text:body.text,endsOn:body.endsOn,updatedAt:8}}:{ok:true}; }
      else if(url.searchParams.has('notice')) data={notice:{text:'',endsOn:'',updatedAt:0}};
      else if(url.searchParams.has('health')) data={checkedAt:Date.now(),checks:[{id:'google',label:'Kết nối Google',status:'ok',message:'Kết quả minh họa'}]};
      else if(url.searchParams.has('reconcile')) data={formCount:2,sheetCount:2,matchedCount:2,issues:[]};
      else if(url.searchParams.has('week')) data={week:{...weeks[0],weekKey:url.searchParams.get('week'),dayLabels:days.map(day=>day.day)},responseCount:2,responseIds:['sample-a','sample-b'],responses:[{responseId:'sample-a',name:'Trường An',timestamp:1791467940000,meals:days.map(()=> 'CƠM GÀ'),deletable:true,deleteToken:'synthetic-token',rowNumber:2},{responseId:'sample-b',name:'Minh Anh',timestamp:1791467880000,meals:days.map(()=> 'BÚN BÒ'),deletable:false,rowNumber:3}],history:[]};
      else data={accountId:'synthetic-owner',email:'admin@example.com',role,permissions:{view:true,create:role==='owner',manageResponses:role==='owner'},weeks,allowedEmails:[],members:[]};
    }
    await route.fulfill({status:200,json:data});
  });
}

test('reading-tools: saved PC layout survives reload and full reset keeps every mobile field',async({page})=>{
  await interceptMealServices(page);await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:5175/newest');const workspace=page.getByRole('region',{name:'Bảng chi tiết',exact:true});await workspace.getByRole('button',{name:'Cột hiển thị',exact:true}).click();await page.getByRole('dialog',{name:'Cột hiển thị · Bảng chi tiết',exact:true}).getByRole('checkbox',{name:'Thứ 4 (14/10/2026)',exact:true}).uncheck();await page.keyboard.press('Escape');const handle=workspace.getByRole('separator',{name:'Độ rộng cột Họ tên',exact:true});await handle.focus();await page.keyboard.press('End');const width=await handle.getAttribute('aria-valuenow');await page.reload();await expect(workspace.locator('th').nth(4)).toBeHidden();await expect(handle).toHaveAttribute('aria-valuenow',width!);await page.setViewportSize({width:390,height:844});await expect(page.locator('.detail-wrap tbody tr').first().locator('td').nth(4)).toBeVisible();await page.setViewportSize({width:1440,height:900});await workspace.getByRole('button',{name:'Cột hiển thị',exact:true}).click();await page.getByRole('dialog',{name:'Cột hiển thị · Bảng chi tiết',exact:true}).getByRole('button',{name:'Khôi phục bố cục',exact:true}).click();await page.keyboard.press('Escape');await page.reload();await expect(workspace.locator('th').nth(4)).toBeVisible();await expect(workspace.getByRole('button',{name:'Cỡ cột mặc định',exact:true})).toBeDisabled();
});

test('reading-tools: quick view navigates loaded records by identity with readonly boundaries',async({page})=>{
const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();await page.locator('[data-response-id=sample-a]').getByRole('button',{name:'Xem nhanh',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Chi tiết lượt gửi',exact:true});await expect(dialog).toContainText('Trường An');await expect(dialog.getByRole('button',{name:'Lượt trước',exact:true})).toBeDisabled();await dialog.getByRole('button',{name:'Lượt sau',exact:true}).click();await expect(dialog).toContainText('Minh Anh');await expect(dialog.getByRole('status',{name:'Vị trí lượt gửi',exact:true})).toContainText('2 / 2');await expect(dialog.getByRole('button',{name:'Lượt sau',exact:true})).toBeDisabled();await dialog.getByRole('button',{name:'Lượt trước',exact:true}).click();await expect(dialog).toContainText('Trường An');await dialog.getByRole('button',{name:'Đóng',exact:true}).click();await expect(page.locator('[data-response-id=sample-a]').getByRole('button',{name:'Xem nhanh',exact:true})).toBeFocused();expect(writes).toEqual([]);
});

test('reading-tools: logo distinguishes invalid URL from loading failure and retries without saving',async({page})=>{
const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);let fail=true;await page.route('https://assets.example.test/logo.png',route=>fail?route.abort():route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="blue"/></svg>'}));await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Thương hiệu',exact:true}).click();const field=page.getByLabel('URL ảnh logo HTTPS',{exact:true}),feedback=page.getByRole('status',{name:'Tình trạng logo',exact:true});await field.fill('http://assets.example.test/logo.png');await expect(feedback).toContainText('HTTPS');await expect(field).toHaveAttribute('aria-invalid','true');await field.fill('https://assets.example.test/logo.png');await expect(feedback).toContainText('Chưa tải được ảnh');fail=false;await page.getByRole('button',{name:'Thử tải lại logo',exact:true}).click();await expect(feedback).toContainText('Ảnh đã tải được');await expect(field).toHaveValue('https://assets.example.test/logo.png');expect(writes).toEqual([]);
});

test('reading-tools: audit groups use Vietnam days and collapsed failures remain visible',async({page})=>{
  await interceptMealServices(page);await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('week')?route.fulfill({json:{week:weeks[0],responses:[],history:[{id:'event-b',action:'delete-review',at:Date.parse('2026-10-14T17:00:00Z'),actor:'admin@example.com',name:'B'},{id:'event-a',action:'deleted',at:Date.parse('2026-10-14T16:59:59Z'),actor:'admin@example.com',name:'A'}]}}):route.fallback());await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();const group=page.getByRole('button',{name:/15\/10\/2026 · 1 sự kiện đã tải/});await expect(group).toContainText('1 cần kiểm tra');await group.click();await expect(group).toHaveAttribute('aria-expanded','false');await expect(page.locator('.dashboard-history-table [data-audit-event]')).toHaveCount(1);await page.getByRole('textbox',{name:'Người quản trị',exact:true}).fill('admin');await expect(group).toHaveAttribute('aria-expanded','true');await expect(page.locator('.dashboard-history-table [data-audit-event]')).toHaveCount(2);
});

test('reading-tools: archive status intersects month and unknown metadata is never closed',async({page})=>{
  await interceptMealServices(page);await page.route('**/api/history',route=>route.fulfill({json:{weeks:[{weekKey:'2026-09-28_2026-10-02',name:'Tuần đóng',startDate:'2026-09-28',endDate:'2026-10-02',formStatus:'closed'},{weekKey:'2026-10-05_2026-10-09',name:'Tuần chưa rõ',startDate:'2026-10-05',endDate:'2026-10-09'}]}}));await page.goto('http://127.0.0.1:5175/history?month=2026-10');await page.getByRole('combobox',{name:'Trạng thái Form',exact:true}).click();await page.getByRole('option',{name:'Chưa xác định',exact:true}).click();await expect(page.locator('.archive-weeks li')).toHaveCount(1);await expect(page.locator('.archive-weeks')).toContainText('Tuần chưa rõ');await expect(page.locator('.archive-weeks a')).toHaveAttribute('href',/status=unknown/);await page.getByRole('combobox',{name:'Trạng thái Form',exact:true}).click();await page.getByRole('option',{name:'Đã đóng',exact:true}).click();await expect(page.locator('.archive-weeks li')).toHaveCount(1);await expect(page.locator('.archive-weeks')).toContainText('Tuần đóng');
});

test('reading-tools: cancelled drag never persists an intermediate pointer or keyboard width',async({page})=>{
  await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/newest');const handle=page.getByRole('separator',{name:'Độ rộng cột Họ tên',exact:true});await handle.focus();await page.keyboard.press('Home');await expect(handle).toHaveAttribute('aria-valuenow','144');const box=(await handle.boundingBox())!;await page.mouse.move(box.x+12,box.y+12);await page.mouse.down();await page.mouse.move(box.x+60,box.y+12);await page.keyboard.press('ArrowRight');await page.keyboard.press('Escape');await page.mouse.up();await page.reload();await expect(handle).toHaveAttribute('aria-valuenow','144');
});

test('reading-tools: denied layout storage leaves safe transient column controls usable',async({page})=>{
  await page.addInitScript(()=>{const read=Storage.prototype.getItem,write=Storage.prototype.setItem;Storage.prototype.getItem=function(key){if(key.startsWith('meal-table-layout-v1:'))throw new DOMException('Denied','SecurityError');return read.call(this,key);};Storage.prototype.setItem=function(key,value){if(key.startsWith('meal-table-layout-v1:'))throw new DOMException('Denied','SecurityError');write.call(this,key,value);};});await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/newest');await page.getByRole('button',{name:'Cột hiển thị',exact:true}).click();const chooser=page.getByRole('dialog',{name:'Cột hiển thị · Bảng chi tiết',exact:true});await expect(chooser).toContainText('Không lưu/đọc được bố cục');await expect(chooser.getByRole('checkbox',{name:'Họ tên',exact:true})).toBeDisabled();await chooser.getByRole('checkbox',{name:'Thứ 4 (14/10/2026)',exact:true}).uncheck();await page.keyboard.press('Escape');await expect(page.locator('.detail-wrap th').nth(4)).toBeHidden();
});

test('reading-tools: quick navigation preserves same-name identities and never loads an extra page',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);let reads=0;await page.route('**/api/dashboard?**',route=>{if(!new URL(route.request().url()).searchParams.has('week'))return route.fallback();reads++;return route.fulfill({json:{week:{...weeks[0],dayLabels:days.map(day=>day.day)},responses:Array.from({length:50},(_,i)=>({responseId:'id-'+i,name:'Trùng tên',timestamp:1791467000000+i*1000,meals:['Món-'+i]})),page:{query:'',sort:'newest',nextOffset:50,revision:'test-revision',offset:0,total:200,matchedCount:200,snapshotAt:1791468000000},history:[]}});});await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();await page.locator('[data-response-id=id-49]').getByRole('button',{name:'Xem nhanh',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Chi tiết lượt gửi',exact:true});await expect(dialog).toContainText('Món-49');const before=reads;await dialog.getByRole('button',{name:'Lượt sau',exact:true}).click();await expect(dialog).toContainText('Món-48');await expect(dialog.getByRole('status',{name:'Vị trí lượt gửi'})).toContainText('2 / 50 lượt đã tải');expect(reads).toBe(before);expect(writes).toEqual([]);
});

test('reading-tools: late logo failure cannot replace feedback for the new successful URL',async({page})=>{
  await interceptMealServices(page);let release:()=>void=()=>{};const hold=new Promise<void>(resolve=>release=resolve);await page.route('https://assets.example.test/old.png',async route=>{await hold;await route.abort();});await page.route('https://assets.example.test/new.png',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"/>'}));await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Thương hiệu',exact:true}).click();const field=page.getByLabel('URL ảnh logo HTTPS',{exact:true}),status=page.getByRole('status',{name:'Tình trạng logo',exact:true});try{await field.fill('https://assets.example.test/old.png');await expect(status).toContainText('Đang tải');await field.fill('https://assets.example.test/new.png');await expect(status).toContainText('Ảnh đã tải được');release();await expect(field).toHaveValue('https://assets.example.test/new.png');await expect(status).toContainText('Ảnh đã tải được');}finally{release();}
});

test('reading-tools: clearing archive status preserves month and calendar links preserve status',async({page})=>{
  await interceptMealServices(page);await page.route('**/api/history',route=>route.fulfill({json:{weeks:[{weekKey:'2026-09-28_2026-10-02',name:'Tuần đóng',startDate:'2026-09-28',endDate:'2026-10-02',formStatus:'closed'},{weekKey:'2026-10-05_2026-10-09',name:'Tuần chưa rõ',startDate:'2026-10-05',endDate:'2026-10-09'}]}}));await page.goto('http://127.0.0.1:5175/history?month=2026-09&status=unknown');const empty=page.getByRole('status',{name:'Không có tuần phù hợp',exact:true});await expect(empty).toBeVisible();await empty.getByRole('button',{name:'Bỏ điều kiện Trạng thái Form',exact:true}).click();await expect(page.getByRole('combobox',{name:'Tháng',exact:true})).toHaveValue('09/2026');await expect(page.locator('.archive-weeks')).toContainText('Tuần đóng');await page.getByRole('combobox',{name:'Trạng thái Form',exact:true}).click();await page.getByRole('option',{name:'Đã đóng',exact:true}).click();await page.getByRole('button',{name:'Lịch tháng',exact:true}).click();await expect(page.locator('.calendar-week-links a').first()).toHaveAttribute('href','/history?week=2026-09-28_2026-10-02&month=2026-09&layout=calendar&status=closed');
});

test('reading-tools: audit day headings span only the columns that remain visible',async({page})=>{
await interceptMealServices(page);await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('week')?route.fulfill({json:{week:weeks[0],responses:[],history:[{id:'audit-a',at:1791467940000,action:'deleted',actor:'admin@example.com'}]}}):route.fallback());await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();const history=page.getByRole('region',{name:'Bảng lịch sử thao tác',exact:true});await history.getByRole('button',{name:'Cột hiển thị',exact:true}).click();const chooser=page.getByRole('dialog',{name:'Cột hiển thị · Bảng lịch sử thao tác',exact:true});await chooser.getByRole('checkbox',{name:'Thời gian',exact:true}).uncheck();await chooser.getByRole('checkbox',{name:'Người thực hiện',exact:true}).uncheck();await page.keyboard.press('Escape');await expect(history.locator('.audit-day-heading td')).toHaveAttribute('colspan','3');await expect(history.locator('.audit-day-heading button')).toBeVisible();await page.setViewportSize({width:390,height:844});await expect(history.locator('.audit-day-heading td')).toHaveAttribute('colspan','5');
});

test('reading-tools: responsive review keeps grouped audit, readonly navigation, logo feedback and archive filters usable',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('week')?route.fulfill({json:{week:{...weeks[0],dayLabels:days.map(day=>day.day)},responses:[{responseId:'sample-a',name:'Trường An',timestamp:1791467940000,meals:days.map(()=> 'CƠM GÀ')},{responseId:'sample-b',name:'Minh Anh',timestamp:1791467880000,meals:days.map(()=> 'BÚN BÒ')}],history:[{id:'event-a',at:1791467940000,action:'delete-review',actor:'admin@example.com',name:'Trường An'},{id:'event-b',at:1791381540000,action:'deleted',actor:'admin@example.com',name:'Minh Anh'}]}}):route.fallback());
  for(const width of [360,900,1440])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:800});await page.goto('http://127.0.0.1:5175/dashboard');await page.getByRole('button',{name:'Tùy chọn hiển thị',exact:true}).click();const display=page.getByRole('dialog',{name:'Tùy chọn hiển thị',exact:true});await display.getByRole('combobox',{name:'Giao diện',exact:true}).selectOption(theme);await display.getByRole('combobox',{name:'Hiệu ứng',exact:true}).selectOption('off');await display.getByRole('button',{name:'Lớn',exact:true}).click();await page.keyboard.press('Escape');
    async function navigate(label:string){if(width>700)await page.locator('.ui-sidebar').getByRole('button',{name:label,exact:true}).click();else if(label==='Lượt gửi & lịch sử')await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Lượt gửi',exact:true}).click();else{await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Thêm',exact:true}).click();await page.getByRole('dialog',{name:'Thêm chức năng'}).getByRole('button',{name:label,exact:true}).click();}}
    await navigate('Lượt gửi & lịch sử');const history=page.getByRole('region',{name:'Bảng lịch sử thao tác',exact:true});await expect(history.locator('.audit-day-heading')).toHaveCount(2);await history.screenshot({path:`review/reading-tools/audit-${width}-${theme}.png`});if(width>700){const chooserTrigger=history.getByRole('button',{name:'Cột hiển thị',exact:true});await chooserTrigger.scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await chooserTrigger.click();await page.getByRole('dialog',{name:'Cột hiển thị · Bảng lịch sử thao tác',exact:true}).screenshot({path:`review/reading-tools/layout-${width}-${theme}.png`});await page.keyboard.press('Escape');}
await page.locator('[data-response-id=sample-a]').getByRole('button',{name:'Xem nhanh',exact:true}).click();const quick=page.getByRole('dialog',{name:'Chi tiết lượt gửi',exact:true});await quick.getByRole('button',{name:'Lượt sau',exact:true}).click();if(width<=700)expect((await quick.getByRole('button',{name:'Lượt sau',exact:true}).boundingBox())!.height).toBeLessThan(100);await quick.screenshot({path:`review/reading-tools/quick-${width}-${theme}.png`});const bounds=(await quick.boundingBox())!;expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(width);await quick.getByRole('button',{name:'Đóng',exact:true}).click();await navigate('Thương hiệu');await page.getByLabel('URL ảnh logo HTTPS',{exact:true}).fill('http://assets.example.test/logo.png');await expect(page.getByRole('status',{name:'Tình trạng logo'})).toContainText('HTTPS');await page.getByRole('status',{name:'Tình trạng logo',exact:true}).screenshot({path:`review/reading-tools/logo-${width}-${theme}.png`});page.once('dialog',dialog=>dialog.accept());await page.goto('http://127.0.0.1:5175/history?month=2026-10&status=unknown');await expect(page.getByRole('combobox',{name:'Trạng thái Form'})).toHaveValue('Chưa xác định');await page.locator('.archive-panel').screenshot({path:`review/reading-tools/archive-${width}-${theme}.png`});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }expect(errors).toEqual([]);expect(writes).toEqual([]);
});

test('direct-ui: summary selects the real day and meal, retains name/sort and returns on mobile',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5175/newest');
  await page.getByRole('combobox',{name:'Họ tên',exact:true}).fill('truong');await page.getByRole('heading',{name:'Thực đơn tuần này',exact:true}).click();await page.getByRole('combobox',{name:'Sắp xếp',exact:true}).click();await page.getByRole('option',{name:'Cũ nhất',exact:true}).click();await page.getByRole('tab',{name:'Tổng hợp',exact:true}).click();
  const chosen=page.getByRole('button',{name:'Xem người chọn CƠM GÀ · Thứ 4 (14/10/2026)',exact:true});await chosen.click();await expect(page.getByRole('tab',{name:'Chi tiết',exact:true})).toHaveAttribute('aria-selected','true');await expect(page.locator('#day')).toHaveValue('Thứ 4 (14/10/2026)');await expect(page.locator('#meal')).toHaveValue('CƠM GÀ');await expect(page.getByRole('status',{name:'Kết quả lọc'})).toContainText('1 lựa chọn món');await expect(page.getByRole('heading',{name:'Chi tiết lựa chọn',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Quay lại Tổng hợp',exact:true}).click();await expect(page.getByRole('tab',{name:'Tổng hợp',exact:true})).toHaveAttribute('aria-selected','true');await expect(page.locator('#day')).toHaveValue('');await expect(page.locator('#day')).toHaveAttribute('placeholder','Tất cả');await expect(page.getByRole('combobox',{name:'Họ tên',exact:true})).toHaveValue('truong');await expect(page.locator('#response-sort')).toHaveValue('Cũ nhất');await expect(chosen).toBeFocused();expect(writes).toEqual([]);
});

test('direct-ui: zero-match summary selection keeps a usable return and ordinary filters leave drilldown',async({page})=>{
  await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/newest');await expect(page.getByRole('status',{name:'Kết quả lọc'})).toBeVisible();const open=page.getByRole('button',{name:'Mở tổng hợp',exact:true});if(await open.isVisible())await open.click();await page.getByRole('combobox',{name:'Họ tên',exact:true}).fill('truong');await page.getByRole('heading',{name:'Thực đơn tuần này',exact:true}).click();await page.getByRole('button',{name:'Xem người chọn BÚN BÒ · Thứ 4 (14/10/2026)',exact:true}).click();await expect(page.getByRole('status',{name:'Không có kết quả phù hợp',exact:true})).toBeVisible();await page.getByRole('button',{name:'Quay lại Tổng hợp',exact:true}).click();await expect(page.getByRole('status',{name:'Kết quả lọc'})).toContainText('5 lựa chọn món');
  await page.getByRole('button',{name:'Xem người chọn CƠM GÀ · Thứ 2 (12/10/2026)',exact:true}).click();await page.getByRole('combobox',{name:'Họ tên',exact:true}).fill('minh');await expect(page.getByRole('button',{name:'Quay lại Tổng hợp',exact:true})).toHaveCount(0);
});

test('direct-ui: table shadows track only real remaining horizontal space and disappear on mobile',async({page})=>{
  await interceptMealServices(page);await page.setViewportSize({width:900,height:900});await page.goto('http://127.0.0.1:5175/newest');const viewport=page.locator('.detail-wrap'),frame=viewport.locator('..');await expect(frame).toHaveAttribute('data-edge-right','true');await expect(frame).toHaveAttribute('data-edge-left','false');await expect(frame.getByText('Kéo ngang',{exact:false})).toHaveCount(0);
  await viewport.evaluate(node=>node.scrollLeft=(node.scrollWidth-node.clientWidth)/2);await expect(frame).toHaveAttribute('data-edge-left','true');await expect(frame).toHaveAttribute('data-edge-right','true');await frame.screenshot({path:'review/direct-ui/table-edges-900.png'});await viewport.evaluate(node=>node.scrollLeft=node.scrollWidth);await expect(frame).toHaveAttribute('data-edge-right','false');
  await page.setViewportSize({width:390,height:844});await expect(frame).toHaveAttribute('data-edge-left','false');await expect(frame).toHaveAttribute('data-edge-right','false');await expect(viewport.locator('tbody tr').first().locator('td')).toHaveCount(7);
});

test('direct-ui: OCR issues navigate to the actual date and meal without editing or creating',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.route('**/api/dashboard',route=>route.request().method()==='POST'&&route.request().postDataJSON().action==='ocr'?route.fulfill({json:{title:'Tuần thử',days:['19','20','21','22','23'].map((day,i)=>({day:`Thứ ${i+2}`,date:i===2?'31/02/2026':`${day}/10/2026`,meals:i===2?['A','','']:['A','B','C']}))}}):route.fallback());await page.goto('http://127.0.0.1:5175/dashboard?tab=create');
  await expect(page.getByRole('button',{name:'Chọn ảnh thực đơn',exact:true})).toBeEnabled();const image=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;return canvas.toDataURL('image/png').split(',')[1];});await page.locator('input[type=file]').first().setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();
  const issues=page.getByRole('region',{name:'Cần đối chiếu OCR',exact:true});await issues.screenshot({path:'review/direct-ui/ocr-issues.png'});await issues.getByRole('button',{name:/Thứ 4 · Ngày/}).click();await expect(page.locator('#ocr-date-2')).toBeFocused();await expect(page.locator('#ocr-date-2')).toHaveValue('31/02/2026');await issues.getByRole('button',{name:/Thứ 4 · Món 2/}).click();await expect(page.locator('#ocr-meal-2-1')).toBeFocused();expect(writes).toEqual([]);await page.locator('#ocr-date-2').fill('21/10/2026');await expect(issues.getByRole('button',{name:/Thứ 4 · Ngày/})).toHaveCount(0);await page.getByRole('button',{name:'Tạo Form và Sheet',exact:true}).click();await expect(page.getByRole('region',{name:'Lỗi cần sửa trước khi tạo tuần',exact:true})).toBeVisible();expect(writes).toEqual([]);
});

test('direct-ui: disabled action explains the real missing image without enabling or writing',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard?tab=create');const action=page.getByRole('button',{name:'Đọc thực đơn',exact:true});await expect(action).toBeDisabled();const help=page.getByRole('button',{name:'Giải thích vì sao Đọc thực đơn bị khóa',exact:true});await help.focus();await page.keyboard.press('Enter');await expect(page.getByRole('note',{name:'vì sao Đọc thực đơn bị khóa',exact:true})).toContainText('Chọn ảnh');await page.keyboard.press('Escape');await expect(help).toBeFocused();await expect(action).toBeDisabled();expect(writes).toEqual([]);
});

test('direct-ui: exact meal drilldown does not include prefix matches while typed search stays unchanged',async({page})=>{
  await interceptMealServices(page);await page.route('**/api/viewer?**',route=>route.fulfill({json:{headers:['Thời điểm','Họ tên','Thứ 2 (12/10/2026)'],days:[{day:'Thứ 2 (12/10/2026)',meals:['CƠM','CƠM GÀ']}],rows:[['08/10/2026 09:00','Một','CƠM'],['08/10/2026 08:00','Hai','CƠM GÀ']]}}));await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5175/newest');await page.getByRole('tab',{name:'Tổng hợp',exact:true}).click();await page.getByRole('button',{name:'Xem người chọn CƠM · Thứ 2 (12/10/2026)',exact:true}).click();await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(1);await expect(page.getByRole('status',{name:'Kết quả lọc'})).toContainText('1 lựa chọn món');await page.getByRole('button',{name:'Quay lại Tổng hợp',exact:true}).click();await page.getByRole('tab',{name:'Chi tiết',exact:true}).click();await page.getByRole('button',{name:'Bộ lọc',exact:true}).click();await page.getByRole('combobox',{name:'Món',exact:true}).fill('CƠM');await page.getByRole('option',{name:'CƠM',exact:true}).click();await page.getByRole('button',{name:'Đóng bộ lọc',exact:true}).click();await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(2);
});

test('direct-ui: Form, empty notice and unselected week explanations keep actions blocked and never write',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard');const nav=page.locator('.ui-sidebar');await nav.getByRole('button',{name:'Điều khiển Form',exact:true}).click();await page.getByRole('button',{name:'Giải thích vì sao Đóng Form bị khóa',exact:true}).click();await expect(page.getByRole('note',{name:'vì sao Đóng Form bị khóa',exact:true})).toContainText('Form đã đóng');await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Đóng Form',exact:true})).toBeDisabled();
  await nav.getByRole('button',{name:'Thông báo tuần',exact:true}).click();await expect(page.getByRole('button',{name:'Tải lại thông báo',exact:true})).toBeEnabled();await expect(page.getByRole('region',{name:'Thay đổi thông báo chưa lưu',exact:true})).toHaveCount(0);await page.getByLabel('Hiển thị hết ngày',{exact:true}).fill('2026-10-23');await page.getByRole('region',{name:'Thay đổi thông báo chưa lưu',exact:true}).getByRole('button',{name:'Lưu thông báo',exact:true}).click();await expect(page.getByRole('region',{name:'Lỗi cần sửa trước khi lưu thông báo',exact:true})).toContainText('Nhập nội dung');await expect(page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true})).toHaveCount(0);expect(writes).toEqual([]);await page.getByLabel('Hiển thị hết ngày',{exact:true}).fill('');
  await page.route('**/api/dashboard?access=1',route=>route.fulfill({json:{accountId:'empty-owner',email:'admin@example.com',role:'owner',permissions:{view:true,create:true,manageResponses:true},weeks:[]}}));await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Đối soát',exact:true}).click();await page.getByRole('button',{name:'Giải thích vì sao Đối soát tuần này bị khóa',exact:true}).click();await expect(page.getByRole('note',{name:'vì sao Đối soát tuần này bị khóa',exact:true})).toContainText('Chọn một tuần');await expect(page.getByRole('button',{name:'Đối soát tuần này',exact:true})).toBeDisabled();expect(writes).toEqual([]);
});

test('direct-ui: shadows respond to all three tables, column reset and fit without document overflow',async({page})=>{
  await interceptMealServices(page);await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('week')?route.fulfill({json:{week:weeks[0],responses:[{responseId:'sample-a',name:'Trường An',meals:['CƠM GÀ']}],history:[{id:'audit-a',action:'deleted',name:'Trường An',at:1791467940000,actor:'admin@example.com'}]}}):route.fallback());await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
  for(const label of ['Bảng lượt gửi','Bảng lịch sử thao tác']){const workspace=page.getByRole('region',{name:label,exact:true}),handle=workspace.getByRole('separator').first();await expect(handle).toBeVisible();await handle.focus();await page.keyboard.press('End');const viewport=workspace.locator('.table-wrap'),frame=viewport.locator('..');await viewport.evaluate(node=>node.scrollLeft=0);await expect(frame).toHaveAttribute('data-edge-right','true');await workspace.getByRole('button',{name:'Cỡ cột mặc định',exact:true}).click();}
  await page.goto('http://127.0.0.1:5175/newest');await page.getByRole('combobox',{name:'Ngày',exact:true}).click();await page.getByRole('option',{name:'Thứ 4 (14/10/2026)',exact:true}).click();const frame=page.locator('.detail-wrap').locator('..');await expect(frame).toHaveAttribute('data-edge-left','false');await expect(frame).toHaveAttribute('data-edge-right','false');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('direct-ui: warning navigation targets an always-visible OCR day without changing its text or confirmation',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.route('**/api/dashboard',route=>route.request().method()==='POST'&&route.request().postDataJSON().action==='ocr'?route.fulfill({json:{title:'Tuần thử',days:['19','20','21','22','23'].map((day,i)=>({day:`Thứ ${i+2}`,date:`${day}/10/2026`,meals:i===0?['A','B','']:['A','B','C']}))}}):route.fallback());await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await expect(page.getByRole('button',{name:'Chọn ảnh thực đơn',exact:true})).toBeEnabled();const image=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;return canvas.toDataURL('image/png').split(',')[1];});await page.locator('input[type=file]').first().setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();await page.getByRole('checkbox',{name:/Tôi xác nhận/}).check();await expect(page.locator('.menu-day').first().locator('.ocr-day-fields')).toBeVisible();await page.getByRole('region',{name:'Cần đối chiếu OCR',exact:true}).getByRole('button',{name:/Thứ 2 · Món 3/}).click();await expect(page.locator('#ocr-meal-0-2')).toBeFocused();await expect(page.locator('#ocr-meal-0-2')).toHaveValue('');await expect(page.getByRole('checkbox',{name:/Tôi xác nhận/})).toBeChecked();await expect(page.getByRole('button',{name:'Tạo Form và Sheet',exact:true})).toBeEnabled();expect(writes).toEqual([]);
});

test('direct-ui: bounded visual review covers summary, issue links, shadows and manual reasons',async({page})=>{
  await page.addInitScript(()=>{localStorage.removeItem('meal-viewer-filters');localStorage.setItem('meal-viewer-summary-open','true');});
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
for(const width of [360,900,1440])for(const theme of ['light','dark']){await page.setViewportSize({width,height:800});await page.goto('http://127.0.0.1:5175/newest');await page.getByRole('button',{name:'Tùy chọn hiển thị',exact:true}).click();const display=page.getByRole('dialog',{name:'Tùy chọn hiển thị',exact:true});await display.getByRole('combobox',{name:'Giao diện',exact:true}).selectOption(theme);await display.getByRole('button',{name:'Lớn',exact:true}).click();await display.getByRole('combobox',{name:'Hiệu ứng',exact:true}).selectOption('off');await page.keyboard.press('Escape');if(width<=700)await page.getByRole('tab',{name:'Tổng hợp',exact:true}).click();else{const open=page.getByRole('button',{name:'Mở tổng hợp',exact:true});if(await open.isVisible())await open.click();}await expect(page.locator('.summary-meal-button').first()).toHaveCSS('background-color','rgba(0, 0, 0, 0)');await page.locator('.ui-summary-grid').screenshot({path:`review/direct-ui/summary-${width}-${theme}.png`});await page.getByRole('button',{name:'Xem người chọn CƠM GÀ · Thứ 4 (14/10/2026)',exact:true}).click();await page.screenshot({path:`review/direct-ui/details-${width}-${theme}.png`});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.goto('http://127.0.0.1:5175/dashboard?tab=create');const help=page.getByRole('button',{name:'Giải thích vì sao Đọc thực đơn bị khóa',exact:true});await help.click();const note=page.getByRole('note',{name:'vì sao Đọc thực đơn bị khóa',exact:true});await note.screenshot({path:`review/direct-ui/reason-${width}-${theme}.png`});const box=(await note.boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);await page.keyboard.press('Escape');
  }expect(errors).toEqual([]);expect(writes).toEqual([]);
});

test('clarity-controls: branding review shows old/new values and only confirmed snapshot writes',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Thương hiệu',exact:true}).click();await page.getByLabel('Tên trường',{exact:true}).fill('Tên mới kiểm thử');await page.getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();
  const review=page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true});await expect(review).toContainText('Trường minh họa');await expect(review).toContainText('Tên mới kiểm thử');await review.getByRole('button',{name:'Hủy',exact:true}).click();expect(writes).toEqual([]);await expect(page.getByLabel('Tên trường',{exact:true})).toHaveValue('Tên mới kiểm thử');await page.getByRole('region',{name:'Thay đổi thương hiệu chưa lưu',exact:true}).getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();await review.getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();await expect.poll(()=>writes.length).toBe(1);expect(writes[0]).toMatchObject({method:'POST',action:'set-branding',branding:{schoolName:'Tên mới kiểm thử',primaryColor:'#357185'},expectedUpdatedAt:0});
});

test('clarity-controls: notice review cancel preserves draft and confirmation retains revision',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);const endsOn=new Date(Date.now()+7*86400000).toISOString().slice(0,10);await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('notice')?route.fulfill({json:{notice:{text:'Nội dung cũ',endsOn,updatedAt:7}}}):route.fallback());await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Thông báo tuần',exact:true}).click();await page.getByRole('textbox',{name:'Nội dung thông báo',exact:true}).fill('Nội dung mới');await page.getByRole('region',{name:'Thay đổi thông báo chưa lưu',exact:true}).getByRole('button',{name:'Lưu thông báo',exact:true}).click();const review=page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true});await expect(review).toContainText('Nội dung cũ');await expect(review).toContainText('Nội dung mới');await review.getByRole('button',{name:'Hủy',exact:true}).click();expect(writes).toEqual([]);await expect(page.getByRole('textbox',{name:'Nội dung thông báo',exact:true})).toHaveValue('Nội dung mới');await page.getByRole('region',{name:'Thay đổi thông báo chưa lưu',exact:true}).getByRole('button',{name:'Lưu thông báo',exact:true}).click();await review.getByRole('button',{name:'Lưu thông báo',exact:true}).click();await expect.poll(()=>writes.length).toBe(1);expect(writes[0]).toMatchObject({action:'set-week-notice',weekKey:key,text:'Nội dung mới',endsOn,expectedUpdatedAt:7});
});

test('clarity-controls: deadline review retains the original reason and Form concurrency guards',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Điều khiển Form',exact:true}).click();const date=new Date(Date.now()+7*86400000).toISOString().slice(0,10);await page.getByLabel('Hạn mới — giờ Việt Nam',{exact:true}).fill(date+'T12:00');await page.getByRole('button',{name:'Lưu hạn đăng ký',exact:true}).click();const review=page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true});await expect(review.locator('.change-review')).toContainText('Hạn đăng ký');await expect(review.locator('.change-review')).toContainText('Trước');await expect(review.locator('.change-review')).toContainText('Sau');await review.getByRole('textbox',{name:'Lý do (tùy chọn)',exact:true}).fill('Chốt thử');await review.getByRole('button',{name:'Đổi hạn đăng ký',exact:true}).click();await expect.poll(()=>writes.length).toBe(1);expect(writes[0]).toMatchObject({action:'form-control',weekKey:key,mode:'deadline',deadline:date+'T12:00:00+07:00',expectedStatus:'closed',expectedLockAt:weeks[0].lockAt,reason:'Chốt thử'});
});

test('clarity-controls: PC resize supports pointer, keyboard and reset without changing data',async({page})=>{
  await interceptMealServices(page);await page.setViewportSize({width:1440,height:960});await page.goto('http://127.0.0.1:5175/newest');const th=page.locator('.detail-wrap th').nth(1);await expect(th).toBeVisible();await page.evaluate(()=>document.fonts.ready);await th.evaluate(node=>Promise.all(node.closest('dialog')!.getAnimations().map(animation=>animation.finished.catch(()=>{}))));const before=(await th.boundingBox())!.width;const handle=th.getByRole('separator',{name:'Độ rộng cột Họ tên',exact:true});const box=(await handle.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+80,box.y+box.height/2);await page.mouse.up();expect((await th.boundingBox())!.width).toBeCloseTo(before+80,0);await handle.focus();await page.keyboard.press('ArrowRight');expect((await th.boundingBox())!.width).toBeCloseTo(before+96,0);await expect(page.getByRole('status',{name:'Kết quả lọc'})).toContainText('10 lựa chọn món');await page.getByRole('button',{name:'Cỡ cột mặc định',exact:true}).click();await expect(page.locator('.detail-wrap table')).toHaveCSS('table-layout','auto');expect(Math.abs((await th.boundingBox())!.width-before)).toBeLessThan(2);await page.setViewportSize({width:390,height:960});await expect(handle).toBeHidden();await expect(page.locator('.detail-wrap tbody tr').first().locator('td')).toHaveCount(7);
});

test('clarity-controls: manual shortcut reference preserves Ctrl K and adds no delete shortcut',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/newest');await page.getByRole('button',{name:'Tùy chọn hiển thị',exact:true}).click();const button=page.getByRole('button',{name:'Phím tắt',exact:true});await expect(button).toHaveAttribute('aria-expanded','false');await button.click();const reference=page.getByRole('region',{name:'Hướng dẫn phím tắt',exact:true});await expect(reference).toContainText('OCR');await expect(reference).toContainText('Không có phím tắt xóa');await page.keyboard.press('Escape');await page.keyboard.press('Control+k');await expect(page.getByRole('dialog',{name:'Lệnh nhanh',exact:true})).toBeVisible();await page.keyboard.press('Escape');await page.getByRole('heading',{name:'Thực đơn tuần này',exact:true}).click();await page.keyboard.press('Delete');expect(writes).toEqual([]);
});

test('clarity-controls: real pending read elapsed time resets and stopping never claims backend cancellation',async({page})=>{
  await page.clock.install();await interceptMealServices(page);let release:()=>void=()=>{};const hold=new Promise<void>(resolve=>release=resolve);await page.route('**/api/dashboard?**',async route=>{if(new URL(route.request().url()).searchParams.has('reconcile')){await hold;return route.fulfill({json:{formCount:0,sheetCount:0,matchedCount:0,issues:[]}});}return route.fallback();});await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Đối soát',exact:true}).click();await page.getByRole('button',{name:'Đối soát tuần này',exact:true}).click();const elapsed=page.getByRole('status',{name:'Thời gian chờ',exact:true});await expect(elapsed).toContainText('Đang đối soát');await page.clock.fastForward(12000);await expect(elapsed).toContainText('12 giây');await page.getByRole('button',{name:'Dừng chờ dữ liệu',exact:true}).click();await expect(elapsed).toBeHidden();await expect(page.locator('.dashboard-message')).toContainText('Máy chủ có thể vẫn xử lý');release();
});

test('clarity-controls: malformed and unknown links explain the problem without reading week data',async({page})=>{
  await interceptMealServices(page);let reads=0;page.on('request',request=>{if(/\/api\/(viewer|history)/.test(request.url()))reads++;});for(const path of ['/not-a-page','/?view=','/?view=bad!','/history?week=']){await page.goto('http://127.0.0.1:5175'+path);await expect(page.getByRole('region',{name:'Vấn đề liên kết',exact:true})).toBeVisible();await expect(page.getByRole('link',{name:'Tuần này',exact:true})).toBeVisible();}expect(reads).toBe(0);
});

test('clarity-controls: missing, forbidden and network viewer states follow server evidence',async({page})=>{
  await interceptMealServices(page);for(const [status,error,heading] of [[404,'Không tìm thấy tuần đã đăng ký.','Không tìm thấy tuần trong liên kết'],[403,'Không có quyền xem.','Chưa có quyền xem tuần này'],[502,'Không thể kết nối.','Chưa tải được dữ liệu'],[502,'Không tìm thấy tuần đã đăng ký.','Không tìm thấy tuần trong liên kết']] as const){await page.route('**/api/history?**',route=>route.fulfill({status,json:{error}}));await page.goto('http://127.0.0.1:5175/history?week=missing');await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible();}
});

test('clarity-controls: all tables resize independently, Escape cancels drag and projection resets widths',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);
  await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('week')?route.fulfill({json:{week:{...weeks[0],dayLabels:days.map(day=>day.day)},responses:[{responseId:'sample-a',name:'Trường An',meals:['CƠM GÀ']}],history:[{id:'audit-a',action:'deleted',name:'Trường An',at:1791467940000,actor:'admin@example.com'}]}}):route.fallback());
  await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
  for(const label of ['Bảng lượt gửi','Bảng lịch sử thao tác'])await test.step('Resize '+label,async()=>{
    const workspace=page.getByRole('region',{name:label,exact:true}),handle=workspace.getByRole('separator').first();await expect(handle).toBeVisible();await handle.focus();await page.keyboard.press('End');await expect(handle).toHaveAttribute('aria-valuenow',await handle.getAttribute('aria-valuemax') as string);await page.keyboard.press('Home');await expect(handle).toHaveAttribute('aria-valuenow','144');
    await workspace.getByRole('button',{name:'Cỡ cột mặc định',exact:true}).click();await expect(workspace.getByRole('button',{name:'Cỡ cột mặc định',exact:true})).toBeDisabled();
  });
  await page.goto('http://127.0.0.1:5175/newest');const workspace=page.getByRole('region',{name:'Bảng chi tiết',exact:true});await workspace.getByRole('button',{name:'Phóng rộng bảng chi tiết',exact:true}).click();const expanded=page.getByRole('dialog',{name:'Bảng chi tiết',exact:true}),handle=expanded.getByRole('separator',{name:'Độ rộng cột Họ tên',exact:true});await expect(handle).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  const box=(await handle.boundingBox())!,before=(await handle.locator('..').boundingBox())!.width;
  await page.mouse.move(box.x+12,box.y+12);await page.mouse.down();await page.mouse.move(box.x+92,box.y+12);await page.keyboard.press('Escape');await page.mouse.up();await expect(expanded).toBeVisible();expect((await handle.locator('..').boundingBox())!.width).toBeCloseTo(before,0);await page.keyboard.press('Escape');
  await workspace.getByRole('separator',{name:'Độ rộng cột Họ tên',exact:true}).focus();await page.keyboard.press('ArrowRight');await workspace.getByRole('button',{name:'Cột hiển thị',exact:true}).click();await page.getByRole('dialog',{name:'Cột hiển thị · Bảng chi tiết',exact:true}).getByRole('checkbox',{name:'Thứ 4 (14/10/2026)',exact:true}).uncheck();await page.keyboard.press('Escape');await expect(page.locator('.detail-wrap th').nth(4)).toBeHidden();
  await page.getByRole('combobox',{name:'Ngày',exact:true}).click();await page.getByRole('option',{name:'Thứ 4 (14/10/2026)',exact:true}).click();await expect(workspace.getByRole('button',{name:'Cỡ cột mặc định',exact:true})).toBeDisabled();await expect(page.locator('.detail-wrap thead').getByRole('columnheader')).toHaveCount(2);expect(writes).toEqual([]);
});

test('clarity-controls: refresh keeps rows on network failure but clears data when server refuses access',async({page})=>{
  await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/history?week='+key);await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(2);
  await page.route('**/api/history?**',route=>route.fulfill({status:502,json:{error:'Kết nối tạm thời gián đoạn.'}}));await page.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(2);await expect(page.locator('.viewer-error')).toContainText('Dữ liệu lần tải trước đang được giữ');
  await page.route('**/api/history?**',route=>route.fulfill({status:403,json:{error:'Không có quyền xem.'}}));await page.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await expect(page.getByRole('heading',{name:'Chưa có quyền xem tuần này',exact:true})).toBeVisible();await expect(page.locator('.detail-wrap')).toHaveCount(0);
});

test('clarity-controls: compact review and shortcut reference fit mobile light and dark with large text',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);
  for(const theme of ['light','dark']){
    await page.setViewportSize({width:360,height:640});await page.goto('http://127.0.0.1:5175/dashboard?tab=branding');
    await page.getByRole('button',{name:'Tùy chọn hiển thị',exact:true}).click();const display=page.getByRole('dialog',{name:'Tùy chọn hiển thị',exact:true});await display.getByRole('combobox',{name:'Giao diện',exact:true}).selectOption(theme);await display.getByRole('button',{name:'Lớn',exact:true}).click();await display.getByRole('button',{name:'Phím tắt',exact:true}).click();await expect(page.getByRole('region',{name:'Hướng dẫn phím tắt',exact:true})).toBeVisible();await display.screenshot({path:`review/clarity-controls/shortcuts-${theme}-360.png`});const bounds=(await display.boundingBox())!;expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(360);await page.keyboard.press('Escape');
    await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Thêm',exact:true}).click();await page.getByRole('dialog',{name:'Thêm chức năng'}).getByRole('button',{name:'Thương hiệu',exact:true}).click();await page.getByLabel('Tên trường',{exact:true}).fill('Tên trường kiểm thử rất dài '.repeat(3));await page.getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();const review=page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true});await review.screenshot({path:`review/clarity-controls/confirmation-${theme}-360.png`});const cancel=review.getByRole('button',{name:'Hủy',exact:true}),box=(await cancel.boundingBox())!;expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(640);await cancel.click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }expect(errors).toEqual([]);expect(writes).toEqual([]);
});

test('operate: PC sidebar collapse frees width and keeps named keyboard navigation and mobile tools',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);
  await page.setViewportSize({width:1440,height:960});await page.goto('http://127.0.0.1:5175/dashboard');
  const sidebar=page.locator('.ui-sidebar'),content=page.locator('#dashboard-content');
  const before=(await content.boundingBox())!.width;
  await sidebar.getByRole('button',{name:'Thu gọn thanh bên',exact:true}).click();
  expect((await content.boundingBox())!.width).toBeGreaterThan(before+100);
  const notices=sidebar.getByRole('button',{name:'Thông báo tuần',exact:true});await notices.focus();
  await expect(page.getByRole('tooltip',{name:'Thông báo tuần',exact:true})).toBeVisible();
  await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:'Thông báo tuần',exact:true})).toBeVisible();
  await sidebar.getByRole('button',{name:'Mở rộng thanh bên',exact:true}).click();
  await expect(sidebar.getByRole('button',{name:'Thông báo tuần',exact:true}).locator('.ui-nav-label')).toBeVisible();
  await page.setViewportSize({width:390,height:960});await expect(sidebar).toBeHidden();
  await expect(page.getByRole('navigation',{name:'Điều hướng điện thoại'})).toBeVisible();expect(writes).toEqual([]);
});

test('operate: viewer column choices preserve identity, filters, expansion and complete mobile cards',async({page})=>{
  await interceptMealServices(page);await page.setViewportSize({width:1440,height:960});await page.goto('http://127.0.0.1:5175/newest');
  const workspace=page.getByRole('region',{name:'Bảng chi tiết',exact:true});
  await workspace.getByRole('button',{name:'Cột hiển thị',exact:true}).click();
  const chooser=page.getByRole('dialog',{name:'Cột hiển thị · Bảng chi tiết',exact:true});
  await expect(chooser.getByRole('checkbox',{name:'Họ tên',exact:true})).toBeDisabled();
  await chooser.screenshot({path:'review/operate/column-chooser.png'});
  await chooser.getByRole('checkbox',{name:'Thứ 4 (14/10/2026)',exact:true}).uncheck();await page.keyboard.press('Escape');
  await expect(page.locator('.detail-wrap th').nth(4)).toBeHidden();await expect(page.locator('.detail-wrap tbody tr').first().locator('td').nth(4)).toBeHidden();
  await expect(page.getByRole('status',{name:'Kết quả lọc'})).toContainText('10 lựa chọn món');
  await workspace.getByRole('button',{name:'Phóng rộng bảng chi tiết',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Bảng chi tiết',exact:true}).locator('th').nth(4)).toBeHidden();await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:960});await expect(page.locator('.detail-wrap tbody tr').first().locator('td').nth(4)).toBeVisible();
  await expect(page.getByRole('button',{name:'Cột hiển thị',exact:true})).toBeHidden();
  await page.setViewportSize({width:1440,height:960});await workspace.getByRole('button',{name:'Cột hiển thị',exact:true}).click();
  await chooser.getByRole('button',{name:'Hiện tất cả cột',exact:true}).click();await page.keyboard.press('Escape');await expect(page.locator('.detail-wrap th').nth(4)).toBeVisible();
});

test('operate: Dashboard columns keep actions and independently control response and history tables',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);
  await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('week')?route.fulfill({json:{week:{...weeks[0],dayLabels:days.map(day=>day.day)},responses:[{responseId:'sample-a',name:'Trường An',timestamp:1791467940000,meals:days.map(()=> 'CƠM GÀ'),deletable:true,deleteToken:'synthetic-token'}],history:[{id:'audit-a',entryId:'entry-a',action:'deleted',name:'Trường An',at:1791467940000,actor:'admin@example.com',meals:['CƠM GÀ'],restorable:false}]}}):route.fallback());
  await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
  const responses=page.getByRole('region',{name:'Bảng lượt gửi',exact:true});await responses.getByRole('button',{name:'Cột hiển thị',exact:true}).click();
  const choices=page.getByRole('dialog',{name:'Cột hiển thị · Bảng lượt gửi',exact:true});
  await expect(choices.getByRole('checkbox',{name:'Họ tên',exact:true})).toBeDisabled();await expect(choices.getByRole('checkbox',{name:'Thao tác',exact:true})).toBeDisabled();
  await choices.getByRole('checkbox',{name:'Món đã chọn',exact:true}).uncheck();await page.keyboard.press('Escape');
  await expect(responses.locator('th').nth(2)).toBeHidden();await expect(responses.getByRole('button',{name:'Xem nhanh',exact:true})).toBeVisible();
  const history=page.getByRole('region',{name:'Bảng lịch sử thao tác',exact:true});await history.getByRole('button',{name:'Cột hiển thị',exact:true}).click();
  await page.getByRole('dialog',{name:'Cột hiển thị · Bảng lịch sử thao tác',exact:true}).getByRole('checkbox',{name:'Người thực hiện',exact:true}).uncheck();await page.keyboard.press('Escape');
  await expect(history.locator('th').nth(2)).toBeHidden();await expect(history.locator('th').nth(3)).toBeVisible();expect(writes).toEqual([]);
});

test('operate: filtered viewer empty removes one criterion while keeping day and sort',async({page})=>{
  await page.setViewportSize({width:390,height:960});await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/newest');
  await page.getByRole('button',{name:'Bộ lọc',exact:true}).click();await page.getByRole('combobox',{name:'Ngày',exact:true}).click();await page.getByRole('option',{name:'Thứ 4 (14/10/2026)',exact:true}).click();await page.getByRole('button',{name:'Đóng bộ lọc',exact:true}).click();
  await page.getByRole('combobox',{name:'Họ tên',exact:true}).fill('Không ai tên này');await page.getByRole('heading',{name:'Thực đơn tuần này',exact:true}).click();
  const empty=page.getByRole('status',{name:'Không có kết quả phù hợp',exact:true});await expect(empty).toContainText('Họ tên');await expect(empty).toContainText('Thứ 4 (14/10/2026)');
  await empty.screenshot({path:'review/operate/filtered-empty-mobile.png'});
  await empty.getByRole('button',{name:'Bỏ điều kiện Họ tên',exact:true}).click();await expect(page.getByRole('status',{name:'Kết quả lọc'})).toContainText('2 lượt gửi');
  await expect(page.getByRole('combobox',{name:'Họ tên',exact:true})).toHaveValue('');await expect(page.locator('#day')).toHaveValue('Thứ 4 (14/10/2026)');
});

test('operate: notice draft preview changes device and theme without saving or discarding edits',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard');
  await page.locator('.ui-sidebar').getByRole('button',{name:'Thông báo tuần',exact:true}).click();
  const text='<b>Thứ Tư nghỉ</b>\nĐã điều chỉnh thực đơn';const endsOn=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
  await page.getByRole('textbox',{name:'Nội dung thông báo',exact:true}).fill(text);await page.getByLabel('Hiển thị hết ngày',{exact:true}).fill(endsOn);
  await page.getByRole('button',{name:'Xem trước thông báo',exact:true}).click();
  const preview=page.getByRole('region',{name:'Xem trước thông báo',exact:true});await expect(preview).toContainText('Chưa lưu');
  await preview.getByRole('combobox',{name:'Thiết bị xem trước',exact:true}).selectOption('pc');await preview.getByRole('combobox',{name:'Giao diện xem trước',exact:true}).selectOption('dark');
  const canvas=preview.locator('.notice-preview-canvas');await expect(canvas).toHaveAttribute('data-scheme','dark');await expect(canvas.locator('.notice-text')).toHaveText(text);
  await expect(canvas.locator('b')).toHaveCount(0);await expect(page.getByRole('status',{name:'Chưa lưu thông báo',exact:true})).toBeVisible();
  await expect(page.getByRole('textbox',{name:'Nội dung thông báo',exact:true})).toHaveValue(text);expect(writes).toEqual([]);
});

test('operate: preview of an unchanged saved notice does not claim unsaved work',async({page})=>{
  await interceptMealServices(page);const endsOn=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
  await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('notice')?route.fulfill({json:{notice:{text:'Thông báo đã lưu',endsOn,expiresAt:Date.now()+7*86400000,updatedAt:12}}}):route.fallback());
  await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Thông báo tuần',exact:true}).click();await expect(page.getByRole('textbox',{name:'Nội dung thông báo',exact:true})).toHaveValue('Thông báo đã lưu');await page.getByRole('button',{name:'Xem trước thông báo',exact:true}).click();await expect(page.getByRole('region',{name:'Xem trước thông báo',exact:true})).not.toContainText('Chưa lưu');
});

test('operate: field help is manual, accessible and cannot change Form controls',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.goto('http://127.0.0.1:5175/dashboard');
  await page.locator('.ui-sidebar').getByRole('button',{name:'Điều khiển Form',exact:true}).click();
  const help=page.getByRole('button',{name:'Giải thích Hạn đăng ký',exact:true});await expect(help).toHaveAttribute('aria-expanded','false');
  await help.focus();await page.keyboard.press('Enter');const note=page.getByRole('note',{name:'Hạn đăng ký',exact:true});await expect(note).toContainText('giờ Việt Nam');
  await page.keyboard.press('Escape');await expect(note).toBeHidden();await expect(help).toBeFocused();expect(writes).toEqual([]);
  await page.setViewportSize({width:390,height:700});await help.click();const bounds=(await note.boundingBox())!;expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(390);expect(bounds.y+bounds.height).toBeLessThanOrEqual(700);
});

test('operate: an explicitly empty source is not blamed on search or audit criteria',async({page})=>{
  await interceptMealServices(page);await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('week')?route.fulfill({json:{week:weeks[0],responseCount:0,responses:[],history:[],historyPage:{total:0,matchedCount:0,actions:[]}}}):route.fallback());
  await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
  await page.getByRole('textbox',{name:'Tìm theo họ tên',exact:true}).fill('abc');
  const source=page.getByRole('status',{name:'Tuần đang xem chưa có lượt gửi',exact:true});await expect(source).toBeVisible();await expect(source.getByRole('button')).toHaveCount(0);
  await page.getByRole('textbox',{name:'Người quản trị',exact:true}).fill('no-one');
  const audit=page.getByRole('status',{name:'Chưa có thao tác nào trong tuần này',exact:true});await expect(audit).toBeVisible();await expect(audit.getByRole('button')).toHaveCount(0);
});

test('operate: audit and submission recovery clear only the selected criterion',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);await page.route('**/api/dashboard?**',route=>new URL(route.request().url()).searchParams.has('week')?route.fulfill({json:{week:weeks[0],responseCount:1,responses:[{responseId:'sample-a',name:'Trường An',timestamp:1791467940000,meals:['CƠM GÀ']}],history:[{id:'event-a',action:'restored',name:'Trường An',at:1791467940000,actor:'admin@example.com',note:'ghi chú giữ lại'}]}}):route.fallback());
  await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
  await page.getByRole('textbox',{name:'Tìm theo họ tên',exact:true}).fill('không khớp');const responseEmpty=page.getByRole('status',{name:'Không có kết quả phù hợp',exact:true});await expect(responseEmpty).toBeVisible();await responseEmpty.getByRole('button',{name:'Bỏ điều kiện Họ tên',exact:true}).click();await expect(page.locator('[data-response-id=sample-a]')).toBeVisible();
  await page.getByRole('textbox',{name:'Tìm ghi chú',exact:true}).fill('giữ lại');await page.getByRole('textbox',{name:'Người quản trị',exact:true}).fill('không khớp');
  const audit=page.getByRole('status',{name:'Không có thao tác phù hợp',exact:true});await expect(audit).toContainText('giữ lại');await audit.getByRole('button',{name:'Bỏ điều kiện Người quản trị',exact:true}).click();await expect(page.getByRole('textbox',{name:'Tìm ghi chú',exact:true})).toHaveValue('giữ lại');await expect(page.locator('.dashboard-history-table')).toContainText('ghi chú giữ lại');expect(writes).toEqual([]);
});

test('operate: archive month recovery handles a refreshed list without inventing weeks',async({page})=>{
  await interceptMealServices(page);let older=false;await page.route('**/api/history',route=>route.fulfill({json:{weeks:[older?{weekKey:'2026-09-21_2026-09-25',name:'Tuần 21/09/2026 - 25/09/2026',startDate:'2026-09-21',endDate:'2026-09-25'}:{...weeks[1],startDate:'2026-10-05',endDate:'2026-10-09'}]}}));
  await page.goto('http://127.0.0.1:5175/history');await page.getByRole('combobox',{name:'Tháng',exact:true}).click();await page.getByRole('option',{name:'10/2026',exact:true}).click();older=true;await page.getByRole('button',{name:'Tải lại',exact:true}).click();
  const empty=page.getByRole('status',{name:'Không có tuần trong tháng đã chọn',exact:true});await expect(empty).toContainText('10/2026');await empty.getByRole('button',{name:'Bỏ điều kiện Tháng',exact:true}).click();await expect(page.locator('.archive-weeks')).toContainText('21/09/2026');await expect(page.getByRole('combobox',{name:'Tháng',exact:true})).toHaveValue('Tất cả');
});

test('operate: column projection changes reset safely and optional hiding cannot hide empty recovery',async({page})=>{
  await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/newest');const viewer=page.getByRole('region',{name:'Bảng chi tiết',exact:true});await viewer.getByRole('button',{name:'Cột hiển thị',exact:true}).click();
  const chooser=page.getByRole('dialog',{name:'Cột hiển thị · Bảng chi tiết',exact:true});for(const checkbox of await chooser.getByRole('checkbox').all())if(await checkbox.isEnabled())await checkbox.uncheck();await page.keyboard.press('Escape');await expect(page.locator('.detail-wrap thead').getByRole('columnheader')).toHaveCount(1);
  await page.getByRole('combobox',{name:'Ngày',exact:true}).click();await page.getByRole('option',{name:'Thứ 4 (14/10/2026)',exact:true}).click();await expect(page.locator('.detail-wrap thead').getByRole('columnheader')).toHaveCount(2);
  await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();const responses=page.getByRole('region',{name:'Bảng lượt gửi',exact:true});await responses.getByRole('button',{name:'Cột hiển thị',exact:true}).click();const responseChooser=page.getByRole('dialog',{name:'Cột hiển thị · Bảng lượt gửi',exact:true});await responseChooser.getByRole('checkbox',{name:'Thời điểm gửi',exact:true}).uncheck();await responseChooser.getByRole('checkbox',{name:'Món đã chọn',exact:true}).uncheck();await page.keyboard.press('Escape');await page.getByRole('textbox',{name:'Tìm theo họ tên',exact:true}).fill('Không có');await expect(responses.getByRole('status',{name:'Không có kết quả phù hợp',exact:true})).toBeVisible();
});

test('operate: PC and mobile light-dark states stay readable with independent draft preview themes',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme:'light',motion:'off'}));});
  for(const width of [1440,768,360])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:800});await page.goto('http://127.0.0.1:5175/dashboard');await page.getByRole('button',{name:'Tùy chọn hiển thị',exact:true}).click();const display=page.getByRole('dialog',{name:'Tùy chọn hiển thị',exact:true});await display.getByRole('combobox',{name:'Giao diện',exact:true}).selectOption(theme);await display.getByRole('button',{name:'Lớn',exact:true}).click();await page.keyboard.press('Escape');
    async function navigate(label:string){if(width>700)await page.locator('.ui-sidebar').getByRole('button',{name:label,exact:true}).click();else{await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Thêm',exact:true}).click();await page.getByRole('dialog',{name:'Thêm chức năng'}).getByRole('button',{name:label,exact:true}).click();}}
    if(width>700){await page.locator('.ui-sidebar').getByRole('button',{name:'Thu gọn thanh bên',exact:true}).click();await page.screenshot({path:`review/operate/sidebar-${width}-${theme}.png`});}
    await navigate('Thông báo tuần');await page.getByRole('textbox',{name:'Nội dung thông báo',exact:true}).fill(('Thứ Tư nghỉ. Đã điều chỉnh thực đơn.\n').repeat(6));await page.getByLabel('Hiển thị hết ngày',{exact:true}).fill(new Date(Date.now()+7*86400000).toISOString().slice(0,10));await page.getByRole('button',{name:'Xem trước thông báo',exact:true}).click();
    const preview=page.getByRole('region',{name:'Xem trước thông báo',exact:true}),canvas=preview.locator('.notice-preview-canvas');for(const scheme of ['light','dark']){await preview.getByRole('combobox',{name:'Giao diện xem trước',exact:true}).selectOption(scheme);await expect(page.locator('html')).toHaveAttribute('data-color-scheme',theme);await expect(canvas).toHaveCSS('background-color',scheme==='dark'?'rgb(13, 21, 23)':'rgb(245, 248, 249)');await canvas.screenshot({path:`review/operate/notice-${width}-${theme}-${scheme}.png`});}
    const help=page.getByRole('button',{name:'Giải thích Ngày hết hạn thông báo',exact:true});await help.click();const note=page.getByRole('note',{name:'Ngày hết hạn thông báo',exact:true});await expect(note).toBeVisible();await note.screenshot({path:`review/operate/help-${width}-${theme}.png`});await page.keyboard.press('Escape');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);expect(writes).toEqual([]);
});

test('viewer counts submissions separately from meal choices across filters and mobile tabs',async({page})=>{
  await page.setViewportSize({width:390,height:960});
  await interceptMealServices(page);
  await page.goto('http://127.0.0.1:5175/newest');
  const counts=page.getByRole('status',{name:'Kết quả lọc'});
  await expect(counts).toContainText('2 lượt gửi');
  await expect(counts).toContainText('10 lựa chọn món');
  await page.getByRole('tab',{name:'Tổng hợp',exact:true}).click();
  await expect(page.locator('.ui-day-card').first().locator('[data-slot=badge]').first()).toHaveText('1 lựa chọn');
  await page.getByRole('tab',{name:'Chi tiết',exact:true}).click();
  await expect(counts).toBeVisible();
  await page.getByRole('button',{name:'Bộ lọc',exact:true}).click();
  await page.getByRole('combobox',{name:'Món',exact:true}).fill('CƠM GÀ');
  await page.getByRole('option',{name:'CƠM GÀ',exact:true}).click();
  await page.getByRole('button',{name:'Đóng bộ lọc',exact:true}).click();
  await expect(counts).toContainText('1 lượt gửi');
  await expect(counts).toContainText('5 lựa chọn món');
  await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(5);
});

test('registration context keeps closed viewed week separate from open next-week Form',async({page})=>{
  await page.setViewportSize({width:390,height:960});
  await interceptMealServices(page);
  await page.route('**/api/viewer?**',async route=>{
    const body={headers:['Timestamp','Họ tên',...days.map(day=>day.day)],rows:[],days,calendarDays:days.map(day=>day.day),formStatus:'closed',formUrl:weeks[0].formUrl,nextForm:{formStatus:'open',formUrl:'https://docs.google.com/forms/d/e/next-synthetic/viewform',calendarDays:['Thứ 2 (19/10/2026)','Thứ 6 (23/10/2026)']}};
    await route.fulfill({json:body});
  });
  await page.goto('http://127.0.0.1:5175/newest');
  const viewed=page.getByRole('group',{name:'Form tuần đang xem',exact:true});
  const target=page.getByRole('group',{name:'Form đăng ký tuần sau',exact:true});
  await expect(viewed).toContainText('12/10/2026 – 16/10/2026');
  await expect(viewed).toContainText('Form đã đóng');
  await expect(viewed.getByRole('link')).toHaveCount(0);
  await expect(target).toContainText('19/10/2026 – 23/10/2026');
  await expect(target).toContainText('Form đang mở');
  await expect(target.getByRole('link',{name:/Đăng ký tuần sau/})).toHaveAttribute('href','https://docs.google.com/forms/d/e/next-synthetic/viewform');
  await page.screenshot({path:'review/production/registration-context-mobile.png',fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('mobile actual-day labels expand on tap without changing filters and stay full on PC',async({page})=>{
  await page.setViewportSize({width:390,height:960});
  await interceptMealServices(page);
  await page.goto('http://127.0.0.1:5175/newest');
  await page.getByRole('tab',{name:'Tổng hợp',exact:true}).click();
  const label=page.locator('.ui-day-card').nth(2).locator('.day-label-toggle');
  await expect(label).toHaveText('T4 · 14/10');
  await label.click();
  await expect(label).toHaveText('Thứ 4 (14/10/2026)');
  await expect(page.getByRole('status',{name:'Kết quả lọc'})).toContainText('2 lượt gửi');
  await page.getByRole('tab',{name:'Chi tiết',exact:true}).click();
  await expect(page.locator('.detail-wrap tbody tr').first().getByRole('button',{name:/Thứ 4 \(14\/10\/2026\)/})).toHaveText('T4 · 14/10');
  await page.setViewportSize({width:1440,height:960});
  await expect(page.locator('.detail-wrap thead')).toContainText('Thứ 4 (14/10/2026)');
  await expect(page.locator('.ui-day-card').nth(2).locator('.day-label-toggle')).toBeHidden();await expect(page.locator('.ui-day-card').nth(2).locator('.summary-meal-button').first()).toBeVisible();
});

test('What is new opens only on request and resets when display menu closes',async({page})=>{
  const writes:object[]=[];
  await interceptMealServices(page,'owner','#357185',writes);
  await page.goto('http://127.0.0.1:5175/newest');
  const menu=page.getByRole('dialog',{name:'Tùy chọn hiển thị',exact:true});
  await expect(page.getByRole('region',{name:'Điểm mới của giao diện'})).toBeHidden();
  await page.getByRole('button',{name:'Tùy chọn hiển thị',exact:true}).click();
  const button=menu.getByRole('button',{name:'Có gì mới?',exact:true});
  await expect(button).toHaveAttribute('aria-expanded','false');
  await button.click();
  const notes=page.getByRole('region',{name:'Điểm mới của giao diện'});
  await expect(notes).toBeVisible();
  await expect(notes).toContainText('lượt gửi');
  await expect(notes).toContainText('tuần sau');
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Tùy chọn hiển thị',exact:true}).click();
  await expect(button).toHaveAttribute('aria-expanded','false');
  await expect(notes).toBeHidden();
  expect(writes).toEqual([]);
});

test('mobile Dashboard holiday details and quick view preserve actual dates and meals',async({page})=>{
  const writes:object[]=[];
  await page.setViewportSize({width:390,height:960});
  await interceptMealServices(page,'owner','#357185',writes);
  await page.route('**/api/dashboard?**',route=>{
    if(!new URL(route.request().url()).searchParams.has('week'))return route.fallback();
    return route.fulfill({json:{week:{...weeks[0],dayLabels:['Thứ 4 (14/10/2026)','Thứ 6 (16/10/2026)'],closedDays:['Thứ 2 (12/10/2026)']},responseCount:1,responseIds:['sample-a'],responses:[{responseId:'sample-a',name:'Trường An',timestamp:1791467940000,meals:['CƠM GÀ','BÚN BÒ'],deletable:true,deleteToken:'synthetic-token',rowNumber:2}],history:[]}});
  });
  await page.goto('http://127.0.0.1:5175/dashboard');
  await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Lượt gửi',exact:true}).click();
  const row=page.locator('[data-response-id="sample-a"]');
  const firstDay=row.locator('.response-meals>div').filter({has:page.getByRole('button',{name:/Thứ 4/})});
  await expect(firstDay.getByRole('button',{name:/Thứ 4/})).toHaveText('T4 · 14/10');
  await expect(firstDay.locator('dd')).toHaveText('CƠM GÀ');
  await row.getByRole('button',{name:'Xem nhanh',exact:true}).click();
  const quick=page.getByRole('dialog',{name:'Chi tiết lượt gửi'});
  const lastDay=quick.locator('.response-meals>div').last();
  await expect(lastDay.locator('dd')).toHaveText('BÚN BÒ');
  await lastDay.getByRole('button',{name:/Thứ 6/}).click();
  await expect(lastDay.getByRole('button',{name:/Thứ 6/})).toHaveText('Thứ 6 (16/10/2026)');
  await expect(quick).toContainText('Không phục vụ: Thứ 2 (12/10/2026)');
  await quick.getByRole('button',{name:'Đóng',exact:true}).click();
  await expect(row.getByRole('button',{name:'Xem nhanh',exact:true})).toBeFocused();
  expect(writes).toEqual([]);
});

test('new viewer contexts and manual release notes fit large-text light and dark screens',async({page})=>{
  await interceptMealServices(page);
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme:'system',motion:'off'}));localStorage.setItem('meal-text-size','large');});
  for(const width of [1440,390,320])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:900});
    await page.goto('http://127.0.0.1:5175/newest');
    await expect(page.getByRole('group',{name:'Form tuần đang xem'})).toContainText('Form đã đóng');
    await page.getByRole('button',{name:'Tùy chọn hiển thị',exact:true}).click();
    const menu=page.getByRole('dialog',{name:'Tùy chọn hiển thị',exact:true});
    await menu.getByRole('combobox',{name:'Giao diện',exact:true}).selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-color-scheme',theme);
    await menu.getByRole('button',{name:'Lớn',exact:true}).click();
    await menu.getByRole('button',{name:'Có gì mới?',exact:true}).click();
    const notes=page.getByRole('region',{name:'Điểm mới của giao diện'});
    await notes.locator('li').last().scrollIntoViewIfNeeded();
    await expect(notes.locator('li').last()).toBeInViewport();
    const overflow=await menu.evaluate(el=>el.scrollWidth>el.clientWidth+1);
    expect(overflow,`menu ${width} ${theme}`).toBe(false);
    await menu.screenshot({path:`review/production/whats-new-${width}-${theme}.png`});
    await page.keyboard.press('Escape');
    await page.locator('.form-access').screenshot({path:`review/production/form-context-${width}-${theme}.png`});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

test('real Dashboard has grouped desktop navigation with all nine authorized tools', async ({page}) => {
  await interceptMealServices(page);
  await page.goto('http://127.0.0.1:5175/dashboard');
  const nav=page.locator('aside').getByRole('navigation',{name:'Quản trị',exact:true});
  await expect(nav).toBeVisible();
  await expect(page.locator('.ui-week-list').getByRole('heading',{name:'Tuần 05/10/2026 - 09/10/2026',exact:true})).toHaveCount(1);
  for(const name of ['Tổng quan','Tạo tuần bằng OCR','Lượt gửi & lịch sử','Điều khiển Form','Thông báo tuần','Đối soát','Thương hiệu','Hệ thống','Quyền Gmail']) await expect(nav.getByRole('button',{name,exact:true})).toBeVisible();
  await nav.getByRole('button',{name:'Thương hiệu',exact:true}).click();
  await expect(nav.getByRole('button',{name:'Thương hiệu',exact:true})).toHaveCSS('background-color','rgb(53, 113, 133)');
  await expect(page.getByLabel('Tên trường',{exact:true})).toHaveValue('Trường minh họa');
  await nav.getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Lượt gửi và lịch sử thao tác'})).toBeVisible();
});

test('real delete confirmation retains selected identity and reason, and cancel never sends a write',async({page})=>{
  const writes:object[]=[];
  await interceptMealServices(page,'owner','#357185',writes);
  await page.goto('http://127.0.0.1:5175/dashboard');
  await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
  await page.locator('[data-response-id="sample-a"]').getByRole('button',{name:'Thao tác lượt gửi',exact:true}).click();
  await page.getByRole('button',{name:'Xóa lượt này',exact:true}).click();
  const confirmation=page.getByRole('dialog',{name:'Xác nhận thao tác'});
  await expect(confirmation).toContainText('Trường An');
  await confirmation.getByRole('button',{name:'Hủy',exact:true}).click();
  expect(writes).toEqual([]);
  await page.locator('[data-response-id="sample-a"]').getByRole('button',{name:'Thao tác lượt gửi',exact:true}).click();
  await page.getByRole('button',{name:'Xóa lượt này',exact:true}).click();
  await confirmation.getByRole('textbox',{name:'Lý do (tùy chọn)',exact:true}).fill('Bản ghi thử');
  await confirmation.getByRole('button',{name:'Xóa lượt gửi này',exact:true}).click();
  await expect.poll(()=>writes.length).toBe(1);
  expect(writes).toEqual([{method:'DELETE',weekKey:key,responseId:'sample-a',deleteToken:'synthetic-token',reason:'Bản ghi thử'}]);
});

test('production visual matrix: both surfaces, all owner panels and brand themes',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  for(const width of [1440,768,390,360])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:960});
    await page.addInitScript(({theme})=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));localStorage.setItem('meal-viewer-summary-open','true');},{theme});
    await interceptMealServices(page);
    for(const path of ['/dashboard','/newest','/history']){
      await page.goto('http://127.0.0.1:5175'+path);
      await expect(page.locator('main h1')).toBeVisible();
      if(path==='/dashboard')await expect(page.locator('.ui-overview')).toBeVisible();
      if(path==='/dashboard'&&width===768){const heading=page.locator('.ui-week-list h2').first();const size=await heading.evaluate(el=>({height:el.getBoundingClientRect().height,line:parseFloat(getComputedStyle(el).lineHeight)}));expect(size.height).toBeLessThanOrEqual(size.line*3);}
      if(path==='/newest')await expect(page.locator('.ui-day-card').first()).toBeVisible();
      if(path==='/history')await expect(page.locator('.archive-weeks li')).toHaveCount(1);
      await page.evaluate(()=>document.fonts.ready);
      const sizes=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
      expect(sizes.scroll,`${path} ${width} ${theme}`).toBeLessThanOrEqual(sizes.width);
      await page.screenshot({path:`review/production/${path.slice(1)}-${width}-${theme}.png`,fullPage:true});
    }
  }
  for(const theme of ['light','dark']){
    await page.setViewportSize({width:1440,height:960});
    await page.addInitScript(({theme})=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));},{theme});
    await page.goto('http://127.0.0.1:5175/dashboard');
    const nav=page.locator('.ui-sidebar nav');
    for(const name of ['Tạo tuần bằng OCR','Lượt gửi & lịch sử','Điều khiển Form','Thông báo tuần','Đối soát','Thương hiệu','Hệ thống','Quyền Gmail']){
      await nav.getByRole('button',{name,exact:true}).click();
      await expect(page.locator('.dashboard-panel h2').first()).toBeVisible();
      if(name==='Lượt gửi & lịch sử')await expect(page.locator('[data-response-id]')).toHaveCount(2);
      if(name==='Thông báo tuần')await expect(page.getByRole('textbox',{name:'Nội dung thông báo'})).toBeEnabled();
      await page.evaluate(()=>Promise.all(document.getAnimations().filter(animation=>animation.effect?.getComputedTiming().iterations!==Infinity).map(animation=>animation.finished.catch(()=>{}))));
      await page.screenshot({path:`review/production/panel-${name.replaceAll(/[^\p{L}\p{N}]/gu,'-')}-${theme}.png`,fullPage:true});
    }
  }
  for(const color of ['#b91c1c','#ffffff','#087f5b']){
    await interceptMealServices(page,'owner',color);
    await page.goto('http://127.0.0.1:5175/newest');
    await expect(page.locator('.ui-day-card').first()).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--meal-ui-primary').trim())).toBe(color);
  }
  expect(errors).toEqual([]);
});

test('real mobile Dashboard More exposes only permitted tools and retains account context',async({page})=>{
  await page.setViewportSize({width:390,height:960});
  await interceptMealServices(page,'viewer');
  await page.goto('http://127.0.0.1:5175/dashboard');
  const nav=page.getByRole('navigation',{name:'Điều hướng điện thoại'});
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('button',{name:'Tạo tuần',exact:true})).toHaveCount(0);
  await nav.getByRole('button',{name:'Thêm',exact:true}).click();
  const more=page.getByRole('dialog',{name:'Thêm chức năng'});
  await expect(more).toContainText('admin@example.com');
  await expect(more.getByRole('button',{name:'Quyền Gmail',exact:true})).toHaveCount(0);
  await more.getByRole('button',{name:'Đối soát',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Đối soát Form–Sheet'})).toBeVisible();
});

test('real viewer displays weekly day cards while filtering and retains preferences in header',async({page})=>{
  await page.setViewportSize({width:390,height:960});
  await page.addInitScript(()=>localStorage.setItem('meal-viewer-summary-open','true'));
  await interceptMealServices(page);
  await page.goto('http://127.0.0.1:5175/newest');
  await expect(page.locator('.ui-day-card').first()).toContainText('12/10/2026');
  await page.getByRole('combobox',{name:'Họ tên',exact:true}).fill('truong');
  await page.getByRole('heading',{name:'Thực đơn tuần này'}).click();
  await expect(page.locator('.detail-wrap')).toContainText('Trường An');
  await expect(page.locator('.detail-wrap')).not.toContainText('Minh Anh');
  await expect(page.locator('.viewer-header').getByRole('button',{name:'Tùy chọn hiển thị'})).toBeVisible();
  const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,outside:[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(el=>({tag:el.tagName,class:el.className,right:el.getBoundingClientRect().right}))}));
  expect(geometry.scroll,JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.width);
});

test('mobile detail cards keep one surface and type hierarchy across full, day and meal filters',async({page})=>{
  for(const theme of ['light','dark']) {
    await page.setViewportSize({width:390,height:960});
    await page.addInitScript(theme=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));},theme);
    await interceptMealServices(page);
    await page.goto('http://127.0.0.1:5175/newest');
    const rows=page.locator('.detail-wrap tbody tr');
    await expect(rows).toHaveCount(2);
    async function checkCards() {
      const styles=await rows.evaluateAll(elements=>elements.map(row=>({
        surface:getComputedStyle(row).backgroundColor,
        fields:[...row.querySelectorAll('td')].map(cell=>({background:getComputedStyle(cell).backgroundColor,weight:getComputedStyle(cell).fontWeight,size:parseFloat(getComputedStyle(cell).fontSize)}))
      })));
      expect.soft(new Set(styles.map(row=>row.surface)).size,'row striping must not turn adjacent cards into different surfaces').toBe(1);
      const fields=styles.flatMap(row=>row.fields);
      expect.soft([...new Set(fields.map(field=>field.background))],'table cell fills must not appear inside a mobile card').toEqual(['rgba(0, 0, 0, 0)']);
      expect.soft([...new Set(fields.map(field=>field.weight))],'filtered columns must not inherit first-two-column emphasis').toEqual(['400']);
      expect.soft(Math.min(...fields.map(field=>field.size)),'mobile values must use the readable body size').toBeGreaterThanOrEqual(16);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
    await checkCards();
    await page.getByRole('button',{name:'Bộ lọc',exact:true}).click();
    await page.getByRole('combobox',{name:'Ngày',exact:true}).click();
    await page.getByRole('option',{name:'Thứ 4 (14/10/2026)',exact:true}).click();
    await page.getByRole('button',{name:'Đóng bộ lọc',exact:true}).click();
    await expect(rows.first().locator('td')).toHaveCount(2);
    await expect(rows.first()).toContainText('Trường An');
    await checkCards();
    await page.locator('.detail-wrap').screenshot({path:`review/production/detail-day-${theme}.png`});
    await page.getByRole('button',{name:'Xóa bộ lọc',exact:true}).click();
    await page.getByRole('button',{name:'Bộ lọc',exact:true}).click();
    await page.getByRole('combobox',{name:'Món',exact:true}).fill('CƠM GÀ');
    await page.getByRole('button',{name:'Đóng bộ lọc',exact:true}).click();
    await expect(rows).toHaveCount(5);
    await expect(rows.first().locator('td')).toHaveCount(3);
    await checkCards();
    await page.getByRole('button',{name:'Xóa bộ lọc',exact:true}).click();
    await page.getByRole('combobox',{name:'Sắp xếp',exact:true}).click();
    await page.getByRole('option',{name:'Cũ nhất',exact:true}).click();
    await expect(rows.first()).toContainText('Minh Anh');
    await page.setViewportSize({width:360,height:960});
    await checkCards();
    await page.locator('.detail-wrap').screenshot({path:`review/production/detail-week-${theme}.png`});
  }
});

test('Dashboard week searches display the committed week in every shared picker',async({page})=>{
  await interceptMealServices(page);
  await page.goto('http://127.0.0.1:5175/dashboard');
  const nav=page.locator('.ui-sidebar nav');
  const current='Tuần 12/10/2026 - 16/10/2026';
  const previous='Tuần 05/10/2026 - 09/10/2026';
  for(const tab of ['Thông báo tuần','Lượt gửi & lịch sử','Điều khiển Form','Đối soát','Hệ thống']) {
    await nav.getByRole('button',{name:tab,exact:true}).click();
    const picker=page.getByRole('combobox',{name:'Tìm tuần',exact:true});
    await expect.soft(picker,'the selected week belongs in the input, not an extra line').toHaveValue(current);
    await picker.click();
    await expect(page.getByRole('option',{name:previous,exact:true})).toBeVisible();
    await picker.fill('05/10');
    await page.getByRole('option',{name:previous,exact:true}).click();
    await expect.soft(picker).toHaveValue(previous);
    await expect(page.locator('.selected-week-name')).toHaveCount(0);
    await picker.click();
    await picker.fill('không có tuần này');
    await page.keyboard.press('Escape');
    await expect(picker,'canceling a search must restore the committed selection').toHaveValue(previous);
    await picker.click();
    await page.getByRole('option',{name:current,exact:true}).click();
  }
  const selectionFits=()=>page.getByRole('combobox',{name:'Tìm tuần',exact:true}).evaluate(input=>{
    const element=input as HTMLInputElement,style=getComputedStyle(element),canvas=document.createElement('canvas'),context=canvas.getContext('2d')!;
    context.font=style.font;
    return context.measureText(element.value).width<=element.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
  });
  expect(await selectionFits(),'the chosen date range must not be clipped by a narrow desktop picker').toBe(true);
  await page.locator('.dashboard-week-picker').screenshot({path:'review/production/week-picker-desktop.png'});
  await page.setViewportSize({width:390,height:960});
  await page.evaluate(()=>localStorage.setItem('meal-appearance',JSON.stringify({theme:'dark',motion:'off'})));
  await page.reload();
  await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Thêm',exact:true}).click();
  await page.getByRole('dialog',{name:'Thêm chức năng'}).getByRole('button',{name:'Thông báo tuần',exact:true}).click();
  const picker=page.getByRole('combobox',{name:'Tìm tuần',exact:true});
  await picker.click();
  await page.getByRole('option',{name:previous,exact:true}).click();
  await expect(picker).toHaveValue(previous);
  expect(await selectionFits(),'the mobile picker must show the full selected week').toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.getByRole('textbox',{name:'Nội dung thông báo'})).toBeEnabled();
  await page.locator('.dashboard-panel').screenshot({path:'review/production/week-picker-mobile-dark.png'});
});

test('large text, next-week empty, anonymous and retry states preserve real viewer boundaries',async({page})=>{
  await page.setViewportSize({width:360,height:960});
  await page.addInitScript(()=>{localStorage.setItem('meal-appearance',JSON.stringify({theme:'dark',motion:'off'}));});
  await interceptMealServices(page);
  await page.goto('http://127.0.0.1:5175/newest');
  await page.getByRole('button',{name:'Tùy chọn hiển thị'}).click();
  await page.getByRole('button',{name:'Lớn',exact:true}).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveAttribute('data-text-size','large');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'review/production/viewer-large-dark.png',fullPage:true});
  await page.route('**/api/viewer**',route=>route.fulfill({status:404,json:{error:'Chưa có thực đơn cho tuần sau.'}}));
  await page.goto('http://127.0.0.1:5175/next');
  await expect(page.getByRole('heading',{name:'Chưa có thực đơn cho tuần sau.'})).toBeVisible();
  expect((await page.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).boundingBox())!.width).toBeGreaterThanOrEqual(200);
  await page.screenshot({path:'review/production/next-empty-dark.png',fullPage:true});
  await page.route('**/api/session',route=>route.fulfill({status:200,json:{authenticated:false}}));
  await page.goto('http://127.0.0.1:5175/newest');
  await expect(page.getByRole('button',{name:'Tiếp tục với tư cách khách'})).toBeVisible();
  await page.screenshot({path:'review/production/guest-login-dark.png',fullPage:true});
  await page.route('**/api/session',route=>route.fulfill({status:503,json:{error:'Máy chủ tạm thời không kết nối được'}}));
  await page.goto('http://127.0.0.1:5175/dashboard');
  await expect(page.getByRole('button',{name:'Kiểm tra lại',exact:true})).toBeVisible();
  await expect(page.getByText('Thông tin phiên chưa bị xóa.',{exact:false})).toBeVisible();
  await page.screenshot({path:'review/production/session-error-dark.png',fullPage:true});
});

test('Dashboard removes duplicate chrome and consolidates owner setup and authorization in System',async({page})=>{
  await interceptMealServices(page);
  await page.goto('http://127.0.0.1:5175/dashboard');
  await expect(page.locator('.ui-overview')).toBeVisible();
  await expect(page.locator('.school-brand')).toHaveCount(0);
  const header=page.locator('.dashboard-header');
  await expect(header.getByRole('button',{name:'Đăng xuất',exact:true})).toHaveCount(0);
  await expect(header.getByRole('link')).toHaveCount(0);
  await expect(header.getByRole('button',{name:'Cấp quyền Apps Script',exact:true})).toHaveCount(0);
  await expect(page.locator('.ui-sidebar').getByRole('button',{name:'Đăng xuất',exact:true})).toBeVisible();
  await page.locator('.ui-sidebar').getByRole('button',{name:'Hệ thống',exact:true}).click();
  await expect(page.locator('.dashboard-panel').first().getByRole('button',{name:'Cấp quyền Apps Script',exact:true})).toBeVisible();
  await expect(page.locator('.setup-steps li')).toHaveCount(7);
  await page.goto('http://127.0.0.1:5175/setup');
  await expect(page.locator('.setup-steps li')).toHaveCount(7);
});

test('explicit Apps Script OCR permission failures offer the owner a scoped authorization action',async({page})=>{
  await interceptMealServices(page);
  await page.route('**/api/dashboard',async route=>{
    if(route.request().method()==='POST'&&route.request().postDataJSON()?.action==='ocr')return route.fulfill({status:400,json:{error:'You do not have permission to call UrlFetchApp.fetch. Required permissions: https://www.googleapis.com/auth/script.external_request'}});
    return route.fallback();
  });
  await page.goto('http://127.0.0.1:5175/dashboard?tab=create');
  await expect(page.getByRole('button',{name:'Chọn ảnh thực đơn',exact:true})).toBeEnabled();
  const image=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;canvas.getContext('2d')!.fillRect(0,0,4,4);return canvas.toDataURL('image/png').split(',')[1];});
  await page.locator('input[type=file]').first().setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});
  await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();
  const message=page.locator('.dashboard-message');
  await expect(message).toContainText('Thiếu quyền Apps Script');
  await expect(message.getByRole('button',{name:'Cấp quyền Apps Script',exact:true})).toBeVisible();
});

test('mobile filters, week links and two-line registration/status controls stay aligned',async({page})=>{
  await page.setViewportSize({width:360,height:960});
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme:'dark',motion:'off'}));});
  await interceptMealServices(page);
  const nextForm={formStatus:'open',formUrl:weeks[0].formUrl,calendarDays:['Thứ 2 (19/10/2026)','Thứ 6 (23/10/2026)']};
  await page.route('**/api/viewer**',route=>route.fulfill({status:200,json:{headers:['Thời điểm','Họ tên',...days.map(day=>day.day)],rows:[['08/10/2026 20:59','Trường An',...days.map(()=> 'CƠM GÀ')]],days,formStatus:'closed',formUrl:weeks[0].formUrl,nextForm}}));
  await page.goto('http://127.0.0.1:5175/newest');
  await expect(page.getByRole('link',{name:/Đăng ký tuần sau/})).toBeVisible();
  await expect(page.getByRole('link',{name:/Đăng ký tuần sau/})).toHaveCSS('background-color','rgb(53, 113, 133)');
  await page.getByRole('button',{name:'Bộ lọc',exact:true}).click();
  await page.getByRole('combobox',{name:'Ngày',exact:true}).click();
  await page.getByRole('option',{name:'Thứ 4 (14/10/2026)',exact:true}).click();
  const geometry=await page.evaluate(()=>{
    const filter=document.querySelector('.mobile-filter-toggle')!,label=filter.querySelector('span')!,name=document.querySelector('#name')!;
    const actions=[...document.querySelectorAll('.form-access .meal-form-link,.form-access .form-status')].map(el=>el.getBoundingClientRect().height);
    return {labelHeight:label.getBoundingClientRect().height,lineHeight:parseFloat(getComputedStyle(label).lineHeight),aligned:Math.abs(filter.getBoundingClientRect().bottom-name.getBoundingClientRect().bottom),actions,nav:[...document.querySelectorAll('.viewer-navigation a')].map(el=>el.getBoundingClientRect().height),overflow:document.documentElement.scrollWidth>innerWidth};
  });
  expect.soft(geometry.labelHeight).toBeLessThanOrEqual(geometry.lineHeight+1);
  expect.soft(geometry.aligned).toBeLessThanOrEqual(1);
  expect.soft(Math.max(...geometry.actions)-Math.min(...geometry.actions)).toBeLessThanOrEqual(1);
  expect.soft(Math.max(...geometry.nav)-Math.min(...geometry.nav)).toBeLessThanOrEqual(1);
  expect(geometry.overflow).toBe(false);
  await page.screenshot({path:'review/production/controls-mobile-dark.png',fullPage:true});
  await page.route('**/api/viewer**',route=>route.fulfill({status:200,json:{headers:['Thời điểm','Họ tên',...days.map(day=>day.day)],rows:[],days,formStatus:'closed',formUrl:''}}));
  await page.reload();
  const unavailable=page.getByText('Form chưa sẵn sàng',{exact:true});
  await expect(unavailable).toBeVisible();
  expect(Math.abs((await unavailable.boundingBox())!.height-(await page.locator('.form-status').boundingBox())!.height)).toBeLessThanOrEqual(1);
});

test('Google sign-in respects appearance and resizes its official widget without changing session flow',async({page})=>{
  await interceptMealServices(page);
  await page.route('**/api/session',route=>route.fulfill({status:200,json:{authenticated:false}}));
  await page.addInitScript(()=>{
    localStorage.setItem('meal-appearance',JSON.stringify({theme:'dark',motion:'off'}));
    (window as any).__gsi={calls:[],initializations:0};
    (window as any).google={accounts:{id:{initialize(){(window as any).__gsi.initializations++;},renderButton(root:HTMLElement,options:any){
      (window as any).__gsi.calls.push(options);
      const frame=document.createElement('iframe');frame.title='Đăng nhập bằng Google';frame.style.width=(Number(options.width)+20)+'px';frame.style.height='44px';root.append(frame);
    }}}};
  });
  await page.setViewportSize({width:1440,height:960});
  await page.goto('http://127.0.0.1:5175/newest');
  await expect(page.locator('.google-signin iframe')).toBeVisible();
  expect(await page.evaluate(()=>(window as any).__gsi.calls.at(-1).theme)).toBe('outline_dark');
  await page.setViewportSize({width:360,height:844});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const fit=await page.locator('.google-signin').evaluate(root=>root.querySelector('iframe')!.getBoundingClientRect().width<=root.getBoundingClientRect().width);
  expect(fit).toBe(true);
  await page.getByRole('button',{name:'Tùy chọn hiển thị'}).click();
  await page.getByRole('combobox',{name:'Giao diện',exact:true}).selectOption('light');
  await expect.poll(()=>page.evaluate(()=>(window as any).__gsi.calls.at(-1).theme)).toBe('outline');
  expect(await page.evaluate(()=>(window as any).__gsi.initializations)).toBe(1);
});

test('mobile submissions and audit share the panel palette without alternating nested card fills',async({page})=>{
  await page.setViewportSize({width:390,height:960});
  for(const theme of ['light','dark']) {
    await page.addInitScript(theme=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));},theme);
    await interceptMealServices(page);
    await page.route('**/api/dashboard?week=**',route=>route.fulfill({status:200,json:{
      week:{...weeks[0],dayLabels:days.map(day=>day.day)},responseCount:2,responseIds:['sample-a','sample-b'],responses:[
        {responseId:'sample-a',name:'Trường An',timestamp:1791467940000,meals:days.map(()=> 'CƠM GÀ'),deletable:false,rowNumber:2},
        {responseId:'sample-b',name:'Minh Anh',timestamp:1791467880000,meals:days.map(()=> 'BÚN BÒ'),deletable:false,rowNumber:3}
      ],history:[{id:'audit-a',action:'form-closed',at:1791467940000,actor:'admin@example.com',note:'Đã chốt đăng ký'},{id:'audit-b',action:'form-deadline-updated',at:1791467880000,actor:'admin@example.com',note:'Đã đổi hạn đăng ký'}]
    }}));
    await page.goto('http://127.0.0.1:5175/dashboard');
    await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Lượt gửi',exact:true}).click();
    await expect(page.locator('.dashboard-history-table [data-audit-event]')).toHaveCount(2);
    const weekFits=await page.getByRole('combobox',{name:'Tìm tuần',exact:true}).evaluate(input=>{const element=input as HTMLInputElement,style=getComputedStyle(element),context=document.createElement('canvas').getContext('2d')!;context.font=style.font;return context.measureText(element.value).width<=element.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);});
    expect.soft(weekFits,'the submissions toolbar must not truncate the committed week').toBe(true);
    const colors=await page.evaluate(()=>{
      const panel=document.querySelector('.dashboard-panel')!,toolbar=document.querySelector('.dashboard-sticky-tools')!;
      return {panel:getComputedStyle(panel).backgroundColor,toolbar:getComputedStyle(toolbar).backgroundColor,rows:[...new Set([...document.querySelectorAll('.dashboard-response-table tbody tr,.dashboard-history-table tbody tr')].map(row=>getComputedStyle(row).backgroundColor))]};
    });
    expect.soft(colors.toolbar).toBe(colors.panel);
    expect.soft(colors.rows).toEqual([colors.panel]);
    await page.screenshot({path:`review/production/submissions-audit-mobile-${theme}.png`,fullPage:true});
  }
});

test('full motion explains menus with bounded entry, fast disclosure close and interruption',async({page})=>{
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme:'dark',motion:'full'}));});
  await interceptMealServices(page);
  await page.goto('http://127.0.0.1:5175/newest');
  await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(2);
  const trigger=page.getByRole('button',{name:'Tùy chọn hiển thị'}),menu=page.locator('.comfort-menu');
  await trigger.click();
  const motion=await menu.evaluate(el=>el.getAnimations().map(animation=>({duration:Number(animation.effect!.getTiming().duration),frames:animation.effect!.getKeyframes()})));
  expect(motion.length,'the native menu should have a real opening transition').toBeGreaterThan(0);
  expect(Math.max(...motion.map(item=>item.duration))).toBeLessThanOrEqual(260);
  for(const time of [0,100,240]) {
    await menu.evaluate((el,time)=>el.getAnimations().forEach(animation=>{animation.pause();animation.currentTime=time;}),time);
    await page.screenshot({path:`review/motion/menu-${time}ms.png`});
  }
  await page.keyboard.press('Escape');
  await trigger.click();
  expect(await menu.evaluate(el=>el.matches(':popover-open'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(menu).toHaveAttribute('inert','');
  const name=page.getByRole('combobox',{name:'Họ tên',exact:true});
  await name.click();
  const properties=await page.locator('#name-options').evaluate(el=>getComputedStyle(el).transitionProperty);
  expect(properties).not.toMatch(/height|padding|width/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#name-options')).not.toHaveClass(/closing/,{timeout:450});
  await name.click();await page.keyboard.press('Escape');await name.click();
  await expect(name).toHaveAttribute('aria-expanded','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('motion preferences preserve useful light feedback, immediate off and automatic OS reduction',async({page})=>{
  await interceptMealServices(page);
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme:'light',motion:'light'}));});
  await page.goto('http://127.0.0.1:5175/newest');
  await page.getByRole('button',{name:'Tùy chọn hiển thị'}).click();
  const menu=page.locator('.comfort-menu');
  const motions=await menu.evaluate(el=>el.getAnimations().map(animation=>animation.effect!.getKeyframes()));
  expect(motions.length,'light mode keeps short opacity feedback').toBeGreaterThan(0);
  expect(motions.flat().every(frame=>!frame.transform||frame.transform==='none')).toBe(true);
  await page.getByRole('combobox',{name:'Hiệu ứng',exact:true}).selectOption('off');
  expect(await menu.evaluate(el=>el.getAnimations().length)).toBe(0);
  await page.keyboard.press('Escape');
  const name=page.getByRole('combobox',{name:'Họ tên',exact:true});
  await name.click();await page.keyboard.press('Escape');
  await expect(name).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('#name-options')).not.toHaveClass(/closing/);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>localStorage.removeItem('meal-appearance'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion-level','off');
  await page.getByRole('button',{name:'Tùy chọn hiển thị'}).click();
  expect(await menu.evaluate(el=>el.getAnimations().length)).toBe(0);
});

test('confirmation motion never delays cancel and busy animation follows the real pending read',async({page})=>{
  const writes:object[]=[];
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme:'light',motion:'full'}));});
  await interceptMealServices(page,'owner','#357185',writes);
  await page.goto('http://127.0.0.1:5175/dashboard');
  await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
  const remove=page.getByRole('button',{name:'Xóa lượt này',exact:true});
  await page.locator('[data-response-id="sample-a"]').getByRole('button',{name:'Thao tác lượt gửi',exact:true}).click();
  await remove.click();
  const dialog=page.getByRole('dialog',{name:'Xác nhận thao tác'});
  expect(await dialog.evaluate(el=>el.getAnimations().length),'confirmation should acknowledge its focus layer').toBeGreaterThan(0);
  await dialog.evaluate(el=>el.getAnimations().forEach(animation=>{animation.pause();animation.currentTime=90;}));
  await dialog.screenshot({path:'review/motion/confirmation-90ms.png'});
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);expect(writes).toEqual([]);
  let release!:()=>void;
  const pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/dashboard?week=**',async route=>{await pending;await route.fallback();});
  const reload=page.getByRole('button',{name:'Tải lại dữ liệu',exact:true});
  try {
    await reload.click();
    const busy=page.getByRole('button',{name:'Đang tải lại…',exact:true});
    await expect(busy).toHaveAttribute('aria-busy','true');
    expect(await busy.evaluate(el=>getComputedStyle(el,'::after').animationName)).not.toBe('none');
    await busy.screenshot({path:'review/motion/pending-read.png'});
  } finally {release();}
  await expect(reload).toHaveAttribute('aria-busy','false');
  expect(writes).toEqual([]);
});

test('mobile More motion preserves tool navigation, inert exit and an explicit full-motion override',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme:'dark',motion:'full'}));});
  await interceptMealServices(page);
  await page.goto('http://127.0.0.1:5175/dashboard');
  const more=page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Thêm',exact:true});
  await more.focus();await page.keyboard.press('Enter');
  const menu=page.locator('.ui-more-menu');
  expect(await menu.evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
  await menu.evaluate(el=>el.getAnimations().forEach(animation=>{animation.pause();animation.currentTime=100;}));
  await page.screenshot({path:'review/motion/mobile-more-100ms.png'});
  await menu.getByRole('button',{name:'Đối soát',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Đối soát Form–Sheet'})).toBeVisible();
  await expect(menu).toHaveAttribute('inert','');
  expect(await menu.evaluate(el=>el.matches(':popover-open'))).toBe(false);
  await more.click();await page.keyboard.press('Escape');await more.click();
  await expect(more).toHaveAttribute('aria-expanded','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('initial viewer skeleton never covers loaded data on a manual refresh',async({page})=>{
  await interceptMealServices(page);
  let release!:()=>void;
  let pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/viewer**',async route=>{await pending;await route.fallback().catch(()=>{});});
  await page.goto('http://127.0.0.1:5175/newest');
  try {
    await expect(page.getByRole('status',{name:'Đang tải thực đơn…',exact:true})).toBeVisible();
    await expect(page.getByText('Không có kết quả',{exact:true})).toHaveCount(0);
  } finally {release();}
  await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(2);
  pending=new Promise<void>(resolve=>{release=resolve;});
  await page.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();
  try {
    await expect(page.locator('.content-skeleton')).toHaveCount(0);
    await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(2);
    await page.getByRole('button',{name:'Dừng chờ dữ liệu',exact:true}).click();
    await expect(page.locator('.content-skeleton')).toHaveCount(0);
  } finally {release();}
});

test('initial Dashboard and archive skeletons give way to actual rows without hiding cached reads',async({page})=>{
  await interceptMealServices(page);
  let release!:()=>void;
  let pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/dashboard?week=**',async route=>{await pending;await route.fallback().catch(()=>{});});
  await page.goto('http://127.0.0.1:5175/dashboard');
  await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
  try {await expect(page.getByRole('status',{name:'Đang tải lượt gửi…',exact:true})).toBeVisible();}finally{release();}
  await expect(page.locator('[data-response-id]')).toHaveCount(2);
  pending=new Promise<void>(resolve=>{release=resolve;});
  await page.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();
  try {
    await expect(page.locator('.content-skeleton')).toHaveCount(0);
    await expect(page.locator('[data-response-id]')).toHaveCount(2);
    await expect(page.locator('.dashboard-row-location button').first()).toBeDisabled();
  }finally{release();}
  await expect(page.getByRole('button',{name:'Tải lại dữ liệu',exact:true})).toBeEnabled();
  pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/history',async route=>{await pending;await route.fallback().catch(()=>{});});
  await page.goto('http://127.0.0.1:5175/history');
  try{await expect(page.getByRole('status',{name:'Đang tải kho tuần cũ…',exact:true})).toBeVisible();}finally{release();}
  await expect(page.locator('.archive-weeks li')).toHaveCount(1);
});

test('grouped week searches preserve exact selection and archive calendar includes crossing months',async({page})=>{
  await interceptMealServices(page);
  await page.goto('http://127.0.0.1:5175/dashboard');
  await page.locator('.ui-sidebar').getByRole('button',{name:'Thông báo tuần',exact:true}).click();
  const picker=page.getByRole('combobox',{name:'Tìm tuần',exact:true});
  await picker.click();
  await expect(page.locator('.combo-group').getByText('Tuần đã qua',{exact:true})).toBeVisible();
  await page.getByRole('option',{name:weeks[1].name,exact:true}).click();
  await expect(picker).toHaveValue(weeks[1].name);
  await page.route('**/api/history',route=>route.fulfill({status:200,json:{weeks:[{weekKey:'2026-09-28_2026-10-02',name:'Tuần 28/09/2026 - 02/10/2026',startDate:'2026-09-28',endDate:'2026-10-02'},{...weeks[1],startDate:'2026-10-05',endDate:'2026-10-09'}]}}));
  await page.goto('http://127.0.0.1:5175/history');
  await page.getByRole('button',{name:'Lịch tháng',exact:true}).click();
  await expect(page.getByRole('table',{name:'Lịch kho tuần 10/2026',exact:true})).toBeVisible();
  const crossing=page.locator('.archive-calendar').getByRole('link',{name:/28\/09\/2026/});
  await expect(crossing).toHaveAttribute('href','/history?week=2026-09-28_2026-10-02&month=2026-10&layout=calendar');
  await page.getByRole('button',{name:'Danh sách',exact:true}).click();
  await expect(page.locator('.archive-weeks li')).toHaveCount(2);
});

test('viewer has no day strip and retains existing filters, tabs, named cards and pinned PC identity',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme:'dark',motion:'off'}));});
  await interceptMealServices(page);
  const serving=[days[0],days[2]],calendar=days.map(day=>day.day);
  await page.route('**/api/viewer**',route=>route.fulfill({status:200,json:{headers:['Timestamp','Họ tên',...serving.map(day=>day.day)],rows:[['08/10/2026 10:00:00','Trường','CƠM GÀ','BÚN BÒ'],['08/10/2026 09:00:00','Trường','BÚN BÒ','CƠM GÀ']],days:serving,calendarDays:calendar,closedDays:[calendar[1]],formStatus:'closed',formUrl:weeks[0].formUrl}}));
  await page.goto('http://127.0.0.1:5175/newest');
  await expect(page.getByRole('tab',{name:'Chi tiết',exact:true})).toHaveAttribute('aria-selected','true');
  await expect(page.getByRole('navigation',{name:'Ngày trong tuần',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Hôm nay',exact:true})).toBeVisible();
  await page.getByRole('combobox',{name:'Họ tên',exact:true}).fill('truong');
  await page.getByRole('heading',{name:'Thực đơn tuần này',exact:true}).click();
  await page.getByRole('button',{name:/^Bộ lọc/}).click();
  await page.getByRole('combobox',{name:'Ngày',exact:true}).click();
  await page.getByRole('option',{name:calendar[2],exact:true}).click();
  await page.getByRole('button',{name:'Đóng bộ lọc',exact:true}).click();
  const first=page.locator('.detail-wrap tbody tr').first();
  await expect(first.locator('td[data-kind=name]')).toContainText('Trường');
  await expect(first.locator('.response-card-time')).toHaveText('08/10/2026 10:00:00');
  await expect(first).toContainText('BÚN BÒ');
  await page.getByRole('tab',{name:'Tổng hợp',exact:true}).click();
  await expect(page.locator('.ui-day-card')).toHaveCount(1);
  await page.getByRole('tab',{name:'Chi tiết',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Họ tên',exact:true})).toHaveValue('truong');
  await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(2);
  await page.getByRole('button',{name:'Xóa bộ lọc',exact:true}).click();
  await page.setViewportSize({width:1440,height:960});
  await expect(page.locator('.viewer-tabs')).toBeHidden();
  const pinned=await page.locator('.detail-wrap').evaluate(wrap=>{(wrap as HTMLElement).style.width='320px';wrap.scrollLeft=220;const name=wrap.querySelector('tbody td[data-kind=name]')!;return Math.abs(name.getBoundingClientRect().left-wrap.getBoundingClientRect().left);});
  expect(pinned).toBeLessThanOrEqual(2);
});

test('row action popovers defer Sheet lookup and retain restore identity and cancel guards',async({page})=>{
  const writes:object[]=[];let lookups=0;
  await interceptMealServices(page,'owner','#357185',writes);
  await page.route('**/api/dashboard?**',route=>{
    const url=new URL(route.request().url());
    if(url.searchParams.has('locate')){lookups++;return route.fulfill({status:200,json:{rows:[],spreadsheetId:'synthetic',sheetId:0}});}
    if(url.searchParams.has('week'))return route.fulfill({status:200,json:{week:{...weeks[0],formStatus:'open',dayLabels:days.map(day=>day.day)},responses:[{responseId:'sample-a',name:'Trường An',timestamp:1791467940000,meals:['CƠM GÀ'],deletable:true,deleteToken:'synthetic-token'}],history:[{id:'audit-a',entryId:'entry-a',action:'deleted',restorable:true,name:'Trường An',at:1791467940000,timestamp:1791467940000,meals:['CƠM GÀ']}]}});
    return route.fallback();
  });
  await page.goto('http://127.0.0.1:5175/dashboard');
  await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
  const row=page.locator('[data-response-id="sample-a"]');
  await row.getByRole('button',{name:'Xem nhanh',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Đóng',exact:true}).click();
  await row.getByRole('button',{name:'Thao tác lượt gửi',exact:true}).click();
  const menu=page.getByRole('dialog',{name:'Thao tác lượt gửi',exact:true});
  await expect(menu).toBeVisible();expect(lookups).toBe(0);expect(writes).toEqual([]);
  await menu.getByRole('button',{name:'Mở hàng trong Sheet',exact:true}).click();
  await expect(menu).toContainText('Không còn hàng Sheet phù hợp');expect(lookups).toBe(1);
  await page.keyboard.press('Escape');await expect(menu).toBeHidden();
  page.once('dialog',dialog=>dialog.dismiss());
  await page.locator('.dashboard-history-table').getByRole('button',{name:'Thao tác lịch sử',exact:true}).click();
  await page.getByRole('dialog',{name:'Thao tác lịch sử',exact:true}).getByRole('button',{name:'Khôi phục',exact:true}).click();
  expect(writes).toEqual([]);
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('.dashboard-history-table').getByRole('button',{name:'Thao tác lịch sử',exact:true}).click();
  await page.getByRole('dialog',{name:'Thao tác lịch sử',exact:true}).getByRole('button',{name:'Khôi phục',exact:true}).click();
  await expect.poll(()=>writes.length).toBe(1);
  expect(writes).toEqual([{method:'POST',action:'restore',weekKey:key,entryId:'entry-a'}]);
});

test('OCR steps follow real review/create error and completion without automatic writes',async({page})=>{
  const writes:object[]=[];let fail=true;let release:()=>void=()=>{};
  const hold=new Promise<void>(resolve=>release=resolve);
  await interceptMealServices(page);
  await page.route('**/api/dashboard',async route=>{
    if(route.request().method()!=='POST')return route.fallback();
    const body=route.request().postDataJSON();writes.push(body);
    if(body.action==='ocr')return route.fulfill({status:200,json:{title:'Tuần thử',days:['19','20','21','22','23'].map((day,i)=>({day:`Thứ ${i+2}`,date:`${day}/10/2026`,meals:['A','B','C']}))}});
    if(body.action==='create'){
      if(fail){fail=false;return route.fulfill({status:500,json:{error:'Lỗi tạo thử; nháp được giữ'}});}
      await hold;return route.fulfill({status:200,json:{ok:true}});
    }
    throw Error('Unexpected write');
  });
  await page.goto('http://127.0.0.1:5175/dashboard?tab=create');
  const progress=page.getByRole('list',{name:'Tiến trình tạo tuần'});
  await expect(progress.locator('[aria-current=step]')).toHaveText(/Ảnh thực đơn/);
  await expect(page.getByRole('button',{name:'Chọn ảnh thực đơn',exact:true})).toBeEnabled();
  const image=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;canvas.getContext('2d')!.fillRect(0,0,4,4);return canvas.toDataURL('image/png').split(',')[1];});
  await page.locator('input[type=file]').first().setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});
  expect(writes).toEqual([]);
  await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();
  await expect(progress.locator('[aria-current=step]')).toHaveText(/Rà soát/);expect(writes).toHaveLength(1);
  await page.getByRole('button',{name:'Tạo Form và Sheet',exact:true}).click();
  await expect(page.locator('.dashboard-message')).toContainText('Lỗi tạo thử');
  await expect(progress.locator('[aria-current=step]')).toHaveText(/Rà soát/);
  await expect(page.getByLabel('Tiêu đề tuần',{exact:true})).toHaveValue('Tuần thử');
  await page.getByRole('button',{name:'Tạo Form và Sheet',exact:true}).click();
  await expect(progress.locator('[aria-current=step]')).toHaveText(/Tạo Form/);
  await expect(progress).not.toContainText('Hoàn tất');release();
  await expect(progress).toContainText('Hoàn tất');
  expect(writes.map((value:any)=>value.action)).toEqual(['ocr','create','create']);
});

test('branding contexts are draft-only across surfaces, sizes and schemes',async({page})=>{
  const writes:object[]=[];
  await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme:'dark',motion:'off'}));});
  await interceptMealServices(page,'owner','#357185',writes);
  await page.goto('http://127.0.0.1:5175/dashboard');
  await page.locator('.ui-sidebar').getByRole('button',{name:'Thương hiệu',exact:true}).click();
  const color=page.getByLabel('Màu chủ đạo',{exact:true});await color.fill('#b91c1c');
  const preview=page.getByRole('region',{name:'Xem trước thương hiệu'});
  for(const surface of ['Trang xem','Dashboard'])for(const device of ['Điện thoại','PC'])for(const scheme of ['Sáng','Tối']){
    await preview.getByRole('combobox',{name:'Trang minh họa',exact:true}).selectOption({label:surface});
    await preview.getByRole('combobox',{name:'Thiết bị minh họa',exact:true}).selectOption({label:device});
    await preview.getByRole('combobox',{name:'Giao diện minh họa',exact:true}).selectOption({label:scheme});
    await expect(preview.locator('.branding-preview-canvas')).toHaveAttribute('data-scheme',scheme==='Tối'?'dark':'light');
    await expect(preview.locator('.branding-preview-canvas')).toContainText('Dữ liệu minh họa');
    const primary=await preview.locator('.branding-preview-canvas').evaluate(el=>getComputedStyle(el).getPropertyValue('--meal-ui-primary').trim());expect(primary).toBe('#b91c1c');
    const colors=await preview.locator('.branding-preview-canvas').evaluate(el=>({heading:getComputedStyle(el.querySelector('h3')!).color,body:getComputedStyle(el).color}));expect(colors.heading).toBe(colors.body);
  }
  expect(writes).toEqual([]);
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--meal-ui-primary').trim())).toBe('#357185');
});

test('ten-UI responsive review covers cards, calendars, progress, popovers and branding frames',async({page})=>{
  test.setTimeout(60000);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  for(const width of [360,1440])for(const theme of ['dark','light']){
    await page.setViewportSize({width,height:960});
    await page.addInitScript(theme=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));},theme);
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);
    async function capture(name:string){
      await page.evaluate(()=>document.fonts.ready);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.screenshot({path:`review/ten-ui/${name}-${width}-${theme}.png`,fullPage:true});
    }
    await page.goto('http://127.0.0.1:5175/newest');
    await expect(page.locator('.detail-wrap')).toBeVisible();
    if(width===360){const positions=await page.locator('.detail-wrap tbody tr').first().evaluate(row=>({name:row.querySelector('[data-kind=name]')!.getBoundingClientRect().bottom,time:row.querySelector('[data-kind=time]')!.getBoundingClientRect().top}));expect(positions.time).toBeGreaterThanOrEqual(positions.name);}
    await capture('viewer-details');
    if(width===360){
      await page.getByRole('tab',{name:'Chi tiết',exact:true}).focus();await page.keyboard.press('ArrowLeft');
      await expect(page.getByRole('tab',{name:'Tổng hợp',exact:true})).toBeFocused();
      await expect(page.locator('.ui-day-card').first()).toBeVisible();await capture('viewer-summary');
    }
    await page.goto('http://127.0.0.1:5175/history');
    await page.getByRole('button',{name:'Lịch tháng',exact:true}).click();await capture('archive-calendar');
    await page.goto('http://127.0.0.1:5175/dashboard?tab=create');
    await expect(page.getByRole('list',{name:'Tiến trình tạo tuần'})).toBeVisible();await capture('ocr');
    async function navigate(label:string,short=label){
      if(width===1440)await page.locator('.ui-sidebar').getByRole('button',{name:label,exact:true}).click();
      else if(short==='Lượt gửi')await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:short,exact:true}).click();
      else{await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Thêm',exact:true}).click();await page.getByRole('dialog',{name:'Thêm chức năng'}).getByRole('button',{name:label,exact:true}).click();}
    }
    await navigate('Lượt gửi & lịch sử','Lượt gửi');
    await page.locator('[data-response-id="sample-a"]').getByRole('button',{name:'Thao tác lượt gửi',exact:true}).click();
    const menu=page.getByRole('dialog',{name:'Thao tác lượt gửi',exact:true});await expect(menu).toBeVisible();
    await page.evaluate(()=>document.fonts.ready);await expect(menu).toBeVisible();
    const bounds=await menu.boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width);expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(960);
    await page.screenshot({path:`review/ten-ui/response-menu-${width}-${theme}.png`});await page.keyboard.press('Escape');
    await navigate('Thương hiệu');
    const preview=page.getByRole('region',{name:'Xem trước thương hiệu'});
    await preview.getByRole('combobox',{name:'Thiết bị minh họa',exact:true}).selectOption(width===360?'phone':'pc');
    await preview.getByRole('combobox',{name:'Giao diện minh họa',exact:true}).selectOption(theme);
    for(const surface of ['viewer','dashboard']){await preview.getByRole('combobox',{name:'Trang minh họa',exact:true}).selectOption(surface);await capture('brand-'+surface);}
    expect(writes).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('clarity: accent highlights and clear buttons preserve data and independent filters',async({page})=>{
  await interceptMealServices(page);
  await page.goto('http://127.0.0.1:5175/newest');
  const name=page.getByRole('combobox',{name:'Họ tên',exact:true});await name.fill('truong');
  await page.getByRole('heading',{name:'Thực đơn tuần này',exact:true}).click();
  await expect(page.locator('.detail-wrap td[data-kind=name] mark').first()).toHaveText('Trường');
  await expect(page.locator('.detail-wrap th').first()).toHaveText('Thời điểm gửi');
  await page.getByRole('combobox',{name:'Ngày',exact:true}).click();await page.getByRole('option',{name:days[2].day,exact:true}).click();
  await page.getByRole('button',{name:'Xóa tìm kiếm Họ tên',exact:true}).click();
  await expect(name).toHaveValue('');await expect(page.getByRole('combobox',{name:'Ngày',exact:true})).toHaveValue(days[2].day);
  await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(2);
  await page.goto('http://127.0.0.1:5175/dashboard');
  await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
  const query=page.getByRole('textbox',{name:'Tìm theo họ tên',exact:true});await query.fill('truong');
  await expect(page.locator('[data-response-id="sample-a"] mark')).toHaveText('Trường');
  await page.getByRole('button',{name:'Xóa tìm kiếm Tìm theo họ tên',exact:true}).click();await expect(query).toHaveValue('');
  const picker=page.getByRole('combobox',{name:'Tìm tuần',exact:true});const saved=await picker.inputValue();await picker.fill('05/10');
  await page.getByRole('button',{name:'Xóa tìm kiếm Tìm tuần',exact:true}).click();await page.keyboard.press('Escape');await expect(picker).toHaveValue(saved);
});

test('clarity: external links explain new tabs without changing destinations',async({page})=>{
  await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/dashboard');
  const link=page.locator('.ui-week-links').first().getByRole('link',{name:'Form',exact:true});
  await expect(link.locator('.external-link-icon')).toHaveCount(1);await expect(link).toHaveAttribute('target','_blank');await expect(link).toHaveAttribute('href',weeks[0].formUrl);
  await expect(link).toHaveAttribute('title','Mở tab mới');await expect(link).toHaveAttribute('rel',/noopener/);
});

test('clarity: archive metadata, month return and context titles stay truthful',async({page})=>{
  await interceptMealServices(page);
  const crossing={weekKey:'2026-09-28_2026-10-02',name:'Tuần 28/09/2026 - 02/10/2026',startDate:'2026-09-28',endDate:'2026-10-02',responseCount:0,formStatus:'closed'};
  await page.route('**/api/history**',route=>{
    const url=new URL(route.request().url());
    return route.fulfill({status:200,json:url.searchParams.has('week')?{headers:['Timestamp','Họ tên','Thứ 2 (28/09/2026)'],rows:[['01/09/2026 09:00','Tên minh họa','Cơm']],days:[{day:'Thứ 2 (28/09/2026)',meals:['Cơm']}],calendarDays:['Thứ 2 (28/09/2026)','Thứ 6 (02/10/2026)'],formStatus:'closed'}:{weeks:[crossing,{...weeks[1],responseCount:null,formStatus:'unknown'}]}});
  });
  await page.goto('http://127.0.0.1:5175/history?month=2026-10&layout=calendar');
  await expect(page.locator('.archive-calendar')).toBeVisible();
  await expect(page.locator('.archive-calendar')).toContainText('0 lượt gửi');await expect(page.locator('.archive-calendar')).toContainText('Chưa đọc được số lượt');
  await page.locator('.archive-calendar').getByRole('link',{name:/Tuần 28\/09/}).click();
  await expect(page.getByRole('navigation',{name:'Đường dẫn ngữ cảnh'})).toContainText('Tháng 10/2026');
  await expect(page).toHaveTitle(/Tuần 28\/09\/2026–02\/10\/2026 · Thực đơn/);
  await page.getByRole('navigation',{name:'Đường dẫn ngữ cảnh'}).getByRole('link',{name:'Tháng 10/2026',exact:true}).click();
  await expect(page).toHaveURL(/month=2026-10&layout=calendar/);await expect(page.locator('.archive-calendar')).toBeVisible();
  await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
  await expect(page).toHaveTitle(/Lượt gửi.*Dashboard/);
});

test('clarity: long notices expand, reset on replacement and cannot outlive expiry',async({page})=>{
  await interceptMealServices(page);let notice={text:'Thông báo công khai '.repeat(20),expiresAt:Date.now()+3600000};
  await page.route('**/api/viewer**',route=>route.fulfill({status:200,json:{headers:['Timestamp','Họ tên',days[0].day],rows:[['08/10/2026 09:00','Minh họa','CƠM GÀ']],days:[days[0]],weekNotice:notice,serverNow:Date.now(),formStatus:'closed'}}));
  await page.goto('http://127.0.0.1:5175/newest');
  const more=page.getByRole('button',{name:'Xem thêm thông báo',exact:true});await expect(more).toHaveAttribute('aria-expanded','false');
  await more.click();await expect(page.getByRole('button',{name:'Thu gọn thông báo',exact:true})).toHaveAttribute('aria-expanded','true');
  notice={text:'Nội dung thay thế '.repeat(20),expiresAt:Date.now()+3600000};await page.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await expect(more).toHaveAttribute('aria-expanded','false');
  notice={text:'Thông báo đã hết hạn',expiresAt:Date.now()-1000};await page.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await expect(page.getByRole('complementary',{name:'Thông báo tuần',exact:true})).toHaveCount(0);
});

test('clarity: mobile filter sheet preserves values and returns focus across close and resize',async({page})=>{
  await page.setViewportSize({width:390,height:844});await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/newest');
  const toggle=page.getByRole('button',{name:'Bộ lọc',exact:true});await toggle.click();
  const sheet=page.getByRole('dialog',{name:'Bộ lọc thực đơn',exact:true});await expect(sheet).toBeVisible();
  await sheet.getByRole('combobox',{name:'Ngày',exact:true}).click();await sheet.getByRole('option',{name:days[2].day,exact:true}).click();
  await sheet.getByRole('combobox',{name:'Món',exact:true}).fill('CƠM');
  await sheet.getByRole('button',{name:'Đóng bộ lọc',exact:true}).click();await expect(sheet).toBeHidden();
  await expect(page.getByRole('button',{name:'Bộ lọc (2)',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Bộ lọc (2)',exact:true}).click();
  await expect(sheet.getByRole('combobox',{name:'Ngày',exact:true})).toHaveValue(days[2].day);await expect(sheet.getByRole('combobox',{name:'Món',exact:true})).toHaveValue('CƠM');
  await page.setViewportSize({width:1440,height:960});await expect(page.getByRole('dialog',{name:'Bộ lọc thực đơn',exact:true})).toHaveCount(0);
  await expect(page.getByRole('combobox',{name:'Món',exact:true})).toHaveValue('CƠM');
  await page.setViewportSize({width:390,height:400});await page.getByRole('button',{name:'Bộ lọc (2)',exact:true}).click();
  await sheet.getByRole('button',{name:'Đóng bộ lọc',exact:true}).focus();await page.keyboard.press('Escape');await expect(sheet).toBeHidden();
});

test('clarity: expanded PC workspace retains the same controls, table and scroll',async({page})=>{
  await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/newest');
  const input=page.getByRole('combobox',{name:'Họ tên',exact:true});await input.fill('truong');await page.getByRole('heading',{name:'Thực đơn tuần này',exact:true}).click();
  await page.locator('.detail-wrap').evaluate(node=>{node.setAttribute('data-original','yes');(node as HTMLElement).style.width='320px';node.scrollLeft=150;});
  await page.getByRole('button',{name:'Phóng rộng bảng chi tiết',exact:true}).click();
  const workspace=page.getByRole('dialog',{name:'Bảng chi tiết',exact:true});await expect(workspace).toBeVisible();
  await expect(workspace.locator('.detail-wrap')).toHaveAttribute('data-original','yes');await expect(workspace.getByRole('combobox',{name:'Sắp xếp',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');await expect(workspace).toHaveCount(0);
  await expect(input).toHaveValue('truong');expect(await page.locator('.detail-wrap').evaluate(node=>node.scrollLeft)).toBe(150);
  await expect(page.getByRole('button',{name:'Phóng rộng bảng chi tiết',exact:true})).toBeFocused();
  await page.keyboard.press('Control+k');await expect(page.getByRole('dialog',{name:'Lệnh nhanh',exact:true})).toBeVisible();await page.keyboard.press('Escape');
});

test('clarity: confirmation footer remains visible in a keyboard-height viewport',async({page})=>{
  const writes:object[]=[];await page.setViewportSize({width:390,height:844});await interceptMealServices(page,'owner','#357185',writes);
  await page.goto('http://127.0.0.1:5175/dashboard');await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Lượt gửi',exact:true}).click();
  await page.locator('[data-response-id="sample-a"]').getByRole('button',{name:'Thao tác lượt gửi',exact:true}).click();await page.getByRole('dialog',{name:'Thao tác lượt gửi',exact:true}).getByRole('button',{name:'Xóa lượt này',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true});await page.setViewportSize({width:390,height:340});await dialog.getByRole('textbox',{name:'Lý do (tùy chọn)',exact:true}).fill('Lý do '.repeat(70));
  const footer=dialog.locator('.confirmation-actions');await expect(footer).toBeVisible();
  const box=await footer.boundingBox();expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(340);
  await footer.getByRole('button',{name:'Hủy',exact:true}).click();expect(writes).toEqual([]);
});

test('clarity: unsaved branding cancels navigation/logout and survives failed save',async({page})=>{
  const writes:any[]=[];let fail=true;await interceptMealServices(page);
  await page.route('**/api/dashboard',route=>{
    if(route.request().method()==='POST'&&route.request().postDataJSON()?.action==='set-branding'){
      const body=route.request().postDataJSON();writes.push(body);
      if(fail){fail=false;return route.fulfill({status:500,json:{error:'Lỗi lưu thử'}});}
      return route.fulfill({status:200,json:{...body.branding,updatedAt:2}});
    }return route.fallback();
  });
  await page.goto('http://127.0.0.1:5175/dashboard');const nav=page.locator('.ui-sidebar');await nav.getByRole('button',{name:'Thương hiệu',exact:true}).click();
  const field=page.getByLabel('Tên trường',{exact:true});await field.fill('Tên đang sửa');
  const dirty=page.getByRole('status',{name:'Chưa lưu thương hiệu',exact:true});await expect(dirty).toBeVisible();
  expect(await page.evaluate(()=>{const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;})).toBe(true);
  page.once('dialog',dialog=>dialog.dismiss());await nav.getByRole('button',{name:'Tổng quan',exact:true}).click();await expect(field).toHaveValue('Tên đang sửa');
  page.once('dialog',dialog=>dialog.dismiss());await nav.getByRole('button',{name:'Đăng xuất',exact:true}).click();await expect(field).toHaveValue('Tên đang sửa');expect(writes).toEqual([]);
  await page.getByRole('region',{name:'Thay đổi thương hiệu chưa lưu',exact:true}).getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();await page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true}).getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();
  await expect(page.locator('.dashboard-message')).toContainText('Lỗi lưu thử');await expect(dirty).toBeVisible();await expect(field).toHaveValue('Tên đang sửa');
  await page.getByRole('region',{name:'Thay đổi thương hiệu chưa lưu',exact:true}).getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();await page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true}).getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();await expect(dirty).toHaveCount(0);
  await field.fill('Bản bỏ đi');page.once('dialog',dialog=>dialog.accept());await nav.getByRole('button',{name:'Tổng quan',exact:true}).click();await nav.getByRole('button',{name:'Thương hiệu',exact:true}).click();await expect(field).toHaveValue('Tên đang sửa');
});

test('clarity: unsaved notices keep text on week cancel and save error, then retry exact revision',async({page})=>{
  let fail=true;const writes:any[]=[];await interceptMealServices(page);
  await page.route('**/api/dashboard?notice=**',route=>route.fulfill({status:200,json:{notice:{text:'Thông báo cũ',endsOn:'2026-10-18',updatedAt:1,expiresAt:1792335600000}}}));
  await page.route('**/api/dashboard',route=>{
    if(route.request().method()==='POST'&&route.request().postDataJSON()?.action==='set-week-notice'){
      const body=route.request().postDataJSON();writes.push(body);if(fail){fail=false;return route.fulfill({status:500,json:{error:'Chưa lưu được thử'}});}
      return route.fulfill({status:200,json:{notice:{text:body.text,endsOn:body.endsOn,updatedAt:2,expiresAt:1792335600000}}});
    }return route.fallback();
  });
  await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Thông báo tuần',exact:true}).click();
  const text=page.getByRole('textbox',{name:'Nội dung thông báo',exact:true});await expect(text).toBeEnabled();await text.fill('Nháp thông báo');
  const dirty=page.getByRole('status',{name:'Chưa lưu thông báo',exact:true});await expect(dirty).toBeVisible();
  const picker=page.getByRole('combobox',{name:'Tìm tuần',exact:true});const selected=await picker.inputValue();await picker.fill('05/10');
  page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('option',{name:weeks[1].name,exact:true}).click();await expect(picker).toHaveValue(selected);await expect(text).toHaveValue('Nháp thông báo');
  await page.getByRole('region',{name:'Thay đổi thông báo chưa lưu',exact:true}).getByRole('button',{name:'Lưu thông báo',exact:true}).click();await page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true}).getByRole('button',{name:'Lưu thông báo',exact:true}).click();await expect(page.locator('.dashboard-message')).toContainText('Chưa lưu được thử');await expect(text).toBeEnabled();await expect(dirty).toBeVisible();
  await page.getByRole('region',{name:'Thay đổi thông báo chưa lưu',exact:true}).getByRole('button',{name:'Lưu thông báo',exact:true}).click();await page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true}).getByRole('button',{name:'Lưu thông báo',exact:true}).click();await expect(dirty).toHaveCount(0);
  expect(writes.map(body=>({weekKey:body.weekKey,expectedUpdatedAt:body.expectedUpdatedAt,text:body.text}))).toEqual([{weekKey:key,expectedUpdatedAt:1,text:'Nháp thông báo'},{weekKey:key,expectedUpdatedAt:1,text:'Nháp thông báo'}]);
});

test('clarity: OCR days stay editable and retain validation after edits or Undo',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);
  await page.route('**/api/dashboard',route=>route.request().method()==='POST'&&route.request().postDataJSON()?.action==='ocr'?route.fulfill({status:200,json:{title:'Tuần thử',days:['19','20','21','22','23'].map((day,i)=>({day:`Thứ ${i+2}`,date:i===0?'31/02/2026':`${day}/10/2026`,meals:['A','B','C']}))}}):route.fallback());
  await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await expect(page.getByRole('button',{name:'Chọn ảnh thực đơn',exact:true})).toBeEnabled();
  const image=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;return canvas.toDataURL('image/png').split(',')[1];});await page.locator('input[type=file]').first().setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();
  const day=page.locator('.menu-day').nth(1);await expect(page.locator('#ocr-date-0')).toHaveAttribute('aria-invalid','true');await expect(day.locator('.ocr-day-fields')).toBeVisible();await expect(page.getByRole('checkbox',{name:/Đã rà soát/})).toHaveCount(0);
  await day.getByRole('textbox',{name:'Món 1',exact:true}).fill('A đã sửa');await page.getByLabel('Chọn thứ Hai',{exact:true}).fill('2026-10-26');await expect(page.locator('#ocr-date-0')).toHaveValue('26/10/2026');await expect(page.locator('#ocr-date-0')).toHaveAttribute('aria-invalid','false');
  await expect(day.locator('.ocr-day-fields')).toBeVisible();await expect(day.getByRole('textbox',{name:'Món 1',exact:true})).toHaveValue('A đã sửa');
  await page.getByRole('button',{name:'Hoàn tác',exact:true}).click();await expect(page.locator('#ocr-date-0')).toHaveValue('31/02/2026');await expect(page.locator('#ocr-date-0')).toHaveAttribute('aria-invalid','true');await expect(day.locator('.ocr-day-fields')).toBeVisible();await expect(day.getByRole('textbox',{name:'Món 1',exact:true})).toHaveValue('A đã sửa');expect(writes).toEqual([]);
});

test('clarity: command and version navigation honor dirty cancellation without duplicate writes',async({page})=>{
  const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);
  await page.route('**/version.json',route=>route.fulfill({status:200,json:{id:'another-build'}}));
  await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Thương hiệu',exact:true}).click();
  const field=page.getByLabel('Tên trường',{exact:true});await field.fill('Nháp chưa lưu');
  await page.keyboard.press('Control+k');const commands=page.getByRole('dialog',{name:'Lệnh nhanh',exact:true});
  await commands.getByRole('combobox',{name:'Tìm lệnh hoặc tuần',exact:true}).fill('Tổng quan');
  await commands.getByRole('button',{name:'Xóa tìm kiếm Tìm lệnh hoặc tuần',exact:true}).click();
  await commands.getByRole('combobox',{name:'Tìm lệnh hoặc tuần',exact:true}).fill('Tổng quan');
  page.once('dialog',dialog=>dialog.dismiss());await commands.getByRole('option',{name:/Tổng quan/}).click();await expect(commands).toBeVisible();
  await expect(commands.getByRole('alert')).toHaveCount(0);await page.keyboard.press('Escape');await expect(field).toHaveValue('Nháp chưa lưu');
  page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('button',{name:'Cập nhật trang',exact:true}).click();await expect(page.getByRole('button',{name:'Cập nhật trang',exact:true})).toBeEnabled();await expect(field).toHaveValue('Nháp chưa lưu');expect(writes).toEqual([]);
});

test('clarity: notice conflicts preserve the draft and require an explicit reload before another revision',async({page})=>{
  await interceptMealServices(page);let reads=0,revision=1;const writes:any[]=[];
  await page.route('**/api/dashboard?notice=**',route=>{reads++;return route.fulfill({status:200,json:{notice:{text:revision===1?'Cũ':'Bản mới trên máy chủ',endsOn:'2026-10-18',updatedAt:revision}}});});
  await page.route('**/api/dashboard',route=>{
    if(route.request().method()==='POST'&&route.request().postDataJSON()?.action==='set-week-notice'){
      const body=route.request().postDataJSON();writes.push(body);revision=2;
      return writes.length===1?route.fulfill({status:409,json:{error:'Thông báo đã thay đổi; hãy tải lại'}}):route.fulfill({status:200,json:{notice:{text:body.text,endsOn:body.endsOn,updatedAt:3}}});
    }return route.fallback();
  });
  await page.goto('http://127.0.0.1:5175/dashboard');await page.locator('.ui-sidebar').getByRole('button',{name:'Thông báo tuần',exact:true}).click();
  const text=page.getByRole('textbox',{name:'Nội dung thông báo',exact:true}),save=page.getByRole('button',{name:'Lưu thông báo',exact:true});await expect(text).toBeEnabled();await text.fill('Nháp giữ lại');
  await save.click();await page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true}).getByRole('button',{name:'Lưu thông báo',exact:true}).click();await expect(save).toBeDisabled();await expect(text).toBeEnabled();await expect(text).toHaveValue('Nháp giữ lại');
  const readsBeforeCancel=reads;page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('button',{name:'Tải lại thông báo',exact:true}).click();expect(reads).toBe(readsBeforeCancel);await expect(text).toHaveValue('Nháp giữ lại');
  page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Tải lại thông báo',exact:true}).click();await expect(text).toHaveValue('Bản mới trên máy chủ');await expect(page.getByRole('status',{name:'Chưa lưu thông báo',exact:true})).toHaveCount(0);
  await text.fill('Đã đối chiếu');await save.click();await page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true}).getByRole('button',{name:'Lưu thông báo',exact:true}).click();await expect.poll(()=>writes.length).toBe(2);expect(writes.map(value=>value.expectedUpdatedAt)).toEqual([1,2]);
});

test('clarity: responsive review of new states stays readable across viewport and theme',async({page})=>{
  test.setTimeout(90000);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  for(const width of [360,768,1440])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:960});await page.addInitScript(theme=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));},theme);
    const writes:object[]=[];await interceptMealServices(page,'owner','#357185',writes);
    async function capture(label:string,fullPage=true){await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);await page.screenshot({path:`review/clarity/${label}-${width}-${theme}.png`,fullPage});}
    await page.goto('http://127.0.0.1:5175/newest');await page.getByRole('combobox',{name:'Họ tên',exact:true}).fill('truong');await page.getByRole('heading',{name:'Thực đơn tuần này',exact:true}).click();await capture('search');
    if(width===360){await page.getByRole('button',{name:'Bộ lọc (1)',exact:true}).click();await page.getByRole('dialog',{name:'Bộ lọc thực đơn',exact:true}).waitFor();await capture('filter-sheet',false);await page.getByRole('button',{name:'Đóng bộ lọc',exact:true}).click();}
    else{await page.getByRole('button',{name:'Phóng rộng bảng chi tiết',exact:true}).click();await capture('expanded-viewer',false);await page.keyboard.press('Escape');}
    await page.goto('http://127.0.0.1:5175/history');await page.getByRole('button',{name:'Lịch tháng',exact:true}).click();await capture('archive');
    await page.goto('http://127.0.0.1:5175/dashboard');
    if(width===360)await page.getByRole('navigation',{name:'Điều hướng điện thoại'}).getByRole('button',{name:'Lượt gửi',exact:true}).click();else await page.locator('.ui-sidebar').getByRole('button',{name:'Lượt gửi & lịch sử',exact:true}).click();
    await page.locator('[data-response-id="sample-a"]').waitFor();
    if(width>700){await page.getByRole('button',{name:'Phóng rộng bảng lượt gửi',exact:true}).click();await capture('expanded-dashboard',false);await page.keyboard.press('Escape');}
    await page.locator('[data-response-id="sample-a"]').getByRole('button',{name:'Thao tác lượt gửi',exact:true}).click();await page.getByRole('dialog',{name:'Thao tác lượt gửi',exact:true}).getByRole('button',{name:'Xóa lượt này',exact:true}).click();
    await capture('confirmation',false);await page.getByRole('dialog',{name:'Xác nhận thao tác',exact:true}).getByRole('button',{name:'Hủy',exact:true}).click();expect(writes).toEqual([]);
  }
  expect(errors).toEqual([]);
});
