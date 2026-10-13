import {useEffect,useId,useRef} from 'react';
import {readMenuImages} from './image-import.mjs';

export default function ImageInput({images,activeImage,disabled,onImages,onChoose,onRemove,onBusy,onMessage}){
  const input=useRef(null),append=useRef(false);
  const limitsId=useId();
  async function ingest(files,add){
    if(disabled||!files.length)return;
    onBusy(true);
    try{const result=await readMenuImages(files,add?images:[]);onImages(result,add);onMessage('Đã nhận ảnh. Chỉ bấm Đọc thực đơn khi bạn muốn chạy OCR.','info');}
    catch(error){onMessage(error.message);}
    finally{onBusy(false);}
  }
  useEffect(()=>{
    const paste=event=>{
      if(disabled||document.querySelector('dialog[open]')||event.target.closest?.('input,textarea,[contenteditable="true"]'))return;
      const files=Array.from(event.clipboardData?.items||[]).filter(item=>item.kind==='file'&&item.type.startsWith('image/')).map(item=>item.getAsFile()).filter(Boolean);
      if(files.length){event.preventDefault();void ingest(files,true);}
    };
    document.addEventListener('paste',paste);return()=>document.removeEventListener('paste',paste);
  },[images,disabled]);
  return <div className="image-dropzone" role="region" aria-label="Dán hoặc thả ảnh thực đơn" onDragOver={event=>{if(Array.from(event.dataTransfer.types).includes('Files'))event.preventDefault();}} onDrop={event=>{if(event.dataTransfer.files.length){event.preventDefault();void ingest(Array.from(event.dataTransfer.files),true);}}}>
    <label className="dashboard-file image-file-input">Ảnh thực đơn (PNG, JPEG, WEBP; tối đa 5 ảnh, tổng 2,8 MB)
      <input ref={input} type="file" hidden multiple accept="image/png,image/jpeg,image/webp" disabled={disabled} onChange={event=>{const files=Array.from(event.target.files||[]),add=append.current;append.current=false;event.target.value='';void ingest(files,add);}} />
    </label>
    <button type="button" className="secondary image-upload-target" aria-label={images.length?'Chọn lại bộ ảnh thực đơn':'Chọn ảnh thực đơn'} aria-describedby={limitsId} disabled={disabled} onClick={()=>{append.current=false;input.current.click();}}>
      <span className="image-upload-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m-4 4 4-4 4 4M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg></span>
      <strong>{images.length?'Chọn lại ảnh':'Chọn ảnh thực đơn'}</strong>
      <span className="image-upload-help">Kéo thả hoặc <span className="image-upload-browse">Duyệt ảnh</span></span>
      <small id={limitsId} className="image-upload-limits">PNG, JPEG, WEBP · tối đa 5 ảnh · tổng 2,8 MB</small>
    </button>
    <div className="image-upload-footer"><small>Ctrl/⌘ V để dán ảnh. Chọn lại sẽ thay bộ ảnh; kéo thả hoặc Thêm ảnh giữ ảnh hiện có.</small>{images.length>0&&<button type="button" className="secondary" disabled={disabled||images.length>=5} onClick={()=>{append.current=true;input.current.click();}}>Thêm ảnh</button>}</div>
    <div className="image-source-list">{images.map((entry,i)=><div className="image-source" key={i}><button type="button" className="secondary" aria-pressed={activeImage===entry.dataUrl} disabled={disabled} onClick={()=>onChoose(entry)}><img src={entry.dataUrl} alt=""/><span>Ảnh {i+1}: {entry.name}</span></button><button type="button" className="secondary" aria-label={`Bỏ ảnh ${i+1}`} disabled={disabled} onClick={()=>void onRemove(i)}>Bỏ ảnh</button></div>)}</div>
  </div>;
}
