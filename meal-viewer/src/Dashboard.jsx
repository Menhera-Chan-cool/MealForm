import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { errorMessage, mealRegistrationTarget } from './viewer-model.mjs';
import { inspectMenu, describeHistoryNote, countNewResponseIds, menuCalendarKey } from './dashboard-model.mjs';
import { menuHistoryReducer } from './menu-history.mjs';
import { safeErrorReport, dashboardOperation } from './safe-error-report.mjs';
import ErrorReportButton from './ErrorReportButton.jsx';
import { readDashboardCache, writeDashboardCache, lastDashboardWeek, clearDashboardCache } from './dashboard-cache.mjs';
import ActionConfirmation from './ActionConfirmation.jsx';
import SheetRowButton from './SheetRowButton.jsx';
import MenuImagePreview from './MenuImagePreview.jsx';
import useOcrDraft from './useOcrDraft.js';
import ActionToast from './ActionToast.jsx';
import { useBranding } from './BrandingProvider.jsx';
import { brandingTheme, normalizeBranding } from './branding.mjs';
import './dashboard.css';

const IMAGE_LIMIT = 2_800_000;
const MEAL_SLOTS = [0, 1, 2];

export async function dashboardRequest(url = '/api/dashboard', options = {}, onUnauthorized) {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
  const body = await response.json();
  if (!response.ok) {
    const message = errorMessage(body.error, 'Không thể hoàn tất thao tác.');
    if (response.status === 401 || response.status === 403) onUnauthorized?.(message, response.status);
    throw Object.assign(new Error(message), { status: response.status });
  }
  return body;
}

function formatTime(value) {
  const date = new Date(Number(value));
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}

function historyActionLabel(action) {
  return ({
    deleted: 'Đã xóa',
    'not-restorable': 'Đã xóa · không thể khôi phục',
    partial: 'Xóa chưa hoàn tất',
    'delete-failed': 'Xóa thất bại',
    'delete-review': 'Xóa cần kiểm tra',
    'delete-pending': 'Xóa đang xử lý',
    'restore-pending': 'Đang khôi phục',
    restored: 'Đã khôi phục',
    'restore-review': 'Khôi phục cần kiểm tra',
    'form-control-pending': 'Đang đổi Form', 'form-opened': 'Đã mở Form', 'form-closed': 'Đã đóng Form', 'form-deadline-updated': 'Đã đổi hạn', 'form-control-review': 'Đổi Form cần kiểm tra'
  })[action] || action;
}

function Dashboard({ initialData, onUnauthorized, onSignOut }) {
  const branding = useBranding();
  const request = async (url, options) => {
    try { return await dashboardRequest(url, options, (message, status) => { weekRequest.current++; clearDashboardCache(); onUnauthorized?.(message, status); }); }
    catch (error) { setFailure(safeErrorReport(dashboardOperation(url, options), error)); throw error; }
  };
  const [savedWeek] = useState(() => lastDashboardWeek(initialData?.accountId, (initialData?.weeks || []).map(week => week.weekKey)));
  const initialWeek = savedWeek || initialData?.weeks?.[0]?.weekKey || '';
  const [overview, setOverview] = useState(initialData || { role: '', weeks: [], allowedEmails: [] });
  const [tab, setTab] = useState(() => {
    const initialTab = new URLSearchParams(window.location.search).get('tab');
    return ['create', 'health'].includes(initialTab) ? initialTab : savedWeek ? 'delete' : 'overview';
  });
  const [weekKey, setWeekKey] = useState(initialWeek);
  const [weekData, setWeekData] = useState(() => readDashboardCache(initialData?.accountId, initialWeek)?.data || null);
  const [weekVerified, setWeekVerified] = useState(false);
  const [weekLoading, setWeekLoading] = useState(false);
  const [cacheTime, setCacheTime] = useState(() => readDashboardCache(initialData?.accountId, initialWeek)?.savedAt || 0);
  const [newResponses, setNewResponses] = useState(0);
  const [pollError, setPollError] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [query, setQuery] = useState('');
  const [responseSort, setResponseSort] = useState('newest');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [image, setImage] = useState('');
  const [menuHistory, dispatchMenu] = useReducer(menuHistoryReducer, undefined, () => menuHistoryReducer(undefined, { type: 'reset', value: null }));
  const menu = menuHistory.present;
  const setMenu = value => dispatchMenu({ type: 'reset', value });
  const [allowMissing, setAllowMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, updateMessage] = useState('');
  const [failure, setFailure] = useState(null);
  const [toast, setToast] = useState(null);
  const [pendingRow, setPendingRow] = useState(null);
  const weekRequest = useRef(0);
  const currentWeekData = useRef(weekData);
  currentWeekData.current = weekData;
  const dismissToast = useCallback(() => setToast(null), []);
  function setMessage(text, kind) {
    updateMessage(text);
    if (!text || kind === 'success' || /^Đã |^Apps Script đã/.test(text)) setFailure(null);
    if (text) setToast({ message: text, kind: kind || (/^Đã |^Apps Script đã/.test(text) ? 'success' : /^Đang /.test(text) ? 'info' : 'error') });
  }
  const [authorizationUrl, setAuthorizationUrl] = useState('');
  const [health, setHealth] = useState(null);
  const [healthBusy, setHealthBusy] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [reconciliation, setReconciliation] = useState(null);
  const [brandDraft, setBrandDraft] = useState(branding);
  const selectedWeek = (overview.weeks || []).find(week => week.weekKey === weekKey);
  const permissions = overview.permissions || { view: true, create: true, manageResponses: true };
  const draft = useOcrDraft(overview.accountId, permissions.create === true, { image, filename: file?.name || '', menu }, saved => {
    setImage(saved.image); setFile({ name: saved.filename }); setMenu(saved.menu); setAllowMissing(false);
  });

  const validation = useMemo(() => inspectMenu(menu, allowMissing), [menu, allowMissing]);
  const existingWeek = (overview.weeks || []).find(week => week.weekKey === menuCalendarKey(menu));
  const existingFormUrl = mealRegistrationTarget(existingWeek).formUrl;
  const existingSheetUrl = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]+(?:\/|$)/.test(existingWeek?.spreadsheetUrl || '') ? existingWeek.spreadsheetUrl : '';
  const displayedWeek = weekData?.week?.weekKey === weekKey ? weekData : null;
  const weekReady = weekVerified && Boolean(displayedWeek);
  const visibleResponses = (displayedWeek?.responses || []).filter(response =>
    String(response.name || '').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).slice().sort((left, right) => {
      if (responseSort === 'name') return String(left.name || '').localeCompare(String(right.name || ''), 'vi', { sensitivity: 'base' });
      const difference = Number(left.timestamp || 0) - Number(right.timestamp || 0);
      return responseSort === 'oldest' ? difference : -difference;
    });
  const restoreAttempts = new Set((displayedWeek?.history || []).filter(event => /^restore-/.test(event.action) || event.action === 'restored').map(event => event.entryId));

  async function refreshOverview() {
    try {
      const data = await request();
      setOverview(data);
      if (!weekKey && data.weeks?.length) setWeekKey(data.weeks[0].weekKey);
      return data;
    } catch (error) {
      setMessage(error.message);
      return null;
    }
  }

  async function loadWeek(key = weekKey) {
    const generation = ++weekRequest.current;
    setWeekVerified(false); setNewResponses(0); setPollError('');
    if (!key) { setWeekData(null); setWeekLoading(false); return false; }
    const saved = readDashboardCache(overview.accountId, key);
    const previous = currentWeekData.current;
    const keep = previous?.week?.weekKey === key;
    setWeekData(keep ? previous : saved?.data || null);
    setCacheTime(keep ? cacheTime : saved?.savedAt || 0);
    setWeekLoading(true);
    try {
      const result = await request(`/api/dashboard?week=${encodeURIComponent(key)}`);
      if (generation !== weekRequest.current) return false;
      setWeekData(result);
      setWeekVerified(true); setCacheTime(0);
      writeDashboardCache(overview.accountId, key, result);
      setMessage('');
      return true;
    } catch (error) { if (generation === weekRequest.current) setMessage(error.message); return false; }
    finally { if (generation === weekRequest.current) setWeekLoading(false); }
  }

  useEffect(() => { if (!initialData || initialData.overviewPending) void refreshOverview(); }, []);
  useEffect(() => { if (tab === 'delete') void loadWeek(weekKey); return () => { weekRequest.current++; }; }, [tab, weekKey]);
  useEffect(() => () => { weekRequest.current++; }, []);
  useEffect(() => {
    if (!weekVerified || !weekData || busy || tab !== 'delete') return undefined;
    let stopped = false, checking = false;
    const generation = weekRequest.current;
    const baseline = weekData.responseIds || [];
    async function check() {
      if (stopped || checking || document.visibilityState !== 'visible') return;
      checking = true;
      try {
        const result = await request(`/api/dashboard?updates=1&week=${encodeURIComponent(weekKey)}`);
        if (!stopped && generation === weekRequest.current && result.weekKey === weekKey) { setNewResponses(countNewResponseIds(result.responseIds, baseline)); setPollError(''); }
      } catch { if (!stopped && generation === weekRequest.current) setPollError('Chưa kiểm tra được lượt mới; dùng “Tải lại dữ liệu” để thử lại.'); }
      finally { checking = false; }
    }
    const interval = window.setInterval(() => void check(), 60000);
    document.addEventListener('visibilitychange', check);
    return () => { stopped = true; window.clearInterval(interval); document.removeEventListener('visibilitychange', check); };
  }, [weekVerified, weekData, weekKey, busy, tab]);
  useEffect(() => { if (tab === 'health' && overview.role === 'owner') void checkHealth(); }, [tab, weekKey, overview.role]);
  useEffect(() => {
    if ((tab === 'create' && !permissions.create) || (tab === 'health' && overview.role !== 'owner')) setTab('overview');
  }, [tab, permissions.create, overview.role]);
  useEffect(() => {
    const time = Date.parse(selectedWeek?.lockAt || '');
    setDeadline(Number.isFinite(time) ? new Date(time + 7 * 3600000).toISOString().slice(0, 16) : '');
    setReconciliation(null);
  }, [weekKey, selectedWeek?.lockAt]);
  useEffect(() => setBrandDraft(branding), [branding]);

  async function controlForm(mode, reason) {
    if (overview.role !== 'owner' || !selectedWeek) return;
    const lockAt = mode === 'close' ? selectedWeek.lockAt : `${deadline}:00+07:00`;
    if (mode !== 'close' && (!deadline || !Number.isFinite(Date.parse(lockAt)) || Date.parse(lockAt) <= Date.now())) { setMessage('Chọn hạn đăng ký hợp lệ ở tương lai.'); return; }
    const verb = mode === 'open' ? 'Mở lại' : mode === 'close' ? 'Đóng' : 'Đổi hạn đăng ký cho';
    if (reason === undefined) { setConfirmation({ message: `${verb} Form ${selectedWeek.name}?${mode === 'close' ? ' Người dùng sẽ không gửi được lượt mới.' : ` Hạn mới: ${deadline.replace('T', ' ')} (giờ Việt Nam).`} Thao tác được ghi lịch sử.`, run: note => controlForm(mode, note) }); return; }
    clearDashboardCache(); setWeekVerified(false);
    setBusy(true); setMessage('Đang cập nhật Form…');
    try {
      await request('/api/dashboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'form-control', weekKey, mode, deadline: lockAt, expectedStatus: selectedWeek.formStatus, expectedLockAt: selectedWeek.lockAt, reason }) });
      await refreshOverview();
      setMessage('Đã cập nhật Form và lịch khóa.');
    } catch (error) { await refreshOverview(); setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function reconcileWeek() {
    if (!weekKey) return;
    setBusy(true); setReconciliation(null); setMessage('Đang đối soát Form và Sheet…');
    try {
      const result = await request(`/api/dashboard?reconcile=1&week=${encodeURIComponent(weekKey)}`);
      setReconciliation({ ...result, weekKey });
      setMessage(result.issues.length ? `Đã đối soát: có ${result.issues.length} bản ghi cần kiểm tra. Không sửa hoặc xóa dữ liệu.` : 'Đã đối soát: Form và Sheet khớp duy nhất.', result.issues.length ? 'info' : 'success');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function saveBranding(event) {
    event.preventDefault();
    if (overview.role !== 'owner') return;
    if (!window.confirm('Áp dụng tên trường, logo và màu này cho toàn bộ web?')) return;
    setBusy(true); setMessage('Đang lưu thương hiệu…');
    try {
      const result = await request('/api/dashboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'set-branding', branding: brandDraft, expectedUpdatedAt: branding.updatedAt }) });
      window.dispatchEvent(new CustomEvent('meal-branding-changed', { detail: result }));
      setMessage('Đã cập nhật thương hiệu.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function checkHealth() {
    setHealthBusy(true);
    setHealth(null);
    try {
      const response = await fetch(`/api/dashboard?health=1&week=${encodeURIComponent(weekKey)}`, { credentials: 'same-origin', cache: 'no-store' });
      const report = await response.json();
      if (response.status === 401 || response.status === 403) { onUnauthorized(errorMessage(report.error), response.status); return; }
      if (!Array.isArray(report.checks)) throw new Error('Không nhận được kết quả kiểm tra.');
      setHealth(report);
      if (!response.ok || report.checks.some(check => check.status === 'error')) setFailure(safeErrorReport('health', { status: response.status }));
    } catch (error) {
      setHealth({ checks: [{ id: 'network', label: 'Kết nối máy chủ', status: 'error', message: 'Không kết nối được để kiểm tra. Hãy thử lại khi có mạng.' }] });
      setFailure(safeErrorReport('health', error));
    } finally { setHealthBusy(false); }
  }

  async function selectImage(event) {
    const next = event.target.files?.[0] || null;
    setFile(next);
    setMenu(null);
    setAllowMissing(false);
    setImage('');
    setMessage('');
    if (!next) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(next.type)) {
      setFile(null); setMessage('Chỉ nhận ảnh PNG, JPEG hoặc WEBP.'); return;
    }
    if (next.size > IMAGE_LIMIT) {
      setFile(null); setMessage('Ảnh quá lớn. Hãy nén hoặc cắt ảnh xuống dưới 2,8 MB rồi chọn lại.'); return;
    }
    setBusy(true);
    try {
      setImage(await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Không đọc được ảnh.'));
        reader.readAsDataURL(next);
      }));
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function runOcr() {
    if (!image) { setMessage('Hãy chọn ảnh thực đơn trước.'); return; }
    setBusy(true); setMessage('Đang đọc ảnh thực đơn…');
    try {
      const result = await request('/api/dashboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ocr', image })
      });
      const days = (result.days || []).map(day => ({ ...day, meals: [...(day.meals || [])].slice(0, 3) }));
      setMenu({ title: result.title || 'Thực đơn bán trú', days });
      setAllowMissing(false);
      setMessage('OCR xong. Hãy rà soát tên món và ngày trước khi tạo tuần.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  function editDay(dayIndex, field, value, mealIndex = -1) {
    dispatchMenu({ type: 'edit', group: field === 'closed' ? '' : `${dayIndex}-${field}-${mealIndex}`, value: current => ({
      ...current,
      days: current.days.map((day, index) => index !== dayIndex ? day : field === 'meal'
        ? { ...day, meals: MEAL_SLOTS.map(slot => slot === mealIndex ? value : (day.meals[slot] || '')) }
        : { ...day, [field]: value })
    }) });
    if (field === 'closed') setAllowMissing(false);
  }

  function moveMenuHistory(type) { dispatchMenu({ type }); setAllowMissing(false); }

  async function createWeek(event) {
    event.preventDefault();
    if (existingWeek) { setMessage('Tuần này đã có Form; dùng liên kết hiện có hoặc tải lại sổ tuần. Không ghi đè.', 'info'); return; }
    if (!validation.canCreate) {
      setMessage(validation.dateError || validation.servingError || (validation.invalidMealDays.length ? 'Mỗi ngày cần ít nhất 2 món và tối đa 3 món.' : 'Xác nhận tiếp tục với ngày thiếu món.'));
      return;
    }
    const payload = {
      ...menu,
      days: menu.days.map(day => ({ ...day, meals: day.closed === true ? [] : (day.meals || []).map(value => String(value || '').trim()).filter(Boolean) }))
    };
    setBusy(true); setMessage('Đang tạo Form và Sheet cho tuần…');
    try {
      const result = await request('/api/dashboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', menu: payload })
      });
      if (result.alreadyExists) setMessage('Tuần này đã có Form. Mình đã lấy lại các liên kết hiện có.');
      else setMessage('Đã tạo Form, Spreadsheet và thư mục tuần.');
      try { await draft.clear(); } catch { setMessage('Tuần đã tạo nhưng chưa xóa được nháp trên thiết bị. Hãy xóa nháp thủ công.'); }
      setMenu(null); setImage(''); setFile(null); setAllowMissing(false);
      const next = await refreshOverview();
      if (next?.weeks?.[0]) setWeekKey(next.weeks[0].weekKey);
      setWeekData(null);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function deleteResponse(response, reason) {
    const time = formatTime(response.timestamp);
    if (!weekReady || !response.deletable || !response.deleteToken) return;
    const prompt = response.partial
      ? `Form đã xóa lượt của ${response.name} lúc ${time}, nhưng Sheet còn hàng dữ liệu. Xóa nốt hàng Sheet này?`
      : `Xóa lượt gửi của ${response.name} lúc ${time} khỏi Form và Sheet?`;
    if (reason === undefined) { setConfirmation({ message: prompt, run: note => deleteResponse(response, note) }); return; }
    clearDashboardCache(); setWeekVerified(false);
    setPendingRow({ action: 'delete', id: response.responseId });
    setBusy(true); setMessage('Đang xóa lượt gửi…');
    try {
      await request('/api/dashboard', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekKey, responseId: response.responseId, deleteToken: response.deleteToken, reason })
      });
      await refreshOverview();
      await loadWeek(weekKey);
      setMessage(response.partial
        ? `Đã hoàn tất xóa hàng Sheet còn sót của ${response.name}.`
        : `Đã xóa lượt gửi của ${response.name} khỏi Form và Sheet.`);
    } catch (error) { await loadWeek(weekKey); setMessage(error.message); }
    finally { setBusy(false); setPendingRow(null); }
  }

  async function restoreResponse(event) {
    if (!weekReady || !event.restorable || !event.entryId || restoreAttempts.has(event.entryId)) return;
    const originalTime = formatTime(event.originalTimestamp);
    if (!window.confirm(`Khôi phục lượt của ${event.name} (gửi gốc lúc ${originalTime})? Lượt sẽ được tạo mới trong Form, nên thời điểm gửi trong Form sẽ là thời điểm hiện tại.`)) return;
    clearDashboardCache(); setWeekVerified(false);
    setPendingRow({ action: 'restore', id: event.entryId });
    setBusy(true); setMessage('Đang khôi phục lượt gửi…');
    try {
      await request('/api/dashboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', weekKey, entryId: event.entryId })
      });
      await refreshOverview();
      await loadWeek(weekKey);
      setMessage(`Đã khôi phục lượt của ${event.name}. Thời điểm gốc được giữ trong lịch sử.`);
    } catch (error) { await loadWeek(weekKey); setMessage(error.message); }
    finally { setBusy(false); setPendingRow(null); }
  }

  async function changeAllowedEmail(action, address = email, memberPermissions) {
    const target = address.trim();
    if (!target) return;
    setBusy(true); setMessage('Đang cập nhật quyền…');
    try {
      const result = await request('/api/dashboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email: target, permissions: memberPermissions })
      });
      setOverview(current => ({ ...current, allowedEmails: result.allowedEmails || [], members: result.members || [] }));
      setEmail(''); setMessage(action === 'add-email' ? 'Đã cấp quyền chỉ xem. Bạn có thể bật thêm quyền bên dưới.' : action === 'set-permissions' ? 'Đã cập nhật quyền.' : 'Đã gỡ quyền dashboard.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function authorizeScript() {
    const authWindow = window.open('about:blank', '_blank');
    if (authWindow) authWindow.opener = null;
    setBusy(true);
    setAuthorizationUrl('');
    setMessage('Đang kiểm tra quyền Apps Script…');
    try {
      const result = await request('/api/dashboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'authorize-script' })
      });
      if (!result.authorizationRequired) {
        authWindow?.close();
        setMessage('Apps Script đã được cấp đủ các quyền hiện yêu cầu.');
        return;
      }
      if (!result.authorizationUrl) throw new Error('Google không trả liên kết cấp quyền. Hãy mở dự án Apps Script và chạy một hàm cần quyền Drive.');
      if (authWindow) {
        authWindow.location.replace(result.authorizationUrl);
        setMessage('Đã mở trang Google. Hãy xác nhận quyền rồi quay lại Dashboard.');
      } else {
        setAuthorizationUrl(result.authorizationUrl);
        setMessage('Trình duyệt đã chặn cửa sổ bật lên; dùng liên kết bên dưới để tiếp tục.');
      }
    } catch (error) {
      authWindow?.close();
      setMessage(error.message);
    } finally { setBusy(false); }
  }

  function weekPicker() {
    return <label className="dashboard-week-picker">Tuần
      <select value={weekKey} disabled={busy || healthBusy} onChange={event => setWeekKey(event.target.value)}>
        {(overview.weeks || []).map(week => <option key={week.weekKey} value={week.weekKey}>{week.name}</option>)}
      </select>
    </label>;
  }

  return <main className="dashboard-shell">
    <header className="dashboard-header">
      <div><h1>Dashboard quản trị</h1><p className="sub">Quản lý tuần thực đơn, tạo Form từ ảnh và xử lý lượt gửi.</p></div>
      <div className="dashboard-header-actions">
        {overview.role === 'owner' && <button className="secondary" type="button" disabled={busy} onClick={() => void authorizeScript()}>Cấp quyền Apps Script</button>}
        <a className="form-link" href="/newest">Mở trang xem</a>
        <a className="action-link" href="/setup">Cài đặt</a>
        <button className="secondary" type="button" disabled={busy || signingOut} onClick={async () => {
          setSigningOut(true);
          weekRequest.current++; setWeekVerified(false); setWeekLoading(false); clearDashboardCache();
          try { await onSignOut(); }
          catch (error) { setMessage(errorMessage(error, 'Chưa đăng xuất được. Hãy thử lại.')); }
          finally { setSigningOut(false); }
        }}>{signingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}</button>
      </div>
    </header>
    <nav className="dashboard-tabs" aria-label="Chức năng quản trị">
      <button className={tab === 'overview' ? 'active' : 'secondary'} onClick={() => setTab('overview')}>Tổng quan</button>
      {permissions.create && <button className={tab === 'create' ? 'active' : 'secondary'} onClick={() => setTab('create')}>Tạo tuần bằng OCR</button>}
      <button className={tab === 'delete' ? 'active' : 'secondary'} onClick={() => setTab('delete')}>Lượt gửi &amp; lịch sử</button>
      {overview.role === 'owner' && <button className={tab === 'form' ? 'active' : 'secondary'} onClick={() => setTab('form')}>Điều khiển Form</button>}
      <button className={tab === 'reconcile' ? 'active' : 'secondary'} onClick={() => setTab('reconcile')}>Đối soát</button>
      {overview.role === 'owner' && <button className={tab === 'branding' ? 'active' : 'secondary'} onClick={() => setTab('branding')}>Thương hiệu</button>}
      {overview.role === 'owner' && <button className={tab === 'health' ? 'active' : 'secondary'} onClick={() => setTab('health')}>Hệ thống</button>}
      {overview.role === 'owner' && <button className={tab === 'access' ? 'active' : 'secondary'} onClick={() => setTab('access')}>Quyền Gmail</button>}
    </nav>
    {message && <p className={`dashboard-message ${/không|lỗi|chưa/i.test(message) ? 'error' : ''}`} role="status" aria-live="polite">{message}{authorizationUrl && <> <a className="action-link" href={authorizationUrl} target="_blank" rel="noopener noreferrer">Mở trang cấp quyền Google</a></>}</p>}

    <ErrorReportButton report={failure || draft.failure} />
    {tab === 'overview' && <section className="dashboard-panel">
      <div className="dashboard-section-title"><h2>Sổ tuần</h2><button className="secondary" disabled={busy} onClick={() => void refreshOverview()}>Tải lại</button></div>
      {(overview.weeks || []).length ? <div className="table-wrap"><table className="dashboard-table"><thead><tr><th>Tuần</th><th>Lượt gửi</th><th>Form</th><th>Liên kết</th></tr></thead><tbody>
        {overview.weeks.map(week => <tr key={week.weekKey}><td>{week.name}</td><td>{week.responseCount ?? '—'}</td><td>{week.formStatus === 'open' ? 'Đang mở' : week.formStatus === 'closed' ? 'Đã khóa' : 'Chưa xác định'}</td><td className="dashboard-links"><a href={week.formUrl} target="_blank" rel="noreferrer">Form</a><a href={week.spreadsheetUrl} target="_blank" rel="noreferrer">Sheet</a>{week.folderUrl && <a href={week.folderUrl} target="_blank" rel="noreferrer">Thư mục</a>}</td></tr>)}
      </tbody></table></div> : <p>Chưa có tuần nào trong sổ.</p>}
    </section>}

    {tab === 'health' && <section className="dashboard-panel">
      <div className="dashboard-section-title"><h2>Kiểm tra hệ thống</h2>{weekPicker()}</div>
      <p>Kiểm tra quyền Google, thư mục, Sheet, Form, cấu hình OCR và lịch tự khóa.</p>
      <button className="secondary" type="button" disabled={healthBusy} onClick={() => void checkHealth()}>{healthBusy ? 'Đang kiểm tra…' : 'Kiểm tra lại'}</button>
      {health?.checkedAt && <p>Đã kiểm tra lúc {formatTime(health.checkedAt)}</p>}
      <ul className="dashboard-health-list" aria-live="polite">{(health?.checks || []).map(check => <li key={check.id} data-status={check.status}>
        <div><strong>{check.label}</strong><span>{({ ok: 'Ổn', warning: 'Cần chú ý', error: 'Lỗi' })[check.status] || 'Chưa xác định'}</span></div>
        <p>{check.message}</p>
      </li>)}</ul>
    </section>}

    {tab === 'create' && permissions.create && <section className="dashboard-panel">
      <h2>Tạo tuần từ ảnh thực đơn</h2>
      <div className="draft-toolbar"><p role="status">{draft.status || 'Nháp lưu riêng trên thiết bị này, không đồng bộ giữa các máy.'}</p><button type="button" className="secondary" disabled={busy || !draft.ready} onClick={async () => {
        if (!window.confirm('Xóa nháp ảnh và món đang sửa trên thiết bị này?')) return;
        try { await draft.clear(); setImage(''); setMenu(null); setFile(null); setAllowMissing(false); } catch (error) { setMessage(error.message); }
      }}>Xóa nháp</button></div>
      <label className="dashboard-file">Ảnh thực đơn (PNG, JPEG, WEBP; tối đa 2,8 MB)
        <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy || !draft.ready} onChange={event => void selectImage(event)} />
      </label>
      {image && file?.name && !file.type && <p className="menu-image-hint">Ảnh đã khôi phục: {file.name}. Không cần chọn lại để tiếp tục OCR hoặc sửa món.</p>}
      <button disabled={busy || !image} onClick={() => void runOcr()}>{busy ? 'Đang xử lý…' : 'Đọc thực đơn'}</button>
      {image && <div className={`menu-review-layout${menu ? '' : ' image-only'}`}>
      <MenuImagePreview src={image} name={file?.name} />
      {menu && <form className="menu-review" onSubmit={createWeek} onBlur={() => dispatchMenu({ type: 'commit' })} onKeyDown={event => {
        if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'z' && !busy) { event.preventDefault(); moveMenuHistory(event.shiftKey ? 'redo' : 'undo'); }
      }}>
        <div className="menu-history-tools"><button type="button" className="secondary" disabled={busy || !menuHistory.past.length} onClick={() => moveMenuHistory('undo')}>Hoàn tác</button><button type="button" className="secondary" disabled={busy || !menuHistory.future.length} onClick={() => moveMenuHistory('redo')}>Làm lại</button><small>Ctrl/⌘ Z · Ctrl/⌘ Shift Z. Lịch sử sửa chỉ giữ trong lần mở này.</small></div>
        <label>Tiêu đề tuần<input value={menu.title || ''} maxLength={500} disabled={busy} onChange={event => dispatchMenu({ type: 'edit', group: 'title', value: current => ({ ...current, title: event.target.value }) })} /></label>
        {existingWeek && <div className="existing-week-warning" role="status"><strong>Tuần này đã có Form — không tạo hoặc ghi đè tuần mới.</strong><div className="dashboard-links">{existingFormUrl && <a href={existingFormUrl} target="_blank" rel="noreferrer">Mở Form</a>}{existingSheetUrl && <a href={existingSheetUrl} target="_blank" rel="noreferrer">Mở Sheet</a>}<button type="button" className="secondary" disabled={busy} onClick={() => void refreshOverview()}>Tải lại sổ tuần</button></div></div>}
        <h3>Rà soát 5 ngày</h3>
        {menu.days.map((day, dayIndex) => {
          const issue = validation.dayIssues[dayIndex];
          const status = issue.dateError || issue.mealError ? 'error' : issue.missingMealSlots.length ? 'warning' : 'ok';
          const dateNote = `menu-date-note-${dayIndex}`;
          const mealNote = `menu-meal-note-${dayIndex}`;
          return <fieldset className="menu-day" data-status={status} disabled={busy} key={`${day.day}-${dayIndex}`}>
            <legend>{day.day || `Thứ ${dayIndex + 2}`} {status !== 'ok' && <span className="menu-review-badge">{status === 'error' ? 'Cần sửa' : `Thiếu ${issue.missingMealSlots.length} món`}</span>}</legend>
            <label>Ngày<input value={day.date || ''} maxLength={40} placeholder="dd/mm/yyyy" aria-invalid={Boolean(issue.dateError)} aria-describedby={issue.dateError ? dateNote : undefined} onChange={event => editDay(dayIndex, 'date', event.target.value)} /></label>
            {issue.dateError && <p id={dateNote} className="menu-inline-error">{issue.dateError}</p>}
            <label className="menu-closed-toggle"><input type="checkbox" checked={day.closed === true} onChange={event => editDay(dayIndex, 'closed', event.target.checked)} />Không phục vụ ngày này</label>
            {day.closed === true ? <p className="menu-closed-note">Ngày nghỉ — không tạo câu hỏi chọn món. Món đã nhập vẫn giữ để bỏ đánh dấu hoặc hoàn tác.</p> : <div className="dashboard-meals">{MEAL_SLOTS.map(slot => {
              const missing = issue.missingMealSlots.includes(slot);
              return <label key={slot}>Món {slot + 1}<input value={day.meals?.[slot] || ''} maxLength={500} className={missing ? 'menu-meal-missing' : ''} placeholder={missing ? 'Đối chiếu món này với ảnh' : ''} aria-invalid={Boolean(missing && issue.mealError)} aria-describedby={missing ? mealNote : undefined} onChange={event => editDay(dayIndex, 'meal', event.target.value, slot)} /></label>;
            })}</div>}
            {issue.missingMealSlots.length > 0 && <p id={mealNote} className={issue.mealError ? 'menu-inline-error' : 'menu-inline-warning'}>
              Chưa có {issue.missingMealSlots.map(slot => `Món ${slot + 1}`).join(', ')}. {issue.mealError || 'Nếu ảnh chỉ có 2 món, hãy xác nhận ở cuối bảng.'}
            </p>}
          </fieldset>;
        })}
        {validation.dateError && <p className="dashboard-warning" role="alert">{validation.dateError}</p>}
        {validation.servingError && <p className="dashboard-warning" role="alert">{validation.servingError}</p>}
        {validation.invalidMealDays.length > 0 && <p className="dashboard-warning" role="alert">Mỗi ngày cần ít nhất 2 món và tối đa 3 món: {validation.invalidMealDays.join(', ')}.</p>}
        {validation.missingMealDays.length > 0 && <label className="dashboard-confirm-missing"><input type="checkbox" checked={allowMissing} disabled={busy} onChange={event => setAllowMissing(event.target.checked)} /> Tôi xác nhận các ngày sau có ít hơn 3 món: {validation.missingMealDays.join(', ')}</label>}
        <button type="submit" disabled={busy || !validation.canCreate || Boolean(existingWeek)}>Tạo Form và Sheet</button>
      </form>}
      </div>}
    </section>}

    {tab === 'delete' && <section className="dashboard-panel">
      <div className="dashboard-section-title"><h2>Lượt gửi và lịch sử thao tác</h2></div>
      <div className="dashboard-sticky-tools">{weekPicker()}<div className="dashboard-refresh-bar"><button className="secondary" disabled={busy || weekLoading || !weekKey} onClick={() => void loadWeek(weekKey)}>{weekLoading ? 'Đang tải lại…' : 'Tải lại dữ liệu'}</button>{newResponses > 0 && <span className="dashboard-new-badge" role="status">Có {newResponses} lượt gửi mới</span>}</div><label className="dashboard-search">Tìm theo họ tên<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Nhập tên cần tìm" /></label></div>
      {displayedWeek && !weekReady && <p className="dashboard-cache-status" role="status">{cacheTime ? `Bản lưu lúc ${formatTime(cacheTime)}. ` : 'Dữ liệu lần xem trước. '}{weekLoading ? 'Đang xác minh…' : 'Chưa xác minh được; chỉ xem, hãy tải lại trước khi thao tác.'}</p>}
      {displayedWeek && weekReady && <p className="dashboard-hint">Dữ liệu đã xác minh. Tự kiểm tra lượt mới mỗi phút khi tab đang mở; bảng chỉ đổi khi tải lại.</p>}
      {pollError && <p className="dashboard-hint" role="status">{pollError}</p>}
      <p className="dashboard-warning">Chỉ hiện lượt ghép duy nhất giữa Google Form và Sheet. Khôi phục sẽ tạo lượt Form mới; thời điểm gửi gốc được lưu trong lịch sử.</p>
      <div className="dashboard-response-tools">
        <label className="dashboard-sort">Sắp xếp<select value={responseSort} onChange={event => setResponseSort(event.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="name">Tên A–Z</option>
        </select></label>
      </div>
      {weekLoading && !displayedWeek ? <p>Đang tải lượt gửi…</p> : <div className="table-wrap"><table className="dashboard-table"><thead><tr><th>Thời điểm</th><th>Họ tên</th><th>Món đã chọn</th><th>Thao tác</th></tr></thead><tbody>
        {visibleResponses.length ? visibleResponses.map(response => <tr key={response.responseId || response.rowNumber || `${response.timestamp}-${response.name}`}>
          <td>{formatTime(response.timestamp)}</td><td>{response.name}{response.partial && <strong className="dashboard-partial"> · Form đã xóa, Sheet còn hàng</strong>}</td><td>{response.meals.join(' · ')}</td>
          <td><div className="dashboard-row-actions">{permissions.manageResponses && (response.deletable || !weekReady) ? <button className="danger" disabled={busy || !weekReady} aria-busy={pendingRow?.action === 'delete' && pendingRow.id === response.responseId} onClick={() => void deleteResponse(response)}>{pendingRow?.action === 'delete' && pendingRow.id === response.responseId ? 'Đang xóa…' : response.partial ? 'Xóa nốt hàng Sheet' : 'Xóa lượt này'}</button> : <span title={response.note}>{!permissions.manageResponses ? 'Chỉ xem' : response.partial ? 'Cần kiểm tra thủ công' : 'Không đối chiếu được'}</span>}<SheetRowButton key={`${weekKey}-${weekRequest.current}-${response.responseId}`} weekKey={weekKey} source={response.partial ? 'sheet' : 'form'} response={response} request={request} disabled={busy || !weekReady} /></div></td>
        </tr>) : <tr><td className="empty" colSpan="4">Không có lượt gửi phù hợp.</td></tr>}
      </tbody></table></div>}
      <div className="dashboard-section-title dashboard-history-title"><h2>Lịch sử thao tác</h2><span>{displayedWeek?.history?.length || 0} sự kiện gần nhất</span></div>
      <p>Lịch sử lưu tên, món đã chọn, thời điểm và Gmail quản trị; không lưu email người trả lời.</p>
      {(displayedWeek?.history || []).length ? <div className="table-wrap"><table className="dashboard-table dashboard-history-table"><thead><tr><th>Thao tác</th><th>Thời gian</th><th>Người thực hiện</th><th>Đối tượng</th><th></th></tr></thead><tbody>
        {displayedWeek.history.map(event => {
          const alreadyRestored = restoreAttempts.has(event.entryId);
          const restoreEligible = event.action === 'deleted' && event.restorable && !alreadyRestored;
          const canRestore = weekReady && permissions.manageResponses && restoreEligible && displayedWeek?.week?.formStatus === 'open';
          return <tr key={event.id}>
            <td><strong className="dashboard-history-action">{historyActionLabel(event.action)}</strong>{describeHistoryNote(event.note).map((line, index) => <small key={index} className="dashboard-history-note">{line}</small>)}</td>
            <td data-label="Thời gian">{formatTime(event.at)}{event.originalTimestamp > 0 && <small className="dashboard-history-note">Gửi gốc: {formatTime(event.originalTimestamp)}</small>}</td>
            <td data-label="Người thực hiện">{event.actor || '—'}</td>
            <td data-label="Đối tượng"><strong>{event.name || '—'}</strong><small className="dashboard-history-note">{(event.meals || []).join(' · ')}</small></td>
            <td>{canRestore ? <button className="secondary" disabled={busy} aria-busy={pendingRow?.action === 'restore' && pendingRow.id === event.entryId} onClick={() => void restoreResponse(event)}>{pendingRow?.action === 'restore' && pendingRow.id === event.entryId ? 'Đang khôi phục…' : 'Khôi phục'}</button> : restoreEligible && weekData?.week?.formStatus === 'closed' ? <span title="Không tự mở Form vì thao tác đó sẽ công khai Form">Form đã đóng</span> : restoreEligible ? <span>Chưa xác định Form</span> : alreadyRestored && event.action === 'deleted' ? <span>Đã xử lý</span> : null}</td>
          </tr>;
        })}
      </tbody></table></div> : <p>Chưa có thao tác nào trong tuần này.</p>}
    </section>}

    {tab === 'form' && overview.role === 'owner' && <section className="dashboard-panel">
      <div className="dashboard-section-title"><h2>Trạng thái và hạn đăng ký</h2>{weekPicker()}</div>
      {selectedWeek ? <><p>Form: <strong>{selectedWeek.formStatus === 'open' ? 'Đang mở' : selectedWeek.formStatus === 'closed' ? 'Đã đóng' : 'Chưa xác định'}</strong></p><p>Hạn hiện tại: {selectedWeek.lockAt ? formatTime(Date.parse(selectedWeek.lockAt)) : 'Chưa có hạn'} (giờ Việt Nam)</p><label className="dashboard-deadline">Hạn mới — giờ Việt Nam<input type="datetime-local" value={deadline} disabled={busy} onChange={event => setDeadline(event.target.value)} /></label><p className="dashboard-hint">Mở lại Form quá hạn cần chọn hạn tương lai. Lịch tự đóng dùng hạn mới; tuần chưa chỉnh vẫn khóa lúc 00:00 thứ Hai.</p><div className="actions"><button disabled={busy || selectedWeek.formStatus !== 'closed'} onClick={() => void controlForm('open')}>Mở Form</button><button className="danger" disabled={busy || selectedWeek.formStatus !== 'open'} onClick={() => void controlForm('close')}>Đóng Form</button><button className="secondary" disabled={busy || selectedWeek.formStatus === 'unknown'} onClick={() => void controlForm('deadline')}>Lưu hạn đăng ký</button></div></> : <p>Chọn một tuần đã đăng ký.</p>}
      <p className="dashboard-hint">Lịch sử các thay đổi nằm trong “Lượt gửi &amp; lịch sử” của tuần này.</p>
    </section>}

    {tab === 'reconcile' && <section className="dashboard-panel">
      <div className="dashboard-section-title"><h2>Đối soát Form–Sheet</h2>{weekPicker()}</div><p>Chỉ đọc: không tự sửa, ghép, khôi phục hoặc xóa dữ liệu.</p><button disabled={busy || !weekKey} onClick={() => void reconcileWeek()}>{busy ? 'Đang đối soát…' : 'Đối soát tuần này'}</button>
      {reconciliation && <><div className="reconciliation-counts"><p>Form <strong>{reconciliation.formCount}</strong></p><p>Sheet <strong>{reconciliation.sheetCount}</strong></p><p>Ghép duy nhất <strong>{reconciliation.matchedCount}</strong></p><p>Cần kiểm tra <strong>{reconciliation.issues.length}</strong></p></div><ul className="reconciliation-issues">{reconciliation.issues.map((issue, index) => <li key={`${weekKey}-${index}`}><strong>{({ 'form-only': 'Chỉ có trong Form', 'sheet-only': 'Chỉ có trong Sheet', ambiguous: 'Ghép không duy nhất' })[issue.kind]}</strong><p>{issue.name || '(Thiếu tên)'} · {formatTime(issue.timestamp)} · {issue.source === 'sheet' ? 'Sheet' : 'Form'}{issue.rows?.length ? ` · hàng ${issue.rows.join(', ')}` : ''}</p><p>{issue.meals.join(' · ')}</p><SheetRowButton weekKey={weekKey} source={issue.source} response={issue} request={request} disabled={busy} /></li>)}</ul>{!reconciliation.issues.length && <p role="status">Form và Sheet đang khớp duy nhất.</p>}</>}
    </section>}

    {tab === 'branding' && overview.role === 'owner' && <section className="dashboard-panel"><h2>Thương hiệu trường</h2><p>Áp dụng cho trang xem, kho tuần, Dashboard và cài đặt. Chỉ lưu thông tin hiển thị công khai.</p><form className="branding-form" onSubmit={event => void saveBranding(event)}><label>Tên trường<input required maxLength={100} value={brandDraft.schoolName} onChange={event => setBrandDraft({ ...brandDraft, schoolName: event.target.value })} /></label><label>URL ảnh logo HTTPS<input type="url" maxLength={512} placeholder="https://…/logo.png" value={brandDraft.logoUrl} onChange={event => setBrandDraft({ ...brandDraft, logoUrl: event.target.value })} /></label><label>Màu chủ đạo<input type="color" value={brandDraft.primaryColor} onChange={event => setBrandDraft({ ...brandDraft, primaryColor: event.target.value })} /></label><div className="branding-preview" style={{ background: brandDraft.primaryColor, color: brandingTheme(brandDraft.primaryColor).foreground }}>{normalizeBranding(brandDraft).logoUrl && <img src={normalizeBranding(brandDraft).logoUrl} alt="Xem trước logo" referrerPolicy="no-referrer" />}<strong>{brandDraft.schoolName || 'Tên trường của bạn'}</strong></div><p className="dashboard-hint">Dùng ảnh HTTPS truy cập được công khai; chưa hỗ trợ tải ảnh lên. Không dán khóa API hoặc liên kết chứa thông tin bí mật.</p><button disabled={busy}>Lưu thương hiệu</button></form></section>}

    {tab === 'access' && overview.role === 'owner' && <section className="dashboard-panel">
      <h2>Gmail được phép quản trị</h2>
      <p>Gmail mới mặc định chỉ xem. Gmail cũ giữ quyền hiện có cho đến khi chủ chỉnh.</p>
      <form className="dashboard-access-form" onSubmit={event => { event.preventDefault(); void changeAllowedEmail('add-email'); }}>
        <label>Thêm Gmail<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="ten@gmail.com" required /></label>
        <button disabled={busy}>Cấp quyền</button>
      </form>
      <ul className="dashboard-email-list">{(overview.members || (overview.allowedEmails || []).map(email => ({ email, permissions: { view: true, create: true, manageResponses: true } }))).map(member => <li key={member.email}>
        <strong>{member.email}</strong><div className="member-permissions"><span>{member.permissions.view ? '✓ Xem' : 'Quyền lỗi'}</span>{[['create', 'OCR / tạo tuần'], ['manageResponses', 'Xóa / khôi phục']].map(([key, label]) => <label key={key}><input type="checkbox" checked={member.permissions[key] === true} disabled={busy} onChange={event => void changeAllowedEmail('set-permissions', member.email, { ...member.permissions, view: true, [key]: event.target.checked })} /> {label}</label>)}</div>
        <button className="danger" disabled={busy} onClick={() => { if (window.confirm(`Gỡ quyền dashboard của ${member.email}?`)) void changeAllowedEmail('remove-email', member.email); }}>Gỡ quyền</button>
      </li>)}</ul>
    </section>}
    <ActionToast message={toast?.message} kind={toast?.kind} onDismiss={dismissToast} />
    {confirmation && <ActionConfirmation message={confirmation.message} onCancel={() => setConfirmation(null)} onConfirm={reason => { const action = confirmation.run; setConfirmation(null); void action(reason); }} />}
  </main>;
}

export default Dashboard;
