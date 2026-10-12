async page=>{
 const p=await page.context().newPage();let status='closed';
 await p.route('**/api/session',r=>r.fulfill({json:{authenticated:true}}));await p.route('**/api/branding',r=>r.fulfill({json:{schoolName:'School',logoUrl:'',primaryColor:'#087f5b',updatedAt:1}}));
 await p.route('**/api/viewer*',r=>r.fulfill({json:{title:'Fixture',days:[{day:'Thứ 2 (12/10/2026)',meals:['GÀ']}],headers:['Time','Name','Day'],rows:[['now','Fixture','GÀ']],formStatus:status,formUrl:'https://docs.google.com/forms/d/e/fixture/viewform'}}));
 const check=async selector=>p.locator(selector).first().evaluate(el=>{
  const rgb=value=>value.match(/[\d.]+/g).slice(0,3).map(Number),luma=c=>{const s=c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return s[0]*.2126+s[1]*.7152+s[2]*.0722;};
  const style=getComputedStyle(el);let parent=el,bg;
  while(parent){const value=getComputedStyle(parent).backgroundColor;if(value!=='rgba(0, 0, 0, 0)'&&value!=='transparent'){bg=rgb(value);break;}parent=parent.parentElement;}
  const a=luma(rgb(style.color)),b=luma(bg||[16,28,23]);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 });
 try{
  await p.setViewportSize({width:390,height:844});await p.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await p.goto('http://127.0.0.1:5176/newest');await p.getByLabel('Giao diện',{exact:true}).selectOption('dark');await p.getByLabel('Hiệu ứng',{exact:true}).selectOption('off');await p.getByLabel('Form đã đóng',{exact:true}).waitFor();
  const closed=await check('.meal-form-link.closed');if(closed<4.5)throw Error('Dark closed Form link contrast '+closed);
  const name=await check('.detail-wrap td:nth-child(2)');if(name<4.5)throw Error('Dark mobile response name contrast '+name);
  await p.getByRole('button',{name:'Mở tổng hợp',exact:true}).click();await p.getByRole('button',{name:'Đóng tổng hợp',exact:true}).click();if(await p.locator('#summary-panel').evaluate(el=>el.classList.contains('closing')))throw Error('Off left closing timer');
  await p.getByLabel('Hiệu ứng',{exact:true}).selectOption('light');const duration=await p.locator('.form-status').evaluate(el=>Math.max(...getComputedStyle(el).transitionDuration.split(',').map(parseFloat)));if(duration>.2)throw Error('Light status feedback too slow '+duration);
  status='open';await p.getByRole('button',{name:'Tải lại dữ liệu',exact:true}).click();await p.getByLabel('Form đang mở',{exact:true}).waitFor();await p.getByLabel('Hiệu ứng',{exact:true}).selectOption('full');if(await p.locator('.fax-document').evaluate(el=>getComputedStyle(el).animationName)==='none')throw Error('Full mode did not override reduced motion');
  return{passed:true,closedContrast:closed,mobileNameContrast:name,lightDuration:duration,offImmediate:true,fullReducedOverride:true};
 }finally{await p.close();}
}
