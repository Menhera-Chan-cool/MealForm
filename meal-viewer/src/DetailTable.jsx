import SearchHighlight from './SearchHighlight.jsx';
import {displayHeader} from './ui-clarity.mjs';
import DayLabel from './DayLabel.jsx';
import {ColumnResizeHandle} from './TableWorkspace.jsx';
import TableScroll from './TableScroll.jsx';
export default function DetailTable({ model,filters={} }) {
  const headers = model.headers || [];
  const rows = model.rows || [];
  const kind = index => index === model.nameIndex ? 'name' : index === model.timeIndex ? 'time' : 'value';

  return <TableScroll className="detail-wrap" style={{'--detail-table-min':`${Math.max(480,headers.length*144)}px`}}><table>
    <thead><tr>{headers.map((header, index) => <th data-kind={kind(index)} key={`${header}-${index}`}>{displayHeader(header)}<ColumnResizeHandle index={index} label={header}/></th>)}</tr></thead>
    <tbody>{rows.length ? rows.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((header, index) => <td data-kind={kind(index)} key={index}>
      <span className="mobile-cell-label"><DayLabel label={displayHeader(header)}/></span><span className={kind(index)==='name'?'response-card-name':kind(index)==='time'?'response-card-time':undefined}>{header==='Ngày'?<DayLabel label={row[index]||''}/>:<SearchHighlight text={row[index]||''} query={kind(index)==='name'?filters.name:model.mealIndexes?.includes(index)?filters.meal:''} accent={kind(index)==='name'}/>}</span>
      {kind(index)==='name'&&model.timeIndex<0&&<small className="response-card-time projected-time">{model.rowTimes?.[rowIndex]||''}</small>}
    </td>)}</tr>) : <tr><td className="empty" colSpan={Math.max(headers.length, 1)}>Không có kết quả</td></tr>}</tbody>
  </table></TableScroll>;
}
