async page=>{
 const p=await page.context().newPage();
 await p.route('**/api/session',r=>r.fulfill({json:{authenticated:true}}));
 await p.route('**/api/dashboard*',r=>r.fulfill({json:{role:'owner',email:'owner@example.com',accountId:'palette-fixture',permissions:{view:true,create:true,manageResponses:true},weeks:[],allowedEmails:[]}}));
 await p.route('**/api/history*',r=>r.fulfill({json:{weeks:[]}}));
 await p.route('**/api/branding',r=>r.fulfill({json:{schoolName:'Palette fixture',primaryColor:'#087f5b'}}));
 await p.route('**/api/viewer*',r=>r.fulfill({json:{title:'Fixture',days:[{day:'Thứ 2 (12/10/2026)',meals:['Món thử']}],headers:['Time','Name','Day'],rows:[['now','Fixture','Món thử']],formStatus:'closed',formUrl:'https://docs.google.com/forms/d/e/fixture/viewform'}}));
 const sample=()=>p.evaluate(()=>Object.fromEntries(['body','main','.filters','.combo input','.section-toggle'].map(selector=>{const s=getComputedStyle(document.querySelector(selector));return[selector,{background:s.backgroundColor,color:s.color,border:s.borderColor}];})));
 const brand=async color=>{await p.evaluate(primaryColor=>window.dispatchEvent(new CustomEvent('meal-branding-changed',{detail:{primaryColor}})),color);await p.waitForFunction(color=>document.documentElement.style.getPropertyValue('--brand-primary')===color,color);};
 try{
  await p.goto('http://127.0.0.1:5176/newest');await p.getByLabel('Giao diện',{exact:true}).selectOption('dark');await p.getByLabel('Hiệu ứng',{exact:true}).selectOption('off');await p.locator('.combo input').first().waitFor();
  const green=await sample();await brand('#2563eb');const blue=await sample();
  for(const selector of Object.keys(blue))if(blue[selector].background===green[selector].background)throw Error(selector+' dark background did not follow blue primary');
  for(const selector of ['body','main','.filters','.combo input']){const c=blue[selector].background.match(/\d+/g).map(Number);if(c[2]<=c[1])throw Error(selector+' still green');}
  await brand('#ef4444');const red=await sample();if(red.main.background===blue.main.background)throw Error('Red palette did not update');
  await p.getByLabel('Giao diện',{exact:true}).selectOption('light');await p.waitForFunction(()=>!document.documentElement.style.getPropertyValue('--brand-canvas'));await p.getByLabel('Giao diện',{exact:true}).selectOption('dark');
  await brand('#087f5b');if(await p.evaluate(()=>document.documentElement.dataset.branding))throw Error('Default branding flag leaked');if(!await p.evaluate(()=>document.documentElement.style.getPropertyValue('--brand-canvas')))throw Error('Default dark palette missing');
  await brand('#2563eb');
  await p.locator('.combo input').first().focus();const focus=await p.locator('.combo input').first().evaluate(el=>getComputedStyle(el).outlineColor.match(/\d+/g).map(Number));if(focus[2]<=focus[1])throw Error('Blue input focus still green');
  for(const width of [1280,390,320]){await p.setViewportSize({width,height:900});if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow '+width);}
  await p.setViewportSize({width:1280,height:1000});await p.locator('.combo input').first().click();await p.locator('.combo-menu.open').first().waitFor();const menu=await p.locator('.combo-menu.open').first().evaluate(el=>getComputedStyle(el).backgroundColor);if(menu!==blue.main.background)throw Error('Dropdown palette mismatch');
  await p.keyboard.press('Escape');await p.screenshot({path:'.playwright-cli/brand-blue-dark.png'});
  await p.getByLabel('Giao diện',{exact:true}).selectOption('system');await p.emulateMedia({colorScheme:'light'});await p.waitForFunction(()=>document.documentElement.dataset.colorScheme==='light');await p.emulateMedia({colorScheme:'dark'});await p.waitForFunction(()=>document.documentElement.dataset.colorScheme==='dark');
  for(const route of ['/dashboard','/history','/setup']){await p.goto('http://127.0.0.1:5176'+route);await p.locator('main').waitFor();await brand('#2563eb');await p.waitForFunction(()=>document.documentElement.dataset.colorScheme==='dark');const panels=await p.locator('.dashboard-panel,.archive-panel,.setup-steps li').evaluateAll(els=>els.map(el=>getComputedStyle(el).backgroundColor));if(!panels.length)throw Error('Missing panels '+route);for(const panel of panels){const c=panel.match(/\d+/g).map(Number);if(c[2]<=c[1])throw Error(route+' green panel');}}
  return{passed:true,green,blue,red,responsive:[1280,390,320],systemSwitch:true,defaultAndCleanup:true};
 }finally{await p.close();}
}
