import {useEffect,useId,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {ArrowUp,ArrowDown,GripVertical} from 'lucide-react';
import {createPortal} from 'react-dom';
import {readMenuImages,IMAGE_LIMITS} from './image-import.mjs';
import {imageBudget,decimalMB} from './operating-ui.mjs';
import {moveImage} from './ocr-navigation.mjs';
import SourceFilename,{FilenameText} from './SourceFilename.jsx';

export default function ImageInput({images,activeImage,disabled,onImages,onChoose,onRemove,onBusy,onMessage,onReorder,onLabel,onReplace,reorderBlocked='',sourceSlot=null,sourceDetailsSlot=null}){
  const input=useRef(null),append=useRef(false),replacement=useRef(null),replacementIndex=useRef(null),ingesting=useRef(false);
  const [fileStates,setFileStates]=useState([]);
  const [selection,setSelection]=useState({entry:null,index:0});
  const exact=images.indexOf(selection.entry),candidate=exact>=0?exact:Math.min(selection.index,images.length-1);
  const selectedIndex=Math.max(0,images[candidate]?.dataUrl===activeImage?candidate:images.findIndex(entry=>entry.dataUrl===activeImage));
  useLayoutEffect(()=>{const entry=images[selectedIndex]||null;setSelection(current=>current.entry===entry&&current.index===selectedIndex?current:{entry,index:selectedIndex});},[images,activeImage,selectedIndex]);
  const generation=useRef(0);
  useEffect(()=>()=>{generation.current++;},[]);
  const list=useRef(null),drag=useRef(null),[dropTarget,setDropTarget]=useState(null);
  const limitsId=useId();
  const orderId=useId(),canOrder=Boolean(onReorder)&&!disabled&&!reorderBlocked;
  const budget=useMemo(()=>imageBudget(images),[images]);
  function reorder(from,to){
    if(!canOrder)return;const next=moveImage(images,from,to);if(next===images)return;
    onReorder(next);onMessage(`Đã chuyển ảnh ${from+1} tới vị trí ${to+1}. Chưa chạy OCR.`,'info');
    requestAnimationFrame(()=>list.current?.querySelector(`[data-source-index="${to}"] [data-image-choice]`)?.focus({preventScroll:true}));
  }
  async function ingest(files,add,replaceIndex=null){
    if(disabled||ingesting.current||!files.length)return;
    ingesting.current=true;const current=++generation.current;
    const update=(index,state,message='')=>{if(current===generation.current)setFileStates(values=>values.map((value,i)=>i===index?{...value,state,message}:value));};
    setFileStates(files.map(file=>({name:String(file.name||'Ảnh dán').slice(0,500),state:'queued'})));
    onBusy(true);
    try{
      if(replaceIndex!==null&&files.length!==1)throw Error('Chỉ chọn một ảnh để thay.');
      const existing=replaceIndex!==null?images.filter((_entry,index)=>index!==replaceIndex):add?images:[];
      const result=await readMenuImages(files,existing,update);
      if(current!==generation.current)return;
      if(replaceIndex!==null)onReplace(replaceIndex,result[result.length-1]);else onImages(result,add);
      setFileStates(values=>values.map(value=>({...value,state:'added',message:''})));
      onMessage(replaceIndex!==null?'Đã thay riêng ảnh. Nháp được giữ, chưa chạy OCR.':'Đã nhận ảnh. Chỉ bấm Đọc thực đơn khi bạn muốn chạy OCR.','info');
    }catch(error){if(current===generation.current)onMessage(error.message);}
    finally{ingesting.current=false;if(current===generation.current)onBusy(false);}
  }
  useEffect(()=>{
    const paste=event=>{
      if(disabled||document.querySelector('dialog:modal')||event.target.closest?.('input,textarea,[contenteditable="true"]'))return;
      const files=Array.from(event.clipboardData?.items||[]).filter(item=>item.kind==='file'&&item.type.startsWith('image/')).map(item=>item.getAsFile()).filter(Boolean);
      if(files.length){event.preventDefault();void ingest(files,true);}
    };
    document.addEventListener('paste',paste);return()=>document.removeEventListener('paste',paste);
  },[images,disabled]);
  function currentSource(){const i=selectedIndex,entry=images[i];if(!entry)return null;return <section className="image-source-details" role="region" aria-label="Ảnh nguồn đang chọn"><h4>Ảnh {i+1} đang xem</h4>
      {Array.from(entry.name).length>48&&<SourceFilename name={entry.name}/>}
      {onLabel&&<label className="image-secondary-label">Nhãn phụ (không bắt buộc)<input type="text" enterKeyHint="done" aria-label={`Nhãn phụ ảnh ${i+1}`} value={entry.label||''} maxLength={100} disabled={disabled} placeholder="Ví dụ: Phần đầu tuần" onChange={event=>onLabel(i,event.target.value)}/></label>}
      {images.length>1&&<div className="image-order-actions">
        <button type="button" className="secondary" aria-label={`Di chuyển ảnh ${i+1} lên`} aria-describedby={orderId} disabled={!canOrder||i===0} onClick={()=>reorder(i,i-1)}><ArrowUp size={16} aria-hidden="true"/>Lên</button><button type="button" className="secondary" aria-label={`Di chuyển ảnh ${i+1} xuống`} aria-describedby={orderId} disabled={!canOrder||i===images.length-1} onClick={()=>reorder(i,i+1)}><ArrowDown size={16} aria-hidden="true"/>Xuống</button></div>}
      {onReplace&&<button type="button" className="secondary" aria-label={`Thay ảnh ${i+1}`} disabled={disabled} onClick={()=>{replacementIndex.current=i;replacement.current.click();}}>Thay ảnh</button>}
      <button type="button" className="secondary" aria-label={`Bỏ ảnh ${i+1}`} disabled={disabled} onClick={()=>void onRemove(i)}>Bỏ ảnh</button>

  </section>;}
  const sources=images.length?<div className="image-filmstrip"><div role="group" aria-label="Bộ ảnh thực đơn">
    <div className="image-source-list" ref={list}>{images.map((entry,i)=><div className="image-source" key={i} data-source-index={i} data-drop-target={dropTarget===i}
      onDragOver={event=>{if(!canOrder||drag.current?.images!==images)return;event.preventDefault();event.dataTransfer.dropEffect='move';setDropTarget(i);}}
      onDragLeave={event=>{if(!(event.relatedTarget instanceof Node)||!event.currentTarget.contains(event.relatedTarget))setDropTarget(null);}}
      onDrop={event=>{if(!drag.current)return;event.preventDefault();event.stopPropagation();const current=drag.current;drag.current=null;setDropTarget(null);if(current.images===images&&event.dataTransfer.getData('application/x-mealform-image-index')===String(current.from))reorder(current.from,i);}}>
      <button type="button" data-image-choice className="secondary" aria-label={`Ảnh ${i+1}: ${entry.name}`} aria-pressed={selectedIndex===i} disabled={disabled} onClick={()=>{setSelection({entry,index:i});onChoose(entry);}}><img src={entry.dataUrl} alt="" draggable="false" width={80} height={70}/><span>Ảnh {i+1}: <FilenameText name={entry.name}/></span></button>{images.length>1&&selectedIndex===i&&<button type="button" className="secondary image-drag-handle" aria-label={`Kéo để đổi vị trí ảnh ${i+1}`} aria-describedby={orderId} disabled={!canOrder} draggable={canOrder}
        onDragStart={event=>{if(!canOrder){event.preventDefault();return;}drag.current={images,from:i};event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('application/x-mealform-image-index',String(i));}}
        onDragEnd={()=>{drag.current=null;setDropTarget(null);}} onKeyDown={event=>{if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();reorder(i,i+(event.key==='ArrowUp'?-1:1));}}}><GripVertical size={18} aria-hidden="true"/></button>}</div>)}</div>
</div>
    {images.length>1&&<p id={orderId} className="image-order-hint">{reorderBlocked||'Sắp xếp trước OCR: kéo tay nắm hoặc dùng nút Lên/Xuống. Không đổi ảnh đang xem.'}</p>}
{!sourceDetailsSlot&&currentSource()}</div>:null;
  return <div className="image-dropzone" role="region" aria-label="Dán hoặc thả ảnh thực đơn" onDragOver={event=>{if(Array.from(event.dataTransfer.types).includes('Files'))event.preventDefault();}} onDrop={event=>{if(event.dataTransfer.files.length){event.preventDefault();void ingest(Array.from(event.dataTransfer.files),true);}}}>
    <label className="dashboard-file image-file-input">Ảnh thực đơn (PNG, JPEG, WEBP; tối đa 5 ảnh, tổng 2,8 MB)
      <input ref={input} type="file" hidden multiple accept="image/png,image/jpeg,image/webp" disabled={disabled} onChange={event=>{const files=Array.from(event.target.files||[]),add=append.current;append.current=false;event.target.value='';void ingest(files,add);}} />
    </label>
    <input ref={replacement} type="file" hidden accept="image/png,image/jpeg,image/webp" disabled={disabled} aria-label="Tệp thay ảnh thực đơn" onChange={event=>{const files=Array.from(event.target.files||[]),index=replacementIndex.current;replacementIndex.current=null;event.target.value='';if(index!==null)void ingest(files,false,index);}}/>
    <button type="button" className="secondary image-upload-target" aria-label={images.length?'Chọn lại bộ ảnh thực đơn':'Chọn ảnh thực đơn'} aria-describedby={limitsId} disabled={disabled} onClick={()=>{append.current=false;input.current.click();}}>
      <span className="image-upload-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m-4 4 4-4 4 4M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg></span>
      <strong>{images.length?'Chọn lại ảnh':'Chọn ảnh thực đơn'}</strong>
      <span className="image-upload-help">Kéo thả hoặc <span className="image-upload-browse">Duyệt ảnh</span></span>
      <small id={limitsId} className="image-upload-limits">PNG, JPEG, WEBP · tối đa 5 ảnh · tổng 2,8 MB</small>
    </button>
    <div className="image-budget"><p role="status" aria-label="Dung lượng bộ ảnh">{budget?`${budget.count}/${IMAGE_LIMITS.count} ảnh · ${decimalMB(budget.bytes)}/${decimalMB(IMAGE_LIMITS.bytes)} MB`:'Chưa đọc được dung lượng bộ ảnh.'}</p>{budget&&<><progress max={IMAGE_LIMITS.bytes} value={budget.bytes} aria-label="Dung lượng ảnh đã dùng"/><small>{budget.remainingSlots&&budget.remainingBytes?`Còn ${budget.remainingSlots} ảnh · ${decimalMB(budget.remainingBytes)} MB`:'Đã đạt hạn mức. Bỏ bớt ảnh hoặc chọn lại bộ ảnh để thay thế.'}</small></>}</div>
    <div className="image-upload-footer"><small>Ctrl/⌘ V để dán ảnh. Chọn lại sẽ thay bộ ảnh; kéo thả hoặc Thêm ảnh giữ ảnh hiện có.</small>{images.length>0&&<button type="button" className="secondary" disabled={disabled||!budget||!budget.remainingSlots||!budget.remainingBytes} onClick={()=>{append.current=true;input.current.click();}}>Thêm ảnh</button>}</div>

    {fileStates.length>0&&<section className="image-file-states" role="region" aria-label="Trạng thái từng tệp ảnh"><ul aria-live="polite" aria-atomic="true">{fileStates.map((entry,index)=><li key={index} data-state={entry.state}><FilenameText name={entry.name}/><span>{({queued:'Chưa kiểm tra',checking:'Đang kiểm tra',validated:'Đã kiểm tra · chưa thêm',added:'Đã thêm',error:'Lỗi'})[entry.state]}</span>{entry.message&&<small>{entry.message}</small>}</li>)}</ul><small>Chỉ thêm bộ ảnh khi tất cả tệp hợp lệ. Đây là kiểm tra tệp trên thiết bị, không phải tiến trình OCR.</small></section>}
    {sourceSlot?createPortal(sources,sourceSlot):sources}{sourceDetailsSlot&&createPortal(currentSource(),sourceDetailsSlot)}
  </div>;
}
