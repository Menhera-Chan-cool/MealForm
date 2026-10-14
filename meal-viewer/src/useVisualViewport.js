import {useEffect} from 'react';
export default function useVisualViewport(ref,enabled=true) {
  useEffect(()=>{
    if(!enabled)return;
    const viewport=window.visualViewport;
    const update=()=>ref.current?.style.setProperty('--usable-viewport',`${viewport?.height||window.innerHeight}px`);
    update();viewport?.addEventListener('resize',update);window.addEventListener('resize',update);
    return()=>{viewport?.removeEventListener('resize',update);window.removeEventListener('resize',update);};
  },[ref,enabled]);
}
