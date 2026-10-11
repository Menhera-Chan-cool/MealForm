import { useEffect, useRef, useState } from 'react';
import { sheetRowUrl } from './dashboard-model.mjs';

export default function SheetRowButton({ weekKey, source, response, request, disabled }) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function locate() {
    if (loading || disabled) return;
    const popup = window.open('about:blank', '_blank');
    if (popup) popup.opener = null;
    setLoading(true); setRows([]); setMessage('');
    try {
      const params = new URLSearchParams({ locate: '1', week: weekKey, source });
      if (source === 'form') params.set('responseId', response.responseId || '');
      else params.set('target', JSON.stringify({ name: response.name, timestamp: response.timestamp, meals: response.meals }));
      const result = await request(`/api/dashboard?${params}`);
      if (!active.current) { popup?.close(); return; }
      const links = (result.rows || []).map(row => ({ row, href: sheetRowUrl(result.spreadsheetId, result.sheetId, row) })).filter(value => value.href);
      if (links.length === 1 && popup) popup.location.replace(links[0].href);
      else {
        popup?.close(); setRows(links);
        setMessage(links.length > 1 ? 'Có nhiều hàng phù hợp; chọn hàng cần kiểm tra.' : links.length ? '' : 'Không còn hàng Sheet phù hợp. Hãy tải lại hoặc đối soát.');
      }
    } catch (error) { popup?.close(); if (active.current) setMessage(error.message); }
    finally { if (active.current) setLoading(false); }
  }
  return <div className="dashboard-row-location"><button type="button" className="secondary" disabled={disabled || loading} aria-busy={loading} onClick={() => void locate()}>{loading ? 'Đang tìm hàng…' : 'Mở hàng trong Sheet'}</button>
    {message && <small role="status">{message}</small>}
    {rows.length > 0 && <div className="dashboard-row-links">{rows.map(({ row, href }) => <a key={row} href={href} target="_blank" rel="noreferrer">Hàng {row}</a>)}</div>}
  </div>;
}
