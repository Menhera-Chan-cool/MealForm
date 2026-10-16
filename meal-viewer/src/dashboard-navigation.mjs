export function readDashboardLocation(search,tabs,weeks,fallback){
  const params=new URLSearchParams(search),tab=params.get('tab'),week=params.get('week');
  return {tab:tabs.includes(tab)?tab:fallback.tab,week:weeks.some(item=>item.weekKey===week)?week:fallback.week};
}
export function dashboardHref(tab,week){const params=new URLSearchParams({tab});if(week)params.set('week',week);return '/dashboard?'+params;}
export function readDashboardHistory(value,account,now=Date.now()){
  return value?.account===account&&Number.isSafeInteger(value.index)&&value.index>=0&&Number.isFinite(value.at)&&now>=value.at&&now-value.at<86400000?value:null;
}
