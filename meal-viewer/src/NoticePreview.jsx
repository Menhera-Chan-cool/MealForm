import {useId,useState} from 'react';
import {useBranding} from './BrandingProvider.jsx';
import {uiThemeVariables} from './branding.mjs';
import {noticePreview} from './ui-clarity.mjs';
import WeekNotice from './WeekNotice.jsx';

export default function NoticePreview({text,endsOn,weekName,dirty=false}) {
  const [open,setOpen]=useState(false),[device,setDevice]=useState('phone'),[scheme,setScheme]=useState('light'),id=useId();
  const branding=useBranding(),preview=noticePreview(text,endsOn);
  return <div className="notice-preview"><button type="button" className="secondary" aria-label="Xem trước thông báo" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(value=>!value)}>{open?'Đóng xem trước':'Xem trước thông báo'}</button><section id={id} hidden={!open} role="region" aria-label="Xem trước thông báo">
    <h3>Xem trước thông báo</h3><p>{dirty?'Chưa lưu · ':''}Chỉ minh họa khối thông báo; mở xem trước không lưu hay đăng nội dung. Ngày hết hạn theo giờ Việt Nam trên thiết bị.</p>
    <div className="notice-preview-controls"><label>Thiết bị xem trước<select value={device} onChange={event=>setDevice(event.target.value)}><option value="phone">Điện thoại</option><option value="pc">PC</option></select></label><label>Giao diện xem trước<select value={scheme} onChange={event=>setScheme(event.target.value)}><option value="light">Sáng</option><option value="dark">Tối</option></select></label></div>
    <div className="branding-preview-viewport"><div className="notice-preview-canvas" data-device={device} data-scheme={scheme} style={uiThemeVariables(branding.primaryColor,scheme)}><strong>{branding.schoolName||'Trang xem thực đơn'}</strong>{weekName&&<p>{weekName}</p>}{preview.notice?<WeekNotice notice={preview.notice}/>:<p role="status">{preview.message}</p>}</div></div>
  </section></div>;
}
