import { useEffect, useState } from 'react';
import ElapsedWait from './ElapsedWait.jsx';
import ExplainedButton from './ExplainedButton.jsx';
import ExternalLink from './ExternalLink.jsx';
import usePageTitle from './usePageTitle.js';
import { errorMessage } from './viewer-model.mjs';
import { safeErrorReport } from './safe-error-report.mjs';
import ErrorReportButton from './ErrorReportButton.jsx';
import VersionNotice from './VersionNotice.jsx';
import './dashboard.css';

const STEPS = [
  ['Google Drive', 'Tạo thư mục riêng. Điền MEAL_FORM_ROOT_FOLDER_ID bằng ID sau /folders/, không phải cả URL.', 'https://drive.google.com/'],
  ['ViLao OCR', 'Tạo API key riêng, chọn model hỗ trợ ảnh. Điền VILAO_API_KEY, VILAO_BASE_URL, VILAO_MODEL trong Script Properties; Base URL không có /chat/completions.', 'https://vilao.ai/vi/docs'],
  ['HMAC và phiên đăng nhập', 'Chạy New-Secrets.ps1 trong bộ chia sẻ: VIEWER_HMAC ↔ MEAL_VIEWER_HMAC_SECRET / GAS_HMAC_SECRET; DASHBOARD_HMAC ↔ MEAL_DASHBOARD_HMAC_SECRET / GAS_DASHBOARD_HMAC_SECRET. SESSION_SECRET là khóa thứ ba, chỉ ở Vercel.', ''],
  ['Apps Script', 'Chép MealForm.gs và appsscript.json; chạy initializeMealFormOwner, cấp đủ quyền, setupMealFormAutomation. Deploy Web app chạy dưới chủ (Me), truy cập Anyone, lấy URL /exec.', 'https://developers.google.com/apps-script/guides/web'],
  ['Vercel', 'Import bộ mã sạch, Root Directory meal-viewer, Vite, npm ci, npm run build, output dist, Node 22/24. Điền GAS_API_URL, hai khóa GAS_*_HMAC_SECRET và SESSION_SECRET. Domain riêng nhập vào MEAL_VIEWER_ORIGIN trong bản template.', 'https://vercel.com/docs/frameworks/frontend/vite'],
  ['Google Login', 'Tạo OAuth Client loại Web application; thêm domain production vào Authorized JavaScript origins, không có /dashboard. Điền cùng Client ID vào GOOGLE_OAUTH_CLIENT_ID và VITE_GOOGLE_OAUTH_CLIENT_ID.', 'https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid'],
  ['Redeploy và kiểm tra cuối', 'Redeploy Vercel sau khi đổi env. Đăng nhập Gmail chủ rồi kiểm tra bên dưới. Đọc ảnh và tạo một tuần thử cần bạn xác nhận riêng; checklist không tự gọi OCR hoặc tạo Form.', 'https://vercel.com/docs/environment-variables']
];

export function SetupInstructions() {
  return <section className="setup-instructions"><h2>Hướng dẫn cài đặt</h2><ol className="setup-steps">{STEPS.map(([title, text, url]) => <li key={title}><h3>{title}</h3><p>{text}</p>{url && <ExternalLink className="action-link" href={url}>Mở hướng dẫn / dịch vụ</ExternalLink>}</li>)}</ol></section>;
}

export default function SetupChecklist({ authenticated }) {
  usePageTitle('Cài đặt & kiểm tra');
  const [role, setRole] = useState('');
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState(null);
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    fetch('/api/dashboard', { credentials: 'same-origin', cache: 'no-store' }).then(async response => {
      const data = await response.json();
      if (!active) return;
      if (response.ok) setRole(data.role || '');
      else { setFailure(safeErrorReport('health', { status: response.status })); setMessage('Chưa xác nhận được quyền chủ. Kiểm tra URL /exec, HMAC và cấu hình đăng nhập rồi tải lại trang.'); }
    }).catch(error => { if (active) { setFailure(safeErrorReport('health', error)); setMessage('Không kết nối được để xác nhận quyền chủ. Hãy kiểm tra mạng và cấu hình.'); } });
    return () => { active = false; };
  }, [authenticated]);
  async function check() {
    setBusy(true); setMessage(''); setFailure(null);
    try {
      const response = await fetch('/api/dashboard?health=1', { credentials: 'same-origin', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok && !data.checks) throw Object.assign(new Error(errorMessage(data.error)), { status: response.status });
      if (!response.ok || data.checks?.some(check => check.status === 'error')) setFailure(safeErrorReport('health', { status: response.status }));
      setReport(data);
    } catch (error) { setFailure(safeErrorReport('health', error)); setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <main className="dashboard-shell">
    <VersionNotice disabled={busy} />
    <ElapsedWait active={busy} label="Đang kiểm tra hệ thống"/>
    <header><h1>Cài đặt &amp; kiểm tra</h1><p>Hướng dẫn mở được ngay cả khi bản mới chưa cấu hình. Không nhập khóa bí mật vào trang này.</p><div className="dashboard-header-actions"><a className="form-link" href="/dashboard">Mở Dashboard / đăng nhập</a><a className="action-link" href="/newest">Trang xem</a></div></header>
    <SetupInstructions />
    <section className="dashboard-panel"><h2>Kiểm tra kết nối thực tế</h2>
      {role === 'owner' ? <ExplainedButton label="Kiểm tra hệ thống" disabled={busy} reason="Đang kiểm tra cấu hình; hãy chờ kết quả." onClick={() => void check()}>{busy ? 'Đang kiểm tra…' : 'Kiểm tra hệ thống'}</ExplainedButton> : <p>Đăng nhập bằng Gmail chủ trong Dashboard rồi quay lại trang này để kiểm tra cấu hình riêng.</p>}
      <p>Chưa đọc ảnh thử: có key/model không chứng minh OCR hoạt động. Authorized origins Google được xác nhận qua đăng nhập thực tế. Chưa có tuần là cảnh báo, không phải lỗi cài đặt.</p>
      {message && <p role="alert">{message}</p>}
      <ErrorReportButton report={failure} />
      <ul className="dashboard-health-list">{(report?.checks || []).map(check => <li key={check.id} data-status={check.status}><div><strong>{check.label}</strong><span>{({ ok: 'Ổn', warning: 'Cần chú ý', error: 'Lỗi' })[check.status]}</span></div><p>{check.message}</p></li>)}</ul>
    </section>
  </main>;
}
