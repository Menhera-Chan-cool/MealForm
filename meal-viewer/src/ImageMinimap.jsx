import {useEffect,useId,useRef,useState} from 'react';
import {minimapViewport,minimapScroll} from './reading-ui.mjs';

export default function ImageMinimap({src,zoom,viewport}){
  const [view,setView]=useState(null),paper=useRef(null),help=useId();
  useEffect(()=>{
    const node=viewport.current,image=node?.querySelector('img');
    if(!node||!image)return;
    const update=()=>setView({clientWidth:node.clientWidth,clientHeight:node.clientHeight,scrollWidth:node.scrollWidth,scrollHeight:node.scrollHeight,scrollLeft:node.scrollLeft,scrollTop:node.scrollTop,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight});
    const observer=new ResizeObserver(update);observer.observe(node);observer.observe(image);
    node.addEventListener('scroll',update,{passive:true});image.addEventListener('load',update);update();
    return()=>{observer.disconnect();node.removeEventListener('scroll',update);image.removeEventListener('load',update);};
  },[src,zoom,viewport]);
  const rect=view&&minimapViewport(view);
  if(zoom<=100||!rect||!view.naturalWidth||!view.naturalHeight)return null;
  const scale=Math.min(140/view.naturalWidth,100/view.naturalHeight);
  function point(event){
    const bounds=paper.current.getBoundingClientRect();
    const target=minimapScroll((event.clientX-bounds.left)/bounds.width,(event.clientY-bounds.top)/bounds.height,view);
    viewport.current.scrollTo(target.left,target.top);
  }
  return <div className="image-minimap"><button type="button" className="secondary minimap-control" aria-label="Di chuyển vùng xem ảnh" aria-describedby={help}
    onPointerDown={event=>{if(event.button!==0)return;event.preventDefault();event.currentTarget.focus({preventScroll:true});event.currentTarget.setPointerCapture(event.pointerId);point(event);}}
    onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))point(event);}}
    onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}
    onKeyDown={event=>{
      const node=viewport.current;let left=node.scrollLeft,top=node.scrollTop;
      if(event.key==='Home'){left=0;top=0;}else if(event.key==='End'){left=node.scrollWidth;top=node.scrollHeight;}
      else if(event.key==='ArrowLeft')left-=node.clientWidth/4;else if(event.key==='ArrowRight')left+=node.clientWidth/4;
      else if(event.key==='ArrowUp')top-=node.clientHeight/4;else if(event.key==='ArrowDown')top+=node.clientHeight/4;else return;
      event.preventDefault();node.scrollTo(left,top);
    }}>
    <span className="minimap-paper" ref={paper} style={{width:view.naturalWidth*scale,height:view.naturalHeight*scale}}><img src={src} alt="" draggable="false"/><span className="minimap-window" style={{left:rect.x*100+'%',top:rect.y*100+'%',width:rect.width*100+'%',height:rect.height*100+'%'}}/></span>
  </button><small id={help}>Bản đồ ảnh · kéo để di chuyển<br/>Phím mũi tên · Home/End</small></div>;
}
