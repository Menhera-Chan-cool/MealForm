import { useEffect, useId, useRef, useState } from 'react';

export default function MenuImagePreview({ src, name, onRegion, regionDisabled }) {
  const [zoom, setZoom] = useState(100);
  const id = useId();
  const dialog = useRef(null);
  const inlineViewport = useRef(null);
  const fullViewport = useRef(null);

  function fitImage() {
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
    return <div className="menu-image-viewport" ref={fullscreen ? fullViewport : inlineViewport} role="region" tabIndex="0" aria-label="Ảnh thực đơn, dùng thanh cuộn để di chuyển khi phóng to">
      <img src={src} alt="Ảnh gốc thực đơn để đối chiếu món và ngày" draggable="false" style={{ width: `${zoom}%` }} />
    </div>;
  }

  return <aside className="menu-image-pane" aria-label="Đối chiếu ảnh thực đơn">
    <h3>Ảnh gốc</h3>
    {controls()}
    {canvas()}
    <p className="menu-image-filename">{name}</p>
    <p className="menu-image-hint">Phóng to rồi cuộn ảnh để đối chiếu ngày và món đang sửa.</p>
    <dialog ref={dialog} className="menu-image-dialog" aria-labelledby={`${id}-title`}>
      <div className="menu-image-dialog-header"><h2 id={`${id}-title`}>Ảnh gốc thực đơn</h2><button type="button" className="secondary" onClick={() => dialog.current.close()}>Đóng ảnh</button></div>
      {controls(true)}
      {canvas(true)}
    </dialog>
  </aside>;
}
