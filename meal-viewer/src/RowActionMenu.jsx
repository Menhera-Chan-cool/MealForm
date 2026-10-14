import {useEffect,useId,useRef,useState} from 'react';
import {MoreHorizontal} from 'lucide-react';

export default function RowActionMenu({label,children}) {
  const id=useId(),trigger=useRef(null),menu=useRef(null);
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    if(!open)return;
    const close=()=>menu.current?.hidePopover();
    window.addEventListener('resize',close);window.addEventListener('scroll',close,{passive:true});
    return()=>{window.removeEventListener('resize',close);window.removeEventListener('scroll',close);};
  },[open]);
  return <>
    <button className="secondary row-menu-trigger" type="button" ref={trigger} aria-label={label} title={label} aria-haspopup="dialog" aria-controls={id} aria-expanded={open} popoverTarget={id} onKeyDown={event=>{if(event.key==='ArrowDown'){event.preventDefault();if(!menu.current.matches(':popover-open'))trigger.current.click();menu.current.querySelector('button:not(:disabled)')?.focus();}}}><MoreHorizontal size={20} aria-hidden="true"/></button>
    <div id={id} ref={menu} className="row-action-menu" popover="auto" role="dialog" aria-label={label} onToggle={event=>setOpen(event.newState==='open')} onBeforeToggle={event=>{
      event.currentTarget.inert=event.newState!=='open';
      if(event.newState!=='open')return;
      const rect=trigger.current.getBoundingClientRect();
      const top=Math.max(12,Math.min(rect.bottom+6,window.innerHeight-240));
      menu.current.style.top=`${top}px`;menu.current.style.right=`${Math.max(12,document.documentElement.clientWidth-rect.right)}px`;
    }} onClick={event=>{if(event.target.closest('[data-close-row-menu]'))menu.current.hidePopover();}}>{children}</div>
  </>;
}
