import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {readAttentionPreferences,writeAttentionPreferences,showOcrNotification,notificationCapability} from './src/app-platform.mjs';
const values=new Map([['other','keep']]),storage={get length(){return values.size;},key:index=>[...values.keys()][index],getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
assert.deepEqual(readAttentionPreferences('owner',storage),{ocr:false,badge:true});
for(let i=0;i<10;i++)writeAttentionPreferences('owner'+i,{ocr:i===9,badge:false},storage);
assert.equal(values.size,9);assert.equal(values.get('other'),'keep');assert.deepEqual(readAttentionPreferences('owner9',storage),{ocr:true,badge:false});assert.deepEqual(readAttentionPreferences('owner8',storage),{ocr:false,badge:false});
assert.throws(()=>writeAttentionPreferences('',{},storage));
for(const [file,start] of [['viewer','/newest'],['dashboard','/dashboard']]){
 const manifest=JSON.parse(fs.readFileSync(new URL('./public/'+file+'.webmanifest',import.meta.url),'utf8'));assert.equal(manifest.start_url,start);assert.equal(manifest.id,start);assert.equal(manifest.display,'standalone');
 for(const icon of manifest.icons){const png=fs.readFileSync(new URL('./public'+icon.src,import.meta.url)),size=Number(icon.sizes.split('x')[0]);assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);}
}
const navigatorBefore=Object.getOwnPropertyDescriptor(globalThis,'navigator'),notificationBefore=Object.getOwnPropertyDescriptor(globalThis,'Notification');
try{
 const sent=[];let ready,current=true;
 Object.defineProperty(globalThis,'Notification',{configurable:true,value:{permission:'denied',requestPermission(){throw Error('must not request permission automatically');}}});
 assert.equal(notificationCapability(),'denied');await assert.rejects(showOcrNotification());
 Notification.permission='granted';Object.defineProperty(globalThis,'navigator',{configurable:true,value:{serviceWorker:{register:()=>new Promise(resolve=>{ready=resolve;})}}});
 const late=showOcrNotification(false,()=>current);current=false;ready({active:{},showNotification:(title,options)=>sent.push({title,...options})});await late;assert.equal(sent.length,0,'late completion cannot notify for a departed account');
 current=true;await showOcrNotification(false,()=>current);assert.deepEqual(sent.map(item=>[item.title,item.body]),[['MealForm','Đã có kết quả OCR cần rà soát.']]);assert.equal(JSON.stringify(sent).includes('owner'),false);
}finally{if(navigatorBefore)Object.defineProperty(globalThis,'navigator',navigatorBefore);else delete globalThis.navigator;if(notificationBefore)Object.defineProperty(globalThis,'Notification',notificationBefore);else delete globalThis.Notification;}
const events={},actions=[],clients=[];
const context=vm.createContext({URL,self:{location:{origin:'https://example.com'},addEventListener:(name,handler)=>{events[name]=handler;},clients:{matchAll:async()=>clients,openWindow:async target=>actions.push(['open',target])}}});
vm.runInContext(fs.readFileSync(new URL('./public/meal-worker.js',import.meta.url),'utf8'),context);
assert.deepEqual(Object.keys(events),['notificationclick'],'no private fetch interception, cache, sync or background polling');
async function click(tag){let done;events.notificationclick({notification:{tag,close:()=>actions.push(['close'])},waitUntil:promise=>{done=promise;}});await done;}
await click('unknown');assert.deepEqual(actions,[['close']]);actions.length=0;
await click('meal-ocr');assert.deepEqual(actions,[['close'],['open','/dashboard?tab=create']]);actions.length=0;
clients.push({url:'https://unrelated.example/dashboard',focus:async()=>{throw Error('foreign origin');}},{url:'https://example.com/dashboard?tab=create',focus:async()=>actions.push(['focus']),postMessage:value=>actions.push(['message',value.type])});
await click('meal-ocr');assert.deepEqual(actions,[['close'],['focus'],['message','meal-open-ocr-notice']]);
console.log('Install manifests/icons, account-scoped preferences, generic late-safe notifications and notification-only worker passed');
