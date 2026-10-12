import {useEffect,useRef} from 'react';
import {readMenuImages} from './image-import.mjs';

export default function ImageInput({images,activeImage,disabled,onImages,onChoose,onRemove,onBusy,onMessage}){
  const input=useRef(null),append=useRef(false);
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
  return <div className="image-dropzone" role="region" aria-label="Dán hoặc thả ảnh thực đơn" tabIndex={0} onDragOver={event=>{if(Array.from(event.dataTransfer.types).includes('Files'))event.preventDefault();}} onDrop={event=>{if(event.dataTransfer.files.length){event.preventDefault();void ingest(Array.from(event.dataTransfer.files),true);}}}>
    <label className="dashboard-file">Ảnh thực đơn (PNG, JPEG, WEBP; tối đa 5 ảnh, tổng 2,8 MB)
      <input ref={input} type="file" multiple accept="image/png,image/jpeg,image/webp" disabled={disabled} onChange={event=>{const files=Array.from(event.target.files||[]),add=append.current;append.current=false;event.target.value='';void ingest(files,add);}} />
    </label>
    <p>Dán Ctrl/⌘ V hoặc thả ảnh vào khung để thêm. Nút chọn file thay bộ ảnh; nút Thêm ảnh giữ các ảnh hiện có.</p>
    <button type="button" className="secondary" disabled={disabled||images.length>=5} onClick={()=>{append.current=true;input.current.click();}}>Thêm ảnh</button>
    <div className="image-source-list">{images.map((entry,i)=><div className="image-source" key={i}><button type="button" className="secondary" aria-pressed={activeImage===entry.dataUrl} disabled={disabled} onClick={()=>onChoose(entry)}><img src={entry.dataUrl} alt=""/><span>Ảnh {i+1}: {entry.name}</span></button><button type="button" className="secondary" aria-label={`Bỏ ảnh ${i+1}`} disabled={disabled} onClick={()=>void onRemove(i)}>Bỏ ảnh</button></div>)}</div>
  </div>;
}
