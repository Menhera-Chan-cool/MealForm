import { useEffect, useRef } from 'react';
import ResponseMeals from './ResponseMeals.jsx';

export default function ResponseQuickView({ response, week, verified, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const node = dialog.current; node.showModal();
    return () => { node.close(); previous?.focus?.({ preventScroll: true }); };
  }, []);
  const time = new Date(Number(response.timestamp));
  return <dialog ref={dialog} className="response-quick-dialog" aria-labelledby="response-quick-title" onCancel={onClose}>
    <div className="response-quick-header"><h2 id="response-quick-title">Chi tiết lượt gửi</h2><button type="button" className="secondary" onClick={onClose}>Đóng</button></div>
    <h3>{response.name || '(Thiếu tên)'}</h3><p>{Number.isFinite(time.getTime()) ? time.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'Chưa có thời điểm'}</p>
    <p className="dashboard-hint">Chỉ xem. {verified ? 'Dữ liệu đã xác minh.' : 'Bản lưu chưa xác minh; thông tin có thể đã thay đổi.'}</p>
    {response.partial && <p className="dashboard-warning">Form đã mất lượt; Sheet còn hàng. Không thể coi đây là lượt Form đang hoạt động.</p>}
    {response.note && <p>{response.note}</p>}
    <ResponseMeals response={response} week={week} />
    {week?.closedDays?.length > 0 && <p className="closed-days-note">Không phục vụ: {week.closedDays.join(' · ')}</p>}
  </dialog>;
}
