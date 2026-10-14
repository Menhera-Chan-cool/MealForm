import {useEffect,useId,useRef,useState} from 'react';
import {CalendarDays,LayoutDashboard,ScanLine,Users,SlidersHorizontal,Megaphone,GitCompareArrows,Palette,ShieldCheck,Mail,MoreHorizontal,ArrowUpRight} from 'lucide-react';
import {Button} from './components/ui/button.jsx';
import {Card} from './components/ui/card.jsx';
import {Badge} from './components/ui/badge.jsx';
import {groupDashboardWeeks} from './dashboard-model.mjs';

const sections=[
  {id:'overview',label:'Tổng quan',icon:LayoutDashboard},
  {id:'create',label:'Tạo tuần bằng OCR',icon:ScanLine,create:true},
  {id:'delete',label:'Lượt gửi & lịch sử',icon:Users},
  {id:'form',label:'Điều khiển Form',icon:SlidersHorizontal,owner:true},
  {id:'notice',label:'Thông báo tuần',icon:Megaphone,owner:true},
  {id:'reconcile',label:'Đối soát',icon:GitCompareArrows},
  {id:'branding',label:'Thương hiệu',icon:Palette,owner:true},
  {id:'health',label:'Hệ thống',icon:ShieldCheck,owner:true},
  {id:'access',label:'Quyền Gmail',icon:Mail,owner:true}
];

export function DashboardLayout({tab,onNavigate,role,permissions,email,schoolName,busy,onSignOut,children}) {
  const allowed=sections.filter(item=>(!item.owner||role==='owner')&&(!item.create||permissions.create));
  const menu=useRef(null),menuId=useId();
  const [moreOpen,setMoreOpen]=useState(false);
  useEffect(()=>{menu.current?.hidePopover();},[tab]);
  function itemButton(item,short=false){const Icon=item.icon;return <Button key={item.id} type="button" variant="ghost" className={`ui-nav-item ${tab===item.id?'ui-selected':''}`} aria-current={tab===item.id?'page':undefined} disabled={item.id==='notice'&&busy} onClick={()=>onNavigate(item.id)}><Icon aria-hidden="true" size={20}/><span>{short&&item.id==='create'?'Tạo tuần':short&&item.id==='delete'?'Lượt gửi':item.label}</span></Button>;}
  return <div className="ui-dashboard-layout meal-ui">
    <a className="ui-skip-link" href="#dashboard-content">Đến nội dung chính</a>
    <aside className="ui-sidebar"><div className="ui-sidebar-brand"><CalendarDays aria-hidden="true"/><div>Quản trị thực đơn{schoolName&&<small>{schoolName}</small>}</div></div><nav aria-label="Quản trị"><p className="ui-nav-group">Thực đơn</p>{allowed.filter(item=>['overview','create','delete','form','notice'].includes(item.id)).map(item=>itemButton(item))}<p className="ui-nav-group">Quản trị</p>{allowed.filter(item=>['reconcile','branding','health','access'].includes(item.id)).map(item=>itemButton(item))}</nav><div className="ui-sidebar-account"><strong>{role==='owner'?'Chủ sở hữu':'Tài khoản quản trị'}</strong><span>{email}</span><Button type="button" variant="ghost" disabled={busy} onClick={onSignOut}>Đăng xuất</Button></div></aside>
    {children}
    <nav className="ui-mobile-nav" aria-label="Điều hướng điện thoại">{allowed.filter(item=>['overview','create','delete'].includes(item.id)).map(item=>itemButton(item,true))}<Button type="button" variant="ghost" className={`ui-nav-item ${!['overview','create','delete'].includes(tab)?'ui-selected':''}`} popoverTarget={menuId} aria-haspopup="dialog" aria-expanded={moreOpen} aria-controls={menuId}><MoreHorizontal aria-hidden="true" size={20}/><span>Thêm</span></Button></nav>
    <div ref={menu} id={menuId} className="ui-more-menu meal-ui" popover="auto" role="dialog" aria-label="Thêm chức năng" onToggle={event=>setMoreOpen(event.newState==='open')}><h2>Thêm chức năng</h2>{allowed.filter(item=>!['overview','create','delete'].includes(item.id)).map(item=>itemButton(item))}<div className="ui-more-account"><strong>{email}</strong><Button variant="outline" asChild><a href="/newest">Mở trang xem</a></Button><Button type="button" variant="outline" disabled={busy} onClick={onSignOut}>Đăng xuất</Button></div></div>
  </div>;
}

export function DashboardOverview({weeks,busy,owner,onView,onControl,onRefresh}) {
  const grouped=groupDashboardWeeks(weeks);
  function weekCard(week,label){return <Card className="ui-week-card"><div className="ui-card-heading"><h2>{label}</h2><Badge variant="secondary">{week.formStatus==='open'?'Đang mở':week.formStatus==='closed'?'Đã đóng':'Chưa xác định'}</Badge></div>{label!==week.name&&<h3>{week.name}</h3>}<p className="ui-muted">{week.responseCount==null?'Chưa đọc được số lượt':`${week.responseCount} lượt gửi`}</p><div className="ui-week-actions"><Button type="button" disabled={busy} onClick={()=>onView(week.weekKey)}>Xem lượt gửi</Button>{owner&&<Button type="button" variant="outline" disabled={busy} onClick={()=>onControl(week.weekKey)}>Điều khiển Form</Button>}</div><div className="ui-week-links">{[['Form',week.formUrl],['Sheet',week.spreadsheetUrl],['Thư mục',week.folderUrl]].filter(([,url])=>/^https:\/\//i.test(url||'')).map(([label,url])=><Button key={label} variant="ghost" asChild><a href={url} target="_blank" rel="noreferrer">{label}<ArrowUpRight aria-hidden="true" size={16}/></a></Button>)}</div>{week.error&&<p role="status">{week.error}</p>}</Card>;}
  return <section className="ui-overview"><div className="dashboard-section-title"><h2>Sổ tuần</h2><Button type="button" variant="outline" disabled={busy} onClick={onRefresh}>Tải lại</Button></div><div className="ui-current-weeks">{grouped.current?weekCard(grouped.current,'Tuần này'):<Card className="ui-week-card"><h2>Chưa có thực đơn tuần này</h2><p className="ui-muted">Tuần sau không thay thế tuần đang diễn ra.</p></Card>}{grouped.next?weekCard(grouped.next,'Tuần sau'):<Card className="ui-week-card"><h2>Chưa có thực đơn tuần sau</h2><p className="ui-muted">Tuần mới sẽ xuất hiện sau khi được tạo và đăng ký.</p></Card>}</div>{grouped.past.length>0&&<><h2 className="ui-overview-title">Kho tuần cũ</h2><div className="ui-week-list">{grouped.past.map(week=><div key={week.weekKey}>{weekCard(week,week.name)}</div>)}</div></>}{grouped.other.length>0&&<><h2 className="ui-overview-title">Các tuần khác</h2><div className="ui-week-list">{grouped.other.map(week=><div key={week.weekKey}>{weekCard(week,week.name)}</div>)}</div></>}</section>;
}
