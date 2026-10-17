import {useEffect} from 'react';
const fallback='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#087f5b"/><path d="M7 23V9l9 9 9-9v14" fill="none" stroke="white" stroke-width="3"/></svg>');
export default function BrandFavicon({logoUrl}){
  useEffect(()=>{
    let active=true;const link=document.createElement('link');link.rel='icon';link.href=fallback;link.referrerPolicy='no-referrer';document.head.append(link);
    const image=new Image();image.referrerPolicy='no-referrer';image.onload=()=>{if(active)link.href=logoUrl;};image.onerror=()=>{if(active)link.href=fallback;};if(logoUrl)image.src=logoUrl;
    return()=>{active=false;image.onload=null;image.onerror=null;link.remove();};
  },[logoUrl]);
  return null;
}
