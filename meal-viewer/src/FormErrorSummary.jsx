import {useEffect,useRef} from 'react';

export default function FormErrorSummary({errors,label,attempt=0,onJump}){
  const node=useRef(null);
  useEffect(()=>{if(attempt&&errors.length)node.current?.focus();},[attempt]);
  if(!errors.length)return null;
  const blocking=errors.filter(error=>error.blocking!==false).length;
  return <section ref={node} className="form-error-summary" role="region" aria-label={label} tabIndex={-1}>
    <h3>Có {blocking||errors.length} mục cần {blocking?'sửa':'đối chiếu'}</h3>
    <ul>{errors.map(error=><li key={error.id}><button type="button" className="secondary" onClick={()=>{if(onJump)onJump(error.id);else{const target=document.getElementById(error.id);target?.focus();target?.scrollIntoView({block:'center'});}}}>{error.label}: {error.message}</button>{error.blocking===false&&<small>Cảnh báo · đã cho phép thiếu món</small>}</li>)}</ul>
  </section>;
}
