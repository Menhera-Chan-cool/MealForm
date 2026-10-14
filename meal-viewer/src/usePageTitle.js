import {useEffect} from 'react';
import {useBranding} from './BrandingProvider.jsx';
export default function usePageTitle(title) {
  const branding=useBranding();
  useEffect(()=>{if(title)document.title=title+(branding.schoolName?` | ${branding.schoolName}`:'');},[title,branding.schoolName]);
}
