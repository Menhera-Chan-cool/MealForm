import {useState} from 'react';

export default function SessionFeedback({entries,onClear}){
  const [open,setOpen]=useState(false);
  return <section className="session-feedback"><button type="button" className="secondary" aria-expanded={open} onClick={()=>setOpen(value=>!value)}>Thông báo phiên này ({entries.length})</button>{open&&<div role="region" aria-label="Thông báo phiên này"><h2>Thông báo phiên này</h2><p>Không thay thế lịch sử quản trị hoặc xác nhận trạng thái máy chủ. Chỉ giữ tối đa 20 phản hồi trong bộ nhớ của phiên Dashboard này; không lưu khi tải lại/đăng xuất. Chi tiết lỗi nhạy cảm không được chép vào đây.</p>{entries.length?<ol>{entries.map(entry=><li key={entry.id}><small>{new Date(entry.at).toLocaleTimeString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})} · {entry.context}</small><p>{entry.message}</p></li>)}</ol>:<p>Chưa có thông báo trong phiên này.</p>}<button type="button" className="secondary" onClick={onClear}>Xóa thông báo phiên</button></div>}</section>;
}
