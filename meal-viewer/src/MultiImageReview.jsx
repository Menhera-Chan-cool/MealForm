import {useEffect,useMemo,useRef,useState} from 'react';
import {buildImageMerge} from './image-import.mjs';
import MenuImagePreview from './MenuImagePreview.jsx';

export default function MultiImageReview({fragments,images,base,onClose,onApply}){
  const model=useMemo(()=>buildImageMerge(fragments,base),[fragments,base]),dialog=useRef(null);
  const [source,setSource]=useState(0),[resolved,setResolved]=useState([]),[error,setError]=useState('');
  const [menu,setMenu]=useState(()=>({title:model.title,days:model.days.map(day=>({day:day.day,date:day.date.length===1?day.date[0].value:'',meals:day.meals.map(options=>options.length===1?options[0].value:''),closed:day.closed.length===1?day.closed[0].value:false}))}));
  const conflicts=model.days.flatMap((day,i)=>[...(day.date.length>1?[`${i}-date`]:[]),...day.meals.flatMap((options,j)=>options.length>1?[`${i}-meal-${j}`]:[]),...(day.closed.length>1?[`${i}-closed`]:[])]);
  const remaining=conflicts.filter(key=>!resolved.includes(key));
  useEffect(()=>{dialog.current.showModal();return()=>dialog.current?.close();},[]);
  function edit(i,field,value,j=-1){const key=field==='meals'?`${i}-meal-${j}`:`${i}-${field}`;setResolved(old=>old.includes(key)?old:[...old,key]);setMenu(old=>({...old,days:old.days.map((day,index)=>index===i?{...day,[field]:field==='meals'?day.meals.map((meal,k)=>k===j?value:meal):value}:day)}));}
  const sourceName=index=>index===-1?'Nháp đang sửa':`Ảnh ${index+1}: ${images[index]?.name||''}`;
  function candidates(options,i,field,j=-1){const key=field==='meals'?`${i}-meal-${j}`:`${i}-${field}`;return options.length?<div className="merge-candidates" role={options.length>1?'group':undefined} aria-label={options.length>1?`Chọn nguồn ${model.days[i].day} ${field==='meals'?`Món ${j+1}`:field==='date'?'ngày':'ngày nghỉ'}`:undefined}>{options.map((option,k)=><div key={k}>{options.length>1?<button type="button" className="secondary" onClick={()=>edit(i,field,option.value,j)}>{option.value===true?'Không phục vụ':option.value===false?'Phục vụ':option.value}</button>:<span>{option.value===true?'Không phục vụ':option.value===false?'Phục vụ':option.value}</span>}<small>{option.sources.map(sourceName).join(' · ')}</small></div>)}{options.length>1&&<strong>{resolved.includes(key)?'Đã chọn/sửa':'Xung đột — chọn một nguồn hoặc sửa ô bên dưới'}</strong>}</div>:null;}
  return <dialog ref={dialog} className="merge-dialog" aria-labelledby="merge-title" onCancel={event=>{if(event.target===event.currentTarget)onClose();}}>
    <div className="dashboard-section-title"><h2 id="merge-title">Rà soát ghép ảnh OCR</h2><button type="button" className="secondary" onClick={onClose}>Hủy ghép</button></div>
    <p>Nháp hiện tại chưa bị đổi. Có {model.duplicates} ô trùng nội dung; {remaining.length} xung đột chưa chọn. Chỉ áp dụng sau khi rà soát.</p>
    {model.missingDays.length>0&&<p className="dashboard-warning">Chưa đọc đủ dữ liệu: {model.missingDays.join(', ')}. Bổ sung trong bản xem trước hoặc nháp; không tự đoán ngày/món.</p>}
    <div className="merge-layout"><aside><label>Đối chiếu nguồn ảnh<select aria-label="Đối chiếu nguồn ảnh" value={source} onChange={event=>setSource(Number(event.target.value))}>{images.map((entry,i)=><option value={i} key={i}>Ảnh {i+1}: {entry.name}</option>)}</select></label><details className="merge-source-preview" open={!window.matchMedia('(max-width:700px)').matches}><summary>Xem ảnh nguồn / phóng to</summary><MenuImagePreview src={images[source]?.dataUrl} name={images[source]?.name}/></details></aside>
    <form onSubmit={event=>{event.preventDefault();if(remaining.length)return;try{onApply(menu);}catch(error){setError(error.message);}}}>
      <label>Tiêu đề bản ghép<input maxLength={500} value={menu.title} onChange={event=>setMenu({...menu,title:event.target.value})}/></label>
      {model.days.map((day,i)=><fieldset key={i} className="merge-day"><legend>{day.day}</legend>
        {candidates(day.date,i,'date')}<label>Ngày bản ghép<input aria-label={`Ngày bản ghép ${day.day}`} maxLength={40} value={menu.days[i].date} onChange={event=>edit(i,'date',event.target.value)}/></label>
        {candidates(day.closed,i,'closed')}<label><input type="checkbox" checked={menu.days[i].closed} onChange={event=>edit(i,'closed',event.target.checked)}/>Không phục vụ ngày này</label>
        {day.meals.map((options,j)=><div key={j}>{candidates(options,i,'meals',j)}<label>Món {j+1}<input aria-label={`Bản ghép ${day.day} Món ${j+1}`} maxLength={500} value={menu.days[i].meals[j]} onChange={event=>edit(i,'meals',event.target.value,j)}/></label></div>)}
      </fieldset>)}
      {error&&<p role="alert">{error}</p>}<button type="submit" disabled={remaining.length>0}>Áp dụng bản ghép vào nháp</button>
    </form></div>
  </dialog>;
}
