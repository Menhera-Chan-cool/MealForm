import {healthCounts} from './operating-ui.mjs';
export default function SystemReport({report,busy=false}){
  const checks=report?.checks||[],counts=healthCounts(checks);
  return <div className="system-report"><p role="status" aria-label="Tóm tắt hệ thống">{busy?'Đang kiểm tra hệ thống…':!checks.length?'Chưa có kết quả kiểm tra.':`${counts.ok} ổn · ${counts.warning} cần chú ý · ${counts.error} lỗi${counts.unknown?` · ${counts.unknown} chưa xác định`:''}`}</p>
    {!busy&&checks.length>0&&<details className="system-details"><summary>Chi tiết kiểm tra ({checks.length})</summary><ul className="dashboard-health-list">{checks.map(check=><li key={check.id} data-status={check.status}><div><strong>{check.label}</strong><span>{({ok:'Ổn',warning:'Cần chú ý',error:'Lỗi'})[check.status]||'Chưa xác định'}</span></div><p>{check.message}</p></li>)}</ul></details>}
  </div>;
}
