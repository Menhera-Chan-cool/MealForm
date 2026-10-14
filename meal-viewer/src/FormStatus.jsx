const labels = {
  open: { full: 'Form đang mở' },
  closed: { full: 'Form đã đóng' }
};

export default function FormStatus({ status }) {
  const copy = labels[status];
  if (!copy) return <div className="form-status loading" role="status" aria-live="polite" aria-label="Đang kiểm tra Form">
    <span className="form-status-spinner" aria-hidden="true" />
    <span>Đang kiểm tra Form</span>
  </div>;

  return <div className={`form-status ${status}`} role="status" aria-live="polite" aria-label={copy.full}>
    <span key={status} className={`form-status-sequence ${status}`} aria-hidden="true">
      {status === 'closed' ? <ClosedCrossAnimation /> : <FaxTransmissionAnimation />}
      <span className="form-status-message">{copy.full}</span>
    </span>
  </div>;
}

function ClosedCrossAnimation() {
  return <svg className="form-status-animation closed-cross-animation" viewBox="0 0 40 40" focusable="false">
    <path className="closed-cross-line first" d="M10 10 30 30" />
    <path className="closed-cross-line second" d="M30 10 10 30" />
  </svg>;
}

function FaxTransmissionAnimation() {
  return <svg className="form-status-animation fax-animation" viewBox="0 0 64 64" focusable="false">
    <defs>
      <linearGradient id="fax-success-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4f7fc7" />
        <stop offset="1" stopColor="#47b8b6" />
      </linearGradient>
    </defs>
    <g className="fax-document" fill="none" stroke="#4f7fc7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
      <rect x="14" y="6" width="36" height="48" rx="1" />
      <path d="M19 17h7M19 25h26M19 33h15M39 33h6M19 41h23" />
    </g>
    <g className="fax-envelope-open" fill="none" stroke="#4f7fc7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
      <path d="M10 27 32 13l22 14v27H10z" />
      <path d="m10 28 22 17 22-17" />
    </g>
    <g className="fax-envelope-closed" fill="none" stroke="#4f7fc7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
      <rect x="10" y="18" width="44" height="32" rx="2" />
      <path d="m12 22 20 17 20-17" />
    </g>
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5">
      <circle className="fax-success-ring" cx="32" cy="32" r="23" stroke="url(#fax-success-gradient)" />
      <path className="fax-success-smile" d="M21 32q11 13 22 0" stroke="#4f7fc7" />
      <path className="fax-success-check" d="m20 33 9 8 17-20" stroke="#4f7fc7" />
    </g>
  </svg>;
}
