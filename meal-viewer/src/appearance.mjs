export function readAppearance(storage){
  try{
    storage||=globalThis.localStorage;const value=JSON.parse(storage?.getItem('meal-appearance')||'null');
    return{theme:['light','dark','system'].includes(value?.theme)?value.theme:'system',motion:['full','light','off'].includes(value?.motion)?value.motion:storage?.getItem('meal-viewer-motion-override')==='full'?'full':null};
  }catch{return{theme:'system',motion:null};}
}
export function writeAppearance(value,storage){
  try{storage||=globalThis.localStorage;storage?.setItem('meal-appearance',JSON.stringify({theme:['light','dark','system'].includes(value.theme)?value.theme:'system',motion:['full','light','off'].includes(value.motion)?value.motion:null}));}catch{/* Preferences still apply for this page when storage is denied. */}
}
export function resolveAppearance(value,dark,reduced){return{scheme:value.theme==='dark'||value.theme==='system'&&dark?'dark':'light',motion:value.motion||(reduced?'off':'full')};}
