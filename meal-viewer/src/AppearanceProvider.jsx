import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {readAppearance,resolveAppearance,writeAppearance} from './appearance.mjs';
import './appearance.css';
const Appearance=createContext({theme:'system',motion:'full',scheme:'light',setPreference(){}});
export const useAppearance=()=>useContext(Appearance);
export default function AppearanceProvider({children}){
  const [preference,setPreferenceState]=useState(readAppearance);
  const media=useMemo(()=>({dark:window.matchMedia('(prefers-color-scheme: dark)'),reduced:window.matchMedia('(prefers-reduced-motion: reduce)')}),[]);
  const [system,setSystem]=useState(()=>({dark:media.dark.matches,reduced:media.reduced.matches}));
  useEffect(()=>{const sync=()=>setSystem({dark:media.dark.matches,reduced:media.reduced.matches});media.dark.addEventListener('change',sync);media.reduced.addEventListener('change',sync);return()=>{media.dark.removeEventListener('change',sync);media.reduced.removeEventListener('change',sync);};},[media]);
  const resolved=resolveAppearance(preference,system.dark,system.reduced);
  useEffect(()=>{writeAppearance(preference);},[preference]);
  useEffect(()=>{
    const root=document.documentElement;root.dataset.colorScheme=resolved.scheme;root.dataset.motionLevel=resolved.motion;
    if(resolved.motion==='off')delete root.dataset.motionOverride;else root.dataset.motionOverride='full';
    window.dispatchEvent(new Event('meal-appearance-changed'));
  },[resolved.scheme,resolved.motion]);
  return <Appearance.Provider value={{...resolved,theme:preference.theme,setPreference:patch=>setPreferenceState(old=>({...old,...patch}))}}>{children}</Appearance.Provider>;
}
