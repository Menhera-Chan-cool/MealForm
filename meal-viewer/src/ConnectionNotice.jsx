import {useEffect,useState} from 'react';

export function useOnlineState(){
  const [online,setOnline]=useState(()=>navigator.onLine!==false);
  useEffect(()=>{const sync=()=>setOnline(navigator.onLine!==false);window.addEventListener('online',sync);window.addEventListener('offline',sync);return()=>{window.removeEventListener('online',sync);window.removeEventListener('offline',sync);};},[]);
  return online;
}
export default function ConnectionNotice({online,savedAt,hasData}){
  if(online)return null;
  return <aside className="connection-notice" role="status" aria-label="Trạng thái kết nối"><strong>Thiết bị đang báo ngoại tuyến.</strong><p>{hasData?(savedAt?`Đang xem bản lưu lúc ${new Date(savedAt).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}. `:'Đang giữ dữ liệu đã tải trong trang này. '):'Chưa có dữ liệu đã tải để xem. '}Chỉ đọc; không tự gửi lại thao tác khi có mạng. Đây không phải thông báo hết phiên hay xác nhận máy chủ bị lỗi.</p></aside>;
}
