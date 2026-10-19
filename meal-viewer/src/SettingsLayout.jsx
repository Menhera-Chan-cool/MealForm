import {useEffect,useRef} from 'react';

export function SettingsSection({id,title,description,children,heading='h3'}){
  const Heading=heading;
  return <section id={id} tabIndex={-1} className="settings-section"><div className="settings-explanation"><Heading>{title}</Heading><p>{description}</p></div><div className="settings-controls">{children}</div></section>;
}

export function PageContents({label,items}){
  const disclosure=useRef(null);
  useEffect(()=>{
    const media=window.matchMedia('(min-width:1201px)'),update=()=>{if(disclosure.current)disclosure.current.open=media.matches;};
    update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);
  },[]);
  return <nav className="page-contents" aria-label={'Các mục '+label}><details ref={disclosure}><summary>Đến mục</summary><ul>{items.map(([id,text])=><li key={id}><a href={'#'+id} onClick={event=>{
    const target=document.getElementById(id);if(!target)return;event.preventDefault();if(!window.matchMedia('(min-width:1201px)').matches)disclosure.current.open=false;target.focus({preventScroll:true});target.scrollIntoView({block:'start'});
  }}>{text}</a></li>)}</ul></details></nav>;
}
