import {permissionChanges} from './dashboard-nine.mjs';
export default function MemberPermissionsEditor({member,draft,onDraft,onSave,onRemove,disabled}){
  const value=draft||member.permissions,changes=permissionChanges(member.permissions,value),valid=member.permissions?.view===true&&['create','manageResponses'].every(key=>typeof member.permissions?.[key]==='boolean');
  return <li><strong>{member.email}</strong>
    <div className="member-permissions"><span>{valid?'Xem':'Quyền lỗi — tải lại trước khi chỉnh'}</span>{[['create','OCR / tạo tuần'],['manageResponses','Xóa / khôi phục']].map(([key,label])=><label key={key}><input type="checkbox" checked={value?.[key]===true} disabled={disabled||!valid} onChange={event=>onDraft({...value,[key]:event.target.checked})}/>{label}</label>)}</div>
    {changes.length>0&&<p className="permission-diff" role="status">{changes.join(' · ')}. Chưa áp dụng.</p>}
    <div className="actions"><button type="button" disabled={disabled||!valid||!changes.length} onClick={()=>onSave(value)}>Lưu quyền</button><button type="button" className="secondary" disabled={disabled||!changes.length} onClick={()=>onDraft(null)}>Bỏ thay đổi</button><button type="button" className="danger" disabled={disabled} onClick={onRemove}>Gỡ quyền</button></div>
  </li>;
}
