import {useEffect,useRef,useState} from 'react';
import {normalizeBranding,uiThemeVariables} from './branding.mjs';
import {Badge} from './components/ui/badge.jsx';

/** @param {{draft:any,saved?:any,logoAttempt?:number,onLogoStatus?:(value:{url:string,attempt:number,state:string})=>void}} props */
export default function BrandingPreview({draft,saved,logoAttempt=0,onLogoStatus}) {
  const [surface,setSurface]=useState('viewer'),[device,setDevice]=useState('phone'),[scheme,setScheme]=useState('light');
  const [side,setSide]=useState('draft'),[enlarged,setEnlarged]=useState(null),dialog=useRef(null),opener=useRef(null);
  useEffect(()=>{if(!enlarged)return;const node=dialog.current;node.showModal();return()=>{node.close();opener.current?.focus({preventScroll:true});};},[enlarged]);
  return <section className="branding-context-preview" aria-label="Xem trước thương hiệu">
    <h3>Xem trước thương hiệu</h3><p>Minh họa bố cục và màu sắc. Chưa áp dụng lên web cho tới khi lưu.</p>
    <div className="brand-contact-sheet" role="group" aria-label="Bảng mẫu thương hiệu">{[['pc','light','PC sáng'],['pc','dark','PC tối'],['phone','light','Mobile sáng'],['phone','dark','Mobile tối']].map(([device,scheme,label])=><div className="brand-contact-cell" key={label}><h4>{label}</h4><div className="brand-contact-crop" inert><BrandingSample brand={normalizeBranding(draft)} surface={surface} device={device} scheme={scheme}/></div><button type="button" className="secondary" aria-label={'Phóng mẫu '+label} onClick={event=>{opener.current=event.currentTarget;setEnlarged({device,scheme,label});}}>Xem lớn {label}</button></div>)}</div>{enlarged&&<dialog ref={dialog} className="brand-sample-dialog meal-ui" aria-label="Mẫu thương hiệu" onCancel={()=>setEnlarged(null)}><header><h3>{enlarged.label} · Bản đang sửa</h3><button type="button" className="secondary" autoFocus onClick={()=>setEnlarged(null)}>Đóng</button></header><BrandingSample brand={normalizeBranding(draft)} surface={surface} device={enlarged.device} scheme={enlarged.scheme}/></dialog>}<div className="branding-preview-controls">
      <label>Trang minh họa<select value={surface} onChange={event=>setSurface(event.target.value)}><option value="viewer">Trang xem</option><option value="dashboard">Dashboard</option></select></label>
      <label>Thiết bị minh họa<select value={device} onChange={event=>setDevice(event.target.value)}><option value="phone">Điện thoại</option><option value="pc">PC</option></select></label>
      <label>Giao diện minh họa<select value={scheme} onChange={event=>setScheme(event.target.value)}><option value="light">Sáng</option><option value="dark">Tối</option></select></label>
    </div>
    {saved&&<div className="branding-compare-tabs" role="group" aria-label="Bản thương hiệu đang xem"><button type="button" className="secondary" aria-pressed={side==='saved'} onClick={()=>setSide('saved')}>Xem bản đã lưu</button><button type="button" className="secondary" aria-pressed={side==='draft'} onClick={()=>setSide('draft')}>Xem bản đang sửa</button></div>}
    <div className={saved?'branding-comparison':''} data-side={side}>
      {saved&&<section role="region" aria-label="Thương hiệu đã lưu" className="branding-comparison-saved"><h4>Đã lưu</h4><BrandingSample brand={normalizeBranding(saved)} saved surface={surface} device={device} scheme={scheme}/></section>}
      <section role="region" aria-label="Thương hiệu đang sửa" className="branding-comparison-draft">{saved&&<h4>Đang sửa · chưa áp dụng</h4>}<BrandingSample brand={normalizeBranding(draft)} surface={surface} device={device} scheme={scheme} logoAttempt={logoAttempt} onLogoStatus={onLogoStatus}/></section>
    </div>
  </section>;
}

function BrandingSample({brand,saved=false,surface,device,scheme,logoAttempt=0,onLogoStatus=undefined}){
  return <div className="branding-preview-viewport"><div className={saved?'branding-saved-canvas':'branding-preview-canvas'} data-device={device} data-scheme={scheme} style={uiThemeVariables(brand.primaryColor,scheme)}>
      <div className="branding-preview-header">{brand.logoUrl&&<img key={`${brand.logoUrl}:${logoAttempt}`} src={brand.logoUrl} alt={saved?'Logo đã lưu':'Xem trước logo'} referrerPolicy="no-referrer" onLoad={()=>onLogoStatus?.({url:brand.logoUrl,attempt:logoAttempt,state:'loaded'})} onError={()=>onLogoStatus?.({url:brand.logoUrl,attempt:logoAttempt,state:'error'})}/>}<strong>{brand.schoolName||'Tên trường của bạn'}</strong></div>
      <div className="branding-sample-layout" data-surface={surface}>
        {surface==='dashboard'&&device==='pc'&&<aside><strong>Quản trị thực đơn</strong><span className="branding-sample-action">Tổng quan</span><span>Tạo tuần</span><span>Lượt gửi</span></aside>}
        <div className="branding-sample-content"><h3>{surface==='viewer'?'Thực đơn tuần này':'Dashboard quản trị'}</h3><small>Dữ liệu minh họa</small>
          {surface==='viewer'?<><div className="branding-sample-tools"><span className="branding-sample-action">Tuần này</span><span>Kho tuần cũ</span></div><div className="branding-sample-field">Tìm nhanh tên…</div><div className="branding-sample-card"><strong>Thứ Hai</strong><p>Cơm gà <Badge variant="secondary">12 lượt</Badge></p><p>Bún bò <Badge variant="secondary">8 lượt</Badge></p></div></>:<><div className="branding-sample-card"><strong>Sổ tuần thực đơn</strong><p>Tuần hiện tại <Badge variant="secondary">Đang mở</Badge></p><span className="branding-sample-action">Xem lượt gửi</span></div><div className="branding-sample-card"><strong>Lượt gửi gần đây</strong><p>Tên minh họa · Cơm gà</p></div>{device==='phone'&&<div className="branding-sample-tools"><span className="branding-sample-action">Tổng quan</span><span>Tạo tuần</span><span>Thêm</span></div>}</>}
        </div>
      </div>
    </div></div>;
}
