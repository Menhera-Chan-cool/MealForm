import {groupDashboardWeeks} from './dashboard-model.mjs';
export function ocrStage(menu,state) { return state==='creating'||state==='done'?2:menu?1:0; }
const DAY=86400000;
function isoDate(value) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return '';
  const date=new Date(value+'T00:00:00Z');
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value?value:'';
}
export function weekRange(week) {
  const parts=String(week?.weekKey||'').split('_');
  const dates=parts.every(isoDate)?parts.slice().sort():[];
  const start=dates[0]||isoDate(week?.startDate),end=dates.at(-1)||isoDate(week?.endDate)||start;
  return start&&end>=start&&Date.parse(end)-Date.parse(start)<=6*DAY?{start,end}:null;
}
export function weekMonths(week) {
  const range=weekRange(week);
  return range?[...new Set([range.start.slice(0,7),range.end.slice(0,7)])]:[];
}
export function archiveMonths(weeks) {return [...new Set(weeks.flatMap(weekMonths))].sort().reverse();}
export function weekOverlaps(week,start,end) {const range=weekRange(week);return Boolean(range&&range.start<=end&&range.end>=start);}
export function monthRows(month) {
  if(!isoDate(month+'-01'))return [];
  const first=new Date(month+'-01T00:00:00Z');
  const start=first.getTime()-((first.getUTCDay()+6)%7)*DAY;
  return Array.from({length:6},(_,row)=>Array.from({length:7},(_,column)=>{
    const date=new Date(start+(row*7+column)*DAY).toISOString().split('T')[0];
    return {date,inMonth:date.startsWith(month+'-')};
  }));
}
export function weekChoices(weeks,now=Date.now()) {
  const names=weeks.map(week=>String(week.name||week.weekKey));
  const groups=['Tuần này','Tuần sau','Tuần đã qua','Tuần khác'];
  return weeks.map((week,index)=>{
    const grouped=groupDashboardWeeks(weekRange(week)?[week]:[],now);
    const rank=grouped.current?0:grouped.next?1:grouped.past.length?2:3;
    const name=names[index],duplicate=names.filter(value=>value===name).length>1;
    return {...week,label:duplicate?`${name} (${week.weekKey})`:name,group:groups[rank],rank};
  }).sort((left,right)=>left.rank-right.rank||String(right.weekKey).localeCompare(String(left.weekKey)));
}
