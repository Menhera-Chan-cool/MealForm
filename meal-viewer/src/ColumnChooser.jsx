import {Columns3,GripVertical,ArrowLeft,ArrowRight} from 'lucide-react';
import {displayHeader} from './ui-clarity.mjs';
import useAnchoredPopover from './useAnchoredPopover.js';
import {useEffect,useRef,useState} from 'react';

function WidthControl({label,width,max,disabled,onResize,onStep}){
  const [draft,setDraft]=useState(width===undefined?'':String(Math.round(width)));
  useEffect(()=>setDraft(width===undefined?'':String(Math.round(width))),[width]);
  function commit(){const value=Number(draft);if(draft&&Number.isFinite(value))onResize(Math.max(144,Math.min(max,Math.round(value))));else setDraft(width===undefined?'':String(Math.round(width)));}
  return <div className="column-width-controls" role="group" aria-label={`Chỉnh độ rộng ${label}`}><button type="button" className="secondary" aria-label={`Giảm độ rộng ${label}`} disabled={disabled||width<=144} onClick={()=>onStep(-16)}>−</button><label>Độ rộng (px)<input type="number" inputMode="numeric" enterKeyHint="done" aria-label={`Độ rộng ${label}`} min={144} max={max} value={draft} placeholder="Tự động" disabled={disabled} onChange={event=>setDraft(event.target.value)} onBlur={commit} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();event.stopPropagation();commit();}if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setDraft(width===undefined?'':String(Math.round(width)));}}}/></label><button type="button" className="secondary" aria-label={`Tăng độ rộng ${label}`} disabled={disabled||width>=max} onClick={()=>onStep(16)}>+</button></div>;
}
export default function ColumnChooser({label,headers,required,hidden,onChange,onResetLayout,storageNote,widths,maxWidth=720,onResize,onWidthStep,order=headers.map((_,index)=>index),onMove}) {
  const popover=useAnchoredPopover('bottom',{followScroll:true});
  const drag=useRef(null),[tab,setTab]=useState('visibility');
  const tabs=[['visibility','Hiện/Ẩn'],['order','Thứ tự'],['width','Độ rộng']];
  function chooseTab(event,index){const next=(index+tabs.length)%tabs.length;setTab(tabs[next][0]);event.currentTarget.parentElement.querySelectorAll('[role=tab]')[next].focus();}
  return <>
    <button type="button" ref={popover.trigger} className="secondary column-chooser-trigger" aria-label="Cột hiển thị" aria-haspopup="dialog" aria-expanded={popover.open} aria-controls={popover.id} popoverTarget={popover.id}><Columns3 size={18} aria-hidden="true"/>Cột hiển thị <span aria-hidden="true">({headers.length-hidden.length}/{headers.length})</span></button>
    <div ref={popover.panel} id={popover.id} className="ui-anchored-popover column-chooser" popover="auto" role="dialog" aria-label={`Cột hiển thị · ${label}`} {...popover.events}>
      <strong>Cột hiển thị trên PC</strong><p>Ẩn cột không đổi bộ lọc hay tổng số. Điện thoại vẫn hiện đủ cột. {storageNote}</p>
      <div className="column-config-tabs" role="tablist" aria-label="Cấu hình cột">{tabs.map(([key,name],index)=><button key={key} type="button" role="tab" id={popover.id+'-'+key} aria-selected={tab===key} aria-controls={popover.id+'-panel'} tabIndex={tab===key?0:-1} className="secondary" onClick={()=>setTab(key)} onKeyDown={event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();chooseTab(event,event.key==='Home'?0:event.key==='End'?2:index+(event.key==='ArrowLeft'?-1:1));}}}>{name}</button>)}</div>
      <div role="tabpanel" id={popover.id+'-panel'} aria-labelledby={popover.id+'-'+tab}>
      {order.map((index,position)=>{const header=headers[index],name=displayHeader(header)||'Thao tác bản ghi';return <div className="column-choice" key={`${header}-${index}`} onDragOver={event=>{if(drag.current?.signature===JSON.stringify([headers,order]))event.preventDefault();}} onDrop={event=>{event.preventDefault();const source=drag.current;drag.current=null;if(source?.signature===JSON.stringify([headers,order]))onMove?.(source.position,position);}}>{tab==='visibility'?<label><input type="checkbox" aria-label={name} checked={!hidden.includes(index)} disabled={required.includes(index)} onChange={event=>onChange(event.target.checked?hidden.filter(value=>value!==index):[...hidden,index])}/><span>{name}{required.includes(index)&&<small>Luôn hiển thị</small>}</span></label>:<strong>{name}{hidden.includes(index)&&<small> · Đang ẩn</small>}</strong>}{tab==='order'&&onMove&&<div className="column-order-controls" role="group" aria-label={`Thứ tự cột ${name}`}><button type="button" className="secondary column-drag" draggable aria-label={`Kéo cột ${name}`} onDragStart={event=>{drag.current={position,signature:JSON.stringify([headers,order])};event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',String(index));}} onDragEnd={()=>{drag.current=null;}}><GripVertical size={16} aria-hidden="true"/>Kéo</button><button type="button" className="secondary" disabled={position===0} aria-label={`Chuyển cột ${name} sang trái`} onClick={()=>onMove(position,position-1)}><ArrowLeft size={16} aria-hidden="true"/>Trái</button><button type="button" className="secondary" disabled={position===order.length-1} aria-label={`Chuyển cột ${name} sang phải`} onClick={()=>onMove(position,position+1)}><ArrowRight size={16} aria-hidden="true"/>Phải</button></div>}{tab==='width'&&onResize&&<WidthControl label={name} width={widths?.[index]} max={maxWidth} disabled={hidden.includes(index)} onResize={value=>onResize(index,value)} onStep={delta=>onWidthStep(index,delta)}/>}</div>;})}
      </div>
      {tab==='visibility'&&<button type="button" className="secondary" onClick={()=>onChange([])}>Hiện tất cả cột</button>}
      {onResetLayout&&<button type="button" className="secondary" onClick={onResetLayout}>Khôi phục bố cục</button>}
    </div>
  </>;
}
