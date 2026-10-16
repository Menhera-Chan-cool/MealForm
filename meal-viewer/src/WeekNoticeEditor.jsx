import {useEffect,useId,useImperativeHandle,useRef,useState} from 'react';
import FieldHelp from './FieldHelp.jsx';
import ExplainedButton from './ExplainedButton.jsx';
import NoticePreview from './NoticePreview.jsx';
import ActionConfirmation from './ActionConfirmation.jsx';
import {reviewChanges} from './ui-clarity.mjs';
import CharacterCounter from './CharacterCounter.jsx';
import {TEXT_LIMITS} from './operating-ui.mjs';

export default function WeekNoticeEditor({weekKey,weekName,request,busy,onBusy,onMessage,onDirtyChange,ref}){
  const textId=useId(),expiryId=useId();
  const [saved,setSaved]=useState(null),[text,setText]=useState(''),[endsOn,setEndsOn]=useState(''),[loading,setLoading]=useState(false);
  const [needsReload,setNeedsReload]=useState(false);
  const [confirmation,setConfirmation]=useState(null);
  const dirty=Boolean(saved&&(text!==saved.text||endsOn!==saved.endsOn));
  const readReason=busy?'Đang xử lý thao tác khác; hãy chờ hoàn tất.':loading?'Đang đọc thông báo.':!weekKey?'Chọn một tuần đã đăng ký.':'';
  const saveReason=readReason||(needsReload?'Thông báo trên máy chủ đã đổi. Giữ nháp cần thiết rồi bấm Tải lại thông báo để đối chiếu.':!saved?'Chưa đọc được thông báo hiện tại; hãy tải lại.':'Nhập nội dung thông báo trước khi lưu.');
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
  async function save(clear=false,proposal){
    if(!saved||busy||loading||needsReload)return;
    if(!proposal){setConfirmation({weekKey,text:clear?'':text,endsOn,expectedUpdatedAt:saved.updatedAt,clear,changes:reviewChanges(saved,{text:clear?'':text,endsOn:clear?'':endsOn},{text:'Nội dung thông báo',endsOn:'Hiển thị hết ngày (giờ Việt Nam)'})});return;}
    onBusy(true);
    try{const result=await request('/api/dashboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'set-week-notice',weekKey:proposal.weekKey,text:proposal.text,endsOn:proposal.endsOn,expectedUpdatedAt:proposal.expectedUpdatedAt})});setSaved(result.notice);setText(result.notice.text);setEndsOn(result.notice.endsOn);onMessage(clear?'Đã xóa thông báo tuần.':'Đã lưu thông báo tuần.','success');}
    catch(error){if(error.status===409)setNeedsReload(true);onMessage(error.message);}
    finally{onBusy(false);}
  }
  return <><form className="week-notice-editor" onSubmit={event=>{event.preventDefault();void save();}}>
    <p>Thông báo là văn bản công khai. Không nhập thông tin học sinh, mật khẩu hoặc khóa API. Hết ngày đã chọn (giờ Việt Nam), nội dung tự ẩn.</p>
    {dirty&&<p className="unsaved-state" role="status" aria-label="Chưa lưu thông báo">Chưa lưu · Chưa có xác nhận lưu thành công cho thay đổi đang sửa.</p>}
    {needsReload&&<p role="alert">Thông báo trên máy chủ đã đổi. Nháp được giữ; hãy sao chép phần cần giữ trước khi tải lại để đối chiếu.</p>}
    <ExplainedButton label="Tải lại thông báo" reason={readReason} type="button" className="secondary" disabled={busy||loading||!weekKey} onClick={()=>{if(!dirty||window.confirm('Bỏ thay đổi chưa lưu và tải lại thông báo?'))void load();}}>{loading?'Đang đọc thông báo…':'Tải lại thông báo'}</ExplainedButton>
    <div className="field-label-row"><label htmlFor={textId}>Nội dung thông báo</label><FieldHelp label="Thông báo công khai">Nội dung này sẽ xuất hiện trên trang xem của tuần đã chọn sau khi bạn xác nhận Lưu. Không nhập tên học sinh, mật khẩu hoặc khóa API.</FieldHelp></div><textarea id={textId} rows={4} aria-describedby={`${textId}-budget`} maxLength={TEXT_LIMITS.notice} required disabled={busy||loading||!saved} value={text} onChange={event=>setText(event.target.value)} />
    <CharacterCounter id={`${textId}-budget`} label="Nội dung thông báo" value={text} limit={TEXT_LIMITS.notice}/>{saved?.text&&saved.expiresAt<=Date.now()&&<small>Thông báo đã hết hạn</small>}
    <div className="field-label-row"><label htmlFor={expiryId}>Hiển thị hết ngày</label><FieldHelp label="Ngày hết hạn thông báo">Thông báo hiển thị hết ngày đã chọn theo giờ Việt Nam. Qua ngày đó, nội dung tự ẩn; bản xem trước không lưu hoặc gia hạn thông báo.</FieldHelp></div><input id={expiryId} type="date" required disabled={busy||loading||!saved} value={endsOn} onChange={event=>setEndsOn(event.target.value)} />
    <NoticePreview text={text} endsOn={endsOn} weekName={weekName} dirty={dirty}/>
    <div className="actions"><ExplainedButton disabled={busy||loading||needsReload||!saved||!text.trim()} reason={saveReason}>Lưu thông báo</ExplainedButton><ExplainedButton type="button" className="secondary" disabled={busy||loading||needsReload||!saved?.text} reason={readReason||(needsReload?saveReason:'Chưa có thông báo đã lưu để xóa.')} onClick={()=>void save(true)}>Xóa thông báo</ExplainedButton></div>
  </form>{confirmation&&<ActionConfirmation message={confirmation.clear?'Xóa thông báo công khai của tuần này?':'Lưu thông báo công khai của tuần này? Nội dung sẽ hiện trên trang xem và được ghi lịch sử.'} changes={confirmation.changes} showReason={false} onCancel={()=>setConfirmation(null)} onConfirm={()=>{const proposal=confirmation;setConfirmation(null);void save(proposal.clear,proposal);}}/>}</>;
}
