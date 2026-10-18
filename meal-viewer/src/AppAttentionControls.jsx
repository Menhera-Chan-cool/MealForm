import {CircleAlert,X} from 'lucide-react';
import useAnchoredPopover from './useAnchoredPopover.js';
export default function AppAttentionControls({attention}){
  const popover=useAnchoredPopover();
  return <><button type="button" ref={popover.trigger} className="secondary field-help-trigger" aria-label="Thông báo và dấu chấm" aria-haspopup="dialog" aria-expanded={popover.open} aria-controls={popover.id} popoverTarget={popover.id}><CircleAlert size={18} aria-hidden="true"/></button>
  <div ref={popover.panel} id={popover.id} popover="auto" role="dialog" aria-label="Thông báo và dấu chấm ứng dụng" className="ui-more-menu meal-ui app-attention-menu" {...popover.events} onToggle={event=>{popover.events.onToggle(event);if(event.newState==='open'&&window.matchMedia('(max-width:700px)').matches){event.currentTarget.style.left='';event.currentTarget.style.top='';}}}>
    <header><h2>Thông báo và dấu chấm</h2><button type="button" className="secondary field-help-trigger" aria-label="Đóng thông báo" onClick={()=>{popover.hide();popover.trigger.current?.focus({preventScroll:true});}}><X size={18} aria-hidden="true"/></button></header>
    <p>Chỉ phản ánh sự kiện đã nhận trong cửa sổ này, không theo dõi khi đã đóng web. Không gửi ảnh, món, tên học sinh hay Gmail trong thông báo.</p>
    <div className="actions">{attention.preferences.ocr?<button type="button" className="secondary" onClick={()=>attention.preference({ocr:false})}>Tắt thông báo OCR</button>:<button type="button" className="secondary" disabled={attention.permissionBusy} onClick={()=>void attention.enable()}>Bật thông báo OCR</button>}<button type="button" className="secondary" disabled={!attention.preferences.ocr||attention.permissionBusy} onClick={()=>void attention.test()}>Gửi thông báo thử</button></div>
    <label><input type="checkbox" checked={attention.preferences.badge} onChange={event=>attention.preference({badge:event.target.checked})}/>Dấu chấm khi có kết quả chưa xem hoặc lượt mới đã phát hiện</label>
    <p role="status" aria-label="Trạng thái thông báo OCR">{attention.status||'Thông báo chỉ được bật khi bạn chủ động yêu cầu.'}</p><small>{attention.badgeStatus}</small>
    {(attention.ocrPending||attention.updatesPending)&&<p role="status" aria-label="Nội dung đang chờ xem">{attention.ocrPending?'Có kết quả OCR chưa xem. ':''}{attention.updatesPending?'Có lượt mới đã phát hiện; dùng Tải lại dữ liệu để cập nhật.':''}</p>}
  </div></>;
}
