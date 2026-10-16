export default function OcrReviewDay({busy,status,legend,children}) {
  return <fieldset className="menu-day" data-status={status} disabled={busy}><legend>{legend}</legend><div className="ocr-day-fields">{children}</div></fieldset>;
}
