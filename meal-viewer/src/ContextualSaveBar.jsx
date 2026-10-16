import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import ExplainedButton from './ExplainedButton.jsx';
import ActionConfirmation from './ActionConfirmation.jsx';

export default function ContextualSaveBar({dirty,scope,saveLabel,busy,saveDisabled=false,saveReason='',onDiscard}){
  const [confirmDiscard,setConfirmDiscard]=useState(false);
  const bar=useRef(null);
  useEffect(()=>{
    if(!dirty||!bar.current)return;
    const node=bar.current;
    const update=()=>{if(!node.isConnected)return;document.documentElement.style.setProperty('--meal-save-bar-height',node.getBoundingClientRect().height+'px');window.dispatchEvent(new Event('meal-layout-changed'));};
    const observer=new ResizeObserver(update);observer.observe(node);update();
    return()=>{observer.disconnect();document.documentElement.style.removeProperty('--meal-save-bar-height');window.dispatchEvent(new Event('meal-layout-changed'));};
  },[dirty]);
  if(!dirty)return null;
  return <><div ref={bar} className="contextual-save-bar" role="region" aria-label={`Thay đổi ${scope} chưa lưu`}>
    <p role="status" aria-label={`Chưa lưu ${scope}`}>Chưa lưu <span>· {scope}</span></p><div className="actions">
      <ExplainedButton type="submit" disabled={busy||saveDisabled} reason={busy?'Đang xử lý yêu cầu; hãy chờ hoàn tất.':saveReason}>{saveLabel}</ExplainedButton>
      <button type="button" className="secondary" disabled={busy} onClick={()=>setConfirmDiscard(true)}>Bỏ thay đổi</button>
    </div>
  </div>{confirmDiscard&&createPortal(<ActionConfirmation message={`Bỏ thay đổi ${scope} chưa lưu? Giá trị đã lưu trên máy chủ không bị thay đổi.`} confirmLabel="Bỏ thay đổi" showReason={false} onCancel={()=>setConfirmDiscard(false)} onConfirm={()=>{setConfirmDiscard(false);onDiscard();}}/>,document.body)}</>;
}
