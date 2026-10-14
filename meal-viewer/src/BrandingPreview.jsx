import {useState} from 'react';
import {normalizeBranding,uiThemeVariables} from './branding.mjs';
import {Badge} from './components/ui/badge.jsx';

export default function BrandingPreview({draft}) {
  const [surface,setSurface]=useState('viewer'),[device,setDevice]=useState('phone'),[scheme,setScheme]=useState('light');
  const brand=normalizeBranding(draft);
  return <section className="branding-context-preview" aria-label="Xem trước thương hiệu">
    <h3>Xem trước thương hiệu</h3><p>Minh họa bố cục và màu sắc. Chưa áp dụng lên web cho tới khi lưu.</p>
    <div className="branding-preview-controls">
      <label>Trang minh họa<select value={surface} onChange={event=>setSurface(event.target.value)}><option value="viewer">Trang xem</option><option value="dashboard">Dashboard</option></select></label>
      <label>Thiết bị minh họa<select value={device} onChange={event=>setDevice(event.target.value)}><option value="phone">Điện thoại</option><option value="pc">PC</option></select></label>
      <label>Giao diện minh họa<select value={scheme} onChange={event=>setScheme(event.target.value)}><option value="light">Sáng</option><option value="dark">Tối</option></select></label>
    </div>
    <div className="branding-preview-viewport"><div className="branding-preview-canvas" data-device={device} data-scheme={scheme} style={uiThemeVariables(brand.primaryColor,scheme)}>
      <div className="branding-preview-header">{brand.logoUrl&&<img src={brand.logoUrl} alt="Xem trước logo" referrerPolicy="no-referrer"/>}<strong>{brand.schoolName||'Tên trường của bạn'}</strong></div>
      <div className="branding-sample-layout" data-surface={surface}>
        {surface==='dashboard'&&device==='pc'&&<aside><strong>Quản trị thực đơn</strong><span className="branding-sample-action">Tổng quan</span><span>Tạo tuần</span><span>Lượt gửi</span></aside>}
        <div className="branding-sample-content"><h3>{surface==='viewer'?'Thực đơn tuần này':'Dashboard quản trị'}</h3><small>Dữ liệu minh họa</small>
          {surface==='viewer'?<><div className="branding-sample-tools"><span className="branding-sample-action">Tuần này</span><span>Kho tuần cũ</span></div><div className="branding-sample-field">Tìm nhanh tên…</div><div className="branding-sample-card"><strong>Thứ Hai</strong><p>Cơm gà <Badge variant="secondary">12 lượt</Badge></p><p>Bún bò <Badge variant="secondary">8 lượt</Badge></p></div></>:<><div className="branding-sample-card"><strong>Sổ tuần thực đơn</strong><p>Tuần hiện tại <Badge variant="secondary">Đang mở</Badge></p><span className="branding-sample-action">Xem lượt gửi</span></div><div className="branding-sample-card"><strong>Lượt gửi gần đây</strong><p>Tên minh họa · Cơm gà</p></div>{device==='phone'&&<div className="branding-sample-tools"><span className="branding-sample-action">Tổng quan</span><span>Tạo tuần</span><span>Thêm</span></div>}</>}
        </div>
      </div>
    </div></div>
  </section>;
}
