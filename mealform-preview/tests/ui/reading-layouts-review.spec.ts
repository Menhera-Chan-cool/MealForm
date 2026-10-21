import {test,expect} from '@playwright/test';
// Synthetic service fixtures stay in the shared production suite; this file is not a live-data harness.
test('reading-layouts render batch',async({page})=>{
  test.setTimeout(120000);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://accounts.google.com/**',route=>route.abort());
  const key='2026-10-12_2026-10-13_2026-10-14_2026-10-15_2026-10-16',days=['12','13','14','15','16'].map((day,i)=>({day:'Thứ '+(i+2)+' ('+day+'/10/2026)',meals:['Cơm gà','Bún bò']}));
  const week={weekKey:key,name:'Tuần 12/10/2026 - 16/10/2026',formStatus:'closed',responseCount:2,formUrl:'https://docs.google.com/forms/d/e/synthetic/viewform',spreadsheetUrl:'https://docs.google.com/spreadsheets/d/synthetic/edit',lockAt:'2026-10-12T00:00:00+07:00'};
  const writes:string[]=[];
  await page.route('**/api/**',route=>{
    const url=new URL(route.request().url());
    if(route.request().method()!=='GET'){writes.push(url.pathname);return route.fulfill({status:403,json:{error:'Synthetic write blocked'}});}
    let body:any={};
    if(url.pathname==='/api/session')body={authenticated:true};
    if(url.pathname==='/api/branding')body={schoolName:'Trường minh họa',logoUrl:'',primaryColor:'#357185'};
    if(url.pathname==='/api/viewer')body={headers:['Timestamp','Họ tên',...days.map(day=>day.day)],rows:[['08/10/2026 09:00','Trường An',...days.map(()=>'Cơm gà')],['08/10/2026 08:00','Minh Anh',...days.map(()=>'Bún bò')]],days,formStatus:'closed'};
    if(url.pathname==='/api/dashboard'){
      if(url.searchParams.has('notice'))body={notice:{text:'Thông báo công khai minh họa. Chưa thay đổi dữ liệu thật.',endsOn:'2027-01-01',updatedAt:1}};
      else if(url.searchParams.has('week'))body={week:{...week,dayLabels:days.map(day=>day.day)},responses:[{name:'Trường An',responseId:'synthetic-a',timestamp:1791467940000,meals:days.map(()=>'Cơm gà')}],history:[]};
      else body={accountId:'synthetic-layout',email:'admin@example.test',role:'owner',permissions:{view:true,create:true,manageResponses:true},weeks:[week],members:[],allowedEmails:[]};
    }
    return route.fulfill({json:body});
  });
  for(const [width,height,theme,size,forced]of [[1600,1000,'light','normal',false],[900,900,'dark','normal',false],[390,844,'dark','normal',false],[320,400,'light','large',true],[844,390,'dark','large',false]]as const){
    await page.setViewportSize({width,height});await page.emulateMedia({forcedColors:forced?'active':'none'});await page.addInitScript(({theme,size})=>{localStorage.clear();localStorage.setItem('meal-appearance',JSON.stringify({theme,motion:'off'}));localStorage.setItem('meal-text-size',size);},{theme,size});
    for(const [name,url]of [['ledger','/dashboard'],['responses','/dashboard?tab=delete'],['notice','/dashboard?tab=notice'],['brand','/dashboard?tab=branding'],['form','/dashboard?tab=form'],['viewer','/newest']]as const){
      await page.goto('http://127.0.0.1:5175'+url);await expect(page.getByRole('heading',{level:1})).toBeVisible();await page.evaluate(()=>document.fonts.ready);
      if(name==='responses')await expect(page.locator('[data-response-id]')).toHaveCount(1);
      if(name==='notice')await expect(page.getByLabel('Nội dung thông báo',{exact:true})).toHaveValue('Thông báo công khai minh họa. Chưa thay đổi dữ liệu thật.');
      if(name==='viewer'){if(width<=700)await page.getByRole('tab',{name:'Chi tiết',exact:true}).click();await expect(page.locator('.detail-wrap tbody tr')).toHaveCount(2);}
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.screenshot({path:'review/reading-layouts/'+name+'-'+width+'.png',fullPage:true});
    }
  }
  expect(errors).toEqual([]);expect(writes).toEqual([]);
});
