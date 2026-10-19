import {useState} from 'react';
import {SettingsSection} from './SettingsLayout.jsx';
import {clearDeviceStorage} from './dashboard-nine.mjs';
export default function DeviceData({account,disabled,onClearDraft,onClearCache}){
  const [working,setWorking]=useState(false),[message,setMessage]=useState('');
  async function clear(kind){
    if(disabled||working)return;
    const labels={draft:'nháp OCR',cache:'bản lưu Dashboard',layout:'bố cục bảng'};
    if(!window.confirm(`Xóa ${labels[kind]} trên trình duyệt này? ${kind==='layout'?'Áp dụng cho bố cục bảng của trình duyệt này.':'Chỉ dữ liệu của tài khoản đang dùng.'} Không xóa Form/Sheet hay cookie đăng nhập.`))return;
    setWorking(true);setMessage('');
    try{
      if(kind==='draft')await onClearDraft();
      else {clearDeviceStorage(kind,account);if(kind==='cache')onClearCache();else window.dispatchEvent(new Event('meal-table-layout-cleared'));}
      setMessage(`Đã xóa ${labels[kind]} trên thiết bị này.`);
    }catch{setMessage('Chưa xóa xong dữ liệu trên thiết bị. Trình duyệt có thể chặn nơi lưu; hãy thử lại.');}
    finally{setWorking(false);}
  }
  return <section className="dashboard-panel device-data" role="region" aria-label="Dữ liệu trên thiết bị"><SettingsSection id="system-device" heading="h2" title="Dữ liệu trên thiết bị" description="Chỉ ảnh hưởng trình duyệt này; không đồng bộ thao tác xóa sang thiết bị khác. Không xóa Form, Sheet hay cookie đăng nhập.">
    <ul>{[['draft','Nháp OCR','Ảnh và bản sửa của tài khoản đang dùng.'],['cache','Bản lưu Dashboard','Dữ liệu tuần đã lưu của tài khoản đang dùng; giữ từ khóa và vị trí xem.'],['layout','Bố cục bảng','Cột ẩn, thứ tự và độ rộng đã nhớ trên trình duyệt này.']].map(([kind,label,note])=><li key={kind}><div><strong>{label}</strong><p>{note}</p></div><button type="button" className="secondary" disabled={disabled||working} onClick={()=>void clear(kind)}>Xóa {kind==='draft'?'nháp OCR':kind==='cache'?'bản lưu Dashboard':'bố cục bảng'}</button></li>)}</ul><p role="status">{message}</p>
  </SettingsSection></section>;
}
