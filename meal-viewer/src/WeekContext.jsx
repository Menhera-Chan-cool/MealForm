import {archiveBackHref,archiveMetadata} from './ui-clarity.mjs';
import {weekRange} from './ui-model.mjs';
import {Badge} from './components/ui/badge.jsx';

export function ArchiveBreadcrumbs({weekKey='',month='',view='list',status='all'}) {
  const params=new URLSearchParams();if(/^\d{4}-\d{2}$/.test(month)){params.set('month',month);if(view==='calendar')params.set('layout','calendar');}if(['open','closed','unknown'].includes(status))params.set('status',status);
  const back=weekKey?archiveBackHref(weekKey,window.location.search):'/history'+(params.size?'?'+params:'');
  const contextMonth=new URLSearchParams(back.split('?')[1]).get('month');
  const range=weekRange({weekKey});
  return <nav className="context-breadcrumbs" aria-label="Đường dẫn ngữ cảnh"><ol><li><a href="/history" aria-current={!weekKey&&!contextMonth?'page':undefined}>Kho tuần</a></li>{contextMonth&&<li><a href={back} aria-current={!weekKey?'page':undefined}>Tháng {contextMonth.slice(5)}/{contextMonth.slice(0,4)}</a></li>}{weekKey&&<li><span aria-current="page">{range?`Tuần ${range.start.split('-').reverse().join('/')} – ${range.end.split('-').reverse().join('/')}`:'Tuần đang xem'}</span></li>}</ol></nav>;
}
export function ArchiveWeekMetadata({week}) {
  const values=archiveMetadata(week);
  return <span className="archive-week-metadata"><Badge variant="secondary">{values.count}</Badge><Badge variant="secondary">{values.status}</Badge></span>;
}
