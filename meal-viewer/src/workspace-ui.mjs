import {weekMonths} from './ui-model.mjs';
export function identityDetailModel(model){
  const {headers=[],rows=[],timeIndex,nameIndex}=model;
  if(!Number.isInteger(timeIndex)||timeIndex<0||timeIndex===nameIndex||!Number.isInteger(nameIndex)||nameIndex<0||!headers[nameIndex]||!/^(timestamp|thời điểm(?: gửi)?|thời gian(?: gửi)?)$/iu.test(String(headers[timeIndex]||'').trim()))return model;
  const indexes=headers.map((_,index)=>index).filter(index=>index!==timeIndex);
  return {...model,headers:indexes.map(index=>headers[index]),rows:rows.map(row=>indexes.map(index=>row?.[index])),nameIndex:indexes.indexOf(nameIndex),timeIndex:-1,mealIndexes:(model.mealIndexes||[]).map(index=>indexes.indexOf(index)).filter(index=>index>=0),rowTimes:rows.map(row=>row?.[timeIndex])};
}
export function archiveHierarchy(weeks,month=''){
  const years=new Map();
  for(const week of weeks){
    const keys=weekMonths(week),months=month?keys.filter(key=>key===month):keys.length?keys:[''];
    for(const key of months){const year=key?key.slice(0,4):'unknown';if(!years.has(year))years.set(year,new Map());const groups=years.get(year);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(week);}
  }
  return [...years].map(([year,months])=>({year,months:[...months].sort(([a],[b])=>b.localeCompare(a)).map(([key,weeks])=>({key,weeks}))})).sort((a,b)=>a.year==='unknown'?1:b.year==='unknown'?-1:b.year.localeCompare(a.year));
}
export function comparisonPage(value){
  if(value?.version!==1||!Number.isSafeInteger(value.checkedAt)||value.checkedAt<=0||!Number.isSafeInteger(value.offset)||value.offset<0||value.offset>100000||value.offset%50||value.limit!==50||!Number.isSafeInteger(value.total)||value.total<0||!Array.isArray(value.dayLabels)||value.dayLabels.length>5||value.dayLabels.some(label=>typeof label!=='string'||label.length>500)||!Array.isArray(value.pairs)||value.pairs.length!==Math.min(50,Math.max(0,value.total-value.offset)))return null;
  const next=value.offset+value.pairs.length<value.total?value.offset+value.pairs.length:null;
  if(value.nextOffset!==next)return null;
  const source=record=>record&&typeof record.name==='string'&&record.name.length<=500&&Number.isSafeInteger(record.timestamp)&&record.timestamp>=0&&record.timestamp<=8640000000000000&&typeof record.truncated==='boolean'&&Array.isArray(record.meals)&&record.meals.length===value.dayLabels.length&&record.meals.every(meal=>typeof meal==='string'&&meal.length<=500);
  if(value.pairs.some(pair=>!source(pair?.form)||!source(pair?.sheet)||!Number.isSafeInteger(pair.sheet.rowNumber)||pair.sheet.rowNumber<2))return null;
  return value;
}
