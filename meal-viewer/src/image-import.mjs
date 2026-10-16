import {foldSearchText} from './viewer-model.mjs';
export const IMAGE_LIMITS={count:5,bytes:2800000};
export function imageDataBytes(url){
  const match=typeof url==='string'&&url.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  if(!match||match[2].length%4)throw new Error('Định dạng ảnh không hợp lệ.');
  return match[2].length*3/4-(match[2].endsWith('==')?2:match[2].endsWith('=')?1:0);
}
export function validateImageFiles(files,existing=[]){
  if(!files.length)return;
  if(existing.length+files.length>IMAGE_LIMITS.count)throw new Error('Chỉ nhận tối đa 5 ảnh.');
  let total=existing.reduce((sum,image)=>sum+imageDataBytes(image.dataUrl),0);
  for(const file of files){if(!['image/png','image/jpeg','image/webp'].includes(file.type)||!Number.isSafeInteger(file.size)||file.size<=0)throw new Error('Chỉ nhận ảnh PNG, JPEG hoặc WEBP không rỗng.');total+=file.size;}
  if(total>IMAGE_LIMITS.bytes)throw new Error('Tổng ảnh vượt 2,8 MB. Hãy nén hoặc cắt ảnh trước khi thêm.');
}
export async function readMenuImages(files,existing=[]){
  validateImageFiles(files,existing);
  const result=[];
  for(const file of files){
    const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Không đọc được ảnh.'));reader.readAsDataURL(file);});
    imageDataBytes(dataUrl);
    const image=new Image();image.src=dataUrl;
    try{await image.decode();if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>40000000)throw Error();}catch{throw new Error('Ảnh bị lỗi hoặc kích thước quá lớn; nháp cũ được giữ.');}
    result.push({dataUrl,name:String(file.name||'Ảnh dán').slice(0,500)});
  }
  return[...existing,...result];
}
export function buildImageMerge(fragments,base){
  if(!Array.isArray(fragments)||!fragments.length||fragments.length>5)throw new Error('Kết quả ghép ảnh không hợp lệ.');
  const days=Array.from({length:5},(_,i)=>({day:`Thứ ${i+2}`,date:[],meals:[[],[],[]],closed:[],present:false}));let duplicates=0;
  const add=(options,value,source)=>{
    if(value===''||value===undefined)return;
    const previous=options.find(option=>option.value===value);
    if(previous){duplicates++;if(!previous.sources.includes(source))previous.sources.push(source);}else options.push({value,sources:[source]});
  };
  const ingest=(input,source)=>{
    if(!Array.isArray(input)||input.length>5)throw new Error('Ngày OCR không hợp lệ.');
    for(const entry of input){
      const match=foldSearchText(entry?.day).match(/^thu\s*([2-6])\b/);
      if(!match||typeof entry.date!=='string'||entry.date.length>40||!Array.isArray(entry.meals)||entry.meals.length>3||entry.meals.some(v=>typeof v!=='string'||v.length>500)||(entry.closed!==undefined&&typeof entry.closed!=='boolean'))throw new Error('Ngày/món trong ảnh không hợp lệ; hãy đọc lại hoặc sửa riêng.');
      const day=days[Number(match[1])-2];day.present ||= Boolean(entry.date.trim()||entry.meals.some(v=>v.trim())||entry.closed===true);
      add(day.date,entry.date.trim(),source);entry.meals.forEach((value,i)=>add(day.meals[i],value.trim(),source));add(day.closed,entry.closed,source);
    }
  };
  if(base?.days)ingest(base.days,-1);
  for(const fragment of fragments){if(!Number.isInteger(fragment.imageIndex)||fragment.imageIndex<0||fragment.imageIndex>4)throw new Error('Nguồn ảnh không hợp lệ.');ingest(fragment.days,fragment.imageIndex);}
  return{title:base?.title||fragments.find(fragment=>typeof fragment.title==='string'&&fragment.title.trim())?.title||'Thực đơn bán trú',days,duplicates,missingDays:days.filter(day=>!day.present).map(day=>day.day)};
}
