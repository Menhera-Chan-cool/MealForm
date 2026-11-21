import {useId,useRef,useState} from 'react';
import {ChevronDown,MoreHorizontal,Plus,RefreshCw} from 'lucide-react';
import ExternalLink from './ExternalLink.jsx';
import SearchInput from './SearchInput.jsx';
import useAnchoredPopover from './useAnchoredPopover.js';
import {weekMenuRows} from './dashboard-shell.mjs';
import {foldSearchText} from './viewer-model.mjs';

const STATUS={open:'Đang mở',closed:'Đã đóng'};
function deadlineText(lockAt){
  const time=Date.parse(lockAt||'');
  if(!Number.isFinite(time))return '';
  const local=new Date(time+7*3600000).toISOString();
  return `Hạn ${local.slice(8,10)}/${local.slice(5,7)} ${local.slice(11,16)}`;
}
function safeLinks(links){
  return [['Mở Form',links?.formUrl],['Mở Sheet',links?.spreadsheetUrl],['Mở thư mục',links?.folderUrl]].filter(([,url])=>/^https:\/\//i.test(url||''));
}

export default function WeekSwitcher({weeks,weekKey,onChange,onRefresh,canCreate=false,onCreate,disabled=false,links}){
  const menu=useAnchoredPopover('bottom',{align:'start'}),linkMenu=useAnchoredPopover('bottom');
  const listId=useId(),list=useRef(null);
  const [query,setQuery]=useState('');
  const selected=(weeks||[]).find(week=>week.weekKey===weekKey);
  const rows=weekMenuRows(weeks,weekKey,{canCreate});
  const term=foldSearchText(query).trim();
  const slots=term?[]:rows.filter(row=>row.kind==='missing');
  const options=rows.filter(row=>row.kind==='week'&&(!term||foldSearchText(row.label).includes(term)));
  const groups=[...new Set(options.map(row=>row.group))].map(group=>({group,rows:options.filter(row=>row.group===group)}));
  const name=selected?.name||selected?.weekKey||'Chưa chọn tuần';
  const status=selected?(STATUS[selected.formStatus]||'Chưa xác định'):'';
  const deadline=selected?deadlineText(selected.lockAt):'';
  const available=safeLinks(links);
  function options$(){return [...(list.current?.querySelectorAll('[role=option]:not(:disabled)')||[])];}
  function focusInitial(){requestAnimationFrame(()=>{const items=options$();(items.find(item=>item.getAttribute('aria-selected')==='true')||items[0])?.focus();});}
  function returnFocus(panel,trigger){requestAnimationFrame(()=>{const active=document.activeElement;if(!active||active===document.body||panel?.contains(active))trigger?.focus();});}
  function moveFocus(event){
    if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
    const items=options$(),index=items.indexOf(document.activeElement);if(!items.length)return;event.preventDefault();
    items[event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();
  }
  function choose(row){menu.hide();menu.trigger.current?.focus();if(row.weekKey!==weekKey)onChange?.(row.weekKey);}
  function create(){menu.hide();onCreate?.();}
  return <div className="dashboard-week-picker ui-shell-week">
    <button ref={menu.trigger} type="button" className="secondary ui-shell-week-trigger" title={name} disabled={disabled} popoverTarget={menu.id} aria-haspopup="dialog" aria-expanded={menu.open} aria-controls={menu.id}>
      <span className="sr-only">Tuần đang chọn: </span><span className="ui-shell-week-name">{name}</span>
      {status&&<span className="ui-shell-week-status" data-status={selected?.formStatus||'unknown'}>{status}</span>}
      {deadline&&<span className="ui-shell-week-deadline">{deadline}</span>}
      <ChevronDown aria-hidden="true" size={16}/>
    </button>
    <div ref={menu.panel} id={menu.id} className="ui-shell-week-menu ui-anchored-popover meal-ui" popover="auto" role="dialog" aria-label="Chọn tuần" {...menu.events} onToggle={event=>{menu.events.onToggle(event);if(event.newState==='open')focusInitial();else{setQuery('');returnFocus(menu.panel.current,menu.trigger.current);}}}>
      <SearchInput label="Tìm tuần" value={query} maxLength={100} placeholder="Tìm tháng hoặc ngày…" disabled={disabled} onChange={event=>setQuery(event.target.value)} onClear={()=>setQuery('')} onKeyDown={event=>{if(event.key==='ArrowDown'){event.preventDefault();options$()[0]?.focus();}}}/>
      {slots.length>0&&<div className="ui-shell-week-slots">{slots.map(row=><p key={row.group}><strong>{row.group}</strong><span>Chưa có thực đơn</span>{row.canCreate&&<button type="button" className="secondary" disabled={disabled} onClick={create}><Plus aria-hidden="true" size={16}/>Tạo</button>}</p>)}</div>}
      <div ref={list} id={listId} role="listbox" aria-label="Các tuần đã đăng ký" className="ui-shell-week-list" onKeyDown={moveFocus}>
        {groups.map(({group,rows:items},groupIndex)=><div key={group} role="group" aria-label={group}><p className="ui-shell-week-group" aria-hidden="true">{group}</p>{items.map((row,index)=><button key={`${row.weekKey}-${index}`} type="button" role="option" aria-selected={row.selected} aria-label={row.label} aria-describedby={`${listId}-${groupIndex}-${index}`} className="secondary ui-shell-week-option" title={row.label} disabled={disabled} onClick={()=>choose(row)}><span className="ui-shell-week-name">{row.label}</span><small id={`${listId}-${groupIndex}-${index}`}>{row.hint}</small></button>)}</div>)}
        {!options.length&&<p className="ui-shell-week-empty">{term?'Không có tuần khớp từ khóa.':'Chưa có tuần nào được đăng ký.'}</p>}
      </div>
      <button type="button" className="secondary ui-shell-week-refresh" disabled={disabled} onClick={()=>{menu.hide();onRefresh?.();}}><RefreshCw aria-hidden="true" size={16}/>Tải lại danh sách tuần</button>
    </div>
    <button ref={linkMenu.trigger} type="button" className="secondary ui-shell-week-links" aria-label="Liên kết của tuần" title="Liên kết của tuần" disabled={disabled||!selected} popoverTarget={linkMenu.id} aria-haspopup="dialog" aria-expanded={linkMenu.open} aria-controls={linkMenu.id}><MoreHorizontal aria-hidden="true" size={20}/></button>
    <div ref={linkMenu.panel} id={linkMenu.id} className="ui-shell-link-menu ui-anchored-popover meal-ui" popover="auto" role="dialog" aria-label="Liên kết của tuần" {...linkMenu.events} onToggle={event=>{linkMenu.events.onToggle(event);if(event.newState==='open')requestAnimationFrame(()=>linkMenu.panel.current?.querySelector('a')?.focus());else returnFocus(linkMenu.panel.current,linkMenu.trigger.current);}}>
      {available.length?available.map(([label,url])=><ExternalLink key={label} className="action-link" href={url} onClick={()=>linkMenu.hide()}>{label}</ExternalLink>):<p>Tuần này chưa có liên kết hợp lệ.</p>}
    </div>
  </div>;
}
