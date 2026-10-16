import { useEffect, useRef } from 'react';
import ResponseMeals from './ResponseMeals.jsx';
import ExplainedButton from './ExplainedButton.jsx';
import useVisualViewport from './useVisualViewport.js';
import FriendlyTime from './FriendlyTime.jsx';

/** @param {{response:any,week:any,verified:boolean,onClose:()=>void,navigation?:{index:number,total:number,previous?:any,next?:any},onSelect?:(response:any)=>void}} props */
export default function ResponseQuickView({ response, week, verified, onClose,navigation,onSelect }) {
  const dialog = useRef(null);
  const body=useRef(null);useVisualViewport(dialog);
  useEffect(()=>{if(body.current)body.current.scrollTop=0;},[response.responseId]);
  useEffect(() => {
    const previous = document.activeElement;
    const node = dialog.current; node.showModal();
    return () => { node.close(); previous?.focus?.({ preventScroll: true }); };
  }, []);
  return <dialog ref={dialog} className="response-quick-dialog" aria-labelledby="response-quick-title" onCancel={onClose}>
    <div className="response-quick-header"><h2 id="response-quick-title">Chi tiết lượt gửi</h2><button type="button" className="secondary" onClick={onClose}>Đóng</button></div>
    <div ref={body} className="response-quick-body" tabIndex={0} role="region" aria-label="Nội dung lượt gửi">
    <h3 aria-live="polite" aria-atomic="true">{response.name || '(Thiếu tên)'}</h3><p><FriendlyTime value={response.timestamp}/></p>
    <p className="dashboard-hint">Chỉ xem. {verified ? 'Dữ liệu đã xác minh.' : 'Bản lưu chưa xác minh; thông tin có thể đã thay đổi.'}</p>
    {response.partial && <p className="dashboard-warning">Form đã mất lượt; Sheet còn hàng. Không thể coi đây là lượt Form đang hoạt động.</p>}
    {response.note && <p>{response.note}</p>}
    <ResponseMeals response={response} week={week} />
    {week?.closedDays?.length > 0 && <p className="closed-days-note">Không phục vụ: {week.closedDays.join(' · ')}</p>}
    </div>
    {navigation&&onSelect&&<div className="quick-view-navigation"><p role="status" aria-label="Vị trí lượt gửi" aria-live="polite">{navigation.index>=0?`${navigation.index+1} / ${navigation.total} lượt đã tải theo bộ lọc`:'Lượt này không còn trong phần đã tải; chưa thể chuyển trước/sau.'}</p><div className="actions"><ExplainedButton type="button" className="secondary" disabled={!navigation.previous} reason="Không có lượt trước trong phần đã tải theo bộ lọc hiện tại." onClick={()=>onSelect(navigation.previous)}>Lượt trước</ExplainedButton><ExplainedButton type="button" className="secondary" disabled={!navigation.next} reason="Không có lượt sau trong phần đã tải theo bộ lọc hiện tại; đóng Xem nhanh để tải thêm nếu có." onClick={()=>onSelect(navigation.next)}>Lượt sau</ExplainedButton></div></div>}
  </dialog>;
}
