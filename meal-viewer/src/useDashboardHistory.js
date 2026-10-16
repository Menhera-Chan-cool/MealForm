import {useEffect,useRef} from 'react';
import {dashboardHref,readDashboardHistory,readDashboardLocation} from './dashboard-navigation.mjs';

export default function useDashboardHistory({account,tab,week,tabs,weeks,onNavigate,capture}){
  const current=useRef(null),position=useRef(null),reverting=useRef(false),snapshots=useRef(new Map());
  current.current={account,tab,week,tabs,weeks,onNavigate,capture};
  function write(nextTab,nextWeek,push=false){
    const state={account,index:(position.current?.index||0)+(push?1:0),tab:nextTab,week:nextWeek,at:Date.now()};
    position.current=state;
    history[push?'pushState':'replaceState']({...history.state,mealDashboard:state},'',dashboardHref(nextTab,nextWeek));
  }
  useEffect(()=>{
    snapshots.current.clear();
    position.current=readDashboardHistory(history.state?.mealDashboard,account)||{index:0};
    write(tab,week);
    const pop=event=>{
      if(reverting.current){reverting.current=false;return;}
      const state=current.current,previous=position.current,entry=readDashboardHistory(event.state?.mealDashboard,state.account);
      snapshots.current.set(previous.index,state.capture());
      const target=readDashboardLocation(location.search,state.tabs,state.weeks,{tab:'overview',week:state.weeks[0]?.weekKey||''});
      if(state.onNavigate(target.tab,target.week,entry?snapshots.current.get(entry.index):undefined)){
        position.current=entry||{...previous,...target};
        if(!entry)write(target.tab,target.week);
      }else if(entry&&entry.index!==previous.index){
        reverting.current=true;history.go(previous.index-entry.index);
      }else write(state.tab,state.week);
    };
    window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);
  },[account]);
  useEffect(()=>{if(position.current&&(position.current.tab!==tab||position.current.week!==week))write(tab,week);},[tab,week]);
  // Per-entry filters stay in memory; URLs/history.state carry only location metadata.
  return {push(nextTab,nextWeek){snapshots.current.set(position.current?.index||0,current.current.capture());write(nextTab,nextWeek,true);}};
}
