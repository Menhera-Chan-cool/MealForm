import {Card} from './components/ui/card.jsx';
import {Badge} from './components/ui/badge.jsx';
import {ALL} from './viewer-model.mjs';

export default function ViewerSummary({days,filters,model}) {
  const groups=days.map((day,index)=>({label:typeof day==='string'?day:day.day,index,meals:(day.meals||[]).filter(meal=>filters.meal===ALL||meal.toLocaleLowerCase().includes(filters.meal.toLocaleLowerCase()))})).filter(day=>(filters.day===ALL||day.label===filters.day)&&day.meals.length);
  return groups.length?<div className="ui-summary-grid">{groups.map(day=><Card className="ui-day-card" key={day.label}><h3>{day.label}</h3><dl>{day.meals.map(meal=><div key={meal}><dt>{meal}</dt><dd><Badge variant="secondary">{model.sourceRows.filter(row=>String(row?.[2+day.index]||'').trim()===meal).length}<span> lượt</span></Badge></dd></div>)}</dl></Card>)}</div>:<p className="empty">Không có dữ liệu phù hợp.</p>;
}
