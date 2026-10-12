import {useEffect,useState} from 'react';
import {activeWeekNotice} from './dashboard-model.mjs';

export default function WeekNotice({notice,serverNow}){
  const [visible,setVisible]=useState(null);
  useEffect(()=>{
    const now=Number.isFinite(serverNow)&&serverNow>0?serverNow:Date.now();
    const value=activeWeekNotice(notice,now);setVisible(value);
    if(!value)return;
    // Re-arm long notices; browser timeouts cannot exceed a signed 32-bit delay.
    const start=performance.now();let timer;
    function check(){const remaining=value.expiresAt-now-(performance.now()-start);if(remaining<=0)setVisible(null);else timer=setTimeout(check,Math.min(remaining,2147483647));}
    check();return()=>clearTimeout(timer);
  },[notice?.text,notice?.expiresAt,serverNow]);
  return visible?<aside className="week-notice" aria-label="Thông báo tuần"><strong>Thông báo tuần</strong><p>{visible.text}</p></aside>:null;
}
