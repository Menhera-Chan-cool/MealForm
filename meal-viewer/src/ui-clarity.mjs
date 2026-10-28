import {ALL,foldSearchText,parseServingDay} from './viewer-model.mjs';
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
  const match=label.match(/^(Thứ\s+(?:[2-7]|Hai|Ba|Tư|Bốn|Năm|Sáu|Bảy)|Chủ\s+nhật)\s*(?:\(|[·,–-])?\s*(\d{1,2})[./-](\d{1,2})[./-](\d{4})\)?$/iu);
  if(!match||!parseServingDay(label))return label;
  const [,weekday,day,month]=match;
  const short=({'thu hai':'T2','thu ba':'T3','thu tu':'T4','thu bon':'T4','thu nam':'T5','thu sau':'T6','thu bay':'T7','chu nhat':'CN'})[foldSearchText(weekday)]||weekday.replace(/^Thứ\s+/iu,'T');
  return `${short} · ${day.padStart(2,'0')}/${month.padStart(2,'0')}`;
}

export function archiveWeekHref(key,month='',view='list',status='all') {
  const params=new URLSearchParams({week:key});
  if(/^\d{4}-(0[1-9]|1[0-2])$/.test(month))params.set('month',month);
  if(view==='calendar')params.set('layout','calendar');
  if(['open','closed','unknown'].includes(status))params.set('status',status);
  return '/history?'+params;
}
export function archiveBackHref(key,search) {
  const source=new URLSearchParams(search),months=weekMonths({weekKey:key});
  const month=months.includes(source.get('month'))?source.get('month'):months[0];
  const params=new URLSearchParams();if(month)params.set('month',month);
  if(source.get('layout')==='calendar')params.set('layout','calendar');
  if(['open','closed','unknown'].includes(source.get('status')))params.set('status',source.get('status'));
  return '/history'+(params.size?'?'+params:'');
}
export function archiveMetadata(week) {
  return {count:Number.isSafeInteger(week.responseCount)&&week.responseCount>=0?`${week.responseCount} lượt gửi`:'Chưa đọc được số lượt',status:week.formStatus==='open'?'Form đang mở':week.formStatus==='closed'?'Form đã đóng':'Chưa xác định Form'};
}
export function archiveFormStatus(week){return ['open','closed'].includes(week?.formStatus)?week.formStatus:'unknown';}

export function groupAuditDays(events){
  const groups=new Map();
  for(const event of events){const valid=typeof event.at==='number'||typeof event.at==='string'&&event.at.trim()!=='',time=valid?Number(event.at):NaN,date=new Date(time+7*3600000),key=Number.isFinite(date.getTime())?date.toISOString().slice(0,10):'unknown';if(!groups.has(key))groups.set(key,{key,label:key==='unknown'?'Chưa rõ thời gian':key.split('-').reverse().join('/'),events:[],attention:0});const group=groups.get(key);group.events.push(event);if(/(?:-pending|-review|-failed)$|^partial$/.test(event.action))group.attention++;}
  return [...groups.values()];
}
export function viewerPageTitle(data,fallback) {
  const dates=(data?.calendarDays||data?.days||[]).map(parseServingDay).filter(Boolean).map(day=>day.key).sort();
  const range=weekRange({startDate:dates[0],endDate:dates.at(-1)});
  if(!range)return fallback;
  const start=range.start.split('-').reverse(),end=range.end.split('-').reverse();
  return `Tuần ${range.start.slice(0,7)===range.end.slice(0,7)?start[0]:start.join('/')}–${end.join('/')} · Thực đơn`;
}
export function brandHasEdits(draft,saved) {
  return ['schoolName','logoUrl','primaryColor'].some(key=>String(draft?.[key]??'')!==String(saved?.[key]??''));
}

export function filterConditions(filters,labels={name:'Họ tên',day:'Ngày',meal:'Món'}) {
  return Object.entries(labels).flatMap(([key,label])=>{
    const value=filters?.[key];
    return value===true?[{key,label,value:'Đang bật'}]:typeof value==='string'&&value.trim()&&value.trim()!==ALL?[{key,label,value}]:[];
  });
}

export function noticePreview(text,endsOn,now=Date.now()) {
  let message='';
  if(typeof text!=='string'||!text.trim())message='Chưa có nội dung để xem trước.';
  else if(text.length>500)message='Nội dung vượt quá 500 ký tự.';
  else if(!weekRange({startDate:endsOn,endDate:endsOn}))message='Chọn ngày hết hạn hợp lệ để xem trước.';
  const expiresAt=Date.parse(`${endsOn}T23:59:59.999+07:00`);
  if(!message&&expiresAt<=now)message='Thông báo đã hết hạn; sẽ không hiện trên trang xem.';
  return message?{notice:null,message}:{notice:{text,expiresAt},message:''};
}

export function reviewChanges(before,after,labels) {
  return Object.entries(labels).map(([key,label])=>({label,before:String(before?.[key]??''),after:String(after?.[key]??'')})).filter(row=>row.before!==row.after);
}

export function viewerLinkIssue(pathname,search) {
  const path=String(pathname||'/').replace(/\/+$/,'')||'/',params=new URLSearchParams(search);
  if(!['/','/newest','/next','/history','/dashboard','/setup'].includes(path))return 'route';
  if(path==='/'&&params.has('view')&&!/^[A-Za-z0-9_-]{1,100}$/.test(params.get('view')||''))return 'invalid';
  if(path==='/history'&&params.has('week')&&!/^[A-Za-z0-9_-]{1,120}$/.test(params.get('week')||''))return 'invalid';
  return null;
}

export function viewerProblemKind(status,message='') {
  if(status===502&&/^Không tìm thấy tuần đã đăng ký\./.test(message))return 'missing';
  if(status===502&&/^Chỉ xem tuần cũ/.test(message))return 'archive-only';
  return ({400:'invalid',403:'forbidden',404:'missing'})[status]||'connection';
}

export function ocrReviewLinks(menu,validation,allowMissing){
  const links=[];
  (menu?.days||[]).forEach((day,index)=>{
    const issue=validation.dayIssues[index],label=day?.day||`Thứ ${index+2}`;
    if(issue.dateError)links.push({id:`ocr-date-${index}`,label:`${label} · Ngày`,message:issue.dateError,blocking:true});
    issue.missingMealSlots.forEach(slot=>links.push({id:`ocr-meal-${index}-${slot}`,label:`${label} · Món ${slot+1}`,message:issue.mealError||'Chưa có món. Đối chiếu ảnh hoặc xác nhận ngày có ít hơn 3 món ở cuối bảng.',blocking:Boolean(issue.mealError)||!allowMissing}));
    if(issue.mealError&&!issue.missingMealSlots.length)links.push({id:`ocr-meal-${index}-0`,label:`${label} · Món`,message:issue.mealError,blocking:true});
  });
  if(validation.dateError&&menu?.days?.length!==5)links.push({id:'ocr-monday',label:'Ngày của tuần',message:validation.dateError,blocking:true});
  if(validation.servingError)links.push({id:'ocr-closed-0',label:'Ngày phục vụ',message:validation.servingError,blocking:true});
  return links;
}
