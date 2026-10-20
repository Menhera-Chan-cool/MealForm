import {useEffect,useRef,useState} from 'react';
import useVisualViewport from './useVisualViewport.js';

export default function HelpDrawer({title,onClose,children,footer}){
  const dialog=useRef(null),[mobile,setMobile]=useState(()=>window.matchMedia('(max-width:700px)').matches);
  useVisualViewport(dialog);
  useEffect(()=>{const media=window.matchMedia('(max-width:700px)'),update=()=>setMobile(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  useEffect(()=>{
    const previous=document.activeElement,node=dialog.current;
    const other=event=>{if(event.detail!==node)onClose();};
    document.dispatchEvent(new CustomEvent('meal-help-open',{detail:node}));document.addEventListener('meal-help-open',other);
    return()=>{const restore=node.contains(document.activeElement)||document.activeElement===document.body;node.close();document.removeEventListener('meal-help-open',other);if(restore)(previous?.isConnected?previous:document.querySelector('#dashboard-content h1'))?.focus?.({preventScroll:true});};
  },[]);
  useEffect(()=>{const node=dialog.current;node.close();if(mobile)node.showModal();else node.show();node.querySelector('button')?.focus({preventScroll:true});},[mobile]);
  useEffect(()=>{const escape=event=>{if(event.key==='Escape'&&!event.defaultPrevented&&!event.isComposing&&event.keyCode!==229&&!document.querySelector(':popover-open,dialog:modal')){event.preventDefault();onClose();}};document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);},[onClose]);
  return <dialog ref={dialog} className="help-drawer meal-ui" aria-label={title} aria-modal={mobile?'true':undefined} onCancel={event=>{event.preventDefault();onClose();}}><header><h2>{title}</h2><button type="button" className="secondary" aria-label={mobile?'Quay lại — Đóng trợ giúp':'Đóng trợ giúp'} onClick={onClose}>{mobile?'Quay lại':'Đóng'}</button></header><div className="help-drawer-body">{children}</div>{footer&&<footer>{footer}</footer>}</dialog>;
}
