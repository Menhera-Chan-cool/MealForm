import {foldSearchText} from './viewer-model.mjs';
export function moveImage(images,from,to){
  if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=images.length||to>=images.length||from===to)return images;
  const next=images.slice();next.splice(to,0,next.splice(from,1)[0]);return next;
}
export function findOcrFields(menu,query){
  const needle=foldSearchText(query).trim();if(!menu||!needle)return [];
  const fields=[{id:'ocr-title',label:'Tiêu đề tuần',text:menu.title||''}];
  (menu.days||[]).forEach((day,i)=>{const label=day.day||`Ngày ${i+1}`;fields.push({id:`ocr-date-${i}`,label:`${label} · Ngày`,text:day.date||''});if(day.closed!==true)(day.meals||[]).slice(0,3).forEach((meal,j)=>fields.push({id:`ocr-meal-${i}-${j}`,label:`${label} · Món ${j+1}`,text:meal||''}));});
  return fields.filter(field=>foldSearchText(field.text).includes(needle));
}
