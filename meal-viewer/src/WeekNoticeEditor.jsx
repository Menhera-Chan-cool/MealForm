import {useEffect,useImperativeHandle,useRef,useState} from 'react';

export default function WeekNoticeEditor({weekKey,request,busy,onBusy,onMessage,onDirtyChange,ref}){
  const [saved,setSaved]=useState(null),[text,setText]=useState(''),[endsOn,setEndsOn]=useState(''),[loading,setLoading]=useState(false);
  const [needsReload,setNeedsReload]=useState(false);
  const dirty=Boolean(saved&&(text!==saved.text||endsOn!==saved.endsOn));
  useEffect(()=>{onDirtyChange?.(dirty);},[dirty,onDirtyChange]);
  useEffect(()=>()=>onDirtyChange?.(false),[onDirtyChange]);
  useImperativeHandle(ref,()=>({discard(){setText(saved?.text||'');setEndsOn(saved?.endsOn||'');}}),[saved]);
  const generation=useRef(0);
  async function load(){
    const current=++generation.current;setLoading(true);
    try{const result=await request(`/api/dashboard?notice=1&week=${encodeURIComponent(weekKey)}`);if(current!==generation.current)return;setSaved(result.notice);setText(result.notice.text);setEndsOn(result.notice.endsOn);setNeedsReload(false);}
    catch(error){if(current===generation.current&&error.name!=='AbortError')onMessage(error.message);}
    finally{if(current===generation.current)setLoading(false);}
  }
  useEffect(()=>{setSaved(null);setText('');setEndsOn('');setNeedsReload(false);if(weekKey)void load();return()=>{generation.current++;};},[weekKey]);
  async function save(clear=false){
    if(!saved||busy||loading||needsReload)return;
    if(!window.confirm(clear?'Xóa thông báo công khai của tuần này?':'Lưu thông báo công khai của tuần này? Nội dung sẽ hiện trên trang xem và được ghi lịch sử.'))return;
    onBusy(true);
    try{const result=await request('/api/dashboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'set-week-notice',weekKey,text:clear?'':text,endsOn,expectedUpdatedAt:saved.updatedAt})});setSaved(result.notice);setText(result.notice.text);setEndsOn(result.notice.endsOn);onMessage(clear?'Đã xóa thông báo tuần.':'Đã lưu thông báo tuần.','success');}
    catch(error){if(error.status===409)setNeedsReload(true);onMessage(error.message);}
    finally{onBusy(false);}
  }
  return <form className="week-notice-editor" onSubmit={event=>{event.preventDefault();void save();}}>
    <p>Thông báo là văn bản công khai. Không nhập thông tin học sinh, mật khẩu hoặc khóa API. Hết ngày đã chọn (giờ Việt Nam), nội dung tự ẩn.</p>
    {dirty&&<p className="unsaved-state" role="status" aria-label="Chưa lưu thông báo">Chưa lưu · Chưa có xác nhận lưu thành công cho thay đổi đang sửa.</p>}
    {needsReload&&<p role="alert">Thông báo trên máy chủ đã đổi. Nháp được giữ; hãy sao chép phần cần giữ trước khi tải lại để đối chiếu.</p>}
    <button type="button" className="secondary" disabled={busy||loading||!weekKey} onClick={()=>{if(!dirty||window.confirm('Bỏ thay đổi chưa lưu và tải lại thông báo?'))void load();}}>{loading?'Đang đọc thông báo…':'Tải lại thông báo'}</button>
    <label>Nội dung thông báo<textarea rows={4} maxLength={500} required disabled={busy||loading||!saved} value={text} onChange={event=>setText(event.target.value)} /></label>
    <small>{text.length}/500 ký tự{saved?.text&&saved.expiresAt<=Date.now()?' · Thông báo đã hết hạn':''}</small>
    <label>Hiển thị hết ngày<input type="date" required disabled={busy||loading||!saved} value={endsOn} onChange={event=>setEndsOn(event.target.value)} /></label>
    <div className="actions"><button disabled={busy||loading||needsReload||!saved||!text.trim()}>Lưu thông báo</button><button type="button" className="secondary" disabled={busy||loading||needsReload||!saved?.text} onClick={()=>void save(true)}>Xóa thông báo</button></div>
  </form>;
}
