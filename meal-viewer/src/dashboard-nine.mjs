import {foldSearchText} from './viewer-model.mjs';
export function permissionChanges(saved,draft){
  return [['create','OCR / tạo tuần'],['manageResponses','Xóa / khôi phục']].flatMap(([key,label])=>saved?.[key]===draft?.[key]?[]:[`Sắp ${draft?.[key]===true?'thêm':'gỡ'} ${label}`]);
}
export function sendTimeRange(filters={},now=Date.now()){
  if(filters.sentPreset==='today'||filters.sentPreset==='yesterday'){
    const day=new Date(now+7*3600000-(filters.sentPreset==='yesterday'?86400000:0)).toISOString().slice(0,10);
    const start=Date.parse(day+'T00:00:00+07:00');return {start,end:start+86400000};
  }
  if(filters.sentPreset!=='custom')return {start:-Infinity,end:Infinity};
  const parse=value=>{
    if(!value)return null;
    if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))return NaN;
    const stamp=Date.parse(value+':00+07:00');
    return Number.isFinite(stamp)&&new Date(stamp+7*3600000).toISOString().slice(0,16)===value?stamp:NaN;
  };
  const from=parse(filters.sentFrom),to=parse(filters.sentTo);
  if(Number.isNaN(from)||Number.isNaN(to))return {error:'Thời điểm gửi không hợp lệ.'};
  if(from!==null&&to!==null&&from>to)return {error:'Thời điểm bắt đầu phải trước hoặc bằng thời điểm kết thúc.'};
  return {start:from??-Infinity,end:to===null?Infinity:to+60000};
}
export function filterSubmissions(rows,query,filters={},now=Date.now()){
  const range=sendTimeRange(filters,now),wanted=foldSearchText(query).replace(/\s+/g,' ').trim();
  if(range.error)return [];
  return (rows||[]).filter(row=>{
    const name=foldSearchText(row.name).replace(/\s+/g,' ').trim();
    if(wanted&&!(filters.nameMatch==='exact'?name===wanted:name.includes(wanted)))return false;
    if(range.start===-Infinity&&range.end===Infinity)return true;
    return typeof row.timestamp==='number'&&Number.isFinite(row.timestamp)&&row.timestamp>=range.start&&row.timestamp<range.end;
  });
}
export function clearDeviceStorage(kind,account,storage=globalThis.localStorage){
  if(!['cache','layout'].includes(kind)||kind==='cache'&&!account)throw Error('Chưa xác định dữ liệu cần xóa.');
  const prefix=kind==='cache'?'meal-dashboard-cache-v1:'+encodeURIComponent(account)+':':'meal-table-layout-v1:';
  const keys=Array.from({length:storage.length},(_,index)=>storage.key(index)).filter(key=>key?.startsWith(prefix)&&(kind!=='cache'||!key.endsWith(':view')&&!key.endsWith(':last')));
  for(const key of keys)storage.removeItem(key);
  return keys.length;
}
export function connectionNodes(report,busy=false){
  const checks=report?.checks||[],check=id=>{const matches=checks.filter(item=>item.id===id);return matches.length===1?matches[0]:null;};
  const describe=id=>busy?'Đang kiểm tra':({ok:id==='ocr'?'Cấu hình ổn':'Kiểm tra ổn',warning:'Cần chú ý',error:'Lỗi'})[check(id)?.status]||'Chưa kiểm tra';
  const bridge=check('network')||check('bridge');
  return [{id:'web',label:'Web',status:'Trang đang mở'},{id:'script',label:'Apps Script',status:busy?'Đang kiểm tra':bridge?.status==='error'?'Lỗi kết nối':check('signatures')?'Đã nhận kiểm tra':'Chưa kiểm tra'},...['form','sheet','ocr'].map(id=>({id,label:({form:'Google Form',sheet:'Google Sheet',ocr:'Cấu hình OCR'})[id],status:describe(id)}))];
}
