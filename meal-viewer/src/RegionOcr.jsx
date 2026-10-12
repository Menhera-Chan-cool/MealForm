import { useEffect, useRef, useState } from 'react';
import { cropPixelRect, applyRegionResult } from './dashboard-model.mjs';

export default function RegionOcr({ image, menu, request, onApply, onClose, onBusy }) {
  const dialog = useRef(null), picture = useRef(null), drag = useRef(null), controller = useRef(null);
  const [target, setTarget] = useState({mode:'day',dayIndex:0});
  const [rect, setRect] = useState({x:10,y:10,width:50,height:40});
  const [proposal, setProposal] = useState(null), [busy,setBusy] = useState(false), [error,setError] = useState('');
  useEffect(() => {
    const previous=document.activeElement, node=dialog.current; node.showModal();
    return () => { controller.current?.abort(); onBusy(false); node.close(); previous?.focus?.({preventScroll:true}); };
  }, []);
  const current = menu.days[target.dayIndex];
  function select(next) { setTarget(next); setProposal(null); setError(''); }
  function point(event) {
    const box=event.currentTarget.getBoundingClientRect();
    return {x:Math.max(0,Math.min(100,(event.clientX-box.left)/box.width*100)),y:Math.max(0,Math.min(100,(event.clientY-box.top)/box.height*100))};
  }
  async function readRegion() {
    setError('');setBusy(true);onBusy(true);controller.current=new AbortController();
    try {
      const img=picture.current;const area=cropPixelRect(rect,img.naturalWidth,img.naturalHeight);
      const scale=Math.min(1,1600/Math.max(area.width,area.height)),canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(area.width*scale));canvas.height=Math.max(1,Math.round(area.height*scale));
      canvas.getContext('2d').drawImage(img,area.x,area.y,area.width,area.height,0,0,canvas.width,canvas.height);
      const cropped=canvas.toDataURL('image/jpeg',.92);
      if(cropped.length>4000000)throw Error('Vùng ảnh quá lớn; hãy khoanh nhỏ hơn.');
      const result=await request('/api/dashboard',{method:'POST',signal:controller.current.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ocr-region',image:cropped,target})});
      applyRegionResult(menu,target,result);setProposal(result);
    } catch(error) { if(error.name!=='AbortError')setError(error.message); }
    finally {setBusy(false);onBusy(false);}
  }
  return <dialog ref={dialog} className="region-ocr-dialog" aria-labelledby="region-ocr-title" onCancel={event=>{if(busy)event.preventDefault();else onClose();}}>
    <div className="response-quick-header"><h2 id="region-ocr-title">Đọc lại vùng ảnh</h2><button type="button" className="secondary" disabled={busy} onClick={onClose}>Đóng</button></div>
    <p>Khoanh đúng vùng cần đọc. Chỉ vùng đã chọn được gửi OCR; chưa thay món cho tới khi bạn xác nhận.</p>
    <div className="region-targets"><label>Ngày cần sửa<select aria-label="Ngày cần sửa" value={target.dayIndex} disabled={busy} onChange={event=>select({...target,dayIndex:Number(event.target.value)})}>{menu.days.map((day,i)=><option key={i} value={i}>{day.day} · {day.date}</option>)}</select></label><label>Ô cần thay<select aria-label="Ô cần thay" value={target.mode==='day'?'day':`meal-${target.mealIndex}`} disabled={busy} onChange={event=>select({dayIndex:target.dayIndex,mode:event.target.value==='day'?'day':'meal',...(event.target.value==='day'?{}:{mealIndex:Number(event.target.value.split('-')[1])})})}><option value="day">Ngày và cả 3 món</option>{[0,1,2].map(i=><option value={`meal-${i}`} key={i}>Món {i+1}</option>)}</select></label></div>
    <div className="ocr-crop-stage" onPointerDown={event=>{if(busy)return;event.preventDefault();drag.current=point(event);event.currentTarget.setPointerCapture(event.pointerId);setProposal(null);}}
      onPointerMove={event=>{if(!drag.current||busy)return;const next=point(event),start=drag.current;setRect({x:Math.min(start.x,next.x),y:Math.min(start.y,next.y),width:Math.abs(next.x-start.x),height:Math.abs(next.y-start.y)});}}
      onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
      <img ref={picture} src={image} draggable="false" alt="Kéo để khoanh vùng thực đơn cần đọc lại" />
      <div className="ocr-crop-rect" aria-hidden="true" style={{left:`${rect.x}%`,top:`${rect.y}%`,width:`${rect.width}%`,height:`${rect.height}%`}} />
    </div>
    <fieldset className="crop-coordinates"><legend>Vùng chọn theo phần trăm ảnh — có thể sửa bằng bàn phím</legend>{[['x','Vị trí ngang'],['y','Vị trí dọc'],['width','Chiều rộng'],['height','Chiều cao']].map(([key,label])=><label key={key}>{label}<input type="number" min="0" max="100" step=".1" disabled={busy} value={Math.round(rect[key]*10)/10} onChange={event=>{setRect(value=>({...value,[key]:Number(event.target.value)}));setProposal(null);}} /></label>)}</fieldset>
    {error&&<p className="dashboard-warning" role="alert">{error}</p>}
    <button type="button" disabled={busy} onClick={()=>void readRegion()}>{busy?'Đang đọc vùng ảnh…':'Đọc vùng đã chọn'}</button>
    <small className="dashboard-hint">Mỗi lần đọc sử dụng thêm lượt API OCR.</small>
    {proposal&&<section className="region-preview"><h3>Đối chiếu trước khi thay</h3><div className="region-before"><strong>Hiện tại</strong><p>{target.mode==='meal'?current.meals[target.mealIndex]:`${current.date} · ${current.meals.join(' · ')}`}</p></div><div className="region-after"><strong>Kết quả mới — có thể sửa</strong>{target.mode==='meal'?<label>Món mới<input maxLength={500} value={proposal.text} onChange={event=>setProposal({text:event.target.value})} /></label>:<><label>Ngày mới<input maxLength={40} value={proposal.date} onChange={event=>setProposal(value=>({...value,date:event.target.value}))} /></label>{proposal.meals.map((meal,i)=><label key={i}>Món mới {i+1}<input maxLength={500} value={meal} onChange={event=>setProposal(value=>({...value,meals:value.meals.map((text,index)=>index===i?event.target.value:text)}))} /></label>)}</>}</div><button type="button" disabled={busy} onClick={()=>{try{onApply(target,proposal);}catch(error){setError(error.message);}}}>Áp dụng thay đổi</button><p className="dashboard-hint">Chỉ thay ô/ngày đang chọn trong nháp; Hoàn tác sẽ khôi phục cả lần thay.</p></section>}
  </dialog>;
}
