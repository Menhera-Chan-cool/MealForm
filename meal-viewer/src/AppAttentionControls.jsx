export default function AppAttentionControls({attention}){
  return <section className="app-attention" aria-label="Thông báo và dấu chấm ứng dụng"><h3>Thông báo và dấu chấm</h3>
    <p>Chỉ phản ánh sự kiện đã nhận trong cửa sổ này, không theo dõi khi đã đóng web. Không gửi ảnh, món, tên học sinh hay Gmail trong thông báo.</p>
    <div className="actions">{attention.preferences.ocr?<button type="button" className="secondary" onClick={()=>attention.preference({ocr:false})}>Tắt thông báo OCR</button>:<button type="button" className="secondary" disabled={attention.permissionBusy} onClick={()=>void attention.enable()}>Bật thông báo OCR</button>}<button type="button" className="secondary" disabled={!attention.preferences.ocr||attention.permissionBusy} onClick={()=>void attention.test()}>Gửi thông báo thử</button></div>
    <label><input type="checkbox" checked={attention.preferences.badge} onChange={event=>attention.preference({badge:event.target.checked})}/>Dấu chấm khi có kết quả chưa xem hoặc lượt mới đã phát hiện</label>
    <p role="status" aria-label="Trạng thái thông báo OCR">{attention.status||'Thông báo chỉ được bật khi bạn chủ động yêu cầu.'}</p><small>{attention.badgeStatus}</small>
    {(attention.ocrPending||attention.updatesPending)&&<p role="status" aria-label="Nội dung đang chờ xem">{attention.ocrPending?'Có kết quả OCR chưa xem. ':''}{attention.updatesPending?'Có lượt mới đã phát hiện; dùng Tải lại dữ liệu để cập nhật.':''}</p>}
  </section>;
}
