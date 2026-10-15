import {createContext,useContext,useEffect,useId,useMemo,useRef,useState,useCallback} from 'react';
import {createPortal} from 'react-dom';
import {readTextSize,writeTextSize} from './dashboard-model.mjs';
import {foldSearchText} from './viewer-model.mjs';
import './comfort.css';
import {useAppearance} from './AppearanceProvider.jsx';
import SearchInput from './SearchInput.jsx';
import SearchHighlight from './SearchHighlight.jsx';
import ChevronIcon from './ChevronIcon.jsx';

const Comfort=createContext(()=>()=>{});
const PreferencesSlot=createContext(()=>{});
export function DisplayPreferencesSlot(){const setSlot=useContext(PreferencesSlot);return <div className="ui-preferences-slot" ref={setSlot}/>;}
const pages=[['/newest','Tuần này'],['/next','Tuần sau'],['/history','Kho tuần cũ'],['/dashboard','Dashboard'],['/setup','Cài đặt']].map(([href,label])=>({id:href,kind:'page',href,label}));

export function useQuickCommands(commands,blocked,run,beforeNavigate) {
  const register=useContext(Comfort),callbacks=useRef({run,beforeNavigate});
  callbacks.current={run,beforeNavigate};
  useEffect(()=>register({commands,blocked,run:command=>callbacks.current.run(command),beforeNavigate:()=>callbacks.current.beforeNavigate?.()}),[register,commands,blocked]);
}

export default function ComfortProvider({children}) {
  const appearance=useAppearance();
  const [size,setSize]=useState(readTextSize),[registered,setRegistered]=useState(null),[open,setOpen]=useState(false),[query,setQuery]=useState(''),[index,setIndex]=useState(0),[error,setError]=useState(''),[navigating,setNavigating]=useState(false);
  const dialog=useRef(null),input=useRef(null),returnFocus=useRef(null);
  const settings=useRef(null),settingsTrigger=useRef(null),settingsId=useId();
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [updatesOpen,setUpdatesOpen]=useState(false),updatesId=useId();
  const [displaySlot,setDisplaySlot]=useState(null);
  const register=useCallback(value=>{setRegistered(value);return()=>setRegistered(null);},[]);
  const commands=useMemo(()=>[...(registered?.commands||[]),...pages].filter(command=>foldSearchText(command.label).includes(foldSearchText(query))),[registered,query]);
  const blocked=registered?.blocked||navigating;
  useEffect(()=>{document.documentElement.dataset.textSize=size;writeTextSize(size);},[size]);
  function show(){if(blocked||document.querySelector('dialog:modal'))return;returnFocus.current=settings.current?.matches(':popover-open')?settingsTrigger.current:document.activeElement;settings.current?.hidePopover();setQuery('');setIndex(0);setError('');setOpen(true);}
  function positionSettings(event){
    event.currentTarget.inert=event.newState!=='open';
    if(event.newState!=='open')return;
    const rect=settingsTrigger.current.getBoundingClientRect();
    settings.current.style.setProperty('--settings-top',`${Math.min(rect.bottom+8,window.innerHeight-100)}px`);
    settings.current.style.setProperty('--settings-right',`${Math.max(12,document.documentElement.clientWidth-rect.right)}px`);
  }
  function moveSettingsFocus(event){
    if(event.target.tagName!=='BUTTON'||!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    event.preventDefault();
    const controls=[...settings.current.querySelectorAll('button:not(:disabled),select:not(:disabled)')],index=controls.indexOf(event.target);
    controls[event.key==='Home'?0:event.key==='End'?controls.length-1:(index+(event.key==='ArrowDown'?1:-1)+controls.length)%controls.length]?.focus();
  }
  useEffect(()=>{
    if(!settingsOpen)return;
    const close=()=>settings.current?.hidePopover();
    window.addEventListener('resize',close);window.addEventListener('scroll',close,{passive:true});
    return()=>{window.removeEventListener('resize',close);window.removeEventListener('scroll',close);};
  },[settingsOpen]);
  useEffect(()=>{
    const onKey=event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(!open)show();}};
    document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey);
  },[open,blocked]);
  useEffect(()=>{
    if(!open)return;
    const node=dialog.current;node.showModal();input.current.focus();
    return()=>{node.close();const target=returnFocus.current?.isConnected?returnFocus.current:settingsTrigger.current;target?.focus();};
  },[open]);
  useEffect(()=>{if(blocked&&open&&!navigating)setOpen(false);},[blocked,open,navigating]);
  useEffect(()=>{document.getElementById(`quick-result-${index}`)?.scrollIntoView({block:'nearest'});},[index]);
  async function choose(command){
    if(!command||blocked)return;
    setNavigating(true);setError('');
    try{
      if(command.kind==='page'){if(await registered?.beforeNavigate?.()===false)return;window.location.assign(command.href);}
      else {if(await registered?.run(command)===false)return;setOpen(false);}
    }catch{setError('Chưa lưu nháp/vị trí được; trang chưa chuyển. Hãy thử lại.');}
    finally{setNavigating(false);}
  }
  const toolbar=<>
    <div className="comfort-toolbar" aria-label="Điều hướng và cỡ chữ">
      <button ref={settingsTrigger} type="button" className="secondary comfort-menu-toggle" aria-label="Tùy chọn hiển thị" title="Tùy chọn hiển thị" aria-haspopup="dialog" aria-expanded={settingsOpen} aria-controls={settingsId} popoverTarget={settingsId} onKeyDown={event=>{if(event.key==='ArrowDown'){event.preventDefault();if(!settings.current.matches(':popover-open'))settingsTrigger.current.click();settings.current.querySelector('button:not(:disabled)')?.focus();}}}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="4" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="20" cy="12" r="2"/></svg></button>
      <div ref={settings} id={settingsId} className="comfort-menu" popover="auto" role="dialog" aria-label="Tùy chọn hiển thị" onBeforeToggle={positionSettings} onToggle={event=>{setSettingsOpen(event.newState==='open');if(event.newState!=='open')setUpdatesOpen(false);}} onKeyDown={moveSettingsFocus}>
        <h2>Tùy chọn hiển thị</h2>
        <button type="button" className="secondary comfort-command" disabled={blocked} onClick={show}>Lệnh nhanh<span aria-hidden="true">Ctrl/⌘ K</span></button>
        <div className="comfort-font-row"><span>Cỡ chữ</span><div className="comfort-font-options" role="group" aria-label="Cỡ chữ"><button className="secondary" type="button" aria-pressed={size==='normal'} onClick={()=>setSize('normal')}>Bình thường</button><button className="secondary" type="button" aria-pressed={size==='large'} onClick={()=>setSize('large')}>Lớn</button></div></div>
        <div className="appearance-controls"><label>Giao diện<select aria-label="Giao diện" value={appearance.theme} onChange={event=>appearance.setPreference({theme:event.target.value})}><option value="light">Sáng</option><option value="dark">Tối</option><option value="system">Theo hệ thống</option></select></label><label>Hiệu ứng<select aria-label="Hiệu ứng" value={appearance.motion} onChange={event=>appearance.setPreference({motion:event.target.value})}><option value="full">Đầy đủ</option><option value="light">Nhẹ</option><option value="off">Tắt</option></select></label></div>
        <button type="button" className="secondary comfort-command" aria-expanded={updatesOpen} aria-controls={updatesId} onClick={()=>setUpdatesOpen(value=>!value)}>Có gì mới?<ChevronIcon expanded={updatesOpen}/></button>
        <section className="release-notes" id={updatesId} aria-label="Điểm mới của giao diện" hidden={!updatesOpen}>
          <h3>Cập nhật giao diện · 15/10/2026</h3>
          <ul><li>Đếm riêng lượt gửi và lựa chọn món theo bộ lọc.</li><li>Phân biệt Form tuần đang xem với Form đăng ký tuần sau.</li><li>Nhãn ngày gọn trên điện thoại; chạm để xem ngày đầy đủ.</li><li>Xem điểm mới tại đây khi cần, không có cửa sổ tự bật.</li></ul>
        </section>
      </div>
    </div>
  </>;
  return <Comfort.Provider value={register}><PreferencesSlot.Provider value={setDisplaySlot}>
    {displaySlot?createPortal(toolbar,displaySlot):toolbar}
    {children}
    {open&&<dialog ref={dialog} className="quick-dialog" aria-labelledby="quick-title" onCancel={event=>{event.preventDefault();if(!navigating)setOpen(false);}}>
      <h2 id="quick-title">Lệnh nhanh</h2><p>Chỉ mở trang, tuần hoặc tab; không xóa hay thay đổi dữ liệu.</p>
      <SearchInput ref={input} label="Tìm lệnh hoặc tuần" onClear={()=>{setQuery('');setIndex(0);}} role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="quick-results" aria-activedescendant={commands[index]?`quick-result-${index}`:undefined} value={query} disabled={navigating} onChange={event=>{setQuery(event.target.value);setIndex(0);}} onKeyDown={event=>{
        if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setIndex(value=>commands.length?(value+(event.key==='ArrowDown'?1:-1)+commands.length)%commands.length:0);}
        if(event.key==='Enter'){event.preventDefault();void choose(commands[index]);}
      }} placeholder="Tìm tuần, ngày, Dashboard…" />
      <div id="quick-results" role="listbox" aria-label="Kết quả lệnh">{commands.map((command,i)=><button key={command.id} id={`quick-result-${i}`} type="button" role="option" aria-selected={index===i} disabled={navigating} className="secondary" onClick={()=>void choose(command)}><SearchHighlight text={command.label} query={query}/></button>)}</div>
      {!commands.length&&<p role="status">Không có lệnh phù hợp.</p>}{error&&<p role="alert">{error}</p>}
      <button type="button" className="secondary" disabled={navigating} onClick={()=>setOpen(false)}>Đóng</button>
    </dialog>}
  </PreferencesSlot.Provider></Comfort.Provider>;
}
