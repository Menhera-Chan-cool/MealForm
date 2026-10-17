import { createContext, useContext, useEffect, useState } from 'react';
import { brandingTheme, DEFAULT_BRANDING, normalizeBranding, uiThemeVariables } from './branding.mjs';
import {useAppearance} from './AppearanceProvider.jsx';
import BrandFavicon from './BrandFavicon.jsx';

const BrandingContext = createContext(DEFAULT_BRANDING);
export const useBranding = () => useContext(BrandingContext);

function SchoolBrand({ branding }) {
  const [failedLogo, setFailedLogo] = useState('');
  if (!branding.schoolName && !branding.logoUrl) return null;
  return <div className="school-brand" aria-label="Nhận diện trường">
    {branding.logoUrl&&<span className="school-logo-slot">{failedLogo!==branding.logoUrl&&<img width={36} height={36} src={branding.logoUrl} alt={`Logo ${branding.schoolName}`} referrerPolicy="no-referrer" onError={() => setFailedLogo(branding.logoUrl)}/>}</span>}
    <span>{branding.schoolName}</span>
  </div>;
}

export default function BrandingProvider({ children }) {
  const appearance=useAppearance();
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  useEffect(() => {
    let active = true, updatedSinceRead = false;
    fetch('/api/branding', { cache: 'no-store' }).then(async response => {
      if (response.ok && active) { const data = await response.json(); if (active && !updatedSinceRead) setBranding(normalizeBranding(data)); }
    }).catch(() => { /* Preserve the original presentation when configuration is unavailable. */ });
    const updated = event => { updatedSinceRead=true;setBranding(normalizeBranding(event.detail)); };
    window.addEventListener('meal-branding-changed', updated);
    return () => { active = false; window.removeEventListener('meal-branding-changed', updated); };
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    const custom = branding.schoolName || branding.logoUrl || branding.primaryColor !== DEFAULT_BRANDING.primaryColor;
    const theme = custom || appearance.scheme === 'dark' ? brandingTheme(branding.primaryColor, appearance.scheme) : {};
    const ui = uiThemeVariables(branding.primaryColor, appearance.scheme);
    Object.entries(ui).forEach(([name,value]) => root.style.setProperty(name,value));
    Object.entries(theme).forEach(([name, value]) => root.style.setProperty(`--brand-${name}`, value));
    if (custom) {
      root.dataset.branding = 'true';
    }
    return () => { delete root.dataset.branding; Object.keys(ui).forEach(name => root.style.removeProperty(name)); Object.keys(theme).forEach(name => root.style.removeProperty(`--brand-${name}`)); };
  }, [branding,appearance.scheme]);
  const dashboard = typeof window !== 'undefined' && /^\/dashboard\/?$/.test(window.location.pathname);
  return <BrandingContext.Provider value={branding}><BrandFavicon logoUrl={branding.logoUrl}/>{!dashboard && <SchoolBrand branding={branding} />}{children}</BrandingContext.Provider>;
}
