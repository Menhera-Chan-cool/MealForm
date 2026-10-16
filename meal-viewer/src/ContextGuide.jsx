import {useEffect,useLayoutEffect,useRef,useState} from 'react';

const guides={
  overview:[['.ui-overview h2','Tổng quan theo dữ liệu đã tải','Cần xử lý chỉ dựa trên kết quả đúng tuần đã tải, không tự kiểm tra thêm.'],['.ui-overview .dashboard-section-title','Sổ tuần','Tải lại khi cần dữ liệu mới; xem thông tin tuần trước khi mở.'],['.ui-current-weeks','Tuần này và tuần sau','Hai tuần có phạm vi riêng. Mở đúng tuần để xem lượt gửi hoặc điều khiển Form.']],
  create:[['.dashboard-panel h2','Chuẩn bị thực đơn','Chọn ảnh hoặc dán bảng. Các công cụ chỉ sửa nháp cho đến khi bạn tạo tuần.'],['.image-upload-target','Ảnh nguồn','Chọn, dán hoặc thả ảnh; đọc OCR không tự tạo tuần.'],['#ocr-date-0','Ngày và món','Đối chiếu từng ngày, xem thay đổi và mô phỏng trước khi tạo.'],['.menu-review button[type=submit]','Tạo tuần','Chỉ bấm khi đã kiểm tra. Ngày/món và tuần trùng vẫn được kiểm tra.'],['.draft-transfer','Nhập bảng hoặc chuyển món','Các thay đổi đều có xem trước và có thể hoàn tác.']],
  delete:[['.dashboard-panel h2','Đúng tuần trước khi thao tác','Lượt gửi và lịch sử luôn thuộc tuần đang chọn.'],['.dashboard-week-picker','Chọn tuần','Có thể tìm theo ngày/tháng, xem số lượt và trạng thái đã tải.'],['[data-response-id]','Xem trước khi xử lý','Xem nhanh chỉ đọc. Xóa và khôi phục vẫn cần xác nhận đúng bản ghi.'],['.workspace-toolbar','Cách xem bảng','Chọn cột, chỉnh độ rộng hoặc phóng rộng; không sửa dữ liệu.']],
  branding:[['.dashboard-panel h2','Thương hiệu công khai','Thay đổi tên, logo và màu của trường.'],['#brand-school-name','Giá trị đang sửa','Sửa nháp không tự áp dụng. Có thể dùng lại từng giá trị đã lưu.'],['.branding-context-preview','Xem trước','Đối chiếu theo thiết bị và giao diện trước khi xác nhận lưu.']],
  notice:[['.dashboard-panel h2','Thông báo đúng tuần','Thông báo là nội dung công khai. Không ghi thông tin học sinh hay khóa bí mật.'],['.dashboard-week-picker','Chọn tuần','Kiểm tra tuần trước khi sửa thông báo.'],['.week-notice-editor textarea','Nội dung và hạn','Chọn hạn hiển thị. Thanh Lưu chỉ xuất hiện khi có thay đổi.']],
};
export default function ContextGuide({tab,disabled}){
  const trigger=useRef(null),panel=useRef(null),[steps,setSteps]=useState([]),[index,setIndex]=useState(0);
  const open=steps.length>0;
  function close(){setSteps([]);if(trigger.current?.isConnected)trigger.current.focus({preventScroll:true});}
  function show(){if(disabled||document.querySelector('dialog:modal'))return;const root=document.getElementById('dashboard-content'),items=guides[tab]||[['.dashboard-panel h2','Mục đang mở','Các thao tác áp dụng theo quyền của tài khoản hiện tại.'],['.dashboard-week-picker','Phạm vi tuần','Kiểm tra tuần trước khi đọc hoặc thay đổi dữ liệu.'],['.dashboard-panel p','Thông tin và hướng dẫn','Mở trợ giúp tại từng trường nếu cần; hướng dẫn không tự chạy thao tác.'],['.dashboard-panel button','Hành động tại mục này','Đọc nhãn và giải thích trước khi bấm; thao tác ghi giữ nguyên bước xác nhận.']];setSteps(items.map(([selector,title,text])=>({node:root?.querySelector(selector),title,text})).filter(item=>item.node?.checkVisibility()).slice(0,4));setIndex(0);}
  useEffect(()=>{setSteps([]);},[tab]);
  useEffect(()=>{if(disabled)setSteps([]);},[disabled]);
  useLayoutEffect(()=>{
    if(!open)return;
    const node=steps[index]?.node,box=panel.current;if(!node?.isConnected){close();return;}
    node.setAttribute('data-guide-target','');node.scrollIntoView({block:'center',behavior:'instant'});box.showPopover();
    let frame;const position=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(!node.isConnected)return;const rect=node.getBoundingClientRect(),height=box.getBoundingClientRect().height,width=box.getBoundingClientRect().width;box.style.left=Math.max(12,Math.min(rect.left,innerWidth-width-12))+'px';box.style.top=Math.max(12,Math.min(rect.bottom+8+height<=innerHeight-12?rect.bottom+8:rect.top-height-8,innerHeight-height-12))+'px';});};
    position();box.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
    const escape=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}},outside=event=>{if(!box.contains(event.target)&&!trigger.current?.contains(event.target))setSteps([]);};
    document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);window.addEventListener('resize',position);window.addEventListener('scroll',position,true);
    return()=>{cancelAnimationFrame(frame);node.removeAttribute('data-guide-target');box.hidePopover();document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);};
  },[open,index]);
  return <><button ref={trigger} type="button" className="secondary" disabled={disabled} onClick={show}>Hướng dẫn mục này</button>{open&&<div ref={panel} popover="manual" className="context-guide meal-ui" role="dialog" aria-label="Hướng dẫn mục hiện tại"><small>{index+1} / {steps.length}</small><h3>{steps[index].title}</h3><p>{steps[index].text}</p><div className="actions"><button type="button" className="secondary" disabled={!index} onClick={()=>setIndex(value=>value-1)}>Trước</button><button type="button" onClick={()=>index===steps.length-1?close():setIndex(value=>value+1)}>{index===steps.length-1?'Xong':'Tiếp'}</button><button type="button" className="secondary" onClick={close}>Bỏ qua / Đóng</button></div></div>}</>;
}
