import {ocrStage} from './ui-model.mjs';

export default function OcrProgress({menu,state}) {
  const step=ocrStage(menu,state);
  return <ol className="ocr-progress" aria-label="Tiến trình tạo tuần">{['Ảnh thực đơn','Rà soát ngày & món','Tạo Form và Sheet'].map((label,index)=><li key={label} aria-current={index===step?'step':undefined} data-complete={index<step||state==='done'}><span aria-hidden="true">{index+1}</span><div>{label}{index===2&&state==='done'&&<small>Hoàn tất</small>}</div></li>)}</ol>;
}
