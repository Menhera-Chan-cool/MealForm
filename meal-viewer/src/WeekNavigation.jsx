import {ArrowLeft} from 'lucide-react';
import {Button} from './components/ui/button.jsx';
export default function WeekNavigation({current,selected=false,backHref='/history'}) {
  return <><nav className="viewer-navigation ui-week-navigation" aria-label="Các trang">{[['/newest','Tuần này','current'],['/next','Tuần sau','next'],['/history','Kho tuần cũ','history']].map(([href,label,key])=><Button key={href} asChild variant={current===key?'default':'outline'}><a href={href} className={`action-link ${current===key?'ui-selected':''}`} aria-current={current===key?'page':undefined}>{label}</a></Button>)}</nav>{selected&&<Button variant="ghost" asChild><a href={backHref}><ArrowLeft aria-hidden="true" size={18}/>Chọn tuần khác</a></Button>}</>;
}
