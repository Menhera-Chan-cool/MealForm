export default function ChevronIcon({ expanded = false, className = '' }) {
  return <svg
    className={`chevron-icon${expanded ? ' expanded' : ''}${className ? ` ${className}` : ''}`}
    viewBox="0 0 24 24" aria-hidden="true" focusable="false"
  ><path d="m7 10 5 5 5-5" /></svg>;
}
