import {inspectMenu,menuCalendarKey} from './dashboard-model.mjs';

export function menuChanges(original,current){
  if(!original||!current)return null;
  const changes=[];
  const add=(id,label,before='',after='')=>{if(before!==after)changes.push({id,label,before,after});};
  add('ocr-title','Tiêu đề',original.title,current.title);
  for(let index=0;index<Math.max(original.days.length,current.days.length);index++){
    const before=original.days[index]||{},after=current.days[index]||{},label=after.day||before.day||'Ngày '+(index+1);
    add('ocr-date-'+index,label+' · Ngày',before.date,after.date);
    add('ocr-closed-'+index,label+' · Phục vụ',before.closed?'Nghỉ':'Phục vụ',after.closed?'Nghỉ':'Phục vụ');
    for(let slot=0;slot<3;slot++)add(`ocr-meal-${index}-${slot}`,`${label} · Món ${slot+1}`,before.meals?.[slot]||'',after.meals?.[slot]||'');
  }
  return changes;
}

export function parseMealTable(text){
  if(typeof text!=='string'||text.length>50000)throw Error('Bảng quá dài; tối đa 50.000 ký tự.');
  if(/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text))throw Error('Bảng có ký tự điều khiển không hợp lệ.');
  const rows=[];let row=[],cell='',quoted=false;
  const pushCell=()=>{row.push(cell.trim());cell='';if(row.length>12)throw Error('Tối đa 12 cột.');};
  const pushRow=()=>{pushCell();if(row.some(Boolean))rows.push(row);row=[];if(rows.length>20)throw Error('Tối đa 20 hàng kể cả tiêu đề.');};
  for(let i=0;i<text.length;i++){
    const char=text[i];
    if(char==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(quoted||!cell)quoted=!quoted;else cell+=char;}
    else if(!quoted&&(char==='\t'||char==='\r'||char==='\n')){if(char==='\t')pushCell();else{pushRow();if(char==='\r'&&text[i+1]==='\n')i++;}}
    else cell+=char;
  }
  if(quoted)throw Error('Ô có dấu ngoặc kép chưa đóng.');
  pushRow();if(!rows.length)throw Error('Dán bảng ngày và món vào ô trên.');return rows;
}

export function menuFromTable(rows,mapping,current){
  const columns=[mapping.date,...mapping.meals.filter(value=>value>=0)];
  if(columns.length<3||columns.some(value=>!Number.isInteger(value)||value<0||value>11)||new Set(columns).size!==columns.length)throw Error('Chọn cột ngày và ít nhất 2 cột món khác nhau.');
  const body=rows.slice(mapping.header?1:0);if(body.length!==5)throw Error('Bảng phải có đúng 5 ngày, không tính hàng tiêu đề.');
  const value=text=>{const result=String(text||'').trim();if(result.length>500||/^[=+@]/.test(result))throw Error('Dán giá trị văn bản, không dùng công thức; mỗi ô tối đa 500 ký tự.');return result.replace(/\s+/g,' ');};
  const next={title:current?.title||'Thực đơn bán trú',days:body.map((row,index)=>{
    let date=value(row[mapping.date]);if(/^\d{4}-\d{2}-\d{2}$/.test(date))date=date.split('-').reverse().join('/');
    return {day:'Thứ '+(index+2),date,meals:mapping.meals.map(column=>column<0?'':value(row[column]))};
  })};
  const issues=inspectMenu(next,true);if(issues.dateError)throw Error(issues.dateError+' Dùng ngày/tháng/năm, không dùng số ngày Excel.');
  const previousDates=(current&&menuCalendarKey(current)||'').split('_');
  menuCalendarKey(next).split('_').forEach((key,index)=>{if(current?.days[previousDates.indexOf(key)]?.closed)next.days[index].closed=true;});return next;
}

export function copyDayMeals(menu,source,target){
  if(!Number.isInteger(source)||!Number.isInteger(target)||source===target||!menu?.days[source]||!menu.days[target])throw Error('Chọn hai ngày khác nhau trong nháp.');
  if(menu.days[source].closed||menu.days[target].closed)throw Error('Không sao chép từ hoặc vào ngày nghỉ.');
  return {...menu,days:menu.days.map((day,index)=>index===target?{...day,meals:[...menu.days[source].meals]}:day)};
}

export function weekOptionHint(week){
  const count=typeof week.responseCount==='number'&&Number.isFinite(week.responseCount)&&week.responseCount>=0?`${week.responseCount} lượt`:'Chưa đọc được số lượt';
  return count+' · '+({open:'Form đang mở',closed:'Form đã đóng'}[week.formStatus]||'Chưa rõ trạng thái Form');
}
export function moveDraftMeal(menu,dayIndex,from,to){
  const day=menu?.days?.[dayIndex];
  if(!day||day.closed||!Array.isArray(day.meals)||day.meals.length>3||![from,to].every(index=>Number.isInteger(index)&&index>=0&&index<3)||from===to)return menu;
  const meals=Array.from({length:3},(_,index)=>day.meals[index]??'');meals.splice(to,0,meals.splice(from,1)[0]);
  return {...menu,days:menu.days.map((value,index)=>index===dayIndex?{...day,meals}:value)};
}
