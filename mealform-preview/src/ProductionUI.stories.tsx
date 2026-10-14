import {useEffect,useRef,useState} from 'react';
import type {Meta,StoryObj} from '@storybook/react-vite';
import Dashboard from '../../meal-viewer/src/Dashboard.jsx';
import AppearanceProvider from '../../meal-viewer/src/AppearanceProvider.jsx';
import BrandingProvider from '../../meal-viewer/src/BrandingProvider.jsx';
import ComfortProvider from '../../meal-viewer/src/ComfortProvider.jsx';
import ViewerSummary from '../../meal-viewer/src/ViewerSummary.jsx';
import DetailTable from '../../meal-viewer/src/DetailTable.jsx';
import FilterControls from '../../meal-viewer/src/FilterControls.jsx';
import {buildDetailModel,readViewerFilters} from '../../meal-viewer/src/viewer-model.mjs';
import {sampleDays,sampleOverview,sampleViewer,installProductionFixtures} from './production-fixtures.mjs';
import '../../meal-viewer/src/styles.css';
import '../../meal-viewer/src/mobile-cards.css';
import '../../meal-viewer/src/branding.css';
import '../../meal-viewer/src/production-ui.css';
import '../../meal-viewer/src/motion.css';

function ProductionSurface({section='Tổng quan',viewer=false}:{section?:string;viewer?:boolean}){
  const root=useRef<HTMLDivElement>(null),[filters,setFilters]=useState(readViewerFilters(''));
  useEffect(()=>{const frame=requestAnimationFrame(()=>{[...root.current!.querySelectorAll<HTMLButtonElement>('.ui-sidebar nav button')].find(button=>button.textContent===section)?.click();});return()=>cancelAnimationFrame(frame);},[section]);
  return <div ref={root}><p style={{padding:16}}>Dữ liệu minh họa · Không kết nối production</p><AppearanceProvider><BrandingProvider><ComfortProvider>{viewer?<main className="meal-ui ui-viewer"><h1>Thực đơn tuần này</h1><p>12/10/2026 – 16/10/2026</p><FilterControls days={sampleDays} nameOptions={['Trường An','Minh Anh']} mealOptions={sampleDays[0].meals} filters={filters} onChange={(key:string,value:string)=>setFilters(old=>({...old,[key]:value}))}/><h2>Tổng hợp lựa chọn</h2><ViewerSummary days={sampleDays} filters={filters} model={buildDetailModel(sampleViewer,filters)}/><h2>Chi tiết lựa chọn</h2><DetailTable model={buildDetailModel(sampleViewer,filters)}/></main>:<Dashboard initialData={sampleOverview} onSignOut={async()=>{}} onUnauthorized={()=>{}}/>}</ComfortProvider></BrandingProvider></AppearanceProvider></div>;
}

const meta={title:'MealForm/Production UI',component:ProductionSurface,beforeEach:async({globals})=>{localStorage.setItem('meal-appearance',JSON.stringify({theme:globals.theme==='dark'?'dark':'light',motion:'off'}));localStorage.removeItem('meal-dashboard-cache-v1:storybook-owner:last');return installProductionFixtures();},render:(args,context)=><ProductionSurface key={`${context.globals.theme}-${args.section}`} {...args}/>,parameters:{chromatic:{viewports:[390,1440]},design:{type:'link',name:'Viewer Figma',url:'https://www.figma.com/design/W0eib9OIk99Ia0fweyf09e?node-id=12-2345'}}} satisfies Meta<typeof ProductionSurface>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Overview:Story={};
export const OCR:Story={args:{section:'Tạo tuần bằng OCR'}};
export const Responses:Story={args:{section:'Lượt gửi & lịch sử'}};
export const FormControl:Story={args:{section:'Điều khiển Form'}};
export const WeekNotice:Story={args:{section:'Thông báo tuần'}};
export const Reconciliation:Story={args:{section:'Đối soát'}};
export const Branding:Story={args:{section:'Thương hiệu'}};
export const System:Story={args:{section:'Hệ thống'}};
export const Access:Story={args:{section:'Quyền Gmail'}};
export const Viewer:Story={args:{viewer:true}};
export const MobileDark:Story={globals:{theme:'dark',viewport:{value:'phone',isRotated:false}}};
