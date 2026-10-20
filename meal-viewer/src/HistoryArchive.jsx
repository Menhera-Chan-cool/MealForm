import { useEffect, useRef, useState } from 'react';
import { ComboSelect } from './FilterControls.jsx';
import { ALL, errorMessage } from './viewer-model.mjs';
import VersionNotice from './VersionNotice.jsx';
import ContentSkeleton from './ContentSkeleton.jsx';
import ArchiveCalendar from './ArchiveCalendar.jsx';
import {archiveHierarchy} from './workspace-ui.mjs';
import {archiveMonths,weekMonths} from './ui-model.mjs';
import {archiveWeekHref,filterConditions,archiveFormStatus} from './ui-clarity.mjs';
import FilterEmptyState from './FilterEmptyState.jsx';
import ElapsedWait from './ElapsedWait.jsx';
import ExplainedButton from './ExplainedButton.jsx';
import {ArchiveBreadcrumbs,ArchiveWeekMetadata} from './WeekContext.jsx';
import usePageTitle from './usePageTitle.js';
import useReadWait,{cancelledRead,STOP_WAIT_MESSAGE} from './useReadWait.js';

export default function HistoryArchive({ onUnauthorized,selectedWeekKey='' }) {
  const list=useRef(null),restored=useRef(false);
  const [weeks, setWeeks] = useState([]);
  const [month, setMonth] = useState(()=>{const value=new URLSearchParams(window.location.search).get('month')||'';return /^\d{4}-(0[1-9]|1[0-2])$/.test(value)?value.slice(5)+'/'+value.slice(0,4):ALL;});
  const [view,setView]=useState(()=>new URLSearchParams(window.location.search).get('layout')==='calendar'?'calendar':'list');
  const statusOptions=[['all','Tất cả'],['open','Đang mở'],['closed','Đã đóng'],['unknown','Chưa xác định']];
  const [formStatus,setFormStatus]=useState(()=>{const value=new URLSearchParams(window.location.search).get('status');return ['open','closed','unknown'].includes(value)?value:'all';});
  const [message, setMessage] = useState('Đang tải kho tuần cũ…');
  const [busy, setBusy] = useState(true);
  const {gate:reads,pending}=useReadWait();
  async function load() {
    const ticket=reads.begin();
    setBusy(true);
    try {
      const response = await fetch('/api/history', { credentials: 'same-origin', cache: 'no-store',signal:ticket.signal });
      const data = await response.json();
      if(!reads.current(ticket))throw cancelledRead();
      if (response.status === 401) { onUnauthorized(); return; }
      if (!response.ok) throw new Error(errorMessage(data.error));
      setWeeks(Array.isArray(data.weeks) ? data.weeks : []); setMessage('');
    } catch (error) { if(error.name!=='AbortError')setMessage(error.message); }
    finally { if(reads.current(ticket))setBusy(false);reads.finish(ticket); }
  }
  useEffect(() => { void load(); }, []);
  const monthKeys=archiveMonths(weeks),months=monthKeys.map(key=>key.slice(5)+'/'+key.slice(0,4));
  const selectedMonth=month.split('/').reverse().join('-');
  const visible = weeks.filter(week => (month === ALL || weekMonths(week).includes(selectedMonth))&&(formStatus==='all'||archiveFormStatus(week)===formStatus));
  const conditions=filterConditions({month,status:formStatus==='all'?'':statusOptions.find(([value])=>value===formStatus)[1]},{month:'Tháng',status:'Trạng thái Form'});
  const recoveries=conditions.map(condition=>({key:condition.key,unit:'tuần',count:weeks.filter(week=>(condition.key==='month'||month===ALL||weekMonths(week).includes(selectedMonth))&&(condition.key==='status'||formStatus==='all'||archiveFormStatus(week)===formStatus)).length}));
  usePageTitle(selectedWeekKey?'':month===ALL?'Kho tuần cũ':`Kho tuần · Tháng ${month}`);
  useEffect(()=>{
    if(busy||restored.current)return;restored.current=true;
    const saved=window.history.state?.mealArchiveReturn;
    if(!saved||saved.href!==window.location.pathname+window.location.search||typeof saved.week!=='string')return;
    let cancelled=false;
    void document.fonts.ready.then(()=>{if(cancelled)return;
    const link=Array.from(list.current?.querySelectorAll('a[data-week]')||[]).find(node=>node.dataset.week===saved.week&&(!saved.branch||node.dataset.archiveMonth===saved.branch));
    if(Array.isArray(saved.expanded))for(const node of list.current?.querySelectorAll('details[data-archive-key]')||[])node.open=saved.expanded.includes(node.dataset.archiveKey);
    for(let node=link?.parentElement;node&&node!==list.current;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;
    if(link)link.focus({preventScroll:true});
    const pane=list.current?.closest('.archive-list-pane');
    if(pane&&Number.isFinite(saved.listTop))pane.scrollTop=Math.max(0,saved.listTop);
    if(Number.isFinite(saved.top))window.scrollTo(0,Math.max(0,saved.top));
    });return()=>{cancelled=true;};
  },[busy]);
  function weekList(entries,branch){return <ul className="archive-weeks">{entries.map(week => <li key={week.weekKey}><a data-archive-month={branch} data-week={week.weekKey} aria-current={selectedWeekKey===week.weekKey?'page':undefined} href={archiveWeekHref(week.weekKey,selectedMonth,view,formStatus)}><strong>{week.name}</strong><ArchiveWeekMetadata week={week}/><span>Xem tuần →</span></a></li>)}</ul>;}
  return <section className="archive-panel">
    <VersionNotice disabled={busy} />
    <ElapsedWait active={busy} label="Đang tải kho tuần"/>
    {!selectedWeekKey&&<ArchiveBreadcrumbs month={selectedMonth} view={view} status={formStatus}/>}
    <div className="archive-tools"><div role="group" aria-label="Ngữ cảnh kho tuần"><h2>Kho tuần cũ</h2><p>Chỉ hiện tuần đã đăng ký trước tuần này. Cần đăng nhập Google để xem.</p></div>
<div className="archive-filter-grid" role="group" aria-label="Tìm và lọc kho tuần"><div><label htmlFor="archive-month">Tháng có thực đơn</label><ComboSelect id="archive-month" label="Tháng" value={month} values={months} searchable={false} includeAll={view==='list'} onChange={setMonth} /></div><div><label htmlFor="archive-status">Trạng thái Form</label><ComboSelect id="archive-status" label="Trạng thái Form" value={statusOptions.find(([value])=>value===formStatus)[1]} values={statusOptions.map(([,label])=>label)} searchable={false} includeAll={false} onChange={label=>setFormStatus(statusOptions.find(([,text])=>text===label)?.[0]||'all')}/></div></div>
    <div className="archive-actions" role="group" aria-label="Thao tác kho tuần"><ExplainedButton className="secondary" disabled={busy} reason="Đang tải kho tuần; hãy chờ hoặc dùng Dừng chờ dữ liệu." onClick={() => void load()}>Tải lại</ExplainedButton>
    {pending>0&&<button className="secondary" type="button" onClick={()=>{reads.cancel();setBusy(false);setMessage(STOP_WAIT_MESSAGE);}}>Dừng chờ dữ liệu</button>}
    <div className="archive-view-options" role="group" aria-label="Cách xem kho tuần"><button type="button" className="secondary" aria-pressed={view==='list'} onClick={()=>setView('list')}>Danh sách</button><ExplainedButton type="button" className="secondary" aria-pressed={view==='calendar'} disabled={!months.length} reason={busy?'Đang đọc danh sách tuần; chưa có tháng để hiển thị.':'Chưa có tuần cũ với ngày hợp lệ để đưa lên lịch; có thể xem Danh sách.'} onClick={()=>{if(month===ALL)setMonth(months[0]);setView('calendar');}}>Lịch tháng</ExplainedButton></div>
    </div></div>
    {message && <p role="status">{message}</p>}
    {busy && !weeks.length && <ContentSkeleton label="Đang tải kho tuần cũ…" />}
    {!busy && !message && !visible.length && <FilterEmptyState title={weeks.length?(formStatus==='all'?'Không có tuần trong tháng đã chọn':'Không có tuần phù hợp'):'Chưa có tuần cũ'} conditions={weeks.length?conditions:[]} recoveries={recoveries} onClear={key=>{if(key==='status')setFormStatus('all');else{setMonth(ALL);setView('list');}document.getElementById(key==='status'?'archive-status':'archive-month')?.focus();}}/>}
    <div className="archive-list-scroll" ref={list}>{view==='calendar'?<><ArchiveCalendar month={selectedMonth} weeks={visible} status={formStatus} selectedWeekKey={selectedWeekKey}/>{weeks.some(week=>!weekMonths(week).length)&&<p>Có tuần chưa rõ ngày; chuyển Danh sách và chọn Tất cả để xem.</p>}</>:archiveHierarchy(visible,month===ALL?'':selectedMonth).map((year,yearIndex)=><details className="archive-year" data-archive-key={'year-'+year.year} key={year.year} open={yearIndex===0||year.months.some(group=>group.weeks.some(week=>week.weekKey===selectedWeekKey))}><summary>{year.year==='unknown'?'Chưa rõ ngày':'Năm '+year.year}</summary>{year.months.map((group,index)=>group.key?<details className="archive-month" data-month={group.key} data-archive-key={'month-'+group.key} key={group.key} open={index===0||group.weeks.some(week=>week.weekKey===selectedWeekKey)}><summary>Tháng {group.key.slice(5)}/{year.year}</summary>{weekList(group.weeks,group.key)}</details>:weekList(group.weeks,''))}</details>)}</div>
  </section>;
}
