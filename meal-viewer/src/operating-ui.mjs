import {imageDataBytes,IMAGE_LIMITS} from './image-import.mjs';
export const TEXT_LIMITS={schoolName:100,notice:500,reason:500};
export function imageBudget(images){
  try{const bytes=images.reduce((sum,image)=>sum+imageDataBytes(image.dataUrl),0);return {count:images.length,bytes,remainingBytes:Math.max(0,IMAGE_LIMITS.bytes-bytes),remainingSlots:Math.max(0,IMAGE_LIMITS.count-images.length)};}catch{return null;}
}
export function decimalMB(bytes){return new Intl.NumberFormat('vi-VN',{maximumFractionDigits:2}).format(bytes/1000000);}
export function characterBudget(value,limit){const used=value.length,remaining=limit-used;return {used,remaining,warning:remaining<=Math.ceil(limit/10)};}
export function healthCounts(checks=[]){const counts={ok:0,warning:0,error:0,unknown:0};for(const check of checks)counts[['ok','warning','error'].includes(check.status)?check.status:'unknown']++;return counts;}
export function readableTime(value,now=Date.now()){
  let timestamp;
  if(typeof value==='number')timestamp=value;
  else if(typeof value==='string'){
    const match=value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if(match){const [,d,m,y,h,min,s='0']=match;timestamp=Date.UTC(+y,+m-1,+d,+h-7,+min,+s);const date=new Date(timestamp+7*3600000);if(date.getUTCFullYear()!==+y||date.getUTCMonth()!==+m-1||date.getUTCDate()!==+d||+h>23||+min>59||+s>59)return null;}
    else if(/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)){const day=value.slice(0,10),date=new Date(day+'T00:00:00Z');if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==day)return null;timestamp=Date.parse(value);}
  }
  if(!Number.isFinite(timestamp)||timestamp<=0||!Number.isFinite(now))return null;
  const date=new Date(timestamp),day=time=>new Date(time+7*3600000).toISOString().slice(0,10);
  if(!Number.isFinite(date.getTime())||!Number.isFinite(new Date(now+7*3600000).getTime())||!Number.isFinite(new Date(timestamp+7*3600000).getTime()))return null;
  const full=typeof value==='string'?value:date.toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}),clock=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date);
  const prefix=day(timestamp)===day(now)?'Hôm nay':day(timestamp)===day(now-86400000)?'Hôm qua':'';
  return {short:prefix?`${prefix} · ${clock}`:full,full,dateTime:date.toISOString()};
}
