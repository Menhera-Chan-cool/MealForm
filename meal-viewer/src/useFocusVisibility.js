import {useEffect} from 'react';

export default function useFocusVisibility(){
  useEffect(()=>{
    const viewport=window.visualViewport;let frame;
    function reveal(){
      const root=document.documentElement,active=document.activeElement;
      const top=viewport?.offsetTop||0,height=viewport?.height||innerHeight,bottom=top+height;
      root.style.setProperty('--meal-viewport-height',height+'px');
      root.style.setProperty('--meal-viewport-top',top+'px');
      root.dataset.virtualKeyboard=active?.matches('input:not([readonly]),textarea')&&height<innerHeight*.8&&(viewport?.scale||1)===1?'open':'closed';
      if(!(active instanceof HTMLElement)||!active.matches('input,textarea,select,button,a,summary,[tabindex]')||active.getAttribute('role')==='separator'||!active.checkVisibility())return;
      let start=top+12,end=bottom-12;
      const box=active.getBoundingClientRect();
      const layer=active.closest(':popover-open,dialog:modal');
      for(const bar of document.querySelectorAll('.dashboard-sticky-tools,.ocr-pane-tabs,.ui-mobile-nav,.contextual-save-bar,.action-toast')){
        if(layer&&!layer.contains(bar))continue;
        if(bar.contains(active)||!bar.checkVisibility()||!['sticky','fixed'].includes(getComputedStyle(bar).position))continue;
        const rect=bar.getBoundingClientRect();
        if(rect.right<=box.left||rect.left>=box.right)continue;
        if(rect.top<=start&&rect.bottom>start)start=rect.bottom+12;
        else if(rect.top<end&&rect.top>start&&(rect.bottom>=end||box.bottom>rect.top&&box.top<rect.bottom))end=rect.top-12;
      }
      const needed=Math.min(box.height,Math.max(44,end-start));
      const delta=box.top<start?box.top-start:box.top+needed>end?box.top+needed-end:0;
      if(!delta)return;
      let scroller=active.parentElement;
      while(scroller&&scroller!==document.body&&!(scroller.scrollHeight>scroller.clientHeight+1&&/auto|scroll/.test(getComputedStyle(scroller).overflowY)))scroller=scroller.parentElement;
      if(scroller&&scroller!==document.body)scroller.scrollBy({top:delta,behavior:'instant'});
      else window.scrollBy({top:delta,behavior:'instant'});
    }
    const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(reveal);};
    document.addEventListener('focusin',update);document.addEventListener('focusout',update);window.addEventListener('meal-layout-changed',update);
    viewport?.addEventListener('resize',update);viewport?.addEventListener('scroll',update);window.addEventListener('resize',update);update();
    return()=>{cancelAnimationFrame(frame);document.removeEventListener('focusin',update);document.removeEventListener('focusout',update);window.removeEventListener('meal-layout-changed',update);viewport?.removeEventListener('resize',update);viewport?.removeEventListener('scroll',update);window.removeEventListener('resize',update);delete document.documentElement.dataset.virtualKeyboard;};
  },[]);
}
