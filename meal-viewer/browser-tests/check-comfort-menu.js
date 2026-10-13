async page=>{
 const p=await page.context().newPage();
 await p.route('**/api/session',r=>r.fulfill({json:{authenticated:true}}));await p.route('**/api/branding',r=>r.fulfill({json:{schoolName:'Fixture',primaryColor:'#357185'}}));await p.route('**/api/viewer*',r=>r.fulfill({status:404,json:{error:'Chưa có thực đơn.'}}));await p.route('**/api/dashboard*',r=>r.fulfill({json:{role:'owner',email:'owner@example.com',accountId:'menu-fixture',permissions:{view:true,create:true,manageResponses:true},weeks:[],allowedEmails:[]}}));await p.route('**/api/history*',r=>r.fulfill({json:{weeks:[]}}));
 const toggle=p.getByRole('button',{name:'Tùy chọn hiển thị',exact:true}),menu=p.locator('.comfort-menu');
 const show=async()=>{await toggle.click();await menu.waitFor({state:'visible'});};
 try{
  await p.goto('http://127.0.0.1:5176/newest');if(await toggle.count()!==1)throw Error('Missing single ellipsis menu button');if(await p.getByLabel('Giao diện',{exact:true}).isVisible())throw Error('Settings not collapsed');
  for(const width of[1280,390,320]){
   await p.setViewportSize({width,height:844});await show();const rect=await menu.boundingBox();if(rect.x<0||rect.x+rect.width>width||rect.y+rect.height>844)throw Error('Menu outside viewport '+width);
   await p.getByLabel('Giao diện',{exact:true}).selectOption('dark');await p.getByLabel('Hiệu ứng',{exact:true}).selectOption('off');await p.getByRole('button',{name:'Lớn',exact:true}).click();if(!await menu.isVisible())throw Error('Setting dismissed menu');
   if(await menu.evaluate(el=>el.scrollWidth>el.clientWidth))throw Error('Large text overflow inside menu');if(width===390)await p.screenshot({path:'.playwright-cli/comfort-menu-dark.png'});
   await p.keyboard.press('Escape');await menu.waitFor({state:'hidden'});if(!await toggle.evaluate(el=>el===document.activeElement))throw Error('Escape did not restore trigger focus');
   await show();await toggle.click();await menu.waitFor({state:'hidden'});await show();await p.mouse.click(4,820);await menu.waitFor({state:'hidden'});
   await toggle.focus();await p.keyboard.press('ArrowDown');await menu.waitFor({state:'visible'});if(!await p.getByRole('button',{name:'Lệnh nhanh',exact:true}).evaluate(el=>el===document.activeElement))throw Error('ArrowDown did not focus first action');
   await p.keyboard.press('ArrowDown');if(!await p.getByRole('button',{name:'Bình thường',exact:true}).evaluate(el=>el===document.activeElement))throw Error('Menu arrow navigation missing');await p.keyboard.press('ArrowUp');
   await p.keyboard.press('Enter');await p.locator('.quick-dialog[open]').waitFor();if(await menu.isVisible())throw Error('Two overlays stayed open');await p.keyboard.press('Escape');if(!await toggle.evaluate(el=>el===document.activeElement))throw Error('Command dialog returned to hidden item');
   await p.keyboard.press('Control+k');await p.locator('.quick-dialog[open]').waitFor();await p.keyboard.press('Escape');await p.reload();await show();if(await p.getByLabel('Giao diện',{exact:true}).inputValue()!=='dark'||await p.getByLabel('Hiệu ứng',{exact:true}).inputValue()!=='off')throw Error('Preferences lost');await p.getByRole('button',{name:'Bình thường',exact:true}).click();
   await p.getByLabel('Giao diện',{exact:true}).selectOption('light');await p.keyboard.press('Escape');await show();await p.screenshot({path:'.playwright-cli/comfort-menu-'+width+'.png'});await p.keyboard.press('Escape');
  }
  await show();await p.setViewportSize({width:390,height:300});await menu.waitFor({state:'hidden'});await show();const short=await menu.boundingBox();if(short.y+short.height>300)throw Error('Short viewport overflow');await p.keyboard.press('Escape');await p.setViewportSize({width:390,height:844});
  for(const route of['/next','/history','/dashboard','/setup']){await p.goto('http://127.0.0.1:5176'+route);await show();await p.keyboard.press('Escape');}
  await p.setViewportSize({width:320,height:500});await p.goto('http://127.0.0.1:5176/setup');await p.evaluate(()=>document.documentElement.style.overflowY='scroll');await show();const gutter=await menu.boundingBox();if(gutter.x<0||gutter.x+gutter.width>320)throw Error('Classic scrollbar gutter overflow '+JSON.stringify(gutter));
  return{passed:true,widths:[1280,390,320],routes:5,toggleOutsideEscape:true,keyboardFocus:true,commandShortcut:true,preferences:true};
 }finally{await p.close();}
}
