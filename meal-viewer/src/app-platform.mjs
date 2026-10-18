let worker;
export function appWorker(){
  if(!globalThis.navigator?.serviceWorker)return Promise.reject(Error('Trình duyệt chưa hỗ trợ thông báo ứng dụng.'));
  worker ||= navigator.serviceWorker.register('/meal-worker.js',{scope:'/'}).catch(error=>{worker=undefined;throw error;});
  return worker;
}
export const attentionDefaults={ocr:false,badge:true};
const prefix='meal-app-attention-v1:';
export function readAttentionPreferences(account,storage=globalThis.localStorage){
  try{const value=JSON.parse(storage.getItem(prefix+account)||'null');return {ocr:value?.ocr===true,badge:value?.badge!==false};}catch{return {...attentionDefaults};}
}
export function writeAttentionPreferences(account,value,storage=globalThis.localStorage){
  if(!account)throw Error('Chưa xác định tài khoản.');
  const key=prefix+account,keys=Array.from({length:storage.length},(_,index)=>storage.key(index)).filter(item=>item?.startsWith(prefix)&&item!==key);
  while(keys.length>=8)storage.removeItem(keys.shift());
  storage.setItem(key,JSON.stringify({ocr:value.ocr===true,badge:value.badge===true}));
}
export function notificationCapability(){
  try{return typeof Notification==='undefined'||typeof Notification.requestPermission!=='function'?'unsupported':Notification.permission;}catch{return 'unsupported';}
}
export async function showOcrNotification(test=false,isCurrent=()=>true){
  if(notificationCapability()!=='granted')throw Error('Chưa có quyền thông báo.');
  const body=test?'Đây là thông báo thử của MealForm.':'Đã có kết quả OCR cần rà soát.';
  const options={body,tag:test?'meal-ocr-test':'meal-ocr',icon:'/icons/meal-192.png'};
  if(globalThis.navigator?.serviceWorker){
    const registration=await appWorker();
    if(!registration.active){
      if(!navigator.serviceWorker.ready)throw Error('Ứng dụng chưa sẵn sàng nhận thông báo.');
      let timer;const ready=await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Ứng dụng chưa sẵn sàng nhận thông báo.')),8000);})]).finally(()=>clearTimeout(timer));
      if(!isCurrent())return;
      return ready.showNotification('MealForm',options);
    }
    if(!isCurrent())return;
    return registration.showNotification('MealForm',options);
  }
  if(!isCurrent())return;
  new Notification('MealForm',options);
}
