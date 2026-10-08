export default function MealFormLink({ formUrl, status, label = 'Chọn món', dates = '' }) {
  return formUrl
    ? <a className={`form-link meal-form-link ${status}`} href={formUrl} target="_blank" rel="noopener noreferrer"><span>{label}</span>{dates && <small>{dates}</small>}</a>
    : <span className="form-link disabled">Form chưa sẵn sàng</span>;
}
