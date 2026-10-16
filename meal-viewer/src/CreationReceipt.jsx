import ExternalLink from './ExternalLink.jsx';
import {mealRegistrationTarget} from './viewer-model.mjs';

export default function CreationReceipt({week,onResponses,onNew}){
  if(!week)return null;
  const form=mealRegistrationTarget({formUrl:week.responseUrl||week.formUrl}).formUrl;
  const sheet=/^https:\/\/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]+(?:\/|$)/.test(week.spreadsheetUrl||'')?week.spreadsheetUrl:'';
  const folder=/^https:\/\/drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?)?folders\//.test(week.weekFolderUrl||week.folderUrl||'')?week.weekFolderUrl||week.folderUrl:'';
  return <section className="creation-receipt" role="region" aria-label="Kết quả tạo tuần">
    <h3>{week.alreadyExists?'Đã tìm lại tuần hiện có':'Đã tạo tuần'}</h3><p><strong>{week.weekFolderName||week.name}</strong></p>
    <label>Mã tuần (chỉ đọc)<input readOnly value={week.weekKey} aria-label="Mã tuần vừa tạo" onFocus={event=>event.target.select()}/></label>
    <div className="dashboard-links">{form&&<ExternalLink href={form}>Mở Form</ExternalLink>}{sheet&&<ExternalLink href={sheet}>Mở Sheet</ExternalLink>}{folder&&<ExternalLink href={folder}>Mở thư mục</ExternalLink>}</div>
    {(!form||!sheet)&&<p>Chưa nhận đủ liên kết. Kiểm tra Sổ tuần; không bấm tạo lại chỉ vì thiếu liên kết hiển thị.</p>}
    <p>Bước tiếp theo: mở Form/Sheet để kiểm tra tuần vừa xử lý. Không có lượt đăng ký nào được gửi tự động.</p>
    <div className="actions">{week.registered&&<button type="button" className="secondary" onClick={()=>onResponses(week.weekKey)}>Xem lượt gửi tuần này</button>}<button type="button" className="secondary" onClick={onNew}>Tạo tuần khác</button></div>
  </section>;
}
