import {useState} from 'react';
import {compactDayLabel} from './ui-clarity.mjs';

export default function DayLabel({label}) {
  const [expanded,setExpanded]=useState(false),short=compactDayLabel(label);
  if(short===label)return label;
  return <span className="day-label"><span className="day-label-desktop">{label}</span><button type="button" className="day-label-toggle" aria-label={`${label} · ${expanded?'Rút gọn ngày':'Xem ngày đầy đủ'}`} aria-expanded={expanded} title={label} onClick={()=>setExpanded(value=>!value)}>{expanded?label:short}</button></span>;
}
