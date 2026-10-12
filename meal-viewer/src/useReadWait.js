import {useEffect,useRef,useState} from 'react';
import {createReadWait} from './dashboard-model.mjs';
export const cancelledRead=()=>new DOMException('Đã dừng chờ dữ liệu.','AbortError');
export const STOP_WAIT_MESSAGE='Đã dừng chờ trên trình duyệt. Máy chủ có thể vẫn xử lý. Bản đang xem chỉ đọc; tải lại để xác minh dữ liệu.';
export default function useReadWait(){
  const [pending,setPending]=useState(0),active=useRef(true),ref=useRef(null);
  if(!ref.current)ref.current=createReadWait(count=>{if(active.current)setPending(count);});
  useEffect(()=>{active.current=true;return()=>{active.current=false;ref.current.cancel();};},[]);
  return {gate:ref.current,pending};
}
