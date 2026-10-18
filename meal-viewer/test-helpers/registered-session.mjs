import assert from 'node:assert/strict';
import {createDashboardHandler,createViewerHandler,createHistoryHandler} from '../api/security.mjs';
function context(value){assert.match(value?.accountKey||'',/^[a-f0-9]{64}$/);assert.match(value?.sessionKey||'',/^[a-f0-9]{64}$/);}
export function registeredDashboardHandler(options){return createDashboardHandler({...options,callGas:async payload=>{context(payload.session);const result=await options.callGas(payload);return payload.action==='dashboard-authorize'?{...result,sessionActive:true}:result;}});}
function reader(options){return async(...args)=>{if(args[3])context(args[3]);return {...await options.readViewerData(...args),...(args[3]?{sessionActive:true}:{})};};}
export const registeredViewerHandler=options=>createViewerHandler({...options,readViewerData:reader(options)});
export const registeredHistoryHandler=options=>createHistoryHandler({...options,readViewerData:reader(options)});
