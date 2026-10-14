import { useEffect, useState } from 'react';
import { ComboSelect } from './FilterControls.jsx';
import { ALL, errorMessage } from './viewer-model.mjs';
import VersionNotice from './VersionNotice.jsx';
import ContentSkeleton from './ContentSkeleton.jsx';
import ArchiveCalendar from './ArchiveCalendar.jsx';
import {archiveMonths,weekMonths} from './ui-model.mjs';
import useReadWait,{cancelledRead,STOP_WAIT_MESSAGE} from './useReadWait.js';

export default function HistoryArchive({ onUnauthorized }) {
  const [weeks, setWeeks] = useState([]);
  const [month, setMonth] = useState(ALL);
  const [view,setView]=useState('list');
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
  const visible = weeks.filter(week => month === ALL || weekMonths(week).includes(selectedMonth));
  return <section className="archive-panel">
    <VersionNotice disabled={busy} />
    <div className="section-heading"><h2>Kho tuần cũ</h2><button className="secondary" disabled={busy} onClick={() => void load()}>Tải lại</button></div>
    {pending>0&&<button className="secondary" type="button" onClick={()=>{reads.cancel();setBusy(false);setMessage(STOP_WAIT_MESSAGE);}}>Dừng chờ dữ liệu</button>}
    <p>Chỉ hiện tuần đã đăng ký trước tuần này. Cần đăng nhập Google để xem.</p>
    <div className="archive-view-options" role="group" aria-label="Cách xem kho tuần"><button type="button" className="secondary" aria-pressed={view==='list'} onClick={()=>setView('list')}>Danh sách</button><button type="button" className="secondary" aria-pressed={view==='calendar'} disabled={!months.length} onClick={()=>{if(month===ALL)setMonth(months[0]);setView('calendar');}}>Lịch tháng</button></div>
    <label htmlFor="archive-month">Tháng có thực đơn</label>
    <ComboSelect id="archive-month" label="Tháng" value={month} values={months} searchable={false} includeAll={view==='list'} onChange={setMonth} />
    {message && <p role="status">{message}</p>}
    {busy && !weeks.length && <ContentSkeleton label="Đang tải kho tuần cũ…" />}
    {!busy && !message && !visible.length && <p>Chưa có tuần cũ trong tháng đã chọn.</p>}
    {view==='calendar'?<><ArchiveCalendar month={selectedMonth} weeks={visible}/>{weeks.some(week=>!weekMonths(week).length)&&<p>Có tuần chưa rõ ngày; chuyển Danh sách và chọn Tất cả để xem.</p>}</>:<ul className="archive-weeks">{visible.map(week => <li key={week.weekKey}><a href={`/history?week=${encodeURIComponent(week.weekKey)}`}><strong>{week.name}</strong><span>Xem tuần →</span></a></li>)}</ul>}
  </section>;
}
