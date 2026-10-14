import {useEffect,useRef,useState} from 'react';
import {Maximize2,Minimize2} from 'lucide-react';
import useVisualViewport from './useVisualViewport.js';

export default function TableWorkspace({label,expandLabel,children}) {
  const dialog=useRef(null),trigger=useRef(null),saved=useRef(null);
  const [expanded,setExpanded]=useState(false);useVisualViewport(dialog);
  function close(){
    dialog.current.close();dialog.current.setAttribute('open','');setExpanded(false);
    const position=saved.current;
    requestAnimationFrame(()=>{if(position){window.scrollTo(position.x,position.y);position.tables.forEach(item=>{item.node.scrollTop=item.top;item.node.scrollLeft=item.left;});}trigger.current?.focus({preventScroll:true});});
  }
  function expand(){
    saved.current={x:window.scrollX,y:window.scrollY,tables:[...dialog.current.querySelectorAll('.table-wrap')].map(node=>({node,top:node.scrollTop,left:node.scrollLeft}))};
    dialog.current.close();dialog.current.showModal();setExpanded(true);
  }
  useEffect(()=>{
    if(!expanded)return;
    const update=()=>{if(window.matchMedia('(max-width:700px)').matches)close();};
    window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update);
  },[expanded]);
  // Keep one table DOM; the inline region becomes modal only via showModal().
  return <dialog open ref={dialog} role={expanded?'dialog':'region'} aria-label={label} className={`table-workspace ${expanded?'workspace-expanded':''}`} onCancel={event=>{event.preventDefault();close();}}>
    <div className="workspace-toolbar">{expanded&&<strong>{label}</strong>}<button type="button" className="secondary workspace-toggle" ref={trigger} aria-label={expanded?`Thu nhỏ ${label.toLocaleLowerCase()}`:expandLabel} onClick={expanded?close:expand}>{expanded?<Minimize2 size={16} aria-hidden="true"/>:<Maximize2 size={16} aria-hidden="true"/>}{expanded?'Thu nhỏ':'Phóng rộng bảng'}</button></div>
    <div className="workspace-body">{children}</div>
  </dialog>;
}
