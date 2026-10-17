import {imageDataBytes} from './image-import.mjs';
export function normalizeOcrDraft(value, accountId) {
  if(value?.sourceStale!==undefined&&typeof value.sourceStale!=='boolean')return null;
  const tableSource=value?.source==='table'&&value?.image==='';
  if (!accountId || value?.version !== 1 || value.accountId !== accountId || typeof value.image !== 'string' || value.image.length > 4_000_000 || (!tableSource&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value.image))) return null;
  let images;
  if(value.images!==undefined){
    if(!Array.isArray(value.images)||!value.images.length||value.images.length>5)return null;
    try{images=value.images.map(entry=>{if(typeof entry.name!=='string'||entry.name.length>500||entry.label!==undefined&&(typeof entry.label!=='string'||entry.label.length>100))throw Error();imageDataBytes(entry.dataUrl);return{dataUrl:entry.dataUrl,name:entry.name,...(entry.label!==undefined?{label:entry.label}:{})};});if(images.reduce((sum,image)=>sum+imageDataBytes(image.dataUrl),0)>2800000||!images.some(entry=>entry.dataUrl===value.image))return null;}catch{return null;}
  }
  for(const candidate of [value.menu,value.originalMenu])if(candidate){
    const days = candidate.days;
    if (!Array.isArray(days) || days.length > 5 || String(candidate.title || '').length > 500) return null;
    if (days.some(day => !day || (day.closed !== undefined && typeof day.closed !== 'boolean') || String(day.day || '').length > 40 || String(day.date || '').length > 40 || !Array.isArray(day.meals) || day.meals.length > 3 || day.meals.some(meal => String(meal || '').length > 500))) return null;
  }
  const normalizeMenu=menu=>menu?{title:String(menu.title||''),days:menu.days.map(day=>({day:String(day.day||''),date:String(day.date||''),meals:day.meals.map(meal=>String(meal||'')),...(day.closed?{closed:true}:{})}))}:null;
  return { version: 1, accountId,...(value.sourceStale===true?{sourceStale:true}:{}), image: value.image, filename: String(value.filename || '').slice(0, 500), ...(images?{images}:{}), menu:normalizeMenu(value.menu), ...(value.originalMenu!==undefined?{originalMenu:normalizeMenu(value.originalMenu)}:{}),...(tableSource?{source:'table'}:{}), savedAt: Number(value.savedAt) || 0 };
}

function transactDraft(mode, operation) {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('Trình duyệt không hỗ trợ lưu nháp.')); return; }
    let blocked = false;
    const request = indexedDB.open('meal-ocr-drafts', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts', { keyPath: 'accountId' });
    request.onerror = () => reject(new Error('Không mở được nơi lưu nháp.'));
    request.onblocked = () => { blocked = true; reject(new Error('Nơi lưu nháp đang bị tab khác chặn.')); };
    request.onsuccess = () => {
      const db = request.result;
      if (blocked) { db.close(); return; }
      try {
        const tx = db.transaction('drafts', mode);
        const result = operation(tx.objectStore('drafts'));
        tx.oncomplete = () => { db.close(); resolve(result.result); };
        tx.onerror = tx.onabort = () => { db.close(); reject(new Error('Không lưu/đọc được nháp; hãy kiểm tra dung lượng và quyền lưu trên thiết bị.')); };
      } catch (error) { db.close(); reject(error); }
    };
  });
}

export async function readOcrDraft(accountId) {
  const value = await transactDraft('readonly', store => store.get(accountId));
  if (!value) return null;
  const draft = normalizeOcrDraft(value, accountId);
  if (!draft) throw new Error('Nháp cũ không hợp lệ; bạn có thể xóa nháp và chọn ảnh lại.');
  return draft;
}

export function deleteOcrDraft(accountId) {
  return transactDraft('readwrite', store => store.delete(accountId));
}

export function writeOcrDraft(accountId, value) {
  const draft = normalizeOcrDraft({ ...value, version: 1, accountId, savedAt: Date.now() }, accountId);
  if (!draft) return Promise.reject(new Error('Nội dung nháp không hợp lệ.'));
  return transactDraft('readwrite', store => store.put(draft));
}
