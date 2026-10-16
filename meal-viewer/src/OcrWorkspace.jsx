import {useEffect,useId,useImperativeHandle,useRef,useState} from 'react';

export default function OcrWorkspace({hasMenu,source,children,ref}){
  const id=useId(),root=useRef(null),positions=useRef({}),[pane,setPane]=useState('edit');
  const [mobile,setMobile]=useState(()=>window.matchMedia('(max-width:700px)').matches);
  useEffect(()=>{const media=window.matchMedia('(max-width:700px)'),update=()=>setMobile(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  useEffect(()=>{if(hasMenu){setPane('edit');positions.current={};}},[hasMenu]);
  useImperativeHandle(ref,()=>({showEditor(after){setPane('edit');requestAnimationFrame(after);}}),[]);
  function change(next){
    if(next===pane)return;
    positions.current[pane]=window.scrollY;setPane(next);
    requestAnimationFrame(()=>window.scrollTo({top:positions.current[next]??Math.max(0,root.current.getBoundingClientRect().top+window.scrollY-16),behavior:'instant'}));
  }
  return <div className="ocr-workspace" ref={root}>
    {hasMenu&&mobile&&<div className="ocr-pane-tabs" role="tablist" aria-label="Đối chiếu thực đơn">{[['source','Ảnh'],['edit','Bản sửa']].map(([key,label])=><button type="button" role="tab" id={id+'-'+key} aria-controls={id+'-'+key+'-panel'} aria-selected={pane===key} tabIndex={pane===key?0:-1} className={pane===key?'':'secondary'} key={key} onClick={()=>change(key)} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();const next=key==='edit'?'source':'edit';change(next);document.getElementById(id+'-'+next)?.focus();}}}>{label}</button>)}</div>}
    <div className={`menu-review-layout${hasMenu?'':' image-only'}`}>
      <div id={id+'-source-panel'} className="ocr-source-panel" role={hasMenu&&mobile?'tabpanel':undefined} aria-labelledby={hasMenu&&mobile?id+'-source':undefined} hidden={hasMenu&&mobile&&pane!=='source'} inert={hasMenu&&mobile&&pane!=='source'}>{source}</div>
      <div id={id+'-edit-panel'} className="ocr-edit-panel" role={hasMenu&&mobile?'tabpanel':undefined} aria-labelledby={hasMenu&&mobile?id+'-edit':undefined} hidden={hasMenu&&mobile&&pane!=='edit'} inert={hasMenu&&mobile&&pane!=='edit'}>{children}</div>
    </div>
  </div>;
}
