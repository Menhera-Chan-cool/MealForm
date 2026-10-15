import {useEffect,useId,useRef,useState} from 'react';

export default function useAnchoredPopover(side='bottom') {
  const trigger=useRef(null),panel=useRef(null),id=useId();
  const [open,setOpen]=useState(false);
  function hide(){if(panel.current?.matches(':popover-open'))panel.current.hidePopover();}
  useEffect(()=>{
    if(!open)return;
    const close=event=>{if(event.type==='resize'||!(event.target instanceof Node)||!panel.current?.contains(event.target))hide();};
    window.addEventListener('resize',close);window.addEventListener('scroll',close,true);
    return()=>{window.removeEventListener('resize',close);window.removeEventListener('scroll',close,true);};
  },[open]);
  function position(){
    const node=panel.current,rect=trigger.current.getBoundingClientRect(),width=node.offsetWidth,height=node.offsetHeight;
    const left=side==='right'?rect.right+8:rect.right-width;
    const top=side==='right'?rect.top:rect.bottom+8+height<=window.innerHeight-12?rect.bottom+8:rect.top-height-8;
    node.style.left=`${Math.max(12,Math.min(left,document.documentElement.clientWidth-width-12))}px`;
    node.style.top=`${Math.max(12,Math.min(top,window.innerHeight-height-12))}px`;
  }
  return {trigger,panel,id,open,hide,show(){if(!panel.current?.matches(':popover-open'))panel.current?.showPopover();},events:{onBeforeToggle(event){event.currentTarget.inert=event.newState!=='open';},onToggle(event){setOpen(event.newState==='open');if(event.newState==='open')position();}}};
}
