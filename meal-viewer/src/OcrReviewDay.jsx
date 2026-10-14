import {useEffect,useId,useState} from 'react';
export default function OcrReviewDay({day,issue,allowMissing,busy,status,legend,children}) {
  const stamp=JSON.stringify([day.day,day.date,day.meals,day.closed===true]);
  const canReview=!issue.dateError&&!issue.mealError&&(!issue.missingMealSlots.length||allowMissing);
  const [reviewedStamp,setReviewedStamp]=useState(null),id=useId();
  const reviewed=canReview&&reviewedStamp===stamp;
  useEffect(()=>{setReviewedStamp(previous=>canReview&&previous===stamp?previous:null);},[stamp,canReview]);
  return <fieldset className="menu-day" data-status={status} disabled={busy}><legend>{legend}</legend><div className="ocr-review-toolbar"><label><input type="checkbox" checked={reviewed} disabled={busy||!canReview} aria-controls={id} onChange={event=>setReviewedStamp(event.target.checked?stamp:null)}/>Đã rà soát {day.day}</label>{reviewed?<button type="button" className="secondary" onClick={()=>setReviewedStamp(null)}>Mở lại {day.day}</button>:!canReview&&<small>Cần sửa hoặc xác nhận mục còn thiếu trước khi thu gọn.</small>}</div><div id={id} className="ocr-day-fields" hidden={reviewed} inert={reviewed}>{children}</div></fieldset>;
}
