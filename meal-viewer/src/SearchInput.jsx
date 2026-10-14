import {useRef} from 'react';
import {X} from 'lucide-react';
export default function SearchInput({label,value,onClear,ref,...props}) {
  const input=useRef(null);
  return <span className="clearable-search"><input {...props} ref={node=>{input.current=node;if(typeof ref==='function')ref(node);else if(ref)ref.current=node;}} aria-label={label} value={value}/>{value&&<button type="button" className="secondary search-clear" disabled={props.disabled} aria-label={`Xóa tìm kiếm ${label}`} onClick={()=>{onClear();input.current?.focus();}}><X size={16} aria-hidden="true"/></button>}</span>;
}
