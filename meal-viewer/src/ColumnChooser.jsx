import {Columns3} from 'lucide-react';
import {displayHeader} from './ui-clarity.mjs';
import useAnchoredPopover from './useAnchoredPopover.js';
import {useEffect,useState} from 'react';

function WidthControl({label,width,max,disabled,onResize,onStep}){
  const [draft,setDraft]=useState(width===undefined?'':String(Math.round(width)));
  useEffect(()=>setDraft(width===undefined?'':String(Math.round(width))),[width]);
  function commit(){const value=Number(draft);if(draft&&Number.isFinite(value))onResize(Math.max(144,Math.min(max,Math.round(value))));else setDraft(width===undefined?'':String(Math.round(width)));}
  return <div className="column-width-controls" role="group" aria-label={`Chỉnh độ rộng ${label}`}><button type="button" className="secondary" aria-label={`Giảm độ rộng ${label}`} disabled={disabled||width<=144} onClick={()=>onStep(-16)}>−</button><label>Độ rộng (px)<input type="number" inputMode="numeric" enterKeyHint="done" aria-label={`Độ rộng ${label}`} min={144} max={max} value={draft} placeholder="Tự động" disabled={disabled} onChange={event=>setDraft(event.target.value)} onBlur={commit} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();event.stopPropagation();commit();}if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setDraft(width===undefined?'':String(Math.round(width)));}}}/></label><button type="button" className="secondary" aria-label={`Tăng độ rộng ${label}`} disabled={disabled||width>=max} onClick={()=>onStep(16)}>+</button></div>;
}
export default function ColumnChooser({label,headers,required,hidden,onChange,onResetLayout,storageNote,widths,maxWidth=720,onResize,onWidthStep}) {
  const popover=useAnchoredPopover();
  return <>
    <button type="button" ref={popover.trigger} className="secondary column-chooser-trigger" aria-label="Cột hiển thị" aria-haspopup="dialog" aria-expanded={popover.open} aria-controls={popover.id} popoverTarget={popover.id}><Columns3 size={18} aria-hidden="true"/>Cột hiển thị <span aria-hidden="true">({headers.length-hidden.length}/{headers.length})</span></button>
    <div ref={popover.panel} id={popover.id} className="ui-anchored-popover column-chooser" popover="auto" role="dialog" aria-label={`Cột hiển thị · ${label}`} {...popover.events}>
      <strong>Cột hiển thị trên PC</strong><p>Ẩn cột không đổi bộ lọc hay tổng số. Điện thoại vẫn hiện đủ cột. {storageNote}</p>
      {headers.map((header,index)=><div className="column-choice" key={`${header}-${index}`}><label><input type="checkbox" aria-label={displayHeader(header)||'Thao tác bản ghi'} checked={!hidden.includes(index)} disabled={required.includes(index)} onChange={event=>onChange(event.target.checked?hidden.filter(value=>value!==index):[...hidden,index])}/><span>{displayHeader(header)||'Thao tác bản ghi'}{required.includes(index)&&<small>Luôn hiển thị</small>}</span></label>{onResize&&<WidthControl label={displayHeader(header)||'Thao tác bản ghi'} width={widths?.[index]} max={maxWidth} disabled={hidden.includes(index)} onResize={value=>onResize(index,value)} onStep={delta=>onWidthStep(index,delta)}/>}</div>)}
      <button type="button" className="secondary" onClick={()=>onChange([])}>Hiện tất cả cột</button>
      {onResetLayout&&<button type="button" className="secondary" onClick={onResetLayout}>Khôi phục bố cục</button>}
    </div>
  </>;
}
