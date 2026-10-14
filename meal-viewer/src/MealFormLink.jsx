export default function MealFormLink({ formUrl, status, label = 'Chọn món', dates = '' }) {
  return formUrl
    ? <a className={`form-link meal-form-link ${status}`} href={formUrl} target="_blank" rel="noopener noreferrer"><span>{label}</span>{dates && <small>{dates}</small>}</a>
    : <span className="form-link meal-form-link disabled" aria-disabled="true">Form chưa sẵn sàng</span>;
}
