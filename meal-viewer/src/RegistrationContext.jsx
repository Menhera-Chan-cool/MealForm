import MealFormLink from './MealFormLink.jsx';
import FormStatus from './FormStatus.jsx';

export default function RegistrationContext({dates,status,registration}) {
  return <div className="registration-contexts">
    <div className="form-context" role="group" aria-label="Form tuần đang xem">
      <div className="form-context-heading"><strong>Tuần đang xem</strong>{dates&&<span>{dates}</span>}</div>
      <div className="form-context-actions">{!registration.isNext&&<MealFormLink {...registration}/>}<FormStatus status={status}/></div>
    </div>
    {registration.isNext&&<div className="form-context" role="group" aria-label="Form đăng ký tuần sau">
      <div className="form-context-heading"><strong>Đăng ký cho tuần sau</strong><span>{registration.dates||'Chưa đọc được ngày đăng ký'}</span></div>
      <div className="form-context-actions"><MealFormLink {...registration} dates=""/><FormStatus status={registration.status}/></div>
    </div>}
  </div>;
}
