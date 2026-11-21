import {useEffect,useId,useRef} from 'react';
import {CalendarDays,Plus} from 'lucide-react';
import {DisplayPreferencesSlot,MenuExtraSlot} from './ComfortProvider.jsx';
import {shellTabs,shellSettings,canCreateWeek,isWeekScopedTab} from './dashboard-shell.mjs';
import WeekSwitcher from './WeekSwitcher.jsx';

// The owner/create rules live in dashboard-shell.mjs; this list only adds the create page id.
export function allowedDashboardSections(role,permissions){
  return [...shellTabs(role,permissions),...shellSettings(role),...(canCreateWeek(role,permissions)?[{id:'create',label:'Tạo tuần'}]:[])];
}

function WarningBadge({id,label,badge}){
  if(!badge)return null;
  return <span id={id} className="ui-nav-warning" aria-label={`Cảnh báo ${label}`} title={`${badge.description} · Chỉ là kết quả đã tải; không tự kiểm tra lại.`}>{badge.count}<span className="sr-only"> cần kiểm tra. {badge.description}</span></span>;
}

function ShellTab({item,current,badge,disabled,onNavigate}){
  const warningId=useId();
  return <button type="button" className="secondary ui-shell-tab" aria-label={item.label} aria-current={current?'page':undefined} aria-describedby={badge?warningId:undefined} disabled={disabled} onClick={()=>onNavigate(item.id)}>
    <span className="ui-shell-tab-label" data-label={item.label} data-short-label={item.shortLabel}>
      <span>{item.label}</span><span className="ui-shell-tab-short">{item.shortLabel}</span>
    </span><WarningBadge id={warningId} label={item.label} badge={badge}/>
  </button>;
}

function SettingsItem({item,current,badge,onNavigate}){
  const warningId=useId();
  return <button type="button" className="secondary comfort-command ui-shell-menu-item" aria-label={item.label} aria-current={current?'page':undefined} aria-describedby={badge?warningId:undefined} onClick={event=>{const menu=event.currentTarget.closest('[popover]');if(onNavigate(item.id)!==false)menu?.hidePopover();}}>
    {item.label}<WarningBadge id={warningId} label={item.label} badge={badge}/>
  </button>;
}

export function DashboardLayout({tab,onNavigate,role,permissions,email,schoolName,busy,weekDisabled=false,onSignOut,warnings={},weeks=[],weekKey='',onWeekChange,onRefreshWeeks,weekLinks,menuExtras,children}) {
  const tabs=shellTabs(role,permissions),settings=shellSettings(role),canCreate=canCreateWeek(role,permissions);
  const navigation=useRef(null);
  useEffect(()=>{
    const node=navigation.current;
    const updateEdges=()=>{
      node.toggleAttribute('data-scroll-left',node.scrollLeft>1);
      node.toggleAttribute('data-scroll-right',node.scrollWidth-node.clientWidth-node.scrollLeft>1);
    };
    const observer=new ResizeObserver(updateEdges);
    observer.observe(node);
    for(const button of node.children)observer.observe(button);
    node.addEventListener('scroll',updateEdges,{passive:true});
    updateEdges();
    return()=>{observer.disconnect();node.removeEventListener('scroll',updateEdges);};
  },[role]);
  return <div className="ui-dashboard-layout meal-ui">
    <a className="ui-skip-link" href="#dashboard-content">Đến nội dung chính</a>
    <header className="ui-shell-bar">
      <div className="ui-shell-brand"><CalendarDays aria-hidden="true" size={22}/><div><strong>Quản trị thực đơn</strong>{schoolName&&<small>{schoolName}</small>}</div></div>
      {isWeekScopedTab(tab)&&<WeekSwitcher weeks={weeks} weekKey={weekKey} onChange={onWeekChange} onRefresh={onRefreshWeeks} canCreate={canCreate} onCreate={()=>onNavigate('create')} disabled={weekDisabled} links={weekLinks}/>}
      <div className="ui-shell-actions">
        {canCreate&&<button type="button" className="ui-shell-create" aria-current={tab==='create'?'page':undefined} onClick={()=>onNavigate('create')}><Plus aria-hidden="true" size={18}/>Tạo tuần</button>}
        <DisplayPreferencesSlot variant="settings"/>
      </div>
    </header>
    <nav ref={navigation} className="ui-shell-tabs" aria-label="Khu vực quản trị">{tabs.map(item=><ShellTab key={item.id} item={item} current={tab===item.id} badge={warnings[item.id]} disabled={item.id==='notice'&&busy} onNavigate={onNavigate}/>)}</nav>
    <MenuExtraSlot>
      {menuExtras}
      <div className="ui-shell-menu-links" role="group" aria-label="Quản trị và tài khoản">
        {settings.map(item=><SettingsItem key={item.id} item={item} current={tab===item.id} badge={warnings[item.id]} onNavigate={onNavigate}/>)}
        <a className="action-link ui-shell-menu-item" href="/newest">Mở trang xem thực đơn</a>
        <button type="button" className="secondary comfort-command ui-shell-menu-item" disabled={busy} title={email||undefined} onClick={onSignOut}>Đăng xuất</button>
      </div>
    </MenuExtraSlot>
    {children}
  </div>;
}
