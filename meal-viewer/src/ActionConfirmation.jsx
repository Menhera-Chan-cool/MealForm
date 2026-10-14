import { useEffect, useRef, useState } from 'react';
import useVisualViewport from './useVisualViewport.js';

export default function ActionConfirmation({ message, onCancel, onConfirm }) {
  const dialog = useRef(null);
  useVisualViewport(dialog);
  const [reason, setReason] = useState('');
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);
  return <dialog ref={dialog} className="dashboard-confirm-dialog" aria-labelledby="action-confirm-title" onCancel={onCancel}>
    <form onSubmit={event => { event.preventDefault(); onConfirm(reason.trim()); }}>
      <div className="confirmation-body"><h2 id="action-confirm-title">Xác nhận thao tác</h2><p>{message}</p>
      <label>Lý do (tùy chọn)<textarea autoFocus maxLength={500} rows={3} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ví dụ: Đã chốt số lượng" /></label>
      <p className="dashboard-hint">Ghi chú được lưu trong lịch sử. Không nhập mật khẩu hoặc thông tin nhạy cảm.</p></div>
      <div className="actions confirmation-actions"><button type="button" className="secondary" onClick={onCancel}>Hủy</button><button type="submit">Xác nhận</button></div>
    </form>
  </dialog>;
}
