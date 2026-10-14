import {ArrowUpRight} from 'lucide-react';
export default function ExternalLink({children,...props}) {
  return <a {...props} target="_blank" rel="noopener noreferrer" title={props.title||'Mở tab mới'}>{children}<ArrowUpRight className="external-link-icon" size={15} aria-hidden="true"/></a>;
}
