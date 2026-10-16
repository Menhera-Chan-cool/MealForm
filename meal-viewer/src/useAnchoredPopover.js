import {useEffect,useId,useRef,useState} from 'react';

export default function useAnchoredPopover(side='bottom',{followScroll=false}={}) {
  const trigger=useRef(null),panel=useRef(null),id=useId();
  const hideTimer=useRef(null);
  const [open,setOpen]=useState(false);
  function cancelHide(){clearTimeout(hideTimer.current);}
  function hide(){cancelHide();if(panel.current?.matches(':popover-open'))panel.current.hidePopover();}
  function scheduleHide(){cancelHide();if(document.activeElement!==trigger.current&&!panel.current?.contains(document.activeElement))hideTimer.current=setTimeout(hide,250);}
  useEffect(()=>{
    if(!open)return;
    const rootX=window.scrollX,rootY=window.scrollY;
    const close=event=>{
      // Ignore a queued root scroll that did not move the viewport after opening.
      if(event.type==='scroll'&&[window,document,document.scrollingElement].includes(event.target)&&window.scrollX===rootX&&window.scrollY===rootY)return;
      if(followScroll&&event.type==='scroll'){if(panel.current&&trigger.current&&(!(event.target instanceof Node)||!panel.current.contains(event.target)))position();return;}
      if(event.type==='resize'||!(event.target instanceof Node)||!panel.current?.contains(event.target))hide();
    };
    const escape=event=>{if(side==='right'&&event.key==='Escape')hide();};
    window.addEventListener('resize',close);window.addEventListener('scroll',close,true);
    document.addEventListener('keydown',escape);
    return()=>{cancelHide();window.removeEventListener('resize',close);window.removeEventListener('scroll',close,true);document.removeEventListener('keydown',escape);};
  },[open,followScroll]);
  function position(){
    const node=panel.current,rect=trigger.current.getBoundingClientRect(),width=node.offsetWidth,height=node.offsetHeight;
    const left=side==='right'?rect.right+8:rect.right-width;
    const top=side==='right'?rect.top:rect.bottom+8+height<=window.innerHeight-12?rect.bottom+8:rect.top-height-8;
    node.style.left=`${Math.max(12,Math.min(left,document.documentElement.clientWidth-width-12))}px`;
    node.style.top=`${Math.max(12,Math.min(top,window.innerHeight-height-12))}px`;
  }
  return {trigger,panel,id,open,hide,scheduleHide,show(){cancelHide();if(!panel.current?.matches(':popover-open'))panel.current?.showPopover();},events:{onPointerEnter:side==='right'?cancelHide:undefined,onPointerLeave:side==='right'?scheduleHide:undefined,onBeforeToggle(event){event.currentTarget.inert=event.newState!=='open';},onToggle(event){setOpen(event.newState==='open');if(event.newState==='open')position();}}};
}
