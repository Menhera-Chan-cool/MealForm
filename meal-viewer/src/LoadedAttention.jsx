export default function LoadedAttention({warnings={},weekName='',loaded=false,owner,onOpen}){
  const entries=Object.entries(warnings).filter(([id,item])=>['health','reconcile'].includes(id)&&item.count>0&&(id!=='health'||owner));
  return <section className="loaded-attention" role="region" aria-label="Cần xử lý"><h2>Cần xử lý</h2><p className="attention-week">{weekName||'Chưa chọn tuần'}</p>
    {entries.length?<><p>Chỉ gồm kết quả đã tải của tuần đang chọn; chưa tự kiểm tra lại.</p><ul>{entries.map(([id,item])=>{const label=id==='health'?'Hệ thống':'Đối soát';return <li key={id}><div><strong>{label} · {item.count} cần kiểm tra</strong>{item.details&&<p>{item.details}</p>}<small>{item.description}</small></div><button type="button" className="secondary" onClick={()=>onOpen(id)}>Mở {label}</button></li>;})}</ul></>:<p>{loaded?'Trong các kết quả đã tải chưa có mục cần xử lý. Chưa tự kiểm tra lại.':'Chưa có kết quả kiểm tra cho tuần đang chọn. Chưa kiểm tra không đồng nghĩa với không có lỗi.'}</p>}
  </section>;
}
