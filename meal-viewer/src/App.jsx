import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ALL, buildDetailModel, detailResultCounts, errorMessage, readViewerFilters, spreadsheetIdFromUrl, viewerApiUrl, weekNavigation, shouldDeferViewerUpdate, millisecondsUntilMealWeekRollover, todayDayLabel, mealRegistrationTarget,formatFilterSummary } from './viewer-model.mjs';
import Dashboard from './Dashboard.jsx';
import ContentSkeleton from './ContentSkeleton.jsx';
import {useAppearance} from './AppearanceProvider.jsx';
import { clearDashboardCache } from './dashboard-cache.mjs';
import { safeErrorReport } from './safe-error-report.mjs';
import ErrorReportButton from './ErrorReportButton.jsx';
import DetailTable from './DetailTable.jsx';
import FilterControls, { ComboSelect } from './FilterControls.jsx';
import RegistrationContext from './RegistrationContext.jsx';
import ChevronIcon from './ChevronIcon.jsx';
import useDisclosureAnimation from './useDisclosureAnimation.js';
import HistoryArchive from './HistoryArchive.jsx';
import SetupChecklist from './SetupChecklist.jsx';
import VersionNotice from './VersionNotice.jsx';
import { readLoginState } from './session-client.mjs';
import useReadWait,{cancelledRead,STOP_WAIT_MESSAGE} from './useReadWait.js';
import WeekNotice from './WeekNotice.jsx';
import ViewerSummary from './ViewerSummary.jsx';
import ViewerTabs from './ViewerTabs.jsx';
import usePageTitle from './usePageTitle.js';
import {ArchiveBreadcrumbs} from './WeekContext.jsx';
import {viewerPageTitle,archiveBackHref,filterConditions,viewerLinkIssue,viewerProblemKind} from './ui-clarity.mjs';
import ViewerLinkProblem from './ViewerLinkProblem.jsx';
import ElapsedWait from './ElapsedWait.jsx';
import ExplainedButton from './ExplainedButton.jsx';
import FilterEmptyState from './FilterEmptyState.jsx';
import TableWorkspace from './TableWorkspace.jsx';
import WeekNavigation from './WeekNavigation.jsx';
import {DisplayPreferencesSlot} from './ComfortProvider.jsx';

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
  const appearance = useAppearance();
  const viewerPath = window.location.pathname;
  const viewerSearch = window.location.search;
  const routeIssue=viewerLinkIssue(viewerPath,viewerSearch);
  const isDashboard = viewerPath === '/dashboard' || viewerPath === '/dashboard/';
  const isSetup = viewerPath.replace(/\/+$/, '') === '/setup';
  const isHistory = viewerPath.replace(/\/+$/, '') === '/history';
  const isHistoryList = isHistory && !new URLSearchParams(viewerSearch).get('week');
  const isNewestPage = viewerPath === '/newest' || viewerPath === '/newest/';
  const isNextPage = viewerPath === '/next' || viewerPath === '/next/';
  const isWeekPage = isNewestPage || isNextPage;
  const weekLink = weekNavigation(viewerPath);
  const [auth, setAuth] = useState('loading');
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [drilldown,setDrilldown]=useState(null);
  const [responseSort, setResponseSort] = useState('newest');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [loadProblem,setLoadProblem]=useState(null);
  const [failure, setFailure] = useState(null);
  const [message, setMessage] = useState('Đang kiểm tra đăng nhập…');
  const { open: summaryOpen, closing: summaryClosing, active: summaryActive, toggle: toggleSummary } = useDisclosureAnimation(SUMMARY_PANEL_STORAGE_KEY);
  const [mobileViewer,setMobileViewer]=useState(()=>window.matchMedia('(max-width:700px)').matches);
  const [viewerTab,setViewerTab]=useState(()=>summaryOpen?'summary':'detail');
  useEffect(()=>{
    const media=window.matchMedia('(max-width:700px)');
    const update=()=>setMobileViewer(media.matches);
    media.addEventListener('change',update);return()=>media.removeEventListener('change',update);
  },[]);
  const summaryVisible=mobileViewer?viewerTab==='summary':summaryOpen;
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [advancedError, setAdvancedError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [weekUnavailable, setWeekUnavailable] = useState(false);
  const [serverClockOffset, setServerClockOffset] = useState(0);
  const signInRoot = useRef(null);
  const googleClient = useRef(null);
  const currentSessionCheck = useRef(null);
  const authRequest = useRef(0);
  const loading = useRef(false);
  const rolloverTimer = useRef(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const {gate:reads,pending:readPending}=useReadWait();
  const [stoppedReading,setStoppedReading]=useState(false);
  const stoppedRef=useRef(false);
  function stopWaiting(){
    stoppedRef.current=true;setStoppedReading(true);reads.cancel();loading.current=false;setBusy(false);setChecking(false);setFailure(null);setLoadError('');setMessage(STOP_WAIT_MESSAGE);
  }


  useEffect(() => {
    try { window.localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters)); }
    catch { /* Filters still work for this page if storage is unavailable. */ }
  }, [filters]);

  const loadData = useCallback(async (force = false, guest = false, background = false) => {
    const url = viewerApiUrl(viewerPath, viewerSearch, force, guest);
    if (!url) { setLoadError('Liên kết xem thiếu mã bảng tính.'); return; }
    if (loading.current) return;
    if(background&&stoppedRef.current)return;
    stoppedRef.current=false;setStoppedReading(false);
    const ticket=reads.begin();
    loading.current = true;
    if (background) setChecking(true);
    else { setBusy(true); setLoadError('');setLoadProblem(null); setMessage('Đang tải dữ liệu…'); }
    try {
      const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store',signal:ticket.signal });
      if(!reads.current(ticket))throw cancelledRead();
      if (response.status === 401) { setData(null); setAuth('anonymous'); setPendingUpdate(false); setLoadError('');setLoadProblem(null); return; }
      const result = await response.json();
      if(!reads.current(ticket))throw cancelledRead();
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
      if (!response.ok) throw Object.assign(new Error(errorMessage(result.error, 'Không thể tải dữ liệu.')), { status: response.status });
      setWeekUnavailable(false);
      if (background && shouldDeferViewerUpdate(dataRef.current, result)) {
        setData(current=>({...current,weekNotice:result.weekNotice,serverNow:result.serverNow}));
        setPendingUpdate(true);
        setLoadError('');
        setMessage('');
        return;
      }
      setData(result);
      setLoadProblem(null);
      setFailure(null);
      setPendingUpdate(false);
      setLoadError('');
      setMessage(background ? '' : 'Dữ liệu đã được cập nhật.');
    } catch (error) {
      if(error.name==='AbortError')return;
      setFailure(safeErrorReport('viewer', error));
      const reason = error instanceof TypeError ? 'Không thể kết nối tới máy chủ.'
        : error instanceof SyntaxError ? 'Máy chủ trả về dữ liệu không hợp lệ.'
          : errorMessage(error, 'Không thể tải dữ liệu.');
      const kind=viewerProblemKind(error.status,error.message);
      const revoked=kind==='forbidden'||kind==='missing'||kind==='archive-only';
      if(revoked){setData(null);setPendingUpdate(false);if(kind==='forbidden')clearDashboardCache();}
      setLoadProblem(kind);
      setLoadError(`${reason}${dataRef.current&&!revoked ? ' Dữ liệu lần tải trước đang được giữ.' : ''}`);
      setMessage('');
    } finally {
      if(reads.current(ticket)){
        loading.current = false;
        if (background) setChecking(false);
        else setBusy(false);
      }
      reads.finish(ticket);
    }
  }, [viewerPath, viewerSearch, isWeekPage,reads]);

  useEffect(() => () => window.clearTimeout(rolloverTimer.current), [loadData]);

  const checkSession = useCallback(async () => {
    const request = ++authRequest.current;
    setAuth('loading');
    const result = await readLoginState(isDashboard);
    if (request !== authRequest.current) return;
    setAuth(result.auth);
    setFailure(result.failure || null);
    if (result.auth === 'anonymous' || result.auth === 'forbidden') clearDashboardCache();
    setMessage(result.message);
    setDashboardData(result.dashboardData || null);
    if (result.auth === 'authenticated' && !isDashboard && !isSetup && !isHistoryList) void loadData(false);
  }, [isDashboard, isSetup, isHistoryList, loadData]);

  useEffect(() => {
    if(!routeIssue)void checkSession();
    return () => { authRequest.current++; };
  }, [checkSession,routeIssue]);

  useEffect(() => {
    if (auth !== 'authenticated') return undefined;
    const renew = async () => {
      if (document.visibilityState !== 'visible') return;
      const request = authRequest.current;
      const result = await readLoginState();
      if (request === authRequest.current && result.auth === 'anonymous') {
        clearDashboardCache();
        setAuth('anonymous'); setDashboardData(null); setData(null);
        setMessage('Phiên đã hết hạn hoặc đã đăng xuất. Hãy đăng nhập lại.');
      }
    };
    document.addEventListener('visibilitychange', renew);
    return () => document.removeEventListener('visibilitychange', renew);
  }, [auth]);

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

  currentSessionCheck.current = checkSession;
  useEffect(() => {
    if (auth !== 'anonymous' || !signInRoot.current || !CLIENT_ID) return undefined;
    let timer;
    let lastWidth;
    const renderButton = () => {
      if (!window.google?.accounts?.id || !signInRoot.current) return false;
      const client = window.google.accounts.id;
      if (googleClient.current !== client) {
        client.initialize({
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
            if (!result.ok) throw Object.assign(new Error(errorMessage(body.error, 'Không thể đăng nhập.')), { status: result.status });
            await currentSessionCheck.current();
          } catch (error) { setFailure(safeErrorReport('session', error)); setMessage(errorMessage(error, 'Không thể đăng nhập Google.')); }
        }
        });
        googleClient.current = client;
      }
      const width = Math.min(400, Math.max(120, Math.floor(signInRoot.current.clientWidth - 20)));
      if (lastWidth === width) return true;
      lastWidth = width;
      signInRoot.current.replaceChildren();
      client.renderButton(signInRoot.current, {
        theme: appearance.scheme === 'dark' ? 'outline_dark' : 'outline', size: 'large', shape: 'rectangular', text: 'signin_with',
        locale: 'vi', width
      });
      return true;
    };
    if (!renderButton()) timer = window.setInterval(() => { if (renderButton()) window.clearInterval(timer); }, 150);
    const observer = new ResizeObserver(renderButton);
    observer.observe(signInRoot.current);
    return () => { window.clearInterval(timer); observer.disconnect(); };
  }, [auth, checkSession, appearance.scheme]);

  const days = Array.isArray(data?.days) ? data.days : [];
  const weekDates = (data?.calendarDays || days).map(day => typeof day === 'string' ? day : String(day?.day || ''))
    .map(label => label.match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0]).filter(Boolean);
  const pageTitle = isNewestPage ? 'Thực đơn tuần này' : isNextPage ? 'Thực đơn tuần sau' : isHistory ? 'Kho thực đơn tuần cũ' : 'Thực đơn bán trú';
  usePageTitle(routeIssue?'Liên kết thực đơn':isDashboard?(auth==='authenticated'?'':'Dashboard'):isSetup?'':isHistoryList?(auth==='authenticated'?'':'Kho tuần cũ'):viewerPageTitle(data,pageTitle));
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
  const activeDrilldown=Boolean(drilldown&&drilldown.data===data&&JSON.stringify(drilldown.selected)===JSON.stringify(filters));
  useEffect(()=>{if(drilldown&&!activeDrilldown)setDrilldown(null);},[drilldown,activeDrilldown]);
  const model = useMemo(() => buildDetailModel(data, filters, responseSort,activeDrilldown), [data, filters, responseSort,activeDrilldown]);
  const resultCounts = detailResultCounts(model);
  const emptyResults=Boolean(data&&model.sourceRows.length===0);
  const formStatus = busy || !data ? 'loading' : data.formStatus || 'loading';
  const registration = mealRegistrationTarget(data, isNewestPage);
  const todayLabel = todayDayLabel(days, Date.now() + serverClockOffset);

  function setFilter(key, value) { setFilters(current => ({ ...current, [key]: value })); }
  function selectSummaryMeal(day,meal){
    const selected={...filters,day,meal};setDrilldown({data,filters:{...filters},selected,origin:document.activeElement,x:window.scrollX,y:window.scrollY});setFilters(selected);setViewerTab('detail');
    requestAnimationFrame(()=>{const heading=document.getElementById('viewer-detail-title'),target=heading?.getClientRects().length?heading:document.getElementById('viewer-result-count');target?.scrollIntoView({block:'start'});target?.focus({preventScroll:true});});
  }
  function returnToSummary(){
    const previous=drilldown;setDrilldown(null);setFilters(previous.filters);setViewerTab('summary');if(!summaryOpen)toggleSummary();
    requestAnimationFrame(()=>{window.scrollTo(previous.x,previous.y);const target=previous.origin?.isConnected?previous.origin:document.getElementById('viewer-summary-title');target?.focus({preventScroll:true});});
  }
  function openSpreadsheet() {
    const sheetId = spreadsheetIdFromUrl(spreadsheetUrl);
    if (!sheetId) {
      setAdvancedError('URL hoặc mã Spreadsheet không hợp lệ.');
      return;
    }
    setAdvancedError('');
    window.location.assign(`/?view=${encodeURIComponent(sheetId)}`);
  }

  async function signOutDashboard() {
    const response = await fetch('/api/session', { method: 'DELETE', credentials: 'same-origin' });
    if (!response.ok) throw new Error('Chưa đăng xuất được. Hãy thử lại.');
    authRequest.current++;
    clearDashboardCache();
    window.google?.accounts?.id?.disableAutoSelect?.();
    setDashboardData(null);
    setData(null);
    setAuth('anonymous');
    setMessage('Đã đăng xuất. Hãy dùng Gmail được cấp quyền dashboard.');
  }

  if(routeIssue)return <main className="meal-ui ui-viewer"><header className="viewer-header"><h1>Liên kết thực đơn</h1><DisplayPreferencesSlot/></header><ViewerLinkProblem kind={routeIssue}/></main>;
  if (isSetup) return <SetupChecklist authenticated={auth === 'authenticated'} />;
  if (auth === 'error') return <main className="meal-ui ui-viewer"><section className="login-panel"><h1>Chưa kết nối được</h1><p role="alert">{message}</p><p>Thông tin phiên chưa bị xóa. Bạn không cần đăng xuất để thử lại.</p><div className="actions"><button type="button" onClick={() => void checkSession()}>Kiểm tra lại</button><button className="secondary" type="button" onClick={() => void signOutDashboard().catch(error => setMessage(error.message))}>Đăng xuất</button>{isWeekPage && <button className="secondary" type="button" onClick={() => { setAuth('guest'); void loadData(false, true); }}>Tiếp tục với tư cách khách</button>}</div><ErrorReportButton report={failure} /></section></main>;
  if (isHistoryList && auth === 'loading') return <main className="meal-ui ui-viewer"><ContentSkeleton label="Đang xác nhận đăng nhập…" /><ElapsedWait active label="Đang xác nhận đăng nhập"/></main>;
  if (isHistoryList && auth === 'authenticated') return <main className="meal-ui ui-viewer"><header className="viewer-header"><h1>Kho thực đơn tuần cũ</h1><DisplayPreferencesSlot/></header><WeekNavigation current="history"/><HistoryArchive onUnauthorized={() => setAuth('anonymous')} /></main>;
  if (isDashboard) {
    if (auth === 'loading') return <main className="meal-ui ui-viewer"><ContentSkeleton label="Đang xác nhận đăng nhập và quyền dashboard…" /><ElapsedWait active label="Đang xác nhận đăng nhập"/></main>;
    if (auth === 'anonymous') return <main className="meal-ui ui-viewer"><header><h1>Dashboard quản trị thực đơn</h1><p className="sub">Đăng nhập bằng Gmail được chủ sở hữu cấp quyền.</p></header><section className="login-panel"><h2>Đăng nhập để quản trị</h2>{CLIENT_ID ? <div className="google-signin" ref={signInRoot} /> : <p className="error">Chưa cấu hình đăng nhập Google cho trang này.</p>}<p className="message" role="status">{message}</p><ErrorReportButton report={failure} /></section></main>;
    if (auth === 'forbidden') return <main className="meal-ui ui-viewer"><header><h1>Dashboard quản trị thực đơn</h1><p className="sub">Chỉ Gmail được chủ sở hữu cấp quyền mới sử dụng được dashboard.</p></header><section className="login-panel"><p className="error">{message}</p><button className="secondary" type="button" onClick={() => void signOutDashboard().catch(error => setMessage(error.message))}>Đổi tài khoản Google</button><ErrorReportButton report={failure} /></section></main>;
    return <Dashboard key={dashboardData?.accountId} initialData={dashboardData} onSignOut={signOutDashboard} onUnauthorized={(message, status) => { setFailure(safeErrorReport('dashboard', { status })); clearDashboardCache(); authRequest.current++; setDashboardData(null); setAuth(status === 401 ? 'anonymous' : 'forbidden'); setMessage(message); }} />;
  }

  return <main className="meal-ui ui-viewer">
    <VersionNotice disabled={busy} />
    <header className="viewer-header">
      <div className="viewer-title-group">
        <h1>{pageTitle}</h1>
        {weekDates.length > 0 && <p className="week-date-range">{weekDates[0]} – {weekDates[weekDates.length - 1]} <SproutIcon /></p>}
      </div>
      <DisplayPreferencesSlot/>
    </header>
    <WeekNavigation current={isNewestPage?'current':isNextPage?'next':isHistory?'history':''} selected={isHistory} backHref={archiveBackHref(new URLSearchParams(viewerSearch).get('week')||'',viewerSearch)}/>
    {isHistory&&<ArchiveBreadcrumbs weekKey={new URLSearchParams(viewerSearch).get('week')||''}/>}
    <WeekNotice notice={data?.weekNotice} serverNow={data?.serverNow}/>
    {auth==='loading'&&<ElapsedWait active label="Đang xác nhận đăng nhập"/>}
    {readPending>0&&<div className="read-wait"><ElapsedWait active label="Đang tải thực đơn" requestKey={viewerPath+viewerSearch}/><button className="secondary" type="button" onClick={stopWaiting}>Dừng chờ dữ liệu</button><small>Không hủy tác vụ máy chủ.</small></div>}
    {stoppedReading&&<p className="dashboard-cache-status" role="status">{message}</p>}

    {auth === 'anonymous' ? <section className="login-panel">
      <h2>{isWeekPage ? 'Đăng nhập hoặc xem với tư cách khách' : 'Đăng nhập để xem thực đơn'}</h2>
      <p>Chỉ xác minh tài khoản Google; trang này không yêu cầu quyền truy cập Drive, Sheets hay Forms.</p>
      {CLIENT_ID ? <div className="google-signin" ref={signInRoot} /> : <p className="error">Chưa cấu hình đăng nhập Google cho trang này.</p>}
      {isWeekPage && <div>
        <p>Khách không cần đăng nhập. Bất kỳ ai có liên kết tuần đều có thể xem họ tên và món đã chọn; chỉ xem, không thể sửa.</p>
        <button className="secondary" type="button" onClick={() => { setAuth('guest'); void loadData(false, true); }}>Tiếp tục với tư cách khách</button>
      </div>}
      <div className="message" role="status" aria-live="polite">{message}</div>
    </section> : auth === 'loading' ? <ContentSkeleton label="Đang xác nhận phiên đăng nhập…" /> : busy && !data ? <ContentSkeleton label="Đang tải thực đơn…" /> : weekUnavailable || (stoppedReading&&!data) ? <section className="login-panel" role="status">
      <h2>{weekUnavailable?loadError:'Chưa tải được dữ liệu tuần này.'}</h2>
      <div className="actions">
        {weekLink.map(link => <a key={link.href} className="form-link week-link" href={link.href}>{link.label}</a>)}
        <ExplainedButton className="secondary" type="button" disabled={busy || checking} reason="Đang đọc dữ liệu; hãy chờ hoặc dùng Dừng chờ dữ liệu." onClick={() => void loadData(true, auth === 'guest')}>Tải lại dữ liệu</ExplainedButton>
      </div>
    </section> : !data&&(loadProblem||auth==='forbidden')?<ViewerLinkProblem kind={auth==='forbidden'?'forbidden':loadProblem} message={loadError} archiveHref={isHistory?archiveBackHref(new URLSearchParams(viewerSearch).get('week')||'',viewerSearch):'/history'} onRetry={()=>void loadData(true,auth==='guest')} onChangeAccount={()=>void signOutDashboard().catch(error=>setLoadError(error.message))}/>: <>
      <FilterControls days={days} nameOptions={nameOptions} mealOptions={mealOptions} filters={filters} onChange={setFilter} />

      <div className="toolbar">
        <div className="actions">
          <button type="button" onClick={() => setFilters(readViewerFilters(null))}>Xóa bộ lọc</button>
          <ExplainedButton label="Tải lại dữ liệu" className={`secondary ${pendingUpdate ? 'update-available' : ''}`} type="button" disabled={busy || checking} reason="Đang đọc dữ liệu; hãy chờ hoặc dùng Dừng chờ dữ liệu." aria-busy={busy || checking} onClick={() => void loadData(true, auth === 'guest')}>
            {busy ? 'Đang tải…' : pendingUpdate ? 'Có dữ liệu mới · Cập nhật' : 'Tải lại dữ liệu'}
          </ExplainedButton>
          <button className="secondary" type="button" aria-expanded={advancedOpen} onClick={() => { setAdvancedOpen(open => !open); setAdvancedError(''); }}>Nâng cao</button>
          <ExplainedButton className="secondary today-button" type="button" disabled={busy || !todayLabel} reason={busy?'Đang tải thực đơn.':'Tuần đang xem không có ngày phục vụ trùng với hôm nay theo giờ Việt Nam.'} aria-pressed={Boolean(todayLabel && filters.day === todayLabel)} title={todayLabel || 'Tuần đang xem không có thực đơn cho hôm nay'} onClick={() => setFilters({ name: ALL, meal: ALL, day: todayLabel })}>Hôm nay</ExplainedButton>
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
          <RegistrationContext dates={weekDates.length?`${weekDates[0]} – ${weekDates.at(-1)}`:''} status={formStatus} registration={registration} lockAt={data?.lockAt} serverNow={data?.serverNow}/>
          {data?.nextFormUnavailable && <small>Chưa kiểm tra được Form tuần sau. Hãy thử tải lại dữ liệu.</small>}
        </div>
      </div>

      {loadError && <div className="viewer-error" role="alert">
        <span>{loadError}</span>
        <ExplainedButton label="Thử lại" className="secondary" type="button" disabled={busy || checking} reason="Đang đọc dữ liệu; hãy chờ hoặc dùng Dừng chờ dữ liệu." onClick={() => void loadData(true, auth === 'guest')}>
          {busy ? 'Đang thử lại…' : 'Thử lại'}
        </ExplainedButton>
      </div>}

      <ErrorReportButton report={failure} />
      {data?.closedDays?.length > 0 && <p className="closed-days-note">Ngày không phục vụ: {data.closedDays.join(' · ')}</p>}
      {activeDrilldown&&<div className="summary-return"><button type="button" className="secondary" onClick={returnToSummary}>Quay lại Tổng hợp</button><span>Đang xem đúng món đã chọn: {filters.meal} · {filters.day}</span></div>}
      {data&&<p id="viewer-result-count" tabIndex={-1} className="viewer-result-count" role="status" aria-label="Kết quả lọc"><span>Theo bộ lọc hiện tại:</span><strong>{resultCounts.responses} lượt gửi</strong><span>·</span><strong>{resultCounts.choices} lựa chọn món</strong></p>}
      {emptyResults&&<FilterEmptyState title={data.rows?.length?'Không có kết quả phù hợp':'Tuần đang xem chưa có lượt gửi'} conditions={data.rows?.length?filterConditions(filters):[]} onClear={key=>{setFilter(key,ALL);document.getElementById('name')?.focus();}}/>}
      <div hidden={emptyResults}>
      <ViewerTabs value={viewerTab} onChange={setViewerTab}/>
      <section className="data-section viewer-reading-panel" id="viewer-summary" role={mobileViewer?'tabpanel':undefined} aria-labelledby={mobileViewer?'viewer-tab-summary':undefined} hidden={mobileViewer&&viewerTab!=='summary'}>
        <div className="section-heading"><div className="section-heading-title"><SummaryIcon /><h2 id="viewer-summary-title" tabIndex={-1}>Tổng hợp lựa chọn</h2></div><button
          className="section-toggle" type="button" aria-expanded={summaryOpen} data-active={summaryActive}
          aria-controls="summary-panel" aria-label={summaryOpen ? 'Đóng tổng hợp' : 'Mở tổng hợp'}
          title={summaryOpen ? 'Đóng tổng hợp' : 'Mở tổng hợp'} onClick={toggleSummary}
        ><ChevronIcon expanded={summaryActive} className="summary-chevron" /></button></div>
        <div id="summary-panel" className={`collapse-panel ${summaryVisible ? 'expanded' : !mobileViewer&&summaryClosing ? 'closing' : 'collapsed'}`} aria-hidden={!summaryVisible} inert={!summaryVisible}>
          <div className="summary-content">
            <ViewerSummary days={days} filters={filters} model={model} onMealSelect={selectSummaryMeal}/>
          </div>
        </div>
      </section>

      <section className="data-section viewer-reading-panel" id="viewer-detail" role={mobileViewer?'tabpanel':undefined} aria-labelledby={mobileViewer?'viewer-tab-detail':undefined} hidden={mobileViewer&&viewerTab!=='detail'}>
        <TableWorkspace label="Bảng chi tiết" expandLabel="Phóng rộng bảng chi tiết" preferenceKey="viewer-detail" context={{week:weekDates.length?`Tuần ${weekDates[0]} – ${weekDates.at(-1)}`:'Chưa đọc được ngày của tuần',filters:formatFilterSummary(filters),sort:RESPONSE_SORT_OPTIONS.find(option=>option.value===responseSort)?.label}} headers={model.headers} requiredColumns={[model.nameIndex,...(model.headers.indexOf('Ngày')>=0?[model.headers.indexOf('Ngày')]:[])]}>
        <div className="section-heading detail-heading">
          <div className="section-heading-title"><PeopleIcon /><h2 id="viewer-detail-title" tabIndex={-1}>Chi tiết lựa chọn</h2></div>
          <div className="detail-sort">
            <label htmlFor="response-sort">Sắp xếp</label>
            <ComboSelect id="response-sort" label="Sắp xếp" value={RESPONSE_SORT_OPTIONS.find(option => option.value === responseSort)?.label || RESPONSE_SORT_OPTIONS[0].label}
              values={RESPONSE_SORT_OPTIONS.map(option => option.label)} searchable={false} includeAll={false}
              onChange={label => setResponseSort(RESPONSE_SORT_OPTIONS.find(option => option.label === label)?.value || 'newest')} />
          </div>
        </div>
        <div key={JSON.stringify([filters, responseSort])} className="detail-results"><DetailTable model={model} filters={filters}/></div>
        </TableWorkspace>
      </section>
      </div>
    </>}
  </main>;
}

export default App;
