import { useEffect, useState } from 'react';
import { isNewBuild } from './dashboard-model.mjs';
import './review-scale.css';

export default function VersionNotice({ beforeReload, disabled=false }) {
  const [available,setAvailable]=useState(false),[updating,setUpdating]=useState(false),[error,setError]=useState('');
  useEffect(()=>{
    let stopped=false,checking=false;const controller=new AbortController();
    async function check(){
      if(checking||document.visibilityState!=='visible')return;checking=true;
      try{const response=await fetch('/version.json',{cache:'no-store',signal:controller.signal});if(response.ok){const latest=await response.json();if(!stopped)setAvailable(isNewBuild(latest,__MEAL_BUILD_ID__));}}
      catch{/* A version check never interrupts work or login. */}finally{checking=false;}
    }
    void check();const timer=setInterval(()=>void check(),300000);document.addEventListener('visibilitychange',check);
    return()=>{stopped=true;controller.abort();clearInterval(timer);document.removeEventListener('visibilitychange',check);};
  },[]);
  if(!available)return null;
  return <section className="version-notice" aria-label="Phiên bản website"><strong>Có bản cập nhật</strong><span>Không tự tải lại trang khi bạn đang làm việc.</span><button type="button" className="secondary" disabled={disabled||updating} onClick={async()=>{
    setUpdating(true);setError('');
    try{await beforeReload?.();window.location.reload();}
    catch{setError('Chưa lưu nháp được; trang chưa tải lại. Hãy kiểm tra quyền/dung lượng lưu trên thiết bị rồi thử lại.');setUpdating(false);}
  }}>{updating?'Đang lưu trước khi cập nhật…':'Cập nhật trang'}</button>{error&&<p role="alert">{error}</p>}</section>;
}
