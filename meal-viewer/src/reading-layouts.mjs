export function headerGroups(order,hidden,mealIndexes){
  const groups=[];
  for(const index of order.filter(index=>!hidden.includes(index))){
    const label=mealIndexes.includes(index)?'Thực đơn':'Thông tin lượt gửi';
    if(groups.at(-1)?.label===label)groups.at(-1).span++;else groups.push({label,span:1});
  }
  return groups;
}
export function attentionEvent(events,event){
  if(event.viewed&&(event.kind!=='ocr'||!Number.isFinite(event.at)))return events.map(item=>item.kind===event.kind&&item.scope===event.scope?{...item,viewed:true}:item);
  if(event.kind==='updates'&&events.some(item=>item.kind===event.kind&&item.scope===event.scope&&!item.viewed))return events;
  return [event,...events].slice(0,20);
}
