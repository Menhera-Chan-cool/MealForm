import {useEffect,useRef,useState} from 'react';
import {appWorker} from './app-platform.mjs';
export default function InstallApp(){
  const deferred=useRef(null),[guide,setGuide]=useState(false),[status,setStatus]=useState(''),[working,setWorking]=useState(false),[installed,setInstalled]=useState(()=>Boolean(navigator.standalone||window.matchMedia('(display-mode: standalone)').matches));
  useEffect(()=>{
    let link=document.querySelector('link[rel=manifest]');if(!link){link=document.createElement('link');link.rel='manifest';document.head.append(link);}
    link.setAttribute('href',/^\/dashboard\/?$/.test(location.pathname)?'/dashboard.webmanifest':'/viewer.webmanifest');
    void appWorker().catch(()=>{});
    const available=event=>{event.preventDefault();deferred.current=event;},complete=()=>{deferred.current=null;setInstalled(true);setStatus('Trình duyệt đã xác nhận cài ứng dụng.');};
    window.addEventListener('beforeinstallprompt',available);window.addEventListener('appinstalled',complete);
    return()=>{deferred.current=null;window.removeEventListener('beforeinstallprompt',available);window.removeEventListener('appinstalled',complete);};
  },[]);
  async function install(){
    if(working)return;setGuide(true);
    if(installed){setStatus('Đang mở ở chế độ ứng dụng hoặc trình duyệt đã xác nhận cài.');return;}
    const prompt=deferred.current;if(!prompt){setStatus('Dùng menu trình duyệt theo hướng dẫn dưới đây nếu chưa có lời mời cài.');return;}
    deferred.current=null;setWorking(true);
    try{await prompt.prompt();const choice=await prompt.userChoice;setStatus(choice?.outcome==='accepted'?'Đã gửi yêu cầu cài. Chờ trình duyệt hoàn tất.':'Chưa cài ứng dụng; bạn có thể thử lại từ menu trình duyệt.');}
    catch{setStatus('Chưa mở được cửa sổ cài. Hãy dùng menu trình duyệt.');}
    finally{setWorking(false);}
  }
  return <div className="install-app"><button type="button" className="secondary" disabled={working} onClick={()=>void install()}>Cài MealForm</button>{status&&<p role="status" aria-label="Trạng thái cài ứng dụng">{status}</p>}{guide&&<section role="region" aria-label="Cài MealForm trên thiết bị"><h3>Thêm vào màn hình chính</h3><p>iPhone/iPad: mở bằng Safari, chọn Chia sẻ → Thêm vào màn hình chính. Android: mở menu trình duyệt → Cài ứng dụng hoặc Thêm vào màn hình chính. Trên PC, tìm nút Cài ứng dụng trên thanh địa chỉ hoặc menu.</p><p>Mở tại Viewer để cài bản Thực đơn, hoặc tại Dashboard để cài bản Quản trị. Đây là biểu tượng MealForm chung; thương hiệu của trường vẫn hiện trong web.</p><p>Không hỗ trợ dùng offline; không đồng bộ nháp giữa thiết bị hoặc các bản cài. Một số trình duyệt tách nơi lưu nên có thể cần đăng nhập lại.</p><button type="button" className="secondary" onClick={()=>setGuide(false)}>Ẩn hướng dẫn cài</button></section>}</div>;
}
