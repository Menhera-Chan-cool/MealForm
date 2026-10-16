import {useRef} from 'react';
import {X} from 'lucide-react';
import useComposedSearch from './useComposedSearch.js';
export default function SearchInput({label,value,onClear,ref,...props}) {
  const input=useRef(null);
  const search=useComposedSearch(value,props.onChange,props.disabled);
  return <span className="clearable-search"><input inputMode="search" enterKeyHint="search" {...props} ref={node=>{input.current=node;if(typeof ref==='function')ref(node);else if(ref)ref.current=node;}} aria-label={label} value={search.value} onChange={search.onChange} onCompositionStart={search.onCompositionStart} onCompositionEnd={search.onCompositionEnd} onBlur={event=>{search.onBlur(event);props.onBlur?.(event);}} onKeyDown={event=>{if(!search.isComposing(event))props.onKeyDown?.(event);}}/>{search.value&&<button type="button" className="secondary search-clear" disabled={props.disabled} aria-label={`Xóa tìm kiếm ${label}`} onMouseDown={event=>event.preventDefault()} onClick={()=>{search.reset();onClear();input.current?.focus();}}><X size={16} aria-hidden="true"/></button>}</span>;
}
