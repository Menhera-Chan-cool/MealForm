import {parseServingDay} from './viewer-model.mjs';
const text=value=>typeof value==='string'?value.trim():'';
export function mealCellLabel(value,closed=false){if(closed)return 'Không phục vụ';if(value==null||!['string','number'].includes(typeof value))return 'Chưa đọc được';return String(value).trim()===''?'Chưa chọn':'';}
function dayDate(label){return parseServingDay(label)?.key||'';}
export function sameDisplayDay(left,right){return Boolean(text(left)&&text(right)&&(text(left)===text(right)||dayDate(left)&&dayDate(left)===dayDate(right)));}
export function isClosedDay(label,closedDays=[]){return Array.isArray(closedDays)&&closedDays.some(day=>sameDisplayDay(label,day));}
export function calendarDayChoices(days=[],closedDays=[],calendarDays=[]){
 const serving=days.map(day=>text(typeof day==='string'?day:day?.day)).filter(Boolean),closed=Array.isArray(closedDays)?closedDays.filter(day=>text(day)):[],calendar=Array.isArray(calendarDays)?calendarDays:[],result=[];
 for(const value of [...calendar,...serving,...closed]){const label=serving.find(day=>sameDisplayDay(day,value))||closed.find(day=>sameDisplayDay(day,value));if(label&&!result.some(day=>sameDisplayDay(day,label)))result.push(label);}
 return result.sort((a,b)=>dayDate(a)&&dayDate(b)?dayDate(a).localeCompare(dayDate(b)):0);
}
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function minimapViewport(view){const {scrollWidth:w,scrollHeight:h,clientWidth:cw,clientHeight:ch}=view;if(![w,h,cw,ch].every(value=>Number.isFinite(value)&&value>0))return null;return {x:clamp(view.scrollLeft||0,0,Math.max(0,w-cw))/w,y:clamp(view.scrollTop||0,0,Math.max(0,h-ch))/h,width:Math.min(1,cw/w),height:Math.min(1,ch/h)};}
export function minimapScroll(x,y,view){if(!minimapViewport(view))return {left:0,top:0};return {left:clamp((Number.isFinite(x)?x:0)*view.scrollWidth-view.clientWidth/2,0,Math.max(0,view.scrollWidth-view.clientWidth)),top:clamp((Number.isFinite(y)?y:0)*view.scrollHeight-view.clientHeight/2,0,Math.max(0,view.scrollHeight-view.clientHeight))};}
export function loginTargetLabel(pathname,search=''){
 const path=String(pathname).replace(/\/+$/,'')||'/',params=new URLSearchParams(search);
 if(path==='/dashboard')return params.get('tab')==='create'?'Tạo tuần bằng OCR · Dashboard':params.get('tab')==='health'?'Hệ thống · Dashboard':'Dashboard quản trị';
 if(path==='/newest')return 'Thực đơn tuần này';if(path==='/next')return 'Thực đơn tuần sau';
 if(path==='/history'){
  const dates=(params.get('week')||'').split('_'),valid=key=>/^\d{4}-\d{2}-\d{2}$/.test(key)&&dayDate(key.split('-').reverse().join('/'))===key;
  if(dates.length>=2&&dates.length<=5&&dates.every(valid)&&new Set(dates).size===dates.length){const sorted=dates.slice().sort(),start=sorted[0],end=sorted.at(-1);if(Date.parse(end)-Date.parse(start)<=6*86400000)return `Tuần ${start.split('-').reverse().join('/')} – ${end.split('-').reverse().join('/')} · Kho tuần cũ`;}
  const month=params.get('month');return /^\d{4}-(0[1-9]|1[0-2])$/.test(month||'')?`Kho tuần cũ · Tháng ${month.slice(5)}/${month.slice(0,4)}`:'Kho tuần cũ';
 }
 return params.has('view')?'Bảng thực đơn theo liên kết':'Trang thực đơn';
}
