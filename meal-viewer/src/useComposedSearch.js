import {useEffect,useRef,useState} from 'react';

export default function useComposedSearch(value,onChange,disabled=false){
  const composing=useRef(false),[pending,setPending]=useState(null);
  function reset(){composing.current=false;setPending(null);}
  useEffect(()=>{composing.current=false;setPending(null);},[value,disabled]);
  function finish(event){
    if(!composing.current)return;
    reset();onChange?.(event);
  }
  return {
    value:pending??value,reset,
    onCompositionStart:event=>{composing.current=true;setPending(event.target.value);},
    onCompositionEnd:finish,onBlur:finish,
    onChange:event=>{if(composing.current)setPending(event.target.value);else onChange?.(event);},
    isComposing:event=>{
      if(!composing.current&&!event.nativeEvent.isComposing&&event.keyCode!==229)return false;
      event.stopPropagation();return true;
    }
  };
}
