import {useEffect,useRef,useState} from 'react';
import {menuChanges} from './draft-tools.mjs';
import {inspectMenu} from './dashboard-model.mjs';
import useVisualViewport from './useVisualViewport.js';

export default function DraftInspection({menu,original,onJump,disabled}){
  const changes=menuChanges(original,menu),[preview,setPreview]=useState(false),[choices,setChoices]=useState({}),[result,setResult]=useState(false);
  useEffect(()=>{setChoices({});setResult(false);},[menu]);
  return <section className="draft-inspection">
    {changes?<details><summary>Bạn đã sửa {changes.length} ô</summary><div role="region" aria-label="Thay đổi trong nháp"><p>So với bản nguồn ban đầu của nháp. Hoàn tác thay đổi cả danh sách này.</p>{changes.length?<ul>{changes.map(change=><li key={change.id}><button type="button" className="secondary" disabled={disabled} onClick={()=>onJump(change.id)}>{change.label} — Xem ô</button><dl><div><dt>Trước</dt><dd>{change.before||'Trống'}</dd></div><div><dt>Sau</dt><dd>{change.after||'Trống'}</dd></div></dl></li>)}</ul>:<p>Chưa có ô nào khác bản nguồn.</p>}</div></details>:<p>Nháp này chưa có mốc so sánh gốc. Không tự coi bản đang sửa là bản OCR ban đầu.</p>}
    <button type="button" className="secondary" disabled={disabled} onClick={()=>setPreview(true)}>Xem thử Form</button>
    {preview&&<Simulation menu={menu} choices={choices} onChoice={(index,value)=>{setChoices(current=>({...current,[index]:value}));setResult(false);}} result={result} onResult={()=>setResult(true)} onClose={()=>setPreview(false)} onEdit={index=>{setPreview(false);requestAnimationFrame(()=>onJump('ocr-date-'+index));}}/>}
  </section>;
}

function Simulation({menu,choices,onChoice,result,onResult,onClose,onEdit}){
  const dialog=useRef(null);useVisualViewport(dialog);
  useEffect(()=>{const previous=document.activeElement,node=dialog.current;node.showModal();return()=>{node.close();if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
  const issues=inspectMenu(menu,true),serving=menu.days.filter(day=>!day.closed).length,chosen=menu.days.filter((day,index)=>!day.closed&&choices[index]).length;
  return <dialog ref={dialog} className="draft-simulator meal-ui" aria-labelledby="draft-simulation-title" onCancel={onClose}>
    <header><h2 id="draft-simulation-title">Form mô phỏng</h2><button type="button" className="secondary" aria-label="Đóng mô phỏng" onClick={onClose}>Đóng</button></header>
    <p>Không gửi lượt thật. Không tạo Form/Sheet. Lựa chọn thử chỉ giữ trong lần mở nháp này.</p><h3>{menu.title||'Thực đơn bán trú'}</h3>
    {!issues.canCreate&&<p className="dashboard-warning">Nháp còn lỗi; bản mô phỏng không xác nhận đủ điều kiện tạo Form. Hãy quay lại sửa ngày và món.</p>}
    <form onSubmit={event=>{event.preventDefault();onResult();}}>
      {menu.days.map((day,index)=><fieldset key={index}><legend>{day.day} · {day.date}</legend>{day.closed?<p>Không phục vụ — không có câu hỏi chọn món.</p>:<label>Chọn món<select aria-label={`${day.day} · ${day.date}`} value={choices[index]||''} onChange={event=>onChoice(index,event.target.value)}><option value="">Chưa chọn</option>{[...new Set(day.meals.map(meal=>meal.trim()).filter(Boolean))].map(meal=><option key={meal}>{meal}</option>)}</select></label>}<button type="button" className="secondary" onClick={()=>onEdit(index)}>Sửa {day.day}</button></fieldset>)}
      <button type="submit">Xem lựa chọn thử</button>
    </form>
    {result&&<section role="region" aria-label="Kết quả mô phỏng"><h3>Đã chọn thử {chosen}/{serving} ngày phục vụ</h3><ul>{menu.days.map((day,index)=><li key={index}>{day.day} · {day.date}: {day.closed?'Không phục vụ':choices[index]||'Chưa chọn'}</li>)}</ul><p>Đây không phải lượt đăng ký và không xuất hiện trong Google Form/Sheet.</p></section>}
  </dialog>;
}
