import FieldHelp from './FieldHelp.jsx';

/** @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & {reason?:string,label?:string}} props */
export default function ExplainedButton({disabled=false,reason='',label='',children,...props}){
  const name=label||props['aria-label']||(typeof children==='string'?children:'thao tác này');
  return <span className="explained-action"><button {...props} disabled={disabled}>{children}</button>{disabled&&<FieldHelp label={`vì sao ${name} bị khóa`}>{reason||'Thao tác tạm khóa theo trạng thái hiện tại. Hãy chờ yêu cầu đang chạy hoàn tất.'}</FieldHelp>}</span>;
}
