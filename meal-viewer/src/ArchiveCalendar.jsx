import {monthRows,weekOverlaps} from './ui-model.mjs';

export default function ArchiveCalendar({month,weeks}) {
  const label=month.slice(5)+'/'+month.slice(0,4);
  return <div className="archive-calendar"><table aria-label={`Lịch kho tuần ${label}`}><caption>{label} · Các tuần đã lưu</caption><thead><tr>{['T2','T3','T4','T5','T6','T7','CN'].map(day=><th scope="col" key={day}>{day}</th>)}</tr></thead>{monthRows(month).map(row=>{
    const registered=weeks.filter(week=>weekOverlaps(week,row[0].date,row[6].date));
    return <tbody key={row[0].date}><tr>{row.map(day=><td key={day.date} className={!day.inMonth?'outside-month':undefined} data-registered={registered.some(week=>weekOverlaps(week,day.date,day.date))}><time dateTime={day.date}>{Number(day.date.slice(-2))}</time></td>)}</tr>{registered.length>0&&<tr><td colSpan="7"><div className="calendar-week-links">{registered.map(week=><a key={week.weekKey} href={`/history?week=${encodeURIComponent(week.weekKey)}`}>{week.name||week.weekKey}</a>)}</div></td></tr>}</tbody>;
  })}</table></div>;
}
