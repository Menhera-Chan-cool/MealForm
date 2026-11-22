import {ALL} from './viewer-model.mjs';
import {calendarDayChoices,isClosedDay,sameDisplayDay} from './reading-ui.mjs';
import SearchHighlight from './SearchHighlight.jsx';
import DayLabel from './DayLabel.jsx';

/** @param {{days:any[],filters:any,model:any,onMealSelect?:(day:string,meal:string)=>void}} props */
export default function ViewerSummary({days,filters,model,onMealSelect,closedDays=[],calendarDays=[]}) {
  const labels=calendarDayChoices(days,closedDays,calendarDays);
  const groups=labels.map(label=>{
    const index=days.findIndex(day=>sameDisplayDay(typeof day==='string'?day:day.day,label));
    const meals=(days[index]?.meals||[]).filter(meal=>filters.meal===ALL||meal.toLocaleLowerCase().includes(filters.meal.toLocaleLowerCase()));
    const choices=meals.map(meal=>({meal,count:model.sourceRows.filter(row=>String(row?.[2+index]??'').trim()===meal).length}));
    return {label,closed:isClosedDay(label,closedDays),choices,total:choices.reduce((sum,item)=>sum+item.count,0)};
  }).filter(day=>(filters.day===ALL||sameDisplayDay(day.label,filters.day))&&(day.closed||day.choices.length));
  return groups.length?<div className="viewer-menu-list">{groups.map(day=><section className="viewer-menu-day" key={day.label}><h3><DayLabel label={day.label}/></h3>{day.closed?<p>Không phục vụ</p>:<dl>{day.choices.map(({meal,count})=><div key={meal}><div className="viewer-meal-line"><dt>{onMealSelect?<button type="button" className="secondary summary-meal-button" aria-label={`Xem người chọn ${meal} · ${day.label}`} onClick={()=>onMealSelect(day.label,meal)}><SearchHighlight text={meal} query={filters.meal} accent={false}/></button>:<SearchHighlight text={meal} query={filters.meal} accent={false}/>}</dt><dd>{count}<span className="visually-hidden"> lựa chọn</span></dd></div><div className="viewer-meal-track" aria-hidden="true"><span style={{width:day.total?`${count/day.total*100}%`:'0%'}}/></div></div>)}</dl>}</section>)}</div>:<p className="empty">Không có dữ liệu phù hợp.</p>;
}
