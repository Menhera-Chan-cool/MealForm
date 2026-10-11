import { useState } from 'react';
import { formatErrorReport } from './safe-error-report.mjs';

export default function ErrorReportButton({ report }) {
  const [copied, setCopied] = useState('');
  const [fallback, setFallback] = useState(false);
  if (!report) return null;
  const text = formatErrorReport(report);
  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(report.id); setFallback(false); }
    catch { setFallback(true); }
  }
  return <div className="safe-error-report"><button type="button" className="secondary" onClick={() => void copy()}>Sao chép báo lỗi</button>
    {copied === report.id && <small role="status">Đã sao chép báo lỗi không kèm dữ liệu riêng tư.</small>}
    {fallback && <label>Báo lỗi đã loại thông tin riêng tư<textarea readOnly rows={6} value={text} onFocus={event => event.target.select()} /><small>Trình duyệt chưa cho sao chép tự động. Chọn nội dung trên để sao chép thủ công.</small></label>}
  </div>;
}
