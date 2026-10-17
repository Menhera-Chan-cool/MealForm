export function normalizeMutationReceipt(value,scope){
  if(value?.version!==1||!['delete','restore'].includes(value.operation)||typeof value.weekKey!=='string'||value.weekKey.length>120||typeof value.recordId!=='string'||!value.recordId||value.recordId.length>500||!Number.isFinite(value.checkedAt)||value.checkedAt<=0)return null;
  if(scope&&['operation','weekKey','recordId'].some(key=>value[key]!==scope[key]))return null;
  const state=key=>['absent','present','duplicate','unknown'].includes(value[key])?value[key]:'unknown',form=state('form'),sheet=state('sheet'),wanted=value.operation==='delete'?'absent':'present';
  return {version:1,operation:value.operation,weekKey:value.weekKey,recordId:value.recordId,form,sheet,checkedAt:value.checkedAt,verified:value.verified===true&&form===wanted&&sheet===wanted};
}
