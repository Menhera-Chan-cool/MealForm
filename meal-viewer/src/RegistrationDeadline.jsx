import {useEffect,useState} from 'react';
import {registrationDeadlineTime,registrationRemaining} from './viewer-model.mjs';

export default function RegistrationDeadline({lockAt,status,serverNow}) {
  const [remaining,setRemaining]=useState('');
  const at=registrationDeadlineTime(lockAt),serverClock=Number.isFinite(serverNow)&&serverNow>0;
  useEffect(()=>{
    const start=performance.now(),base=serverClock?serverNow:Date.now();
    const update=()=>setRemaining(registrationRemaining(lockAt,status,base+performance.now()-start));
    update();if(at===null||status!=='open')return;
    const timer=setInterval(update,30000);return()=>clearInterval(timer);
  },[lockAt,status,serverNow,serverClock,at]);
  if(at===null)return <p className="registration-deadline">Chưa có thông tin hạn đăng ký.</p>;
  return <div className="registration-deadline"><p>Hạn đăng ký: <time dateTime={lockAt}>{new Date(at).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'})}</time> (giờ Việt Nam)</p>{remaining&&<p>{remaining}{!serverClock&&' · Theo giờ thiết bị.'}</p>}</div>;
}
