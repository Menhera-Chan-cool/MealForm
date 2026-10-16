import {useId} from 'react';
import SearchInput from './SearchInput.jsx';
export default function OcrFindBar({query,onQuery,matches,index,disabled,onMove}){
  const id=useId();
  return <section className="ocr-find-bar" role="search" aria-label="Tìm trong bản OCR"><label htmlFor={id}>Tìm trong bản OCR</label>
    <SearchInput id={id} label="Tìm trong bản OCR" value={query} maxLength={200} disabled={disabled} onClear={()=>onQuery('')} onChange={event=>onQuery(event.target.value)} placeholder="Tên món, ngày hoặc tiêu đề…" onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();if(!disabled&&matches.length)onMove(event.shiftKey?-1:1);}}}/>
    <div className="ocr-find-actions"><button type="button" className="secondary" disabled={disabled||!matches.length} onClick={()=>onMove(-1)}>Kết quả trước</button><button type="button" className="secondary" disabled={disabled||!matches.length} onClick={()=>onMove(1)}>Kết quả sau</button></div>
    <p role="status" aria-label="Kết quả tìm OCR" aria-live="polite">{query.trim()?`${matches.length} ô khớp${index>=0?` · ${index+1}/${matches.length}: ${matches[index].label}`:''}`:'Nhập từ khóa để tìm trong tiêu đề, ngày và tên món.'}</p>
    <small>Enter: kết quả sau · Shift+Enter: trước. Chỉ tìm và đánh dấu, không thay nội dung.</small>
  </section>;
}
