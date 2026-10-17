import {sendTimeRange} from './dashboard-nine.mjs';
export default function SubmissionFilters({value,onChange}){
  const error=sendTimeRange(value).error;
  return <div className="submission-filters">
    <label>Kiểu khớp tên<select aria-label="Kiểu khớp tên" value={value.nameMatch||'contains'} onChange={event=>onChange({nameMatch:event.target.value})}><option value="contains">Tên chứa từ khóa</option><option value="exact">Khớp toàn bộ họ tên</option></select></label>
    <label>Thời điểm gửi đăng ký<select aria-label="Thời điểm gửi đăng ký" value={value.sentPreset||'all'} onChange={event=>onChange({sentPreset:event.target.value})}><option value="all">Mọi thời điểm</option><option value="today">Hôm nay</option><option value="yesterday">Hôm qua</option><option value="custom">Khoảng ngày giờ</option></select></label>
    {value.sentPreset==='custom'&&<><label>Gửi từ — giờ Việt Nam<input type="datetime-local" aria-invalid={Boolean(error)} value={value.sentFrom||''} onChange={event=>onChange({sentFrom:event.target.value})}/></label><label>Gửi đến — giờ Việt Nam<input type="datetime-local" aria-invalid={Boolean(error)} value={value.sentTo||''} onChange={event=>onChange({sentTo:event.target.value})}/></label></>}
    <small>Ngày gửi đăng ký, không phải ngày phục vụ món. UTC+7; mốc đến bao gồm cả phút đã chọn. Tìm tên chỉ lọc hiển thị, không xác định lượt để xóa.</small>{error&&<p className="menu-inline-error" role="alert">{error}</p>}
  </div>;
}
