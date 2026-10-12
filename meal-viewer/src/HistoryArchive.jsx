import { useEffect, useState } from 'react';
import { ComboSelect } from './FilterControls.jsx';
import { ALL, errorMessage } from './viewer-model.mjs';
import VersionNotice from './VersionNotice.jsx';
import useReadWait,{cancelledRead,STOP_WAIT_MESSAGE} from './useReadWait.js';

export default function HistoryArchive({ onUnauthorized }) {
  const [weeks, setWeeks] = useState([]);
  const [month, setMonth] = useState(ALL);
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
  const monthLabel = week => `${week.startDate?.slice(5, 7)}/${week.startDate?.slice(0, 4)}`;
  const months = [...new Set(weeks.map(monthLabel))];
  const visible = weeks.filter(week => month === ALL || monthLabel(week) === month);
  return <section className="archive-panel">
    <VersionNotice disabled={busy} />
    <div className="section-heading"><h2>Kho tuần cũ</h2><button className="secondary" disabled={busy} onClick={() => void load()}>Tải lại</button></div>
    {pending>0&&<button className="secondary" type="button" onClick={()=>{reads.cancel();setBusy(false);setMessage(STOP_WAIT_MESSAGE);}}>Dừng chờ dữ liệu</button>}
    <p>Chỉ hiện tuần đã đăng ký trước tuần này. Cần đăng nhập Google để xem.</p>
    <label htmlFor="archive-month">Tháng bắt đầu tuần</label>
    <ComboSelect id="archive-month" label="Tháng" value={month} values={months} searchable={false} onChange={setMonth} />
    {message && <p role="status">{message}</p>}
    {!busy && !message && !visible.length && <p>Chưa có tuần cũ trong tháng đã chọn.</p>}
    <ul className="archive-weeks">{visible.map(week => <li key={week.weekKey}><a href={`/history?week=${encodeURIComponent(week.weekKey)}`}><strong>{week.name}</strong><span>Xem tuần →</span></a></li>)}</ul>
  </section>;
}
