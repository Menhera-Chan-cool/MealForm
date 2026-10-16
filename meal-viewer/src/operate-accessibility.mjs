import {logoInputIssue} from './branding.mjs';
import {TEXT_LIMITS} from './operating-ui.mjs';

export function shortFilename(name=''){
  const chars=Array.from(name);
  if(chars.length<=48)return name;
  const dot=name.lastIndexOf('.'),extension=dot>0&&name.length-dot<=12?name.slice(dot):'';
  const base=Array.from(extension?name.slice(0,dot):name);
  return base.slice(0,24).join('')+'…'+base.slice(-12).join('')+extension;
}
export function brandFieldErrors(value){
  const errors=[],name=value.schoolName||'';
  if(!name.trim()||name.length>TEXT_LIMITS.schoolName||/[\x00-\x1f]/.test(name))errors.push({field:'schoolName',label:'Tên trường',message:`Nhập tên trường từ 1 đến ${TEXT_LIMITS.schoolName} ký tự, không có ký tự điều khiển.`});
  const logo=logoInputIssue(value.logoUrl);if(logo)errors.push({field:'logoUrl',label:'URL logo',message:logo});
  if(!/^#[0-9a-f]{6}$/i.test(value.primaryColor||''))errors.push({field:'primaryColor',label:'Màu chủ đạo',message:'Chọn màu hợp lệ dạng #RRGGBB.'});
  return errors;
}
export function noticeFieldErrors(text,endsOn){
  const errors=[];
  if(!text.trim()||text.length>TEXT_LIMITS.notice)errors.push({field:'text',label:'Nội dung thông báo',message:`Nhập nội dung từ 1 đến ${TEXT_LIMITS.notice} ký tự.`});
  const date=/^\d{4}-\d{2}-\d{2}$/.test(endsOn)&&new Date(endsOn+'T00:00:00+07:00');
  if(!date||!Number.isFinite(date.getTime())||new Date(date.getTime()+7*3600000).toISOString().slice(0,10)!==endsOn)errors.push({field:'endsOn',label:'Hiển thị hết ngày',message:'Chọn ngày hết hạn hợp lệ theo giờ Việt Nam.'});
  return errors;
}
