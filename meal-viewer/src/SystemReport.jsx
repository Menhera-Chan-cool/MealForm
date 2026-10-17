import {connectionNodes} from './dashboard-nine.mjs';
import {healthCounts} from './operating-ui.mjs';
export default function SystemReport({report,busy=false}){
  const checks=report?.checks||[],counts=healthCounts(checks);
  return <div className="system-report"><p role="status" aria-label="Tóm tắt hệ thống">{busy?'Đang kiểm tra hệ thống…':!checks.length?'Chưa có kết quả kiểm tra.':`${counts.ok} ổn · ${counts.warning} cần chú ý · ${counts.error} lỗi${counts.unknown?` · ${counts.unknown} chưa xác định`:''}`}</p>
    {!busy&&checks.length>0&&<details className="system-details"><summary>Chi tiết kiểm tra ({checks.length})</summary><ul className="dashboard-health-list">{checks.map(check=><li key={check.id} data-status={check.status}><div><strong>{check.label}</strong><span>{({ok:'Ổn',warning:'Cần chú ý',error:'Lỗi'})[check.status]||'Chưa xác định'}</span></div><p>{check.message}</p></li>)}</ul></details>}
    <section className="connection-map" role="region" aria-label="Sơ đồ kết nối"><h3>Sơ đồ kết nối</h3><p>Web → Apps Script → Google Form / Google Sheet; Apps Script → cấu hình OCR.</p><ul>{connectionNodes(report,busy).map(node=><li key={node.id} data-node={node.id}><strong>{node.label}</strong><span>{node.status}</span></li>)}</ul><small>Chỉ dùng kết quả kiểm tra đã tải. Cấu hình ổn không chứng minh OCR đọc được ảnh. Không tự chạy kiểm tra hoặc sửa kết nối.</small></section>
  </div>;
}
