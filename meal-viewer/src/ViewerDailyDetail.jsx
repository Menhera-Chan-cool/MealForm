import {ALL,buildDetailModel} from './viewer-model.mjs';
import {calendarDayChoices,isClosedDay,sameDisplayDay,mealCellLabel} from './reading-ui.mjs';
import DayLabel from './DayLabel.jsx';
import SearchHighlight from './SearchHighlight.jsx';
import FriendlyTime from './FriendlyTime.jsx';

export default function ViewerDailyDetail({data,filters,sort,exactMeal}) {
  const days=calendarDayChoices(data?.days||[],data?.closedDays||[],data?.calendarDays||[])
    .filter(day=>filters.day===ALL||sameDisplayDay(day,filters.day));
  return <div className="viewer-daily-list">{days.map(day=>{
    const closed=isClosedDay(day,data?.closedDays);
    const model=closed?null:buildDetailModel(data,{...filters,day},sort,exactMeal);
    return <section className="viewer-daily-day" key={day}>
      <h3><DayLabel label={day}/></h3>
      {closed?<p>Không phục vụ</p>:model.rows.length?<ul>{model.rows.map((row,index)=>{
        const value=row[1], label=mealCellLabel(value);
        return <li key={index}><div><strong><SearchHighlight text={row[0]} query={filters.name}/></strong>{model.rowTimes?.[index]&&<small className="viewer-daily-time"><FriendlyTime value={model.rowTimes[index]}/></small>}</div><span>{label||<SearchHighlight text={value} query={filters.meal}/>}</span></li>;
      })}</ul>:<p>Không có kết quả phù hợp.</p>}
    </section>;
  })}</div>;
}
