import { test, expect } from '@playwright/test';

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
    if(url.pathname === '/api/viewer') data = {headers:['Thời điểm','Họ tên',...days.map(day=>day.day)],rows:[['08/10/2026 20:59:00','Trường An',...days.map(()=> 'CƠM GÀ')],['08/10/2026 20:58:00','Minh Anh',...days.map(()=> 'BÚN BÒ')]],days,calendarDays:days.map(day=>day.day),formStatus:'closed',formUrl:weeks[0].formUrl};
    if(url.pathname === '/api/history') data = {weeks:[{...weeks[1],startDate:'2026-10-05',endDate:'2026-10-09'}]};
    if(url.pathname === '/api/dashboard') {
      if(route.request().method() !== 'GET') { writes.push({method:route.request().method(),...route.request().postDataJSON()}); data={ok:true}; }
      else if(url.searchParams.has('notice')) data={notice:{text:'',endsOn:'',updatedAt:0}};
      else if(url.searchParams.has('health')) data={checkedAt:Date.now(),checks:[{id:'google',label:'Kết nối Google',status:'ok',message:'Kết quả minh họa'}]};
      else if(url.searchParams.has('reconcile')) data={formCount:2,sheetCount:2,matchedCount:2,issues:[]};
      else if(url.searchParams.has('week')) data={week:{...weeks[0],weekKey:url.searchParams.get('week'),dayLabels:days.map(day=>day.day)},responseCount:2,responseIds:['sample-a','sample-b'],responses:[{responseId:'sample-a',name:'Trường An',timestamp:1791467940000,meals:days.map(()=> 'CƠM GÀ'),deletable:true,deleteToken:'synthetic-token',rowNumber:2},{responseId:'sample-b',name:'Minh Anh',timestamp:1791467880000,meals:days.map(()=> 'BÚN BÒ'),deletable:false,rowNumber:3}],history:[]};
      else data={accountId:'synthetic-owner',email:'admin@example.com',role,permissions:{view:true,create:role==='owner',manageResponses:role==='owner'},weeks,allowedEmails:[],members:[]};
    }
    await route.fulfill({status:200,json:data});
  });
}

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
  await confirmation.getByRole('button',{name:'Xác nhận',exact:true}).click();
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
    await expect(page.locator('.dashboard-history-table tbody tr')).toHaveCount(2);
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
  page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();
  await expect(page.locator('.dashboard-message')).toContainText('Lỗi lưu thử');await expect(dirty).toBeVisible();await expect(field).toHaveValue('Tên đang sửa');
  page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Lưu thương hiệu',exact:true}).click();await expect(dirty).toHaveCount(0);
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
  page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Lưu thông báo',exact:true}).click();await expect(page.locator('.dashboard-message')).toContainText('Chưa lưu được thử');await expect(text).toBeEnabled();await expect(dirty).toBeVisible();
  page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Lưu thông báo',exact:true}).click();await expect(dirty).toHaveCount(0);
  expect(writes.map(body=>({weekKey:body.weekKey,expectedUpdatedAt:body.expectedUpdatedAt,text:body.text}))).toEqual([{weekKey:key,expectedUpdatedAt:1,text:'Nháp thông báo'},{weekKey:key,expectedUpdatedAt:1,text:'Nháp thông báo'}]);
});

test('clarity: reviewed OCR days collapse only when valid and reopen after edits or Undo',async({page})=>{
  await interceptMealServices(page);
  await page.route('**/api/dashboard',route=>route.request().method()==='POST'&&route.request().postDataJSON()?.action==='ocr'?route.fulfill({status:200,json:{title:'Tuần thử',days:['19','20','21','22','23'].map((day,i)=>({day:`Thứ ${i+2}`,date:i===0?'31/02/2026':`${day}/10/2026`,meals:['A','B','C']}))}}):route.fallback());
  await page.goto('http://127.0.0.1:5175/dashboard?tab=create');await expect(page.getByRole('button',{name:'Chọn ảnh thực đơn',exact:true})).toBeEnabled();
  const image=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;return canvas.toDataURL('image/png').split(',')[1];});await page.locator('input[type=file]').first().setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});await page.getByRole('button',{name:'Đọc thực đơn',exact:true}).click();
  await expect(page.getByRole('checkbox',{name:'Đã rà soát Thứ 2',exact:true})).toBeDisabled();
  const reviewed=page.getByRole('checkbox',{name:'Đã rà soát Thứ 3',exact:true});await reviewed.check();
  const day=page.locator('.menu-day').nth(1);await expect(day.locator('.ocr-day-fields')).toBeHidden();
  await page.getByRole('button',{name:'Mở lại Thứ 3',exact:true}).click();await day.getByRole('textbox',{name:'Món 1',exact:true}).fill('A đã sửa');
  await reviewed.check();await page.getByLabel('Chọn thứ Hai',{exact:true}).fill('2026-10-26');await expect(day.locator('.ocr-day-fields')).toBeVisible();await expect(reviewed).not.toBeChecked();
  await page.getByRole('button',{name:'Hoàn tác',exact:true}).click();await expect(day.locator('.ocr-day-fields')).toBeVisible();await expect(reviewed).not.toBeChecked();
  await expect(day.getByRole('textbox',{name:'Món 1',exact:true})).toHaveValue('A đã sửa');
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
  page.once('dialog',dialog=>dialog.accept());await save.click();await expect(save).toBeDisabled();await expect(text).toBeEnabled();await expect(text).toHaveValue('Nháp giữ lại');
  const readsBeforeCancel=reads;page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('button',{name:'Tải lại thông báo',exact:true}).click();expect(reads).toBe(readsBeforeCancel);await expect(text).toHaveValue('Nháp giữ lại');
  page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Tải lại thông báo',exact:true}).click();await expect(text).toHaveValue('Bản mới trên máy chủ');await expect(page.getByRole('status',{name:'Chưa lưu thông báo',exact:true})).toHaveCount(0);
  await text.fill('Đã đối chiếu');page.once('dialog',dialog=>dialog.accept());await save.click();await expect.poll(()=>writes.length).toBe(2);expect(writes.map(value=>value.expectedUpdatedAt)).toEqual([1,2]);
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
