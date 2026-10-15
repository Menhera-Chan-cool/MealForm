import {useCallback,useLayoutEffect,useRef,useState} from 'react';

/** @param {{children:import('react').ReactNode,className?:string,style?:any,ref?:import('react').Ref<HTMLDivElement>,'data-week-key'?:string}} props */
export default function TableScroll({children,className='',style,ref,...props}){
  const viewport=useRef(null),[edges,setEdges]=useState({left:false,right:false});
  const attach=useCallback(node=>{viewport.current=node;if(typeof ref==='function')ref(node);else if(ref)ref.current=node;},[ref]);
  useLayoutEffect(()=>{
    const node=viewport.current;
    function update(){const pc=window.matchMedia('(min-width:701px)').matches,max=node.scrollWidth-node.clientWidth;const next={left:pc&&max>1&&node.scrollLeft>1,right:pc&&max>1&&node.scrollLeft<max-1};setEdges(previous=>previous.left===next.left&&previous.right===next.right?previous:next);}
    const observer=new ResizeObserver(update);observer.observe(node);const table=node.querySelector('table');if(table)observer.observe(table);node.addEventListener('scroll',update,{passive:true});update();
    return()=>{observer.disconnect();node.removeEventListener('scroll',update);};
  },[children]);
  return <div className="table-scroll-frame" data-edge-left={edges.left} data-edge-right={edges.right}><div {...props} className={`table-wrap ${className}`} style={style} ref={attach}>{children}</div></div>;
}
