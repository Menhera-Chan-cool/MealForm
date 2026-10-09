import { useEffect, useMemo, useState } from 'react';
import { errorMessage } from './viewer-model.mjs';
import { inspectMenu } from './dashboard-model.mjs';
import MenuImagePreview from './MenuImagePreview.jsx';
import useOcrDraft from './useOcrDraft.js';
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
    'restore-review': 'Khôi phục cần kiểm tra'
  })[action] || action;
}

function Dashboard({ initialData, onUnauthorized, onSignOut }) {
  const request = (url, options) => dashboardRequest(url, options, onUnauthorized);
  const [overview, setOverview] = useState(initialData || { role: '', weeks: [], allowedEmails: [] });
  const [tab, setTab] = useState(() => {
    const initialTab = new URLSearchParams(window.location.search).get('tab');
    return ['create', 'health'].includes(initialTab) ? initialTab : 'overview';
  });
  const [weekKey, setWeekKey] = useState(initialData?.weeks?.[0]?.weekKey || '');
  const [weekData, setWeekData] = useState(null);
  const [query, setQuery] = useState('');
  const [responseSort, setResponseSort] = useState('newest');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [image, setImage] = useState('');
  const [menu, setMenu] = useState(null);
  const [allowMissing, setAllowMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState('');
  const [authorizationUrl, setAuthorizationUrl] = useState('');
  const [health, setHealth] = useState(null);
  const [healthBusy, setHealthBusy] = useState(false);
  const permissions = overview.permissions || { view: true, create: true, manageResponses: true };
  const draft = useOcrDraft(overview.accountId, permissions.create === true, { image, filename: file?.name || '', menu }, saved => {
    setImage(saved.image); setFile({ name: saved.filename }); setMenu(saved.menu); setAllowMissing(false);
  });

  const validation = useMemo(() => inspectMenu(menu, allowMissing), [menu, allowMissing]);
  const visibleResponses = (weekData?.responses || []).filter(response =>
    String(response.name || '').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).slice().sort((left, right) => {
      if (responseSort === 'name') return String(left.name || '').localeCompare(String(right.name || ''), 'vi', { sensitivity: 'base' });
      const difference = Number(left.timestamp || 0) - Number(right.timestamp || 0);
      return responseSort === 'oldest' ? difference : -difference;
    });
  const restoreAttempts = new Set((weekData?.history || []).filter(event => /^restore-/.test(event.action) || event.action === 'restored').map(event => event.entryId));

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
    if (!key) { setWeekData(null); return; }
    setBusy(true);
    try {
      setWeekData(await request(`/api/dashboard?week=${encodeURIComponent(key)}`));
      setMessage('');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  useEffect(() => { if (!initialData) void refreshOverview(); }, []);
  useEffect(() => { if (tab === 'delete') void loadWeek(weekKey); }, [tab, weekKey]);
  useEffect(() => { if (tab === 'health' && overview.role === 'owner') void checkHealth(); }, [tab, weekKey, overview.role]);
  useEffect(() => {
    if ((tab === 'create' && !permissions.create) || (tab === 'health' && overview.role !== 'owner')) setTab('overview');
  }, [tab, permissions.create, overview.role]);

  async function checkHealth() {
    setHealthBusy(true);
    setHealth(null);
    try {
      const response = await fetch(`/api/dashboard?health=1&week=${encodeURIComponent(weekKey)}`, { credentials: 'same-origin', cache: 'no-store' });
      const report = await response.json();
      if (response.status === 401 || response.status === 403) { onUnauthorized(errorMessage(report.error), response.status); return; }
      if (!Array.isArray(report.checks)) throw new Error('Không nhận được kết quả kiểm tra.');
      setHealth(report);
    } catch (error) {
      setHealth({ checks: [{ id: 'network', label: 'Kết nối máy chủ', status: 'error', message: 'Không kết nối được để kiểm tra. Hãy thử lại khi có mạng.' }] });
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
    setMenu(current => ({
      ...current,
      days: current.days.map((day, index) => index !== dayIndex ? day : field === 'meal'
        ? { ...day, meals: MEAL_SLOTS.map(slot => slot === mealIndex ? value : (day.meals[slot] || '')) }
        : { ...day, [field]: value })
    }));
  }

  async function createWeek(event) {
    event.preventDefault();
    if (!validation.canCreate) {
      setMessage(validation.dateError || (validation.invalidMealDays.length ? 'Mỗi ngày cần ít nhất 2 món và tối đa 3 món.' : 'Xác nhận tiếp tục với ngày thiếu món.'));
      return;
    }
    const payload = {
      ...menu,
      days: menu.days.map(day => ({ ...day, meals: (day.meals || []).map(value => String(value || '').trim()).filter(Boolean) }))
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

  async function deleteResponse(response) {
    const time = formatTime(response.timestamp);
    if (!response.deletable || !response.deleteToken) return;
    const prompt = response.partial
      ? `Form đã xóa lượt của ${response.name} lúc ${time}, nhưng Sheet còn hàng dữ liệu. Xóa nốt hàng Sheet này?`
      : `Xóa lượt gửi của ${response.name} lúc ${time} khỏi Form và Sheet?`;
    if (!window.confirm(prompt)) return;
    setBusy(true); setMessage('Đang xóa lượt gửi…');
    try {
      await request('/api/dashboard', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekKey, responseId: response.responseId, deleteToken: response.deleteToken })
      });
      await refreshOverview();
      await loadWeek(weekKey);
      setMessage(response.partial
        ? `Đã hoàn tất xóa hàng Sheet còn sót của ${response.name}.`
        : `Đã xóa lượt gửi của ${response.name} khỏi Form và Sheet.`);
    } catch (error) { await loadWeek(weekKey); setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function restoreResponse(event) {
    if (!event.restorable || !event.entryId || restoreAttempts.has(event.entryId)) return;
    const originalTime = formatTime(event.originalTimestamp);
    if (!window.confirm(`Khôi phục lượt của ${event.name} (gửi gốc lúc ${originalTime})? Lượt sẽ được tạo mới trong Form, nên thời điểm gửi trong Form sẽ là thời điểm hiện tại.`)) return;
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
    finally { setBusy(false); }
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
      <select value={weekKey} disabled={tab === 'health' && healthBusy} onChange={event => setWeekKey(event.target.value)}>
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
      {overview.role === 'owner' && <button className={tab === 'health' ? 'active' : 'secondary'} onClick={() => setTab('health')}>Hệ thống</button>}
      {overview.role === 'owner' && <button className={tab === 'access' ? 'active' : 'secondary'} onClick={() => setTab('access')}>Quyền Gmail</button>}
    </nav>
    {message && <p className={`dashboard-message ${/không|lỗi|chưa/i.test(message) ? 'error' : ''}`} role="status" aria-live="polite">{message}{authorizationUrl && <> <a className="action-link" href={authorizationUrl} target="_blank" rel="noopener noreferrer">Mở trang cấp quyền Google</a></>}</p>}

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
      {menu && <form className="menu-review" onSubmit={createWeek}>
        <label>Tiêu đề tuần<input value={menu.title || ''} maxLength={500} disabled={busy} onChange={event => setMenu(current => ({ ...current, title: event.target.value }))} /></label>
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
            <div className="dashboard-meals">{MEAL_SLOTS.map(slot => {
              const missing = issue.missingMealSlots.includes(slot);
              return <label key={slot}>Món {slot + 1}<input value={day.meals?.[slot] || ''} maxLength={500} className={missing ? 'menu-meal-missing' : ''} placeholder={missing ? 'Đối chiếu món này với ảnh' : ''} aria-invalid={Boolean(missing && issue.mealError)} aria-describedby={missing ? mealNote : undefined} onChange={event => editDay(dayIndex, 'meal', event.target.value, slot)} /></label>;
            })}</div>
            {issue.missingMealSlots.length > 0 && <p id={mealNote} className={issue.mealError ? 'menu-inline-error' : 'menu-inline-warning'}>
              Chưa có {issue.missingMealSlots.map(slot => `Món ${slot + 1}`).join(', ')}. {issue.mealError || 'Nếu ảnh chỉ có 2 món, hãy xác nhận ở cuối bảng.'}
            </p>}
          </fieldset>;
        })}
        {validation.dateError && <p className="dashboard-warning" role="alert">{validation.dateError}</p>}
        {validation.invalidMealDays.length > 0 && <p className="dashboard-warning" role="alert">Mỗi ngày cần ít nhất 2 món và tối đa 3 món: {validation.invalidMealDays.join(', ')}.</p>}
        {validation.missingMealDays.length > 0 && <label className="dashboard-confirm-missing"><input type="checkbox" checked={allowMissing} disabled={busy} onChange={event => setAllowMissing(event.target.checked)} /> Tôi xác nhận các ngày sau có ít hơn 3 món: {validation.missingMealDays.join(', ')}</label>}
        <button type="submit" disabled={busy || !validation.canCreate}>Tạo Form và Sheet</button>
      </form>}
      </div>}
    </section>}

    {tab === 'delete' && <section className="dashboard-panel">
      <div className="dashboard-section-title"><h2>Lượt gửi và lịch sử thao tác</h2>{weekPicker()}</div>
      <p className="dashboard-warning">Chỉ hiện lượt ghép duy nhất giữa Google Form và Sheet. Khôi phục sẽ tạo lượt Form mới; thời điểm gửi gốc được lưu trong lịch sử.</p>
      <div className="dashboard-response-tools">
        <label className="dashboard-search">Tìm theo họ tên<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Nhập tên cần tìm" /></label>
        <label className="dashboard-sort">Sắp xếp<select value={responseSort} onChange={event => setResponseSort(event.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="name">Tên A–Z</option>
        </select></label>
      </div>
      {busy && !weekData ? <p>Đang tải lượt gửi…</p> : <div className="table-wrap"><table className="dashboard-table"><thead><tr><th>Thời điểm</th><th>Họ tên</th><th>Món đã chọn</th><th>Thao tác</th></tr></thead><tbody>
        {visibleResponses.length ? visibleResponses.map(response => <tr key={response.responseId || response.rowNumber || `${response.timestamp}-${response.name}`}>
          <td>{formatTime(response.timestamp)}</td><td>{response.name}{response.partial && <strong className="dashboard-partial"> · Form đã xóa, Sheet còn hàng</strong>}</td><td>{response.meals.join(' · ')}</td>
          <td>{permissions.manageResponses && response.deletable ? <button className="danger" disabled={busy} onClick={() => void deleteResponse(response)}>{response.partial ? 'Xóa nốt hàng Sheet' : 'Xóa lượt này'}</button> : <span title={response.note}>{!permissions.manageResponses ? 'Chỉ xem' : response.partial ? 'Cần kiểm tra thủ công' : 'Không đối chiếu được'}</span>}</td>
        </tr>) : <tr><td className="empty" colSpan="4">Không có lượt gửi phù hợp.</td></tr>}
      </tbody></table></div>}
      <div className="dashboard-section-title dashboard-history-title"><h2>Lịch sử thao tác</h2><span>{weekData?.history?.length || 0} sự kiện gần nhất</span></div>
      <p>Lịch sử lưu tên, món đã chọn, thời điểm và Gmail quản trị; không lưu email người trả lời.</p>
      {(weekData?.history || []).length ? <div className="table-wrap"><table className="dashboard-table dashboard-history-table"><thead><tr><th>Thao tác</th><th>Thời gian</th><th>Người thực hiện</th><th>Lượt chọn</th><th></th></tr></thead><tbody>
        {weekData.history.map(event => {
          const alreadyRestored = restoreAttempts.has(event.entryId);
          const restoreEligible = event.action === 'deleted' && event.restorable && !alreadyRestored;
          const canRestore = permissions.manageResponses && restoreEligible && weekData?.week?.formStatus === 'open';
          return <tr key={event.id}>
            <td>{historyActionLabel(event.action)}{event.note && <small className="dashboard-history-note">{event.note}</small>}</td>
            <td>{formatTime(event.at)}{event.originalTimestamp > 0 && <small className="dashboard-history-note">Gửi gốc: {formatTime(event.originalTimestamp)}</small>}</td>
            <td>{event.actor || '—'}</td>
            <td><strong>{event.name || '—'}</strong><small className="dashboard-history-note">{(event.meals || []).join(' · ')}</small></td>
            <td>{canRestore ? <button className="secondary" disabled={busy} onClick={() => void restoreResponse(event)}>Khôi phục</button> : restoreEligible && weekData?.week?.formStatus === 'closed' ? <span title="Không tự mở Form vì thao tác đó sẽ công khai Form">Form đã đóng</span> : restoreEligible ? <span>Chưa xác định Form</span> : alreadyRestored && event.action === 'deleted' ? <span>Đã xử lý</span> : null}</td>
          </tr>;
        })}
      </tbody></table></div> : <p>Chưa có thao tác nào trong tuần này.</p>}
    </section>}

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
  </main>;
}

export default Dashboard;
