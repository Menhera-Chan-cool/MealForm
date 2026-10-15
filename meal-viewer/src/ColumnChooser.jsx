import {Columns3} from 'lucide-react';
import {displayHeader} from './ui-clarity.mjs';
import useAnchoredPopover from './useAnchoredPopover.js';

export default function ColumnChooser({label,headers,required,hidden,onChange,onResetLayout,storageNote}) {
  const popover=useAnchoredPopover();
  return <>
    <button type="button" ref={popover.trigger} className="secondary column-chooser-trigger" aria-label="Cột hiển thị" aria-haspopup="dialog" aria-expanded={popover.open} aria-controls={popover.id} popoverTarget={popover.id}><Columns3 size={18} aria-hidden="true"/>Cột hiển thị <span aria-hidden="true">({headers.length-hidden.length}/{headers.length})</span></button>
    <div ref={popover.panel} id={popover.id} className="ui-anchored-popover column-chooser" popover="auto" role="dialog" aria-label={`Cột hiển thị · ${label}`} {...popover.events}>
      <strong>Cột hiển thị trên PC</strong><p>Ẩn cột không đổi bộ lọc hay tổng số. Điện thoại vẫn hiện đủ cột. {storageNote}</p>
      {headers.map((header,index)=><label key={`${header}-${index}`}><input type="checkbox" aria-label={displayHeader(header)||'Thao tác bản ghi'} checked={!hidden.includes(index)} disabled={required.includes(index)} onChange={event=>onChange(event.target.checked?hidden.filter(value=>value!==index):[...hidden,index])}/><span>{displayHeader(header)||'Thao tác bản ghi'}{required.includes(index)&&<small>Luôn hiển thị</small>}</span></label>)}
      <button type="button" className="secondary" onClick={()=>onChange([])}>Hiện tất cả cột</button>
      {onResetLayout&&<button type="button" className="secondary" onClick={onResetLayout}>Khôi phục bố cục</button>}
    </div>
  </>;
}
