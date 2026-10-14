export default function ViewerTabs({value,onChange}) {
  const options=[['summary','Tổng hợp'],['detail','Chi tiết']];
  return <div className="viewer-tabs" role="tablist" aria-label="Xem thực đơn">{options.map(([key,label],index)=><button type="button" role="tab" key={key} id={`viewer-tab-${key}`} aria-controls={`viewer-${key}`} aria-selected={value===key} tabIndex={value===key?0:-1} className={value===key?'':'secondary'} onClick={()=>onChange(key)} onKeyDown={event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?1:(index+1)%2;
    onChange(options[next][0]);document.getElementById(`viewer-tab-${options[next][0]}`)?.focus();
  }}>{label}</button>)}</div>;
}
