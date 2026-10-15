import { useEffect, useRef, useState } from 'react';
import { sheetRowUrl } from './dashboard-model.mjs';
import ExternalLink from './ExternalLink.jsx';
import {ArrowUpRight} from 'lucide-react';
import ExplainedButton from './ExplainedButton.jsx';

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
  return <div className="dashboard-row-location"><ExplainedButton label="Mở hàng trong Sheet" type="button" className="secondary" title="Tìm hàng hiện tại và mở tab Sheet mới" disabled={disabled || loading} reason={loading?'Đang tìm hàng tương ứng trong Sheet.':'Chưa thể xác minh hàng khi dữ liệu chưa sẵn sàng hoặc đang xử lý thao tác; hãy chờ hoặc tải lại dữ liệu.'} aria-busy={loading} onClick={() => void locate()}>{loading ? 'Đang tìm hàng…' : 'Mở hàng trong Sheet'}<ArrowUpRight className="external-link-icon" size={15} aria-hidden="true"/></ExplainedButton>
    {message && <small role="status">{message}</small>}
    {rows.length > 0 && <div className="dashboard-row-links">{rows.map(({ row, href }) => <ExternalLink key={row} href={href}>Hàng {row}</ExternalLink>)}</div>}
  </div>;
}
