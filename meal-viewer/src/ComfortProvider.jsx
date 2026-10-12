import {createContext,useContext,useEffect,useMemo,useRef,useState,useCallback} from 'react';
import {readTextSize,writeTextSize} from './dashboard-model.mjs';
import {foldSearchText} from './viewer-model.mjs';
import './comfort.css';
import {useAppearance} from './AppearanceProvider.jsx';

const Comfort=createContext(()=>()=>{});
const pages=[['/newest','Tuần này'],['/next','Tuần sau'],['/history','Kho tuần cũ'],['/dashboard','Dashboard'],['/setup','Cài đặt']].map(([href,label])=>({id:href,kind:'page',href,label}));

export function useQuickCommands(commands,blocked,run,beforeNavigate) {
  const register=useContext(Comfort),callbacks=useRef({run,beforeNavigate});
  callbacks.current={run,beforeNavigate};
  useEffect(()=>register({commands,blocked,run:command=>callbacks.current.run(command),beforeNavigate:()=>callbacks.current.beforeNavigate?.()}),[register,commands,blocked]);
}

export default function ComfortProvider({children}) {
  const appearance=useAppearance();
  const [size,setSize]=useState(readTextSize),[registered,setRegistered]=useState(null),[open,setOpen]=useState(false),[query,setQuery]=useState(''),[index,setIndex]=useState(0),[error,setError]=useState(''),[navigating,setNavigating]=useState(false);
  const dialog=useRef(null),input=useRef(null),trigger=useRef(null),returnFocus=useRef(null);
  const register=useCallback(value=>{setRegistered(value);return()=>setRegistered(null);},[]);
  const commands=useMemo(()=>[...(registered?.commands||[]),...pages].filter(command=>foldSearchText(command.label).includes(foldSearchText(query))),[registered,query]);
  const blocked=registered?.blocked||navigating;
  useEffect(()=>{document.documentElement.dataset.textSize=size;writeTextSize(size);},[size]);
  function show(){if(blocked||document.querySelector('dialog[open]'))return;returnFocus.current=document.activeElement;setQuery('');setIndex(0);setError('');setOpen(true);}
  useEffect(()=>{
    const onKey=event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(!open)show();}};
    document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey);
  },[open,blocked]);
  useEffect(()=>{
    if(!open)return;
    const node=dialog.current;node.showModal();input.current.focus();
    return()=>{node.close();const target=returnFocus.current?.isConnected?returnFocus.current:trigger.current;target?.focus();};
  },[open]);
  useEffect(()=>{if(blocked&&open&&!navigating)setOpen(false);},[blocked,open,navigating]);
  useEffect(()=>{document.getElementById(`quick-result-${index}`)?.scrollIntoView({block:'nearest'});},[index]);
  async function choose(command){
    if(!command||blocked)return;
    setNavigating(true);setError('');
    try{
      if(command.kind==='page'){await registered?.beforeNavigate?.();window.location.assign(command.href);}
      else {await registered?.run(command);setOpen(false);}
    }catch{setError('Chưa lưu nháp/vị trí được; trang chưa chuyển. Hãy thử lại.');}
    finally{setNavigating(false);}
  }
  return <Comfort.Provider value={register}>
    <div className="comfort-toolbar" aria-label="Điều hướng và cỡ chữ">
      <button ref={trigger} type="button" className="secondary" disabled={blocked} onClick={show}>Lệnh nhanh<span aria-hidden="true"> Ctrl/⌘ K</span></button>
      <div role="group" aria-label="Cỡ chữ"><button className="secondary" type="button" aria-pressed={size==='normal'} onClick={()=>setSize('normal')}>Bình thường</button><button className="secondary" type="button" aria-pressed={size==='large'} onClick={()=>setSize('large')}>Lớn</button></div>
      <div className="appearance-controls"><label>Giao diện<select aria-label="Giao diện" value={appearance.theme} onChange={event=>appearance.setPreference({theme:event.target.value})}><option value="light">Sáng</option><option value="dark">Tối</option><option value="system">Theo hệ thống</option></select></label><label>Hiệu ứng<select aria-label="Hiệu ứng" value={appearance.motion} onChange={event=>appearance.setPreference({motion:event.target.value})}><option value="full">Đầy đủ</option><option value="light">Nhẹ</option><option value="off">Tắt</option></select></label></div>
    </div>
    {children}
    {open&&<dialog ref={dialog} className="quick-dialog" aria-labelledby="quick-title" onCancel={event=>{event.preventDefault();if(!navigating)setOpen(false);}}>
      <h2 id="quick-title">Lệnh nhanh</h2><p>Chỉ mở trang, tuần hoặc tab; không xóa hay thay đổi dữ liệu.</p>
      <input ref={input} role="combobox" aria-label="Tìm lệnh hoặc tuần" aria-autocomplete="list" aria-expanded="true" aria-controls="quick-results" aria-activedescendant={commands[index]?`quick-result-${index}`:undefined} value={query} disabled={navigating} onChange={event=>{setQuery(event.target.value);setIndex(0);}} onKeyDown={event=>{
        if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setIndex(value=>commands.length?(value+(event.key==='ArrowDown'?1:-1)+commands.length)%commands.length:0);}
        if(event.key==='Enter'){event.preventDefault();void choose(commands[index]);}
      }} placeholder="Tìm tuần, ngày, Dashboard…" />
      <div id="quick-results" role="listbox" aria-label="Kết quả lệnh">{commands.map((command,i)=><button key={command.id} id={`quick-result-${i}`} type="button" role="option" aria-selected={index===i} disabled={navigating} className="secondary" onClick={()=>void choose(command)}>{command.label}</button>)}</div>
      {!commands.length&&<p role="status">Không có lệnh phù hợp.</p>}{error&&<p role="alert">{error}</p>}
      <button type="button" className="secondary" disabled={navigating} onClick={()=>setOpen(false)}>Đóng</button>
    </dialog>}
  </Comfort.Provider>;
}
