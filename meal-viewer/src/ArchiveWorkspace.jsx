import {useEffect} from 'react';
import HistoryArchive from './HistoryArchive.jsx';
import WeekNavigation from './WeekNavigation.jsx';
import {DisplayPreferencesSlot} from './ComfortProvider.jsx';

export default function ArchiveWorkspace({weekKey='',onUnauthorized,children}){
  const List=weekKey?'aside':'main';
  useEffect(()=>{
    const reload=()=>window.location.reload();
    window.addEventListener('popstate',reload);return()=>window.removeEventListener('popstate',reload);
  },[]);
  function navigate(event){
    const link=event.target.closest('a[href]');
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!link||link.target||link.hasAttribute('download'))return;
    const target=new URL(link.href),current=new URL(window.location.href);
    if(target.origin!==current.origin||target.pathname!=='/history')return;
    const back=new URL(target);back.searchParams.delete('week');
    let saved=window.history.state?.mealArchiveReturn;
    if(target.searchParams.has('week')&&link.closest('.archive-list-pane')){
      saved={href:back.pathname+back.search,top:window.scrollY,listTop:document.querySelector('.archive-list-pane')?.scrollTop||0,week:target.searchParams.get('week'),branch:link.dataset.archiveMonth||'',expanded:[...document.querySelectorAll('.archive-panel details[data-archive-key][open]')].map(node=>node.dataset.archiveKey).slice(0,240)};
      window.history.replaceState({...window.history.state,mealArchiveReturn:saved},'',weekKey?current.pathname+current.search:back.pathname+back.search);
    }
    // Keep UI-only return position on the history entry; modified links remain native.
    event.preventDefault();window.history.pushState({mealArchiveReturn:saved},'',target.pathname+target.search);window.location.reload();
  }
  return <div className="archive-workspace meal-ui" data-selected={Boolean(weekKey)} onClickCapture={navigate}>
    <List className="archive-list-pane" aria-label="Danh sách kho tuần">{!weekKey&&<><header className="viewer-header"><h1>Kho thực đơn tuần cũ</h1><DisplayPreferencesSlot/></header><WeekNavigation current="history"/></>}
      <HistoryArchive selectedWeekKey={weekKey} onUnauthorized={onUnauthorized}/>
    </List>
    {children||<section className="archive-invitation" aria-label="Nội dung tuần đã chọn"><h2>Chọn một tuần để xem</h2><p>Thực đơn và lượt đăng ký của tuần sẽ hiện tại đây.</p></section>}
  </div>;
}
