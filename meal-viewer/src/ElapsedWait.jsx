import {useEffect,useState} from 'react';

export default function ElapsedWait({active,label,requestKey=''}) {
  const phase=JSON.stringify([label,requestKey]);
  const [clock,setClock]=useState({phase:'',seconds:0});
  useEffect(()=>{
    setClock({phase,seconds:0});if(!active)return;
    const start=performance.now(),tick=()=>setClock({phase,seconds:Math.max(0,Math.floor((performance.now()-start)/1000))});
    const timer=setInterval(tick,1000);document.addEventListener('visibilitychange',tick);
    return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',tick);};
  },[active,phase]);
  return active?<span className="elapsed-wait" role="status" aria-label="Thời gian chờ" aria-live="off">{label} · <span>{clock.phase===phase?clock.seconds:0} giây</span></span>:null;
}
