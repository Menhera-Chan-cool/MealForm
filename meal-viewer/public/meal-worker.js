// Notifications only: no fetch interception, cache, offline queue or background polling.
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  if(!['meal-ocr','meal-ocr-test'].includes(event.notification.tag))return;
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const target=windows.find(client=>{try{const url=new URL(client.url);return url.origin===self.location.origin&&/^\/dashboard\/?$/.test(url.pathname);}catch{return false;}});
    if(target){await target.focus();if(event.notification.tag==='meal-ocr')target.postMessage({type:'meal-open-ocr-notice'});}
    else await self.clients.openWindow(event.notification.tag==='meal-ocr'?'/dashboard?tab=create':'/newest');
  })());
});
