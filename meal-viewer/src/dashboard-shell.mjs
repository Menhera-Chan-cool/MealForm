import {groupDashboardWeeks} from './dashboard-model.mjs';
import {weekChoices} from './ui-model.mjs';
import {weekOptionHint} from './draft-tools.mjs';

const WEEK_SCOPED_TABS=new Set(['delete','form','notice','reconcile','health']);
const MISSING_LABEL='Chưa có thực đơn';

export function shellTabs(role,_permissions){
  const owner=role==='owner';
  return [
    {id:'delete',label:'Lượt gửi & lịch sử',shortLabel:'Lượt gửi'},
    ...(owner?[{id:'form',label:'Điều khiển Form',shortLabel:'Form'},{id:'notice',label:'Thông báo tuần',shortLabel:'Thông báo'}]:[]),
    {id:'reconcile',label:'Đối soát',shortLabel:'Đối soát'}
  ];
}

export function shellSettings(role){
  return role==='owner'?[{id:'branding',label:'Thương hiệu'},{id:'health',label:'Hệ thống'},{id:'access',label:'Quyền Gmail'}]:[];
}

export function canCreateWeek(role,permissions){
  return permissions?.create===true;
}

export function isWeekScopedTab(id){
  return WEEK_SCOPED_TABS.has(id);
}

export function weekMenuRows(weeks,weekKey,{now=Date.now(),canCreate=false}={}){
  const list=Array.isArray(weeks)?weeks:[];
  const grouped=groupDashboardWeeks(list,now);
  const choices=weekChoices(list,now);
  const taken=new Set();
  const weekRow=(choice,group)=>({
    kind:'week',weekKey:choice.weekKey,label:choice.label,group,
    selected:Boolean(weekKey)&&choice.weekKey===weekKey,
    hint:weekOptionHint(choice),
    status:choice.formStatus==='open'||choice.formStatus==='closed'?choice.formStatus:'unknown'
  });
  const slotRow=(week,group)=>{
    const index=week?choices.findIndex(choice=>choice.weekKey===week.weekKey):-1;
    if(index<0)return {kind:'missing',group,label:MISSING_LABEL,canCreate:canCreate===true};
    taken.add(index);
    return weekRow(choices[index],group);
  };
  return [
    slotRow(grouped.current,'Tuần này'),
    slotRow(grouped.next,'Tuần sau'),
    ...choices.flatMap((choice,index)=>taken.has(index)?[]:[weekRow(choice,choice.group)])
  ];
}
