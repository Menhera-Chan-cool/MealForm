import SearchHighlight from './SearchHighlight.jsx';
import {displayHeader} from './ui-clarity.mjs';
import DayLabel from './DayLabel.jsx';
import {ColumnResizeHandle,WorkspaceRow,TableHeaderGroups,TableColumnWidths} from './TableWorkspace.jsx';
import TableScroll from './TableScroll.jsx';
import {mealCellLabel,isClosedDay} from './reading-ui.mjs';
import {useEffect,useId,useState} from 'react';
import FriendlyTime from './FriendlyTime.jsx';
export default function DetailTable({ model,filters={},closedDays=[] }) {
  const headers = model.headers || [];
  const rows = model.rows || [];
  const kind = index => index === model.nameIndex ? 'name' : index === model.timeIndex ? 'time' : 'value';
  const [guide,setGuide]=useState(null),[opened,setOpened]=useState([]),[allOpen,setAllOpen]=useState(false),id=useId();
  const collapsible=(model.mealIndexes?.length||0)>1&&!headers.includes('Ngày');
  const dayColumn=index=>model.mealIndexes?.includes(index)&&headers[index]!=='Món';
  const signature=JSON.stringify(headers);
  useEffect(()=>setGuide(null),[signature]);
  useEffect(()=>{const clear=()=>setGuide(null);window.addEventListener('resize',clear);return()=>window.removeEventListener('resize',clear);},[]);
  function point(event){
    const cell=event.target.closest('td,th'),index=Number(cell?.dataset.column),row=cell?.parentElement.dataset.row;
    if(event.pointerType!=='mouse'||!matchMedia('(min-width:701px) and (hover:hover)').matches||!cell||!dayColumn(index)){setGuide(null);return;}
    setGuide(current=>current?.column===index&&current?.row===row?current:{column:index,row});
  }
  function cell(row,index,header){
    if(kind(index)==='time')return <FriendlyTime value={row[index]}/>;
    if(header==='Ngày')return <DayLabel label={row[index]||''}/>;
    const label=model.mealIndexes?.includes(index)||isClosedDay(header,closedDays)?mealCellLabel(row[index],isClosedDay(header,closedDays)):'';
    return label?<span className="empty-meal-value">{label}</span>:<SearchHighlight text={row[index]??''} query={kind(index)==='name'?filters.name:model.mealIndexes?.includes(index)?filters.meal:''} accent={kind(index)==='name'}/>;
  }

  return <><div className="mobile-response-expansion" hidden={!collapsible}><button type="button" className="secondary" onClick={()=>{setAllOpen(value=>!value);setOpened([]);}}>{allOpen?'Thu gọn tất cả':'Mở tất cả'}</button></div><TableScroll className="detail-wrap" style={{'--detail-table-min':`${Math.max(480,headers.length*144)}px`}}><table onPointerOver={point} onPointerLeave={()=>setGuide(null)}>
    <TableColumnWidths/><thead><TableHeaderGroups headers={headers} mealIndexes={model.mealIndexes}/><WorkspaceRow>{headers.map((header, index) => <th data-column={index} data-reading-column={guide?.column===index} data-kind={kind(index)} key={`${header}-${index}`}>{displayHeader(header)}<ColumnResizeHandle index={index} label={header}/></th>)}</WorkspaceRow></thead>
    <tbody>{rows.length ? rows.map((row, rowIndex) => <WorkspaceRow data-row={rowIndex} data-reading-row={guide?.row===String(rowIndex)} data-collapsible={collapsible} data-open={allOpen!==opened.includes(rowIndex)} key={rowIndex}>{headers.map((header, index) => <td id={id+'-'+rowIndex+'-'+index} data-column={index} data-reading-column={guide?.column===index} data-kind={kind(index)} key={index}>
      <span className="mobile-cell-label"><DayLabel label={displayHeader(header)}/></span><span className={kind(index)==='name'?'response-card-name':kind(index)==='time'?'response-card-time':undefined}>{cell(row,index,header)}</span>
      {kind(index)==='name'&&model.timeIndex<0&&<small className="response-card-time projected-time"><FriendlyTime value={model.rowTimes?.[rowIndex]}/></small>}
      {kind(index)==='name'&&collapsible&&<button type="button" className="secondary mobile-response-toggle" aria-label={(allOpen!==opened.includes(rowIndex)?'Thu gọn các ngày của ':'Mở các ngày của ')+row[index]} aria-expanded={allOpen!==opened.includes(rowIndex)} aria-controls={headers.map((_,column)=>column).filter(column=>column!==model.nameIndex&&column!==model.timeIndex).map(column=>id+'-'+rowIndex+'-'+column).join(' ')} onClick={()=>setOpened(current=>current.includes(rowIndex)?current.filter(value=>value!==rowIndex):[...current,rowIndex])}>{allOpen!==opened.includes(rowIndex)?'Thu gọn':'Mở các ngày'} · {model.mealIndexes.filter(column=>String(row[column]||'').trim()).length} ngày có nội dung</button>}
    </td>)}</WorkspaceRow>) : <tr><td className="empty" colSpan={Math.max(headers.length, 1)}>Không có kết quả</td></tr>}</tbody>
  </table></TableScroll></>;
}
