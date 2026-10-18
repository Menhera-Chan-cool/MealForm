import {useEffect,useRef,useState} from 'react';
import {attentionDefaults,readAttentionPreferences,writeAttentionPreferences,notificationCapability,showOcrNotification} from './app-platform.mjs';
export default function useAppAttention(account,viewingOcr){
  const [state,setState]=useState(()=>({account,preferences:readAttentionPreferences(account),ocr:false,updates:false})),[status,setStatus]=useState(''),[permissionBusy,setPermissionBusy]=useState(false),[badgeStatus,setBadgeStatus]=useState('');
  const current=useRef(null),queue=useRef(Promise.resolve());current.current={account,state,viewingOcr};
  const value=state.account===account?state:{account,preferences:attentionDefaults,ocr:false,updates:false};
  useEffect(()=>{setState({account,preferences:readAttentionPreferences(account),ocr:false,updates:false});setStatus('');setBadgeStatus('');setPermissionBusy(false);return()=>{current.current=null;queue.current=queue.current.catch(()=>{}).then(()=>navigator.clearAppBadge?.()).catch(()=>{});};},[account]);
  useEffect(()=>{
    function viewed(){if(document.visibilityState==='visible'&&current.current?.viewingOcr)setState(value=>value.account===account?{...value,ocr:false}:value);}
    viewed();document.addEventListener('visibilitychange',viewed);return()=>document.removeEventListener('visibilitychange',viewed);
  },[account,viewingOcr,state.ocr]);
  useEffect(()=>{
    const pending=value.preferences.badge&&(value.ocr||value.updates),scope=account;
    // shortcut: badge reflects this window; aggregate across windows only if a shared unread queue is added.
    if(typeof navigator.setAppBadge!=='function'||typeof navigator.clearAppBadge!=='function'){setBadgeStatus('Thiết bị chưa hỗ trợ dấu chấm ứng dụng; trạng thái vẫn hiện trong trang.');return;}
    queue.current=queue.current.catch(()=>{}).then(async()=>{if(current.current?.account!==scope||current.current.state.account!==scope)return;try{if(pending)await navigator.setAppBadge();else await navigator.clearAppBadge();if(current.current?.account===scope)setBadgeStatus('Đã gửi trạng thái dấu chấm cho hệ điều hành. Cách hiển thị do thiết bị quyết định.');}catch{if(current.current?.account===scope)setBadgeStatus('Chưa hiển thị được dấu chấm hệ thống; dùng trạng thái trong trang.');}});
  },[account,value.preferences.badge,value.ocr,value.updates]);
  function preference(patch){
    if(current.current?.account!==account||current.current.state.account!==account)return;const next={...current.current.state.preferences,...patch};
    setState(value=>({...value,preferences:next}));
    try{writeAttentionPreferences(account,next);}catch{setStatus('Không lưu được tùy chọn; chỉ áp dụng trong cửa sổ này.');}
  }
  async function enable(){
    if(permissionBusy||!account)return;setPermissionBusy(true);setStatus('');
    try{
      if(notificationCapability()==='unsupported')throw Error('Trình duyệt chưa hỗ trợ thông báo. Trên iPhone/iPad có thể cần bản cài ở màn hình chính.');
      const permission=notificationCapability()==='granted'?'granted':await Notification.requestPermission();
      if(current.current?.account!==account)return;
      if(permission!=='granted'){setStatus('Chưa được cấp quyền thông báo. Bạn có thể kiểm tra quyền của trang trong trình duyệt.');return;}
      preference({ocr:true});setStatus('Đã bật thông báo OCR cho tài khoản này trên trình duyệt này.');
    }catch(error){if(current.current?.account===account)setStatus(error.message);}
    finally{if(current.current?.account===account)setPermissionBusy(false);}
  }
  function completed(){
    const scope=account;if(current.current?.account!==scope)return;
    const hidden=document.visibilityState!=='visible';
    if(hidden||!current.current.viewingOcr)setState(value=>value.account===scope?{...value,ocr:true}:value);
    if(hidden&&current.current.state.preferences.ocr&&notificationCapability()==='granted')void showOcrNotification(false,()=>current.current?.account===scope&&current.current.state.preferences.ocr).catch(()=>{if(current.current?.account===scope)setStatus('Chưa gửi được thông báo hệ thống. Kết quả OCR vẫn được giữ trong trang.');});
  }
  const updates=(count,week)=>setState(value=>value.account===account?{...value,updates:count>0?week:value.updates===week?'':value.updates}:value);
  async function test(){const scope=account;try{await showOcrNotification(true,()=>current.current?.account===scope&&current.current.state.preferences.ocr);if(current.current?.account===scope)setStatus('Đã gửi thông báo thử cho hệ điều hành.');}catch{if(current.current?.account===scope)setStatus('Chưa gửi được thông báo thử. Kiểm tra quyền và bản cài ứng dụng.');}}
  return {preferences:value.preferences,ocrPending:value.ocr,updatesPending:value.updates,status,badgeStatus,permissionBusy,enable,preference,completed,updates,test};
}
