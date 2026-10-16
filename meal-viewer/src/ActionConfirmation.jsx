import { useEffect, useId, useRef, useState } from 'react';
import CharacterCounter from './CharacterCounter.jsx';
import {TEXT_LIMITS} from './operating-ui.mjs';
import useVisualViewport from './useVisualViewport.js';

export default function ActionConfirmation({ message, changes, showReason=true, confirmLabel, onCancel, onConfirm }) {
  const dialog = useRef(null);
  const submitted=useRef(false);
  useVisualViewport(dialog);
  const [reason, setReason] = useState('');
  const countId=useId();
  useEffect(() => {
    const previous=document.activeElement,panel=previous?.closest?.('[popover]'),opener=panel?document.querySelector(`[popovertarget="${CSS.escape(panel.id)}"]`):previous,fallback=previous?.closest?.('form')?.querySelector('input:not(:disabled),textarea:not(:disabled)'),node = dialog.current;
    node.showModal();
    node.querySelector('[data-cancel-confirmation]')?.focus({preventScroll:true});
    return () => {node.close();const target=opener?.isConnected&&!opener.disabled?opener:fallback;if(target?.isConnected)target.focus?.({preventScroll:true});};
  }, []);
  return <dialog ref={dialog} className="dashboard-confirm-dialog meal-ui" aria-labelledby="action-confirm-title" onCancel={onCancel}>
    <form onSubmit={event => { event.preventDefault();if(submitted.current)return;submitted.current=true;onConfirm(reason.trim()); }}>
      <div className="confirmation-body"><h2 id="action-confirm-title">Xác nhận thao tác</h2><p>{message}</p>
      {changes&&<dl className="change-review">{changes.length?changes.map(row=><div className="change-review-row" key={row.label}><dt>{row.label}</dt><dd><strong>Trước</strong><span>{row.before||'Chưa đặt'}</span></dd><dd><strong>Sau</strong><span>{row.after||'Chưa đặt'}</span></dd></div>):<div><dt>Các giá trị đang giữ nguyên.</dt></div>}</dl>}
      {showReason&&<><label>Lý do (tùy chọn)<textarea maxLength={TEXT_LIMITS.reason} aria-describedby={countId} rows={3} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ví dụ: Đã chốt số lượng" /></label><CharacterCounter id={countId} label="Lý do" value={reason} limit={TEXT_LIMITS.reason}/><p className="dashboard-hint">Ghi chú được lưu trong lịch sử. Không nhập mật khẩu hoặc thông tin nhạy cảm.</p></>}</div>
      <div className="actions confirmation-actions"><button type="button" data-cancel-confirmation autoFocus className="secondary" onClick={onCancel}>Hủy</button><button type="submit">{confirmLabel}</button></div>
    </form>
  </dialog>;
}
