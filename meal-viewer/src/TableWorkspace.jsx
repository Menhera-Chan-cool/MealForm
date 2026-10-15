import {createContext,useContext,useEffect,useId,useRef,useState} from 'react';
import {Maximize2,Minimize2} from 'lucide-react';
import useVisualViewport from './useVisualViewport.js';
import ColumnChooser from './ColumnChooser.jsx';
import {displayHeader} from './ui-clarity.mjs';

const Sizing=createContext(null);
export function ColumnResizeHandle({index,label}){
  const sizing=useContext(Sizing),[natural,setNatural]=useState(144);
  if(!sizing)return null;
  const width=Math.round(sizing.widths?.[index]||natural);
  return <span className="column-resize-handle" role="separator" tabIndex={0} aria-label={`Độ rộng cột ${displayHeader(label)}`} aria-orientation="vertical" aria-valuemin={Math.min(144,width)} aria-valuemax={Math.max(sizing.max,width)} aria-valuenow={width} onFocus={event=>setNatural(event.currentTarget.parentElement.getBoundingClientRect().width)} onPointerDown={event=>sizing.start(event,index)} onPointerMove={sizing.move} onPointerUp={sizing.end} onPointerCancel={sizing.cancel} onLostPointerCapture={sizing.cancel} onKeyDown={event=>sizing.key(event,index)}/>;
}

/** @param {{label:string,expandLabel:string,headers?:string[],requiredColumns?:number[],children:import('react').ReactNode}} props */
export default function TableWorkspace({label,expandLabel,headers=[],requiredColumns=[],children}) {
  const dialog=useRef(null),trigger=useRef(null),saved=useRef(null);
  const id='workspace-'+useId().replace(/[^a-zA-Z0-9_-]/g,''),signature=JSON.stringify([headers,requiredColumns]);
  const [columns,setColumns]=useState({signature:'',hidden:[]});
  const [sizes,setSizes]=useState(null),drag=useRef(null);
  const widths=sizes?.signature===signature?sizes.values:null;
  function measure(){return headers.map((_,index)=>dialog.current.querySelectorAll('.workspace-body thead th')[index]?.getBoundingClientRect().width||144);}
  function configuration(){const values=widths||measure();return {signature,values,max:Math.max(720,...values,sizes?.max||0)};}
  function cancel(){const current=drag.current;if(!current)return;drag.current=null;setSizes(current.previous);if(current.target.hasPointerCapture(current.pointerId))current.target.releasePointerCapture(current.pointerId);}
  function start(event,index){
    if(event.button!==0||!window.matchMedia('(min-width:701px)').matches)return;
    event.preventDefault();event.currentTarget.focus();const config=configuration();
    drag.current={previous:sizes,config,index,x:event.clientX,target:event.currentTarget,pointerId:event.pointerId};event.currentTarget.setPointerCapture(event.pointerId);setSizes(config);
  }
  function move(event){const current=drag.current;if(!current||event.pointerId!==current.pointerId)return;const values=[...current.config.values];values[current.index]=Math.max(144,Math.min(current.config.max,values[current.index]+event.clientX-current.x));setSizes({...current.config,values});}
  function end(event){const current=drag.current;if(!current||event.pointerId!==current.pointerId)return;drag.current=null;if(current.target.hasPointerCapture(current.pointerId))current.target.releasePointerCapture(current.pointerId);}
  function key(event,index){
    if(event.key==='Escape'&&drag.current){event.preventDefault();event.stopPropagation();cancel();return;}
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const config=configuration(),values=[...config.values];values[index]=event.key==='Home'?144:event.key==='End'?config.max:Math.max(144,Math.min(config.max,values[index]+(event.key==='ArrowLeft'?-16:16)));setSizes({...config,values});
  }
  useEffect(()=>{const resize=()=>{if(window.matchMedia('(max-width:700px)').matches)cancel();};window.addEventListener('resize',resize);return()=>{window.removeEventListener('resize',resize);const current=drag.current;drag.current=null;if(current?.target.hasPointerCapture(current.pointerId))current.target.releasePointerCapture(current.pointerId);};},[signature]);
  const hidden=columns.signature===signature?columns.hidden.filter(index=>!requiredColumns.includes(index)):[];
  const hiddenSelectors=hidden.flatMap(index=>['th','td:not([colspan])'].map(tag=>`#${id} .workspace-body table> :is(thead,tbody)>tr>${tag}:nth-child(${index+1})`));
  const tableWidth=widths?.reduce((total,width,index)=>total+(hidden.includes(index)?0:width),0);
  const widthRules=widths?`#${id} .workspace-body table{table-layout:fixed;width:${tableWidth}px;min-width:${tableWidth}px;max-width:none}#${id} .workspace-body :is(th,td){overflow-wrap:anywhere}${widths.map((width,index)=>`#${id} .workspace-body thead th:nth-child(${index+1}){width:${hidden.includes(index)?0:width}px}`).join('')}`:'';
  const [expanded,setExpanded]=useState(false);useVisualViewport(dialog);
  function close(){
    dialog.current.close();dialog.current.setAttribute('open','');setExpanded(false);
    const position=saved.current;
    requestAnimationFrame(()=>{if(position){window.scrollTo(position.x,position.y);position.tables.forEach(item=>{item.node.scrollTop=item.top;item.node.scrollLeft=item.left;});}trigger.current?.focus({preventScroll:true});});
  }
  function expand(){
    saved.current={x:window.scrollX,y:window.scrollY,tables:[...dialog.current.querySelectorAll('.table-wrap')].map(node=>({node,top:node.scrollTop,left:node.scrollLeft}))};
    dialog.current.close();dialog.current.showModal();setExpanded(true);
  }
  useEffect(()=>{
    if(!expanded)return;
    const update=()=>{if(window.matchMedia('(max-width:700px)').matches)close();};
    window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update);
  },[expanded]);
  // Keep one table DOM; the inline region becomes modal only via showModal().
  return <dialog open ref={dialog} id={id} role={expanded?'dialog':'region'} aria-label={label} style={headers.length?{'--workspace-table-min':`${Math.max(320,(headers.length-hidden.length)*144)}px`}:undefined} className={`table-workspace ${expanded?'workspace-expanded':''}`} onCancel={event=>{event.preventDefault();close();}}>
    <style>{`@media(min-width:701px){${hiddenSelectors.length?`${hiddenSelectors.join(',')}{display:none!important}`:''}${widthRules}}`}</style>
    <div className="workspace-toolbar">{expanded&&<strong>{label}</strong>}{headers.length>0&&<ColumnChooser label={label} headers={headers} required={requiredColumns} hidden={hidden} onChange={next=>setColumns({signature,hidden:next})}/>}<button type="button" className="secondary column-size-reset" disabled={!widths} onClick={()=>setSizes(null)}>Cỡ cột mặc định</button><button type="button" className="secondary workspace-toggle" ref={trigger} aria-label={expanded?`Thu nhỏ ${label.toLocaleLowerCase()}`:expandLabel} onClick={expanded?close:expand}>{expanded?<Minimize2 size={16} aria-hidden="true"/>:<Maximize2 size={16} aria-hidden="true"/>}{expanded?'Thu nhỏ':'Phóng rộng bảng'}</button></div>
    <Sizing.Provider value={{widths,max:sizes?.signature===signature?sizes.max:720,start,move,end,cancel,key}}><div className="workspace-body">{children}</div></Sizing.Provider>
  </dialog>;
}
