import ExternalLink from './ExternalLink.jsx';
export default function MealFormLink({ formUrl, status, label = 'Chọn món', dates = '' }) {
  return formUrl
    ? <ExternalLink className={`form-link meal-form-link ${status}`} href={formUrl}><span>{label}</span>{dates && <small>{dates}</small>}</ExternalLink>
    : <span className="form-link meal-form-link disabled" aria-disabled="true">Form chưa sẵn sàng</span>;
}
