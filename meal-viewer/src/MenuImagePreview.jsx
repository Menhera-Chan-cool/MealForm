import { useEffect, useId, useRef, useState } from 'react';
import ImageMinimap from './ImageMinimap.jsx';
import SourceFilename from './SourceFilename.jsx';

export default function MenuImagePreview({ src, name, onRegion, regionDisabled,sourceRef,sourceDetailsRef }) {
  const [zoom, setZoom] = useState(100);
  const id = useId();
  const dialog = useRef(null);
  const inlineViewport = useRef(null);
  const fullViewport = useRef(null);
  const drag=useRef(null),[panning,setPanning]=useState(false);
  function stopPan(){const current=drag.current;drag.current=null;setPanning(false);if(current?.node.hasPointerCapture(current.id))current.node.releasePointerCapture(current.id);}
  useEffect(()=>{stopPan();},[src,zoom]);

  function fitImage() {
    stopPan();
    setZoom(100);
    inlineViewport.current?.scrollTo(0, 0);
    fullViewport.current?.scrollTo(0, 0);
  }
  useEffect(() => { fitImage(); dialog.current?.close(); }, [src]);

  function controls(fullscreen = false) {
    const rangeId = `${id}-${fullscreen ? 'full' : 'inline'}`;
    return <div className="menu-image-controls">
      <button type="button" className="secondary" aria-label="Thu nhỏ ảnh" disabled={zoom <= 100} onClick={() => setZoom(value => Math.max(100, value - 25))}>−</button>
      <button type="button" className="secondary" aria-label="Phóng to ảnh" disabled={zoom >= 400} onClick={() => setZoom(value => Math.min(400, value + 25))}>+</button>
      <button type="button" className="secondary" onClick={fitImage}>Vừa khung</button>
      {!fullscreen && <button type="button" className="secondary" onClick={() => { if (!dialog.current.open) dialog.current.showModal(); }}>Mở ảnh lớn</button>}
      {!fullscreen && onRegion && <button type="button" className="secondary" disabled={regionDisabled} onClick={onRegion}>Đọc lại vùng ảnh</button>}
      <div className="menu-image-zoom">
        <label htmlFor={rangeId}>Độ phóng ảnh</label>
        <input id={rangeId} type="range" min="100" max="400" step="25" value={zoom} onChange={event => setZoom(Number(event.target.value))} />
        <output aria-live="polite">{zoom}%</output>
      </div>
    </div>;
  }

  function canvas(fullscreen = false) {
    const viewport=fullscreen?fullViewport:inlineViewport;
    return <div className="menu-image-stage"><div className="menu-image-viewport" ref={viewport} role="region" tabIndex="0" data-zoomed={zoom>100} data-panning={panning&&drag.current?.node===viewport.current} aria-label="Ảnh thực đơn, dùng thanh cuộn hoặc kéo chuột để di chuyển khi phóng to"
      onPointerDown={event=>{const node=event.currentTarget,box=node.getBoundingClientRect();if(zoom<=100||event.pointerType!=='mouse'||event.button!==0||event.clientX>=box.left+node.clientWidth||event.clientY>=box.top+node.clientHeight)return;event.preventDefault();node.focus({preventScroll:true});node.setPointerCapture(event.pointerId);drag.current={node,id:event.pointerId,x:event.clientX,y:event.clientY,left:node.scrollLeft,top:node.scrollTop};setPanning(true);}}
      onPointerMove={event=>{const current=drag.current;if(current?.id===event.pointerId&&current.node===event.currentTarget)current.node.scrollTo(current.left+current.x-event.clientX,current.top+current.y-event.clientY);}}
      onPointerUp={stopPan} onPointerCancel={stopPan} onLostPointerCapture={stopPan} onKeyDown={event=>{if(event.key==='Escape'&&drag.current){event.preventDefault();stopPan();}}}>
      <img src={src} alt="Ảnh gốc thực đơn để đối chiếu món và ngày" draggable="false" style={{ width: `${zoom}%` }} />
    </div><ImageMinimap src={src} zoom={zoom} viewport={viewport}/></div>;
  }

  return <aside className="menu-image-pane" aria-label="Đối chiếu ảnh thực đơn">
    <h3>Ảnh gốc</h3><div className="image-source-slot" ref={sourceRef}/>
    {controls()}
    {canvas()}
    <div className="menu-image-filename"><SourceFilename name={name}/></div><div className="image-source-details-slot" ref={sourceDetailsRef}/>
    <p className="menu-image-hint">Phóng to rồi cuộn hoặc giữ chuột kéo ảnh. Bản đồ nhỏ và thao tác cuộn cảm ứng vẫn dùng được.</p>
    <dialog ref={dialog} className="menu-image-dialog" aria-labelledby={`${id}-title`} onClose={stopPan}>
      <div className="menu-image-dialog-header"><h2 id={`${id}-title`}>Ảnh gốc thực đơn</h2><button type="button" className="secondary" onClick={() => dialog.current.close()}>Đóng ảnh</button></div>
      {controls(true)}
      {canvas(true)}
    </dialog>
  </aside>;
}
