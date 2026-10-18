import {useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import ActionConfirmation from './ActionConfirmation.jsx';
import useVisualViewport from './useVisualViewport.js';
const time=value=>new Date(value).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'});
export default function SessionManager({blocked=false,beforeSignOut}){
  const [open,setOpen]=useState(false),[sessions,setSessions]=useState([]),[ready,setReady]=useState(false),[loading,setLoading]=useState(false),[writing,setWriting]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[confirmation,setConfirmation]=useState(null);
  const dialog=useRef(null),opener=useRef(null),read=useRef(null),generation=useRef(0),id=useId();useVisualViewport(dialog,open);
  async function load(){
    const epoch=++generation.current;read.current?.abort();const controller=new AbortController();read.current=controller;setLoading(true);setReady(false);setError('');
    try{
      const response=await fetch('/api/session?list=1',{credentials:'same-origin',cache:'no-store',signal:controller.signal}),body=await response.json();
      if(controller.signal.aborted||generation.current!==epoch)return;
      if(response.status===401)throw Error('Đăng nhập Google để xem phiên của bạn.');
      if(!response.ok)throw Error('Chưa đọc được danh sách phiên. Hãy thử tải lại.');
      if(!body.authenticated||!Array.isArray(body.sessions)||body.sessions.length>8||body.sessions.filter(item=>item.current===true).length!==1||new Set(body.sessions.map(item=>item.id)).size!==body.sessions.length||body.sessions.some(item=>!/^[a-f0-9]{64}$/.test(item.id||'')||typeof item.label!=='string'||![item.createdAt,item.lastSeen,item.expiresAt].every(Number.isFinite)))throw Error('Danh sách phiên chưa được xác minh.');
      setSessions(body.sessions);setReady(true);
    }catch(failure){if(failure.name!=='AbortError'&&generation.current===epoch)setError(failure.message);}
    finally{if(generation.current===epoch)setLoading(false);}
  }
  useEffect(()=>{
    if(!open)return;const previous=document.activeElement,node=dialog.current;node.showModal();void load();
    return()=>{generation.current++;read.current?.abort();node.close();if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[open]);
  async function revoke(item){
    if(writing||!ready||blocked)return;setWriting(true);setError('');setMessage('');
    try{
      if(item.current&&await beforeSignOut?.()===false)return;
      const response=await fetch('/api/session?sessionId='+encodeURIComponent(item.id),{method:'DELETE',credentials:'same-origin',cache:'no-store'}),body=await response.json();
      if(!response.ok||body.revoked!==true||body.id!==item.id||body.authenticated!==!item.current)throw Error('Chưa xác nhận được kết quả thu hồi. Hãy tải lại danh sách trước khi thử tiếp.');
      if(item.current){window.dispatchEvent(new Event('meal-session-ended'));setOpen(false);}
      else {setMessage('Máy chủ đã xác nhận thu hồi phiên được chọn.');await load();}
    }catch(failure){setReady(false);setError(failure.message||'Chưa thu hồi được phiên.');}
    finally{setWriting(false);}
  }
  return <><button ref={opener} type="button" className="secondary" disabled={blocked} onClick={()=>{setMessage('');setSessions([]);setOpen(true);}}>Phiên đăng nhập</button>{open&&createPortal(<><dialog ref={dialog} className="session-manager meal-ui" aria-labelledby={id} onCancel={event=>{if(writing||confirmation)event.preventDefault();else setOpen(false);}}>
    <header><h2 id={id}>Phiên đăng nhập MealForm</h2><button type="button" className="secondary" disabled={writing} onClick={()=>setOpen(false)}>Đóng</button></header>
    <div className="session-manager-body"><p>Chỉ các phiên của tài khoản đang dùng trong MealForm, không phải danh sách thiết bị Google. Tên trình duyệt là gợi ý, không xác định duy nhất thiết bị.</p><p>Tối đa 8 phiên hoạt động. Thu hồi chặn yêu cầu được xác minh sau đó; không hủy tác vụ máy chủ đã chấp nhận.</p>
      <button type="button" className="secondary" disabled={loading||writing} onClick={()=>void load()}>Tải lại phiên</button>
      {loading&&<p role="status">Đang đọc phiên từ máy chủ…</p>}{error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
      <ul>{sessions.map(item=><li key={item.id}><strong>{item.label}</strong>{item.current&&<span className="session-current">Phiên hiện tại</span>}<dl><div><dt>Tạo lúc</dt><dd>{time(item.createdAt)}</dd></div><div><dt>Lần kiểm tra phiên gần nhất</dt><dd>{time(item.lastSeen)}</dd></div><div><dt>Hạn hiện đã lưu</dt><dd>{time(item.expiresAt)}</dd></div></dl><button type="button" className={item.current?'secondary':'danger'} disabled={!ready||writing||loading} onClick={()=>setConfirmation(item)}>{item.current?'Đăng xuất phiên hiện tại':'Đăng xuất phiên này'}</button></li>)}</ul>
    </div>
  </dialog>{confirmation&&<ActionConfirmation confirmLabel="Đăng xuất phiên" message={'Thu hồi phiên '+confirmation.label+' tạo lúc '+time(confirmation.createdAt)+'?'+(confirmation.current?' Bạn sẽ cần đăng nhập lại trên phiên đang dùng.':' Không ảnh hưởng phiên hiện tại.')} showReason={false} onCancel={()=>setConfirmation(null)} onConfirm={()=>{const item=confirmation;setConfirmation(null);void revoke(item);}}/>}</>,document.body)}</>;
}
