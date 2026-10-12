import {useEffect,useRef,useState} from 'react';

export default function WeekNoticeEditor({weekKey,request,busy,onBusy,onMessage}){
  const [saved,setSaved]=useState(null),[text,setText]=useState(''),[endsOn,setEndsOn]=useState(''),[loading,setLoading]=useState(false);
  const generation=useRef(0);
  async function load(){
    const current=++generation.current;setSaved(null);setLoading(true);
    try{const result=await request(`/api/dashboard?notice=1&week=${encodeURIComponent(weekKey)}`);if(current!==generation.current)return;setSaved(result.notice);setText(result.notice.text);setEndsOn(result.notice.endsOn);}
    catch(error){if(current===generation.current&&error.name!=='AbortError')onMessage(error.message);}
    finally{if(current===generation.current)setLoading(false);}
  }
  useEffect(()=>{setText('');setEndsOn('');if(weekKey)void load();return()=>{generation.current++;};},[weekKey]);
  async function save(clear=false){
    if(!saved||busy||loading)return;
    if(!window.confirm(clear?'Xóa thông báo công khai của tuần này?':'Lưu thông báo công khai của tuần này? Nội dung sẽ hiện trên trang xem và được ghi lịch sử.'))return;
    onBusy(true);
    try{const result=await request('/api/dashboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'set-week-notice',weekKey,text:clear?'':text,endsOn,expectedUpdatedAt:saved.updatedAt})});setSaved(result.notice);setText(result.notice.text);setEndsOn(result.notice.endsOn);onMessage(clear?'Đã xóa thông báo tuần.':'Đã lưu thông báo tuần.','success');}
    catch(error){setSaved(null);onMessage(error.message);}
    finally{onBusy(false);}
  }
  return <form className="week-notice-editor" onSubmit={event=>{event.preventDefault();void save();}}>
    <p>Thông báo là văn bản công khai. Không nhập thông tin học sinh, mật khẩu hoặc khóa API. Hết ngày đã chọn (giờ Việt Nam), nội dung tự ẩn.</p>
    <button type="button" className="secondary" disabled={busy||loading||!weekKey} onClick={()=>void load()}>{loading?'Đang đọc thông báo…':'Tải lại thông báo'}</button>
    <label>Nội dung thông báo<textarea rows={4} maxLength={500} required disabled={busy||!saved} value={text} onChange={event=>setText(event.target.value)} /></label>
    <small>{text.length}/500 ký tự{saved?.text&&saved.expiresAt<=Date.now()?' · Thông báo đã hết hạn':''}</small>
    <label>Hiển thị hết ngày<input type="date" required disabled={busy||!saved} value={endsOn} onChange={event=>setEndsOn(event.target.value)} /></label>
    <div className="actions"><button disabled={busy||loading||!saved||!text.trim()}>Lưu thông báo</button><button type="button" className="secondary" disabled={busy||loading||!saved?.text} onClick={()=>void save(true)}>Xóa thông báo</button></div>
  </form>;
}
