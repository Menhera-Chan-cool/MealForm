import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ALL, buildDetailModel, errorMessage, readViewerFilters, spreadsheetIdFromUrl, viewerApiUrl, weekNavigation, shouldDeferViewerUpdate, millisecondsUntilMealWeekRollover, todayDayLabel, mealRegistrationTarget } from './viewer-model.mjs';
import Dashboard from './Dashboard.jsx';
import DetailTable from './DetailTable.jsx';
import FilterControls, { ComboSelect } from './FilterControls.jsx';
import MealFormLink from './MealFormLink.jsx';
import FormStatus from './FormStatus.jsx';
import ChevronIcon from './ChevronIcon.jsx';
import useDisclosureAnimation from './useDisclosureAnimation.js';
import HistoryArchive from './HistoryArchive.jsx';
import SetupChecklist from './SetupChecklist.jsx';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '';
const AUTO_REFRESH_MS = 5 * 60 * 1000;
const FILTERS_STORAGE_KEY = 'meal-viewer-filters';
const SUMMARY_PANEL_STORAGE_KEY = 'meal-viewer-summary-open';
const RESPONSE_SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'name', label: 'Tên A–Z' }
];
const initialFilters = () => {
  try { return readViewerFilters(window.localStorage.getItem(FILTERS_STORAGE_KEY)); }
  catch { return readViewerFilters(null); }
};
const MOTION_OVERRIDE_KEY = 'meal-viewer-motion-override';

function SummaryIcon() {
  return <svg className="section-heading-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="8" width="4" height="13" rx="1" /><rect x="17" y="3" width="4" height="18" rx="1" />
  </svg>;
}

function PeopleIcon() {
  return <svg className="section-heading-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="9" cy="7" r="3.5" /><path d="M2 21v-1.5a7 7 0 0 1 14 0V21H2Z" />
    <circle cx="18" cy="8" r="2.5" /><path d="M17 14.5a5.5 5.5 0 0 1 5 5.5v1h-4.5v-1.5c0-1.9-.6-3.6-1.7-5Z" />
  </svg>;
}

function SproutIcon() {
  return <svg className="week-sprout" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 21v-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 14C7.8 14 5 11.3 5 7c4.4 0 7 2.6 7 7Zm0-3c0-4.4 2.6-7 7-7 0 4.4-2.6 7-7 7Z" />
  </svg>;
}

export function MotionPreferenceToggle({ reducedMotion, fullMotion, onToggle }) {
  if (!reducedMotion) return null;
  return <button className="secondary motion-preference" type="button" aria-pressed={fullMotion} onClick={onToggle}>
    {fullMotion ? 'Tắt hiệu ứng đầy đủ' : 'Bật hiệu ứng đầy đủ'}
  </button>;
}

function App() {
  const viewerPath = window.location.pathname;
  const viewerSearch = window.location.search;
  const isDashboard = viewerPath === '/dashboard' || viewerPath === '/dashboard/';
  const isSetup = viewerPath.replace(/\/+$/, '') === '/setup';
  const isHistory = viewerPath.replace(/\/+$/, '') === '/history';
  const isHistoryList = isHistory && !new URLSearchParams(viewerSearch).get('week');
  const isNewestPage = viewerPath === '/newest' || viewerPath === '/newest/';
  const isOldPage = viewerPath === '/old' || viewerPath === '/old/';
  const isNextPage = viewerPath === '/next' || viewerPath === '/next/';
  const isWeekPage = isNewestPage || isOldPage || isNextPage;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const weekLink = weekNavigation(viewerPath);
  const [auth, setAuth] = useState('loading');
  const [fullMotion, setFullMotion] = useState(() => {
    try { return window.localStorage.getItem(MOTION_OVERRIDE_KEY) === 'full'; }
    catch { return false; }
  });
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [responseSort, setResponseSort] = useState('newest');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [message, setMessage] = useState('Đang kiểm tra đăng nhập…');
  const { open: summaryOpen, closing: summaryClosing, active: summaryActive, toggle: toggleSummary } = useDisclosureAnimation(SUMMARY_PANEL_STORAGE_KEY);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [advancedError, setAdvancedError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [weekUnavailable, setWeekUnavailable] = useState(false);
  const [serverClockOffset, setServerClockOffset] = useState(0);
  const signInRoot = useRef(null);
  const loading = useRef(false);
  const rolloverTimer = useRef(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    if (fullMotion) document.documentElement.dataset.motionOverride = 'full';
    else delete document.documentElement.dataset.motionOverride;
    try {
      if (fullMotion) window.localStorage.setItem(MOTION_OVERRIDE_KEY, 'full');
      else window.localStorage.removeItem(MOTION_OVERRIDE_KEY);
    } catch { /* The animation preference still works for this page if storage is unavailable. */ }
  }, [fullMotion]);

  useEffect(() => {
    try { window.localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters)); }
    catch { /* Filters still work for this page if storage is unavailable. */ }
  }, [filters]);

  const loadData = useCallback(async (force = false, guest = false, background = false) => {
    const url = viewerApiUrl(viewerPath, viewerSearch, force, guest);
    if (!url) { setLoadError('Liên kết xem thiếu mã bảng tính.'); return; }
    if (loading.current) return;
    loading.current = true;
    if (background) setChecking(true);
    else { setBusy(true); setLoadError(''); setMessage('Đang tải dữ liệu…'); }
    try {
      const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
      if (response.status === 401) { setData(null); setAuth('anonymous'); setPendingUpdate(false); setLoadError(''); return; }
      const result = await response.json();
      const responseTime = Date.parse(response.headers.get('date') || '');
      if (Number.isFinite(responseTime)) setServerClockOffset(responseTime - Date.now());
      if (isWeekPage) {
        const serverTime = Date.parse(response.headers.get('date') || '');
        window.clearTimeout(rolloverTimer.current);
        rolloverTimer.current = window.setTimeout(() => void loadData(false, guest), millisecondsUntilMealWeekRollover(Number.isFinite(serverTime) ? serverTime : Date.now()) + 1000);
      }
      if (response.status === 404 && isWeekPage) {
        setData(null);
        setWeekUnavailable(true);
        setPendingUpdate(false);
        setLoadError(errorMessage(result.error, 'Chưa có thực đơn cho tuần này.'));
        setMessage('');
        return;
      }
      if (!response.ok) throw new Error(errorMessage(result.error, 'Không thể tải dữ liệu.'));
      setWeekUnavailable(false);
      if (background && shouldDeferViewerUpdate(dataRef.current, result)) {
        setPendingUpdate(true);
        setLoadError('');
        setMessage('');
        return;
      }
      setData(result);
      setPendingUpdate(false);
      setLoadError('');
      setMessage(background ? '' : 'Dữ liệu đã được cập nhật.');
    } catch (error) {
      const reason = error instanceof TypeError ? 'Không thể kết nối tới máy chủ.'
        : error instanceof SyntaxError ? 'Máy chủ trả về dữ liệu không hợp lệ.'
          : errorMessage(error, 'Không thể tải dữ liệu.');
      setLoadError(`${reason}${dataRef.current ? ' Dữ liệu lần tải trước đang được giữ.' : ''}`);
      setMessage('');
    } finally {
      loading.current = false;
      if (background) setChecking(false);
      else setBusy(false);
    }
  }, [viewerPath, viewerSearch, isWeekPage]);

  useEffect(() => () => window.clearTimeout(rolloverTimer.current), [loadData]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/session', { credentials: 'same-origin', cache: 'no-store' })
      .then(response => response.json())
      .then(async result => {
        if (cancelled) return;
        if (!result.authenticated) { setAuth('anonymous'); setMessage('Đăng nhập bằng Google để xem thực đơn.'); return; }
        if (!isDashboard) { setAuth('authenticated'); if (!isSetup && !isHistoryList) void loadData(false); return; }
        try {
          const access = await fetch('/api/dashboard', { credentials: 'same-origin', cache: 'no-store' });
          const body = await access.json();
          if (cancelled) return;
          if (!access.ok) { setAuth('forbidden'); setMessage(errorMessage(body.error, 'Tài khoản chưa được cấp quyền dashboard.')); return; }
          setDashboardData(body);
          setAuth('authenticated');
          setMessage('');
        } catch (error) {
          if (!cancelled) { setAuth('forbidden'); setMessage(errorMessage(error, 'Không thể xác nhận quyền dashboard.')); }
        }
      })
      .catch(() => { if (!cancelled) { setAuth('anonymous'); setMessage('Hãy đăng nhập bằng Google để tiếp tục.'); } });
    return () => { cancelled = true; };
  }, [isDashboard, isSetup, isHistoryList, loadData]);

  useEffect(() => {
    if (isDashboard || isSetup || isHistoryList || (auth !== 'authenticated' && auth !== 'guest')) return undefined;
    let timer;
    const guest = auth === 'guest';
    const schedule = () => {
      window.clearTimeout(timer);
      if (document.visibilityState === 'visible') {
        timer = window.setTimeout(async () => {
          await loadData(false, guest, true);
          schedule();
        }, AUTO_REFRESH_MS);
      }
    };
    const onVisibilityChange = () => {
      window.clearTimeout(timer);
      if (document.visibilityState === 'visible') {
        void loadData(false, guest, true);
        schedule();
      }
    };
    schedule();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [auth, isDashboard, loadData]);

  useEffect(() => {
    if (auth !== 'anonymous' || !signInRoot.current || !CLIENT_ID) return undefined;
    let timer;
    const renderButton = () => {
      if (!window.google?.accounts?.id || !signInRoot.current) return false;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async response => {
          try {
            setMessage('Đang xác minh tài khoản Google…');
            const result = await fetch('/api/session', {
              method: 'POST', credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential })
            });
            const body = await result.json();
            if (!result.ok) throw new Error(errorMessage(body.error, 'Không thể đăng nhập.'));
            if (isDashboard) {
              const access = await fetch('/api/dashboard', { credentials: 'same-origin', cache: 'no-store' });
              const accessBody = await access.json();
              if (!access.ok) { setAuth('forbidden'); setMessage(errorMessage(accessBody.error, 'Tài khoản chưa được cấp quyền dashboard.')); return; }
              setDashboardData(accessBody);
              setAuth('authenticated');
              setMessage('');
            } else {
              setAuth('authenticated');
              await loadData(false);
            }
          } catch (error) { setMessage(errorMessage(error, 'Không thể đăng nhập Google.')); }
        }
      });
      signInRoot.current.replaceChildren();
      window.google.accounts.id.renderButton(signInRoot.current, {
        theme: 'outline', size: 'large', shape: 'rectangular', text: 'signin_with',
        locale: 'vi', width: Math.max(240, signInRoot.current.clientWidth)
      });
      return true;
    };
    if (!renderButton()) timer = window.setInterval(() => { if (renderButton()) window.clearInterval(timer); }, 150);
    return () => window.clearInterval(timer);
  }, [auth, loadData]);

  const days = Array.isArray(data?.days) ? data.days : [];
  const weekDates = days.map(day => typeof day === 'string' ? day : String(day?.day || ''))
    .map(label => label.match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0]).filter(Boolean);
  const pageTitle = isNewestPage ? 'Thực đơn tuần này' : isOldPage ? 'Thực đơn tuần trước' : isNextPage ? 'Thực đơn tuần sau' : isHistory ? 'Kho thực đơn tuần cũ' : 'Thực đơn bán trú';
  const nameOptions = useMemo(() => [...new Set((data?.rows || []).map(row => String(row?.[1] || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi')), [data]);
  const mealOptions = useMemo(() => [...new Set(days.flatMap(day => Array.isArray(day.meals) ? day.meals : []))].sort((a, b) => a.localeCompare(b, 'vi')), [days]);
  useEffect(() => {
    if (!data) return;
    const availableDays = new Set(days.map(day => typeof day === 'string' ? day : String(day?.day || '')));
    const availableMeals = new Set(mealOptions);
    setFilters(current => {
      const day = current.day !== ALL && !availableDays.has(current.day) ? ALL : current.day;
      const meal = current.meal !== ALL && !availableMeals.has(current.meal) ? ALL : current.meal;
      return day === current.day && meal === current.meal ? current : { ...current, day, meal };
    });
  }, [data, days, mealOptions]);
  const model = useMemo(() => buildDetailModel(data, filters, responseSort), [data, filters, responseSort]);
  const formStatus = busy || !data ? 'loading' : data.formStatus || 'loading';
  const registration = mealRegistrationTarget(data, isNewestPage);
  const todayLabel = todayDayLabel(days, Date.now() + serverClockOffset);

  function setFilter(key, value) { setFilters(current => ({ ...current, [key]: value })); }
  function openSpreadsheet() {
    const sheetId = spreadsheetIdFromUrl(spreadsheetUrl);
    if (!sheetId) {
      setAdvancedError('URL hoặc mã Spreadsheet không hợp lệ.');
      return;
    }
    setAdvancedError('');
    window.location.assign(`/?view=${encodeURIComponent(sheetId)}`);
  }
  function renderSummary() {
    const groups = [];
    days.forEach((day, dayIndex) => {
      const dayLabel = typeof day === 'string' ? day : day.day;
      if (filters.day !== ALL && dayLabel !== filters.day) return;
      const meals = (day.meals || []).filter(meal => filters.meal === ALL || meal.toLocaleLowerCase().includes(filters.meal.toLocaleLowerCase()));
      if (!meals.length) return;
      groups.push(<tbody className="summary-day" key={dayLabel}>{meals.map((meal, mealIndex) => {
        const count = model.sourceRows.filter(row => String(row?.[2 + dayIndex] || '').trim() === meal).length;
        return <tr key={`${dayIndex}-${meal}`}>
          {mealIndex === 0 && <td className="summary-day-label" rowSpan={meals.length}>{dayLabel}</td>}
          <td className="summary-meal">{meal}</td>
          <td className="summary-count"><span className="summary-count-value">{count}<span className="summary-count-unit"> lượt</span></span></td>
        </tr>;
      })}</tbody>);
    });
    return groups.length ? groups : <tbody className="summary-empty"><tr><td className="empty" colSpan="3">Không có dữ liệu phù hợp.</td></tr></tbody>;
  }

  async function signOutDashboard() {
    await fetch('/api/session', { method: 'DELETE', credentials: 'same-origin' });
    setAuth('anonymous');
    setMessage('Đã đăng xuất. Hãy dùng Gmail được cấp quyền dashboard.');
  }

  if (isSetup) return <SetupChecklist authenticated={auth === 'authenticated'} />;
  if (isHistoryList && auth === 'loading') return <main><p>Đang xác nhận đăng nhập…</p></main>;
  if (isHistoryList && auth === 'authenticated') return <main><header><h1>Kho thực đơn tuần cũ</h1><a href="/newest">← Tuần này</a></header><HistoryArchive onUnauthorized={() => setAuth('anonymous')} /></main>;
  if (isDashboard) {
    if (auth === 'loading') return <main><p className="message">Đang xác nhận đăng nhập và quyền dashboard…</p></main>;
    if (auth === 'anonymous') return <main><header><h1>Dashboard quản trị thực đơn</h1><p className="sub">Đăng nhập bằng Gmail được chủ sở hữu cấp quyền.</p></header><section className="login-panel"><h2>Đăng nhập để quản trị</h2>{CLIENT_ID ? <div className="google-signin" ref={signInRoot} /> : <p className="error">Chưa cấu hình đăng nhập Google cho trang này.</p>}<p className="message" role="status">{message}</p></section></main>;
    if (auth === 'forbidden') return <main><header><h1>Dashboard quản trị thực đơn</h1><p className="sub">Chỉ Gmail được chủ sở hữu cấp quyền mới sử dụng được dashboard.</p></header><section className="login-panel"><p className="error">{message}</p><button className="secondary" type="button" onClick={() => void signOutDashboard()}>Đổi tài khoản Google</button></section></main>;
    return <Dashboard initialData={dashboardData} onUnauthorized={message => { setAuth('forbidden'); setMessage(message); }} />;
  }

  return <main>
    <header className="viewer-header">
      <div className="viewer-title-group">
        <h1>{pageTitle}</h1>
        {weekDates.length > 0 && <p className="week-date-range">{weekDates[0]} – {weekDates[weekDates.length - 1]} <SproutIcon /></p>}
      </div>
      <MotionPreferenceToggle reducedMotion={reducedMotion} fullMotion={fullMotion} onToggle={() => setFullMotion(value => !value)} />
    </header>
    <nav className="viewer-navigation" aria-label="Các trang"><a href="/newest">Tuần này</a><a href="/history">Kho tuần cũ</a>{isHistory && <a href="/history">← Chọn tuần khác</a>}</nav>

    {auth === 'anonymous' ? <section className="login-panel">
      <h2>{isWeekPage ? 'Đăng nhập hoặc xem với tư cách khách' : 'Đăng nhập để xem thực đơn'}</h2>
      <p>Chỉ xác minh tài khoản Google; trang này không yêu cầu quyền truy cập Drive, Sheets hay Forms.</p>
      {CLIENT_ID ? <div className="google-signin" ref={signInRoot} /> : <p className="error">Chưa cấu hình đăng nhập Google cho trang này.</p>}
      {isWeekPage && <div>
        <p>Khách không cần đăng nhập. Bất kỳ ai có liên kết tuần đều có thể xem họ tên và món đã chọn; chỉ xem, không thể sửa.</p>
        <button className="secondary" type="button" onClick={() => { setAuth('guest'); void loadData(false, true); }}>Tiếp tục với tư cách khách</button>
      </div>}
      <div className="message" role="status" aria-live="polite">{message}</div>
    </section> : auth === 'loading' ? <p className="message" role="status">Đang xác nhận phiên đăng nhập…</p> : weekUnavailable ? <section className="login-panel" role="status">
      <h2>{loadError}</h2>
      <div className="actions">
        {weekLink.map(link => <a key={link.href} className="form-link week-link" href={link.href}>{link.label}</a>)}
        <button className="secondary" type="button" disabled={busy || checking} onClick={() => void loadData(true, auth === 'guest')}>Tải lại dữ liệu</button>
      </div>
    </section> : <>
      <FilterControls days={days} nameOptions={nameOptions} mealOptions={mealOptions} filters={filters} onChange={setFilter} />

      <div className="toolbar">
        <div className="actions">
          <button type="button" onClick={() => setFilters(readViewerFilters(null))}>Xóa bộ lọc</button>
          <button className={`secondary ${pendingUpdate ? 'update-available' : ''}`} type="button" disabled={busy || checking} aria-busy={busy || checking} onClick={() => void loadData(true, auth === 'guest')}>
            {busy ? 'Đang tải…' : pendingUpdate ? 'Có dữ liệu mới · Cập nhật' : 'Tải lại dữ liệu'}
          </button>
          <button className="secondary" type="button" aria-expanded={advancedOpen} onClick={() => { setAdvancedOpen(open => !open); setAdvancedError(''); }}>Nâng cao</button>
          <button className="secondary today-button" type="button" disabled={busy || !todayLabel} aria-pressed={Boolean(todayLabel && filters.day === todayLabel)} title={todayLabel || 'Tuần đang xem không có thực đơn cho hôm nay'} onClick={() => setFilters({ name: ALL, meal: ALL, day: todayLabel })}>Hôm nay</button>
        </div>
        {advancedOpen && <div className="advanced-panel" aria-label="Lấy dữ liệu từ Spreadsheet">
          <label htmlFor="spreadsheet-url">URL Spreadsheet</label>
          <div className="advanced-row">
            <input
              id="spreadsheet-url"
              type="url"
              value={spreadsheetUrl}
              onChange={event => setSpreadsheetUrl(event.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              autoComplete="off"
            />
            <button type="button" onClick={openSpreadsheet}>Lấy dữ liệu</button>
          </div>
          <p className="advanced-hint">Dán URL hoặc mã Spreadsheet để mở trang xem riêng.</p>
          {advancedError && <p className="advanced-error" role="alert">{advancedError}</p>}
        </div>}
        <div className="form-access" aria-label="Trạng thái Form">
          <div className={`form-links${weekLink.length > 1 ? ' three-actions' : ''}${registration.dates ? ' next-registration' : ''}`}>
            {weekLink.map(link => <a key={link.href} className="form-link week-link" href={link.href}>{link.label}</a>)}
            <MealFormLink {...registration} />
          </div>
          <FormStatus status={formStatus} />
          {data?.nextFormUnavailable && <small>Chưa kiểm tra được Form tuần sau. Hãy thử tải lại dữ liệu.</small>}
        </div>
      </div>

      {loadError && <div className="viewer-error" role="alert">
        <span>{loadError}</span>
        <button className="secondary" type="button" disabled={busy || checking} onClick={() => void loadData(true, auth === 'guest')}>
          {busy ? 'Đang thử lại…' : 'Thử lại'}
        </button>
      </div>}

      <section className="data-section">
        <div className="section-heading"><div className="section-heading-title"><SummaryIcon /><h2>Tổng hợp lựa chọn</h2></div><button
          className="section-toggle" type="button" aria-expanded={summaryOpen} data-active={summaryActive}
          aria-controls="summary-panel" aria-label={summaryOpen ? 'Đóng tổng hợp' : 'Mở tổng hợp'}
          title={summaryOpen ? 'Đóng tổng hợp' : 'Mở tổng hợp'} onClick={toggleSummary}
        ><ChevronIcon expanded={summaryActive} className="summary-chevron" /></button></div>
        <div id="summary-panel" className={`collapse-panel ${summaryOpen ? 'expanded' : summaryClosing ? 'closing' : 'collapsed'}`} aria-hidden={!summaryOpen} inert={!summaryOpen}>
          <div className="summary-content">
            <p className="summary-result-count" aria-live="polite">Đang hiển thị {model.rows.length} kết quả</p>
            <div className="table-wrap summary-wrap"><table><thead><tr><th>Ngày</th><th>Món</th><th>Số lượng</th></tr></thead>{renderSummary()}</table></div>
          </div>
        </div>
      </section>

      <section className="data-section">
        <div className="section-heading detail-heading">
          <div className="section-heading-title"><PeopleIcon /><h2>Chi tiết lựa chọn</h2></div>
          <div className="detail-sort">
            <label htmlFor="response-sort">Sắp xếp</label>
            <ComboSelect id="response-sort" label="Sắp xếp" value={RESPONSE_SORT_OPTIONS.find(option => option.value === responseSort)?.label || RESPONSE_SORT_OPTIONS[0].label}
              values={RESPONSE_SORT_OPTIONS.map(option => option.label)} searchable={false} includeAll={false}
              onChange={label => setResponseSort(RESPONSE_SORT_OPTIONS.find(option => option.label === label)?.value || 'newest')} />
          </div>
        </div>
        <div key={JSON.stringify([filters, responseSort])} className="detail-results"><DetailTable model={model} /></div>
      </section>
    </>}
  </main>;
}

export default App;
