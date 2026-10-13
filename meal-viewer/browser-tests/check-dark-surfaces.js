async page=>{
 const p=await page.context().newPage();const failures=[],checked=[];let filled=false;
 const week={weekKey:'2026-10-12_2026-10-13_2026-10-14_2026-10-15_2026-10-16',name:'Tuần thử',formStatus:'open',dayLabels:['Thứ 2 (12/10/2026)'],formUrl:'https://example.com/form',spreadsheetUrl:'https://example.com/sheet'};
 await p.addInitScript(()=>localStorage.setItem('meal-appearance',JSON.stringify({theme:'dark',motion:'off'})));
 await p.route('**/api/session',r=>r.fulfill({json:{authenticated:true}}));
 await p.route('**/api/branding',r=>r.fulfill({json:{schoolName:'Fixture',primaryColor:'#357185'}}));
 await p.route('**/api/viewer*',r=>r.fulfill({status:404,json:{error:'Chưa có thực đơn cho tuần này.'}}));
 await p.route('**/api/history*',r=>r.fulfill({json:{weeks:[]}}));
 await p.route('**/api/dashboard*',r=>{
  if(r.request().method()!=='GET')return r.fulfill({status:405,json:{error:'Readonly fixture'}});
  if(r.request().url().includes('notice=1'))return r.fulfill({json:{notice:{text:'',endsOn:'',expiresAt:0,updatedAt:0}}});
  if(r.request().url().includes('health=1'))return r.fulfill({json:{checkedAt:Date.now(),checks:[{id:'warning',label:'Cần chú ý',status:'warning',message:'Chưa có tuần thử'},{id:'error',label:'Thiếu cấu hình',status:'error',message:'Kiểm tra cài đặt'}]}});
  if(r.request().url().includes('week=')&&!r.request().url().includes('health='))return r.fulfill({json:{week,responseCount:1,responseIds:['fixture'],responses:[{responseId:'fixture',name:'Tên thử',timestamp:Date.now(),meals:['Món thử'],deletable:true,deleteToken:'fixture'}],history:[]}});
  return r.fulfill({json:{role:'owner',email:'owner@example.com',accountId:'dark-surfaces',permissions:{view:true,create:true,manageResponses:true},weeks:filled?[week]:[],allowedEmails:[]}});
 });
 const audit=async scope=>{const issues=await p.evaluate(scope=>{
  const rgb=v=>v.match(/[\d.]+/g).slice(0,3).map(Number),luma=c=>{const s=c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return s[0]*.2126+s[1]*.7152+s[2]*.0722;};
  return [...document.querySelectorAll(scope)].filter(el=>el.checkVisibility()&&!el.closest('button:disabled')&&el.childNodes.length&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(el=>{
   let parent=el,bg;while(parent){const v=getComputedStyle(parent).backgroundColor;if(v!=='transparent'&&v!=='rgba(0, 0, 0, 0)'){bg=rgb(v);break;}parent=parent.parentElement;}const style=getComputedStyle(el),a=luma(rgb(style.color)),b=luma(bg||[0,0,0]),contrast=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
   return{tag:el.tagName,class:el.className,contrast:+contrast.toFixed(2),background:bg,bright:b>.35};
  }).filter(item=>item.contrast<4.5||item.bright);
 },scope);failures.push(...issues);checked.push(scope);};
 try{
  for(const route of ['/newest','/next','/history','/dashboard','/setup']){await p.goto('http://127.0.0.1:5176'+route);await p.waitForFunction(()=>document.documentElement.style.getPropertyValue('--brand-primary')==='#357185');await p.locator('main').waitFor();if(route==='/next'||route==='/newest')await p.locator('.login-panel[role=status]').waitFor();if(route==='/history')await p.locator('.archive-panel').waitFor();await audit('main h2,main p,main label,main a,main small');}
  filled=true;await p.goto('http://127.0.0.1:5176/dashboard');await p.getByRole('button',{name:'Tổng quan',exact:true}).waitFor();
  for(const tab of ['Tổng quan','Tạo tuần bằng OCR','Lượt gửi & lịch sử','Điều khiển Form','Thông báo tuần','Đối soát','Thương hiệu','Hệ thống','Quyền Gmail']){await p.getByRole('button',{name:tab,exact:true}).click();await audit('.dashboard-panel h2,.dashboard-panel p,.dashboard-panel label,.dashboard-panel a,.dashboard-panel small,.dashboard-panel span');}
  await p.getByRole('button',{name:'Lệnh nhanh',exact:true}).click();await p.locator('.quick-dialog[open]').waitFor();await audit('.quick-dialog h2,.quick-dialog p,.quick-dialog button');await p.keyboard.press('Escape');
  for(const className of ['dashboard-confirm-dialog','response-quick-dialog','menu-image-dialog','region-ocr-dialog','merge-dialog']){
   await p.evaluate(className=>{const modal=document.createElement('dialog');modal.id='dialog-fixture';modal.className=className;modal.innerHTML='<h2>Tiêu đề hộp thoại</h2><p>Nội dung cần đọc rõ</p><label>Ghi chú<input value="Nội dung thử" /></label><button class="secondary">Đóng</button>';document.body.append(modal);modal.showModal();},className);await audit('#dialog-fixture h2,#dialog-fixture p,#dialog-fixture label,#dialog-fixture button');await p.evaluate(()=>document.querySelector('#dialog-fixture').remove());
  }
  // Exercise rarely shown CSS states using the exact component class combinations, without writes.
  await p.evaluate(()=>{
   const gallery=document.createElement('section');gallery.id='surface-fixtures';gallery.className='dashboard-panel';
   gallery.innerHTML='<label class="dashboard-confirm-missing">Chấp nhận ngày thiếu món</label><p class="dashboard-image-preview">Ảnh đã khôi phục</p><div class="version-notice"><p>Không thể lưu nháp</p></div><div class="menu-day" data-status="error"><span class="menu-review-badge">Ngày không hợp lệ</span></div><button class="secondary update-available">Tải lại dữ liệu</button><p class="form-status unknown">Chưa rõ trạng thái</p><div class="login-panel"><p class="error">Không có quyền</p></div>';
   document.querySelector('main').append(gallery);
  });await audit('#surface-fixtures *');
  for(const primaryColor of ['#087f5b','#2563eb','#ef4444','#ffffff','#000000']){
   await p.evaluate(primaryColor=>window.dispatchEvent(new CustomEvent('meal-branding-changed',{detail:{primaryColor}})),primaryColor);await p.waitForFunction(color=>document.documentElement.style.getPropertyValue('--brand-primary')===color,primaryColor);await audit('#surface-fixtures *');
  }
  await p.evaluate(()=>{const combo=document.createElement('div');combo.className='combo active';combo.innerHTML='<input placeholder="Tìm tên" />';document.querySelector('#surface-fixtures').append(combo);});
  await p.evaluate(()=>window.dispatchEvent(new CustomEvent('meal-branding-changed',{detail:{primaryColor:'#ffffff'}})));await p.waitForFunction(()=>document.documentElement.style.getPropertyValue('--brand-primary')==='#ffffff');
  const placeholderContrast=await p.locator('#surface-fixtures input').evaluate(el=>{const luma=v=>{const c=v.match(/\d+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};const a=luma(getComputedStyle(el,'::placeholder').color),b=luma(getComputedStyle(el).backgroundColor);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);});if(placeholderContrast<4.5)failures.push({state:'active placeholder white primary',contrast:placeholderContrast});
  for(const width of [1280,390,320]){await p.setViewportSize({width,height:900});await audit('.login-panel h2,.login-panel p,.archive-panel p,.dashboard-hint');}
  if(failures.length)throw Error(JSON.stringify(failures));
  await p.goto('http://127.0.0.1:5176/next');await p.locator('.login-panel[role=status]').waitFor();await p.screenshot({path:'.playwright-cli/dark-empty-next.png'});
  return{passed:true,routes:5,dashboardTabs:9,rareStates:8,dialogStyles:6,colors:5,widths:[1280,390,320],checked:checked.length};
 }finally{await p.close();}
}
