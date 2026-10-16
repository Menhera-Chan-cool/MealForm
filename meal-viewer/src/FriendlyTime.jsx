import {useEffect,useState} from 'react';
import {readableTime} from './operating-ui.mjs';
export default function FriendlyTime({value}){
  const [now,setNow]=useState(()=>Date.now()),[expanded,setExpanded]=useState(false);
  useEffect(()=>{
    const nextMidnight=86400000-((now+7*3600000)%86400000),update=()=>{if(document.visibilityState==='visible')setNow(Date.now());};
    const timer=setTimeout(()=>setNow(Date.now()),nextMidnight+10);document.addEventListener('visibilitychange',update);
    return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',update);};
  },[now]);
  useEffect(()=>setExpanded(false),[value]);
  const time=readableTime(value,now);
  if(!time)return <span>{value==null||value===''||value===0?'Chưa có thời điểm':String(value)}</span>;
  if(time.short===time.full)return <time dateTime={time.dateTime}>{time.full}</time>;
  return <button type="button" className="time-disclosure" title={time.full} aria-expanded={expanded} onClick={()=>setExpanded(current=>!current)}><time dateTime={time.dateTime}>{expanded?time.full:time.short}</time></button>;
}
