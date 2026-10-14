export const sampleWeekKey='2026-10-12_2026-10-13_2026-10-14_2026-10-15_2026-10-16';
export const sampleDays=['12','13','14','15','16'].map((day,i)=>({day:`Thứ ${i+2} (${day}/10/2026)`,meals:['CƠM GÀ HẢI NAM','BÚN BÒ HUẾ']}));
export const sampleWeeks=[{weekKey:sampleWeekKey,name:'Tuần 12/10/2026 - 16/10/2026',responseCount:2,formStatus:'closed',lockAt:'2026-10-12T00:00:00+07:00',formUrl:'https://docs.google.com/forms/d/e/synthetic/viewform',spreadsheetUrl:'https://docs.google.com/spreadsheets/d/synthetic/edit'}];
export const sampleOverview={accountId:'storybook-owner',email:'admin@example.com',role:'owner',permissions:{view:true,create:true,manageResponses:true},weeks:sampleWeeks,members:[],allowedEmails:[]};
export const sampleViewer={days:sampleDays,headers:['Thời điểm','Họ tên',...sampleDays.map(day=>day.day)],rows:[['08/10/2026 20:59:00','Trường An',...sampleDays.map(()=>sampleDays[0].meals[0])],['08/10/2026 20:58:00','Minh Anh',...sampleDays.map(()=>sampleDays[0].meals[1])]]};

// Development fixture only: no call to /api is forwarded to a live service.
export function installProductionFixtures(){
  const originalFetch=window.fetch,originalNow=Date.now;
  Date.now=()=>Date.parse('2026-10-14T04:00:00Z');
  window.fetch=async(input,options)=>{
    const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,location.origin);
    if(!url.pathname.startsWith('/api/'))return originalFetch(input,options);
    let data;
    if(url.pathname==='/api/branding')data={schoolName:'Trường minh họa',logoUrl:'',primaryColor:'#357185'};
    else if(url.pathname==='/api/session')data={authenticated:true};
    else if(url.pathname==='/api/history')data={weeks:[{weekKey:'2026-09-28_2026-10-02',name:'Tuần 28/09/2026 - 02/10/2026',startDate:'2026-09-28',endDate:'2026-10-02'}]};
    else if(url.pathname==='/api/dashboard'){
      if(options?.method&&options.method!=='GET')return new Response(JSON.stringify({error:'Storybook chỉ minh họa, không gửi thao tác đến hệ thống thật.'}),{status:400,headers:{'Content-Type':'application/json'}});
      if(url.searchParams.has('notice'))data={notice:{text:'',endsOn:'',updatedAt:0}};
      else if(url.searchParams.has('week'))data={week:{...sampleWeeks[0],dayLabels:sampleDays.map(day=>day.day)},responseCount:2,responseIds:['sample-a','sample-b'],responses:sampleViewer.rows.map((row,i)=>({responseId:i?'sample-b':'sample-a',name:row[1],timestamp:Date.parse('2026-10-08T13:59:00Z')-i*60000,meals:row.slice(2),deletable:false,note:'Dữ liệu minh họa chỉ xem'})),history:[]};
      else data=sampleOverview;
    }else data={error:'Chức năng dịch vụ không chạy trong Storybook.'};
    return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
  };
  return()=>{window.fetch=originalFetch;Date.now=originalNow;};
}
