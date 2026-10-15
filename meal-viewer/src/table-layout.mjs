import {displayHeader} from './ui-clarity.mjs';

export function tableLayoutSchema(headers,required=[]){
  const shape=JSON.stringify([headers.map(header=>displayHeader(header).replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,'{date}')),required]);
  let hash=2166136261;for(let index=0;index<shape.length;index++)hash=Math.imul(hash^shape.charCodeAt(index),16777619);
  return 's'+(hash>>>0).toString(36);
}
function records(raw){try{const value=JSON.parse(typeof raw==='string'&&raw.length<=65536?raw:'{}');return value?.version===1&&value.layouts&&typeof value.layouts==='object'&&!Array.isArray(value.layouts)?value.layouts:{};}catch{return {};}}
function clean(record,count,required){
  if(!Number.isInteger(count)||count<1||count>64||record?.count!==count)return {hidden:[],widths:null};
  return {hidden:Array.isArray(record.hidden)?[...new Set(record.hidden.filter(index=>Number.isInteger(index)&&index>=0&&index<count&&!required.includes(index)))]:[],widths:Array.isArray(record.widths)&&record.widths.length===count&&record.widths.every(width=>Number.isFinite(width)&&width>=44&&width<=4096)?record.widths.map(Math.round):null};
}
export function readTableLayout(raw,schema,count,required=[]){return clean(records(raw)[schema],count,required);}
export function updateTableLayouts(raw,schema,count,required,layout){
  const kept=Object.entries(records(raw)).filter(([key,value])=>key!==schema&&/^s[a-z0-9]{1,8}$/.test(key)&&Number.isInteger(value?.count)&&value.count>0&&value.count<=64).map(([key,value])=>[key,{count:value.count,...clean(value,value.count,[])}]);
  if(layout&&/^s[a-z0-9]{1,8}$/.test(schema)&&Number.isInteger(count)&&count>0&&count<=64)kept.push([schema,{count,...clean({count,hidden:layout.hidden,widths:layout.widths},count,required)}]);
  return JSON.stringify({version:1,layouts:Object.fromEntries(kept.slice(-8))});
}
