import {useEffect,useRef} from 'react';
export default function useUnsavedChanges(dirty) {
  const current=useRef(dirty);current.current=dirty;
  useEffect(()=>{
    if(!dirty)return;
    const warn=event=>{if(current.current){event.preventDefault();event.returnValue='';}};
    window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
  },[dirty]);
  return ()=>{
    if(!current.current)return true;
    if(!window.confirm('Còn thay đổi chưa lưu. Rời mục này và bỏ các thay đổi đó?'))return false;
    // Avoid a second unload prompt before React commits the discarded draft.
    current.current=false;return true;
  };
}
