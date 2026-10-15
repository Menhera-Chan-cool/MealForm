import {ALL,foldSearchText} from './viewer-model.mjs';
import {weekRange,weekMonths} from './ui-model.mjs';

export function highlightPieces(value,query,accent=true) {
  const text=String(value??''),needle=accent?foldSearchText(query):String(query??'').trim().toLocaleLowerCase();
  if(!needle||query===ALL)return [{text,match:false}];
  let folded='';const starts=[],ends=[];
  for(const {segment,index} of new Intl.Segmenter('vi',{granularity:'grapheme'}).segment(text)){
    const normalized=accent?segment.normalize('NFD').replace(/\p{M}/gu,'').replace(/[đĐ]/g,'d').toLocaleLowerCase():segment.toLocaleLowerCase();
    for(const char of normalized.split('')){
      if(accent&&/\s/.test(char)&&folded.endsWith(' ')){ends[ends.length-1]=index+segment.length;continue;}
      folded+=accent&&/\s/.test(char)?' ':char;starts.push(index);ends.push(index+segment.length);
    }
  }
  const parts=[];let from=0,position=0;
  while((position=folded.indexOf(needle,position))!==-1){
    const start=starts[position],end=ends[position+needle.length-1];
    if(start>=from){if(start>from)parts.push({text:text.slice(from,start),match:false});parts.push({text:text.slice(start,end),match:true});from=end;}
    position+=needle.length;
  }
  if(from<text.length||!parts.length)parts.push({text:text.slice(from),match:false});
  return parts;
}

export function displayHeader(value) {
  return ({timestamp:'Thời điểm gửi','thoi diem':'Thời điểm gửi','full name':'Họ tên',name:'Họ tên',date:'Ngày',meal:'Món',action:'Thao tác',status:'Trạng thái'})[foldSearchText(value)]||value;
}

export function compactDayLabel(value) {
  const label=String(value??'');
  const match=label.match(/^(Thứ\s+(?:[2-7]|Hai|Ba|Tư|Bốn|Năm|Sáu|Bảy)|Chủ\s+nhật)\s*(?:\(|[·,–-])?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\)?$/iu);
  if(!match)return label;
  const [,weekday,day,month,year]=match,iso=`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
  if(!weekRange({startDate:iso,endDate:iso}))return label;
  const short=({'thu hai':'T2','thu ba':'T3','thu tu':'T4','thu bon':'T4','thu nam':'T5','thu sau':'T6','thu bay':'T7','chu nhat':'CN'})[foldSearchText(weekday)]||weekday.replace(/^Thứ\s+/iu,'T');
  return `${short} · ${day.padStart(2,'0')}/${month.padStart(2,'0')}`;
}

export function archiveWeekHref(key,month='',view='list') {
  const params=new URLSearchParams({week:key});
  if(/^\d{4}-(0[1-9]|1[0-2])$/.test(month))params.set('month',month);
  if(view==='calendar')params.set('layout','calendar');
  return '/history?'+params;
}
export function archiveBackHref(key,search) {
  const source=new URLSearchParams(search),months=weekMonths({weekKey:key});
  const month=months.includes(source.get('month'))?source.get('month'):months[0];
  const params=new URLSearchParams();if(month)params.set('month',month);
  if(source.get('layout')==='calendar')params.set('layout','calendar');
  return '/history'+(params.size?'?'+params:'');
}
export function archiveMetadata(week) {
  return {count:Number.isSafeInteger(week.responseCount)&&week.responseCount>=0?`${week.responseCount} lượt gửi`:'Chưa đọc được số lượt',status:week.formStatus==='open'?'Form đang mở':week.formStatus==='closed'?'Form đã đóng':'Chưa xác định Form'};
}
export function viewerPageTitle(data,fallback) {
  const dates=(data?.calendarDays||data?.days||[]).map(day=>String(typeof day==='string'?day:day.day).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)).filter(Boolean).map(match=>`${match[3]}-${match[2].padStart(2,'0')}-${match[1].padStart(2,'0')}`).sort();
  const range=weekRange({startDate:dates[0],endDate:dates.at(-1)});
  if(!range)return fallback;
  const start=range.start.split('-').reverse(),end=range.end.split('-').reverse();
  return `Tuần ${range.start.slice(0,7)===range.end.slice(0,7)?start[0]:start.join('/')}–${end.join('/')} · Thực đơn`;
}
export function brandHasEdits(draft,saved) {
  return ['schoolName','logoUrl','primaryColor'].some(key=>String(draft?.[key]??'')!==String(saved?.[key]??''));
}
