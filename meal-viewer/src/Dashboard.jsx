import { Fragment,useCallback, useEffect,useId, useMemo, useReducer, useRef, useState } from 'react';
import { errorMessage, mealRegistrationTarget, foldSearchText } from './viewer-model.mjs';
import { inspectMenu, describeHistoryNote, countNewResponseIds, menuCalendarKey, fillMenuMonday, accountRoleLabel, filterAuditHistory, applyRegionResult, dashboardCommands,compareResponseVersions,isAppsScriptPermissionError } from './dashboard-model.mjs';
import {SetupInstructions} from './SetupChecklist.jsx';
import ImageInput from './ImageInput.jsx';
import ContentSkeleton from './ContentSkeleton.jsx';
import OcrProgress from './OcrProgress.jsx';
import RowActionMenu from './RowActionMenu.jsx';
import BrandingPreview from './BrandingPreview.jsx';
import SearchInput from './SearchInput.jsx';
import SearchHighlight from './SearchHighlight.jsx';
import ExternalLink from './ExternalLink.jsx';
import usePageTitle from './usePageTitle.js';
import TableWorkspace,{ColumnResizeHandle,TableSpanCell} from './TableWorkspace.jsx';
import useUnsavedChanges from './useUnsavedChanges.js';
import {brandHasEdits,filterConditions,reviewChanges,ocrReviewLinks,groupAuditDays} from './ui-clarity.mjs';
import ExplainedButton from './ExplainedButton.jsx';
import TableScroll from './TableScroll.jsx';
import ElapsedWait from './ElapsedWait.jsx';
import FilterEmptyState from './FilterEmptyState.jsx';
import FieldHelp from './FieldHelp.jsx';
import OcrReviewDay from './OcrReviewDay.jsx';
import MultiImageReview from './MultiImageReview.jsx';
import {buildImageMerge} from './image-import.mjs';
import './import-appearance.css';
import {useQuickCommands,DisplayPreferencesSlot} from './ComfortProvider.jsx';
import {DashboardLayout,DashboardOverview} from './DashboardLayout.jsx';
import useReadWait,{cancelledRead,STOP_WAIT_MESSAGE} from './useReadWait.js';
import WeekNoticeEditor from './WeekNoticeEditor.jsx';
import WeekNotice from './WeekNotice.jsx';
import DashboardWeekPicker from './DashboardWeekPicker.jsx';
import ResponseMeals from './ResponseMeals.jsx';
import ResponseQuickView from './ResponseQuickView.jsx';
import RegistrationDeadline from './RegistrationDeadline.jsx';
import useDashboardView from './useDashboardView.js';
import { menuHistoryReducer } from './menu-history.mjs';
import { safeErrorReport, dashboardOperation } from './safe-error-report.mjs';
import ErrorReportButton from './ErrorReportButton.jsx';
import { readDashboardCache, writeDashboardCache, lastDashboardWeek, clearDashboardCache } from './dashboard-cache.mjs';
import ActionConfirmation from './ActionConfirmation.jsx';
import SheetRowButton from './SheetRowButton.jsx';
import MenuImagePreview from './MenuImagePreview.jsx';
import RegionOcr from './RegionOcr.jsx';
import VersionNotice from './VersionNotice.jsx';
import useOcrDraft from './useOcrDraft.js';
import ActionToast from './ActionToast.jsx';
import { useBranding } from './BrandingProvider.jsx';
import {logoInputIssue} from './branding.mjs';
import './dashboard.css';
import './review-scale.css';

const MEAL_SLOTS = [0, 1, 2];

export async function dashboardRequest(url = '/api/dashboard', options = {}, onUnauthorized) {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
  const body = await response.json();
  if(options.signal?.aborted)throw cancelledRead();
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
    'form-control-pending': 'Đang đổi Form', 'form-opened': 'Đã mở Form', 'form-closed': 'Đã đóng Form', 'form-deadline-updated': 'Đã đổi hạn', 'form-control-review': 'Đổi Form cần kiểm tra',
    'week-notice-pending':'Đang lưu thông báo','week-notice-updated':'Đã lưu thông báo','week-notice-cleared':'Đã xóa thông báo','week-notice-review':'Thông báo cần kiểm tra'
  })[action] || action;
}

function Dashboard({ initialData, onUnauthorized, onSignOut }) {
  const branding = useBranding();
  const {gate:reads,pending:readPending}=useReadWait();
  const request = async (url, options) => {
    const ticket=(!options?.method||options.method==='GET')?reads.begin():null;
    try {
      const body=await dashboardRequest(url, ticket?{...options,signal:ticket.signal}:options, (message, status) => { weekRequest.current++; reads.cancel(); clearDashboardCache(); onUnauthorized?.(message, status); });
      if(ticket&&!reads.current(ticket))throw cancelledRead();
      return body;
    } catch (error) { if(error.name!=='AbortError')setFailure(safeErrorReport(dashboardOperation(url, options), error)); throw error; }
    finally{if(ticket)reads.finish(ticket);}
  };
  const [savedWeek] = useState(() => lastDashboardWeek(initialData?.accountId, (initialData?.weeks || []).map(week => week.weekKey)));
  const initialWeek = savedWeek || initialData?.weeks?.[0]?.weekKey || '';
  const [overview, setOverview] = useState(initialData || { role: '', weeks: [], allowedEmails: [] });
  const [tab, setTabState] = useState(() => {
    const initialTab = new URLSearchParams(window.location.search).get('tab');
    return ['create', 'health'].includes(initialTab) ? initialTab : savedWeek ? 'delete' : 'overview';
  });
  const [weekKey, setWeekKey] = useState(initialWeek);
  const tabTitle=({overview:'Tổng quan',create:'Tạo tuần bằng OCR',delete:'Lượt gửi',form:'Điều khiển Form',notice:'Thông báo tuần',reconcile:'Đối soát',branding:'Thương hiệu',health:'Hệ thống',access:'Quyền Gmail'})[tab]||'Quản trị';
  usePageTitle(`${tabTitle} · Dashboard`);
  const [weekData, setWeekData] = useState(() => readDashboardCache(initialData?.accountId, initialWeek)?.data || null);
  const [weekVerified, setWeekVerified] = useState(false);
  const [weekLoading, setWeekLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [cacheTime, setCacheTime] = useState(() => readDashboardCache(initialData?.accountId, initialWeek)?.savedAt || 0);
  const [newResponses, setNewResponses] = useState(0);
  const [reloadChanges,setReloadChanges]=useState(null);
  const verifiedBaseline=useRef(null);
  const [pollError, setPollError] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [quickResponse, setQuickResponse] = useState(null);
  const [regionBase, setRegionBase] = useState(null);
  const [highlightIds, setHighlightIds] = useState([]);
  const [auditFilters, setAuditFilters] = useState({});
  const [auditLimit, setAuditLimit] = useState(50);
  const highlightTimer = useRef(null);
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [image, setImage] = useState('');
  const [images,setImages]=useState([]);
  const [mergeBase,setMergeBase]=useState(null);
  const [menuHistory, dispatchMenu] = useReducer(menuHistoryReducer, undefined, () => menuHistoryReducer(undefined, { type: 'reset', value: null }));
  const menu = menuHistory.present;
  const [reviewEpoch,setReviewEpoch]=useState(0);
  const setMenu = value => {setReviewEpoch(epoch=>epoch+1);dispatchMenu({ type: 'reset', value });};
  const [creationState,setCreationState]=useState('idle');
  const [allowMissing, setAllowMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, updateMessage] = useState('');
  const [failure, setFailure] = useState(null);
  const [toast, setToast] = useState(null);
  const [pendingRow, setPendingRow] = useState(null);
  const weekRequest = useRef(0);
  const weekLoadTimer=useRef(null);
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
  const [reconciling,setReconciling]=useState(false);
  const [brandDraft, setBrandDraft] = useState(branding);
  const logoFeedbackId=useId(),[logoAttempt,setLogoAttempt]=useState(0),[logoState,setLogoState]=useState(null),logoRequest=useRef(null);
  logoRequest.current={url:brandDraft.logoUrl,attempt:logoAttempt};
  function receiveLogoStatus(value){if(value.url===logoRequest.current.url&&value.attempt===logoRequest.current.attempt)setLogoState(value);}
  const logoIssue=logoInputIssue(brandDraft.logoUrl),logoPhase=logoState?.url===brandDraft.logoUrl&&logoState.attempt===logoAttempt?logoState.state:'loading';
  const logoMessage=!brandDraft.logoUrl?'Chưa chọn logo; đây là trường tùy chọn.':logoIssue||({loading:'Đang tải ảnh xem trước…',loaded:'Ảnh đã tải được trên trình duyệt này.',error:'Chưa tải được ảnh trên trình duyệt. Kiểm tra liên kết ảnh công khai hoặc thử tải lại; lỗi này không xác nhận ảnh đã bị xóa.'})[logoPhase];
  const [brandSaved,setBrandSaved]=useState(branding),[noticeDirty,setNoticeDirty]=useState(false);
  const noticeEditor=useRef(null),brandDirty=brandHasEdits(brandDraft,brandSaved);
  const confirmDiscard=useUnsavedChanges(brandDirty||noticeDirty);
  function leaveDrafts(){
    if(!confirmDiscard())return false;
    if(brandDirty){setBrandDraft(branding);setBrandSaved(branding);}
    noticeEditor.current?.discard();setNoticeDirty(false);return true;
  }
  const selectedWeek = (overview.weeks || []).find(week => week.weekKey === weekKey);
  const permissions = overview.permissions || { view: true, create: true, manageResponses: true };
  const draft = useOcrDraft(overview.accountId, permissions.create === true, { image, filename: file?.name || '', images:images.length?images:undefined, menu }, saved => {
    setImage(saved.image); setFile({ name: saved.filename }); setMenu(saved.menu); setAllowMissing(false);
    setImages(saved.images||(saved.image?[{dataUrl:saved.image,name:saved.filename||'Ảnh nháp'}]:[]));
  });

  const viewState = useDashboardView(overview.accountId, weekKey, tab, weekData, weekVerified);
  const query = viewState.view.query, responseSort = viewState.view.sort;
  const setQuery = value => viewState.update({ query: value });
  const setResponseSort = value => viewState.update({ sort: value });
  function navigate(nextTab=tab,nextWeek=weekKey){
    if(nextTab===tab&&nextWeek===weekKey)return true;
    if((busy&&['branding','notice'].includes(tab))||!leaveDrafts())return false;
    viewState.save();setTabState(nextTab);
    if(nextWeek!==weekKey){setQuickResponse(null);setWeekKey(nextWeek);}return true;
  }
  const setTab=next=>navigate(next,weekKey),selectWeek=next=>navigate(tab,next);
  const quickCommands=useMemo(()=>dashboardCommands(overview),[overview]);
  useQuickCommands(quickCommands,busy||signingOut||Boolean(regionBase)||Boolean(mergeBase)||Boolean(confirmation),async command=>{
    if(!leaveDrafts())return false;
    viewState.save();await draft.flush();
    if(command.kind==='tab')return navigate(command.tab,weekKey);
    if(command.kind==='week')return navigate('delete',command.weekKey);
  },async()=>{if(!leaveDrafts())return false;viewState.save();await draft.flush();});
  function stopWaiting(){
    if(busy)return;
    clearTimeout(weekLoadTimer.current);
    weekRequest.current++;reads.cancel();setWeekVerified(false);setWeekLoading(false);setMoreLoading(false);setHistoryLoading(false);setHealthBusy(false);setReconciling(false);
    setMessage(STOP_WAIT_MESSAGE,'info');
  }

  const validation = useMemo(() => inspectMenu(menu, allowMissing), [menu, allowMissing]);
  const reviewLinks=useMemo(()=>ocrReviewLinks(menu,validation,allowMissing),[menu,validation,allowMissing]);
  function jumpToReview(id){
    if(busy)return;const target=document.getElementById(id);if(!target)return;
    if(target.closest('.ocr-day-fields')?.hidden)target.closest('.menu-day')?.querySelector('[data-open-review-day]')?.click();
    requestAnimationFrame(()=>{target.scrollIntoView({block:'center'});target.focus({preventScroll:true});});
  }
  const existingWeek = (overview.weeks || []).find(week => week.weekKey === menuCalendarKey(menu));
  const existingFormUrl = mealRegistrationTarget(existingWeek).formUrl;
  const existingSheetUrl = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]+(?:\/|$)/.test(existingWeek?.spreadsheetUrl || '') ? existingWeek.spreadsheetUrl : '';
  const displayedWeek = weekData?.week?.weekKey === weekKey ? weekData : null;
  const weekReady = weekVerified && Boolean(displayedWeek) && (!displayedWeek.page || (displayedWeek.page.query === query && displayedWeek.page.sort === responseSort));
  const currentQuickResponse = quickResponse && displayedWeek?.responses.find(response => response.responseId === quickResponse.responseId);
  const visibleResponses = (displayedWeek?.responses || []).filter(response =>
    foldSearchText(response.name).includes(foldSearchText(query))).slice().sort((left, right) => {
      if (responseSort === 'name') return String(left.name || '').localeCompare(String(right.name || ''), 'vi', { sensitivity: 'base' });
      const difference = Number(left.timestamp || 0) - Number(right.timestamp || 0);
      return responseSort === 'oldest' ? difference : -difference;
    });
  const quickMatches=quickResponse?.responseId?visibleResponses.flatMap((response,index)=>response.responseId===quickResponse.responseId?[index]:[]):[];
  const quickIndex=quickMatches.length===1?quickMatches[0]:-1;
  const restoreAttempts = new Set((displayedWeek?.history || []).filter(event => /^restore-/.test(event.action) || event.action === 'restored').map(event => event.entryId));
  const filteredHistory = filterAuditHistory(displayedWeek?.history || [], auditFilters);
  const auditScope=JSON.stringify([weekKey,auditFilters]),[foldedAudit,setFoldedAudit]=useState({scope:'',keys:[]});
  const foldedDays=foldedAudit.scope===auditScope?foldedAudit.keys:[],auditGroups=groupAuditDays(filteredHistory.slice(0,auditLimit));
  function toggleAuditDay(key){setFoldedAudit({scope:auditScope,keys:foldedDays.includes(key)?foldedDays.filter(value=>value!==key):[...foldedDays,key]});}
  const responseConditions=(displayedWeek?.page?.total??displayedWeek?.responseCount)===0?[]:filterConditions({name:query});
  const auditTotal=displayedWeek?.historyPage?.total??displayedWeek?.history?.length;
  const auditConditions=auditTotal===0?[]:filterConditions({...auditFilters,action:auditFilters.action?historyActionLabel(auditFilters.action):''},{actor:'Người quản trị',action:'Loại thao tác',from:'Từ ngày',to:'Đến ngày',note:'Tìm ghi chú',errorsOnly:'Chỉ lỗi/chưa hoàn tất'});
  function filterHistory(key, value) { setAuditFilters(current => ({ ...current, [key]:value })); setAuditLimit(50); }

  async function refreshOverview() {
    try {
      const data = await request();
      setOverview(data);
      if (!weekKey && data.weeks?.length) setWeekKey(data.weeks[0].weekKey);
      return data;
    } catch (error) {
      if(error.name!=='AbortError')setMessage(error.message);
      return null;
    }
  }

  async function loadWeek(key = weekKey, manual = false) {
    if (manual) { clearTimeout(weekLoadTimer.current);viewState.save(); }
    const generation = ++weekRequest.current;
    setReloadChanges(null);
    setWeekVerified(false); setNewResponses(0); setPollError(''); setMoreLoading(false);
    if (!key) { setWeekData(null); setWeekLoading(false); return false; }
    const saved = readDashboardCache(overview.accountId, key);
    const previous = currentWeekData.current;
    const keep = previous?.week?.weekKey === key;
    setWeekData(keep ? previous : saved?.data || null);
    setCacheTime(keep ? cacheTime : saved?.savedAt || 0);
    setWeekLoading(true);
    try {
      const params = new URLSearchParams({week:key,batch:'1',query,sort:responseSort,audit:JSON.stringify(auditFilters)});
      if (manual || busy) params.set('refresh','1');
      let result = await request(`/api/dashboard?${params}`);
      if (generation !== weekRequest.current) return false;
      if (result.resetRequired) throw new Error('Bản đối chiếu đã đổi; hãy tải lại dữ liệu.');
      const old = keep ? previous : saved?.data;
      const wantedRows = old && (!old.page || (old.page.query === query && old.page.sort === responseSort)) ? old.responses.length : 50;
      while (result.page?.nextOffset != null && result.responses.length < wantedRows) {
        setWeekData(result);
        const next = await request(`/api/dashboard?${params}&offset=${result.page.nextOffset}&revision=${result.page.revision}`);
        if (generation !== weekRequest.current) return false;
        if (next.resetRequired) throw new Error('Bản đối chiếu đã đổi hoặc hết hạn; hãy tải lại dữ liệu.');
        result = { ...result, page:next.page, responses:[...result.responses,...next.responses] };
      }
      setWeekData(result);
      setReloadChanges(manual?compareResponseVersions(verifiedBaseline.current,result):null);
      verifiedBaseline.current={week:result.week,responseVersions:result.responseVersions,responseVersionBinding:result.responseVersionBinding};
      clearTimeout(highlightTimer.current);
      const previousIds = new Set(keep ? previous.responseIds || [] : []);
      setHighlightIds(manual && keep ? (result.responseIds || []).filter(id => !previousIds.has(id)) : []);
      if (manual) highlightTimer.current = setTimeout(() => setHighlightIds([]), 8000);
      setWeekVerified(true); setCacheTime(0);
      writeDashboardCache(overview.accountId, key, result);
      setMessage('');
      return true;
    } catch (error) { if (generation === weekRequest.current&&error.name!=='AbortError') setMessage(error.message); return false; }
    finally { if (generation === weekRequest.current) setWeekLoading(false); }
  }

  async function loadMoreResponses() {
    const previous = currentWeekData.current;
    if (!weekReady || moreLoading || busy || previous?.page?.nextOffset == null) return;
    const generation = weekRequest.current; setMoreLoading(true);
    try {
      const params = new URLSearchParams({week:weekKey,batch:'1',query,sort:responseSort,offset:String(previous.page.nextOffset),revision:previous.page.revision});
      const next = await request(`/api/dashboard?${params}`);
      if (generation !== weekRequest.current) return;
      if (next.resetRequired) { await loadWeek(weekKey,true); return; }
      const known = new Set(previous.responses.map(row => row.responseId));
      const merged = {...previous,page:next.page,responses:[...previous.responses,...next.responses.filter(row=>!known.has(row.responseId))]};
      setWeekData(merged); writeDashboardCache(overview.accountId,weekKey,merged);
    } catch (error) { if (generation === weekRequest.current&&error.name!=='AbortError') setMessage(error.message); }
    finally { if (generation === weekRequest.current) setMoreLoading(false); }
  }

  async function loadMoreHistory() {
    const previous=currentWeekData.current;
    if(!weekReady||historyLoading||busy||previous?.historyPage?.nextOffset==null)return;
    const generation=weekRequest.current;setHistoryLoading(true);
    try{
      const params=new URLSearchParams({week:weekKey,batch:'1',query,sort:responseSort,audit:JSON.stringify(auditFilters),historyOffset:String(previous.historyPage.nextOffset),revision:previous.page.revision});
      const next=await request(`/api/dashboard?${params}`);
      if(generation!==weekRequest.current)return;
      if(next.resetRequired){await loadWeek(weekKey,true);return;}
      const known=new Set(previous.history.map(event=>event.id));
      const merged={...previous,historyPage:next.historyPage,history:[...previous.history,...next.history.filter(event=>!known.has(event.id))]};
      setWeekData(merged);setAuditLimit(merged.history.length);writeDashboardCache(overview.accountId,weekKey,merged);
    }catch(error){if(generation===weekRequest.current&&error.name!=='AbortError')setMessage(error.message);}
    finally{if(generation===weekRequest.current)setHistoryLoading(false);}
  }

  useEffect(() => { if (!initialData || initialData.overviewPending) void refreshOverview(); }, []);
  useEffect(() => {
    weekLoadTimer.current = tab === 'delete' ? setTimeout(() => void loadWeek(weekKey), 300) : null;
    return () => { clearTimeout(weekLoadTimer.current); weekRequest.current++; };
  }, [tab, weekKey, query, responseSort, auditFilters]);
  useEffect(() => () => { weekRequest.current++; clearTimeout(highlightTimer.current); }, []);
  useEffect(() => { setHighlightIds([]); setQuickResponse(null); }, [weekKey]);
  useEffect(()=>{verifiedBaseline.current=null;setReloadChanges(null);},[weekKey]);
  useEffect(() => { setAuditFilters({}); setAuditLimit(50); }, [weekKey]);
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
    if ((tab === 'create' && !permissions.create) || (['health','notice'].includes(tab) && overview.role !== 'owner')) setTab('overview');
  }, [tab, permissions.create, overview.role]);
  useEffect(() => {
    const time = Date.parse(selectedWeek?.lockAt || '');
    setDeadline(Number.isFinite(time) ? new Date(time + 7 * 3600000).toISOString().slice(0, 16) : '');
    setReconciliation(null);
  }, [weekKey, selectedWeek?.lockAt]);
  useEffect(() => {if(!brandHasEdits(brandDraft,brandSaved)){setBrandDraft(branding);setBrandSaved(branding);}}, [branding]);

  async function controlForm(mode, reason) {
    if (overview.role !== 'owner' || !selectedWeek) return;
    const lockAt = mode === 'close' ? selectedWeek.lockAt : `${deadline}:00+07:00`;
    if (mode !== 'close' && (!deadline || !Number.isFinite(Date.parse(lockAt)) || Date.parse(lockAt) <= Date.now())) { setMessage('Chọn hạn đăng ký hợp lệ ở tương lai.'); return; }
    const verb = mode === 'open' ? 'Mở lại' : mode === 'close' ? 'Đóng' : 'Đổi hạn đăng ký cho';
    if (reason === undefined) { const status=value=>value==='open'?'Đang mở':value==='closed'?'Đã đóng':'Chưa xác định';setConfirmation({ message: `${verb} Form ${selectedWeek.name}?${mode === 'close' ? ' Người dùng sẽ không gửi được lượt mới.' : ` Hạn mới: ${deadline.replace('T', ' ')} (giờ Việt Nam).`} Thao tác được ghi lịch sử.`,changes:reviewChanges({status:status(selectedWeek.formStatus),deadline:formatTime(Date.parse(selectedWeek.lockAt))},{status:status(mode==='open'?'open':mode==='close'?'closed':selectedWeek.formStatus),deadline:formatTime(Date.parse(lockAt))},{status:'Trạng thái Form',deadline:'Hạn đăng ký (giờ Việt Nam)'}), run: note => controlForm(mode, note) }); return; }
    clearDashboardCache(undefined, true); setWeekVerified(false);
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
    const generation=weekRequest.current;
    setReconciling(true); setReconciliation(null); setMessage('Đang đối soát Form và Sheet…');
    try {
      const result = await request(`/api/dashboard?reconcile=1&week=${encodeURIComponent(weekKey)}`);
      setReconciliation({ ...result, weekKey });
      setMessage(result.issues.length ? `Đã đối soát: có ${result.issues.length} bản ghi cần kiểm tra. Không sửa hoặc xóa dữ liệu.` : 'Đã đối soát: Form và Sheet khớp duy nhất.', result.issues.length ? 'info' : 'success');
    } catch (error) { if(error.name!=='AbortError')setMessage(error.message); }
    finally { if(generation===weekRequest.current)setReconciling(false); }
  }

  async function saveBranding(event,proposal) {
    event?.preventDefault();
    if (overview.role !== 'owner'||busy) return;
    if(!proposal){const snapshot={draft:{...brandDraft},revision:brandSaved.updatedAt};setConfirmation({message:'Áp dụng tên trường, logo và màu này cho toàn bộ web?',changes:reviewChanges(brandSaved,snapshot.draft,{schoolName:'Tên trường',logoUrl:'URL logo',primaryColor:'Màu chủ đạo'}),showReason:false,run:()=>saveBranding(null,snapshot)});return;}
    setBusy(true); setMessage('Đang lưu thương hiệu…');
    try {
      const result = await request('/api/dashboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'set-branding', branding: proposal.draft, expectedUpdatedAt: proposal.revision }) });
      setBrandDraft(result);setBrandSaved(result);
      window.dispatchEvent(new CustomEvent('meal-branding-changed', { detail: result }));
      setMessage('Đã cập nhật thương hiệu.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function checkHealth() {
    const ticket=reads.begin();
    setHealthBusy(true);
    setHealth(null);
    try {
      const response = await fetch(`/api/dashboard?health=1&week=${encodeURIComponent(weekKey)}`, { credentials: 'same-origin', cache: 'no-store',signal:ticket.signal });
      const report = await response.json();
      if(!reads.current(ticket))throw cancelledRead();
      if (response.status === 401 || response.status === 403) { onUnauthorized(errorMessage(report.error), response.status); return; }
      if (!Array.isArray(report.checks)) throw new Error('Không nhận được kết quả kiểm tra.');
      setHealth(report);
      if (!response.ok || report.checks.some(check => check.status === 'error')) setFailure(safeErrorReport('health', { status: response.status }));
    } catch (error) {
      if(error.name==='AbortError')return;
      setHealth({ checks: [{ id: 'network', label: 'Kết nối máy chủ', status: 'error', message: 'Không kết nối được để kiểm tra. Hãy thử lại khi có mạng.' }] });
      setFailure(safeErrorReport('health', error));
    } finally { if(reads.current(ticket))setHealthBusy(false);reads.finish(ticket); }
  }

  function chooseImage(entry){setImage(entry.dataUrl);setFile({name:entry.name,type:entry.dataUrl.split(';')[0].slice(5)});}
  async function clearDraft(){
    if(!window.confirm('Xóa nháp ảnh và món đang sửa trên thiết bị này?'))return;
    try{await draft.clear();setCreationState('idle');setImages([]);setImage('');setMenu(null);setFile(null);setAllowMissing(false);}catch(error){setMessage(error.message);}
  }
  async function removeImage(index){
    if(images.length===1){await clearDraft();return;}
    const next=images.filter((_image,i)=>i!==index);setImages(next);
    if(!next.some(entry=>entry.dataUrl===image))chooseImage(next[0]);
  }

  async function runOcr() {
    if (!image) { setMessage('Hãy chọn ảnh thực đơn trước.'); return; }
    setCreationState('idle');setBusy(true); setMessage('Đang đọc ảnh thực đơn…');
    try {
      if(images.length>1){
        const result=await request('/api/dashboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ocr-images',images:images.map(entry=>entry.dataUrl)})});
        if(!Array.isArray(result.fragments)||result.fragments.length!==images.length||result.fragments.some((fragment,i)=>fragment.imageIndex!==i))throw new Error('Kết quả OCR không khớp các ảnh nguồn; nháp cũ được giữ.');
        buildImageMerge(result.fragments,menu);
        setMergeBase({images,menu,fragments:result.fragments});setMessage('OCR xong. Rà soát các nguồn và xung đột trước khi áp dụng.','info');return;
      }
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

  function chooseMonday(value) {
    try { const next = fillMenuMonday(menu, value); dispatchMenu({ type: 'edit', value: next }); setAllowMissing(false); setMessage(''); }
    catch (error) { setMessage(error.message); }
  }

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
    setCreationState('creating');setBusy(true); setMessage('Đang tạo Form và Sheet cho tuần…');
    try {
      const result = await request('/api/dashboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', menu: payload })
      });
      setCreationState('done');
      if (result.alreadyExists) setMessage('Tuần này đã có Form. Mình đã lấy lại các liên kết hiện có.');
      else setMessage('Đã tạo Form, Spreadsheet và thư mục tuần.');
      try { await draft.clear(); } catch { setMessage('Tuần đã tạo nhưng chưa xóa được nháp trên thiết bị. Hãy xóa nháp thủ công.'); }
      setMenu(null); setImages([]); setImage(''); setFile(null); setAllowMissing(false);
      const next = await refreshOverview();
      if (next?.weeks?.[0]) setWeekKey(next.weeks[0].weekKey);
      setWeekData(null);
    } catch (error) { setCreationState('idle');setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function deleteResponse(response, reason) {
    const time = formatTime(response.timestamp);
    if (!weekReady || !response.deletable || !response.deleteToken) return;
    const prompt = response.partial
      ? `Form đã xóa lượt của ${response.name} lúc ${time}, nhưng Sheet còn hàng dữ liệu. Xóa nốt hàng Sheet này?`
      : `Xóa lượt gửi của ${response.name} lúc ${time} khỏi Form và Sheet?`;
    if (reason === undefined) { setConfirmation({ message: prompt, run: note => deleteResponse(response, note) }); return; }
    clearDashboardCache(undefined, true); setWeekVerified(false);
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
    clearDashboardCache(undefined, true); setWeekVerified(false);
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
    return <DashboardWeekPicker weeks={overview.weeks || []} value={weekKey} disabled={busy || healthBusy} onChange={selectWeek} />;
  }

  async function signOut(){
          if(!leaveDrafts())return;
          setSigningOut(true);
          weekRequest.current++; setWeekVerified(false); setWeekLoading(false); clearDashboardCache();
          try { await onSignOut(); }
          catch (error) { setMessage(errorMessage(error, 'Chưa đăng xuất được. Hãy thử lại.')); }
          finally { setSigningOut(false); }

  }
  const missingScriptPermission = isAppsScriptPermissionError(message);
  return <DashboardLayout tab={tab} onNavigate={setTab} role={overview.role} permissions={permissions} email={overview.email} schoolName={branding.schoolName} busy={busy||signingOut} onSignOut={signOut}><main id="dashboard-content" className="dashboard-shell meal-ui" data-density={viewState.view.density}>
    <header className="dashboard-header">
      <div><h1>Dashboard quản trị</h1><p className="sub">Quản lý tuần thực đơn, tạo Form từ ảnh và xử lý lượt gửi.</p></div>
      <DisplayPreferencesSlot/>
    </header>
    <div className="dashboard-account" aria-label="Tài khoản đang đăng nhập"><strong>{overview.email || 'Đang xác minh Gmail…'}</strong><span>{accountRoleLabel({ ...overview, permissions })}</span><small>{permissions.create ? 'OCR/tạo tuần' : 'Không tạo tuần'} · {permissions.manageResponses ? 'Xóa/khôi phục' : 'Không xóa lượt gửi'}</small></div>
    <VersionNotice disabled={busy || signingOut || Boolean(regionBase) || Boolean(mergeBase) || Boolean(confirmation)} beforeReload={async()=>{if(!leaveDrafts())return false;viewState.save();await draft.flush();}} />
    {message && <div className={`dashboard-message ${missingScriptPermission || /không|lỗi|chưa/i.test(message) ? 'error' : ''}`} role={missingScriptPermission?'alert':'status'} aria-live="polite">{missingScriptPermission&&<strong>Thiếu quyền Apps Script. </strong>}{message}{missingScriptPermission&&(overview.role==='owner'?<button className="secondary" type="button" disabled={busy} onClick={()=>void authorizeScript()}>Cấp quyền Apps Script</button>:<span> Liên hệ chủ sở hữu để cấp quyền.</span>)}{authorizationUrl && <> <ExternalLink className="action-link" href={authorizationUrl}>Mở trang cấp quyền Google</ExternalLink></>}</div>}

    <ErrorReportButton report={failure || draft.failure} />
    {readPending>0&&<div className="read-wait">{!busy&&<ElapsedWait active label={reconciling?'Đang đối soát':healthBusy?'Đang kiểm tra hệ thống':weekLoading?'Đang tải lượt gửi':'Đang chờ dữ liệu'} requestKey={JSON.stringify([tab,weekKey,query,responseSort,auditFilters])}/>}<button type="button" className="secondary" disabled={busy} onClick={stopWaiting}>Dừng chờ dữ liệu</button><small>Chỉ dừng chờ trên trình duyệt; không hủy thao tác máy chủ.</small></div>}
    <ElapsedWait active={busy} label={creationState==='creating'?'Đang tạo Form và Sheet':pendingRow?.action==='delete'?'Đang xóa lượt gửi':pendingRow?.action==='restore'?'Đang khôi phục lượt gửi':'Đang xử lý yêu cầu'} requestKey={`${weekKey}:${creationState}:${pendingRow?.id||''}`}/>
    {tab==='notice'&&overview.role==='owner'&&<section className="dashboard-panel"><h2>Thông báo tuần</h2>{weekPicker()}<WeekNoticeEditor key={weekKey} ref={noticeEditor} onDirtyChange={setNoticeDirty} weekKey={weekKey} weekName={selectedWeek?.name} request={request} busy={busy} onBusy={setBusy} onMessage={setMessage}/></section>}
    {tab === 'overview' && (readPending>0 && overview.overviewPending && !overview.weeks?.length ? <ContentSkeleton label="Đang tải sổ tuần…"/> : <DashboardOverview weeks={overview.weeks||[]} busy={busy} owner={overview.role==='owner'} onRefresh={()=>void refreshOverview()} onView={key=>navigate('delete',key)} onControl={key=>navigate('form',key)}/>)}

    {tab === 'health' && overview.role === 'owner' && <><section className="dashboard-panel system-authorization"><h2>Cấp quyền Apps Script</h2><p>Cấp các quyền Google mà script hiện yêu cầu để đọc ảnh, tạo và quản lý Form/Sheet. Chỉ chủ sở hữu thực hiện bước này.</p><button className="secondary" type="button" disabled={busy} onClick={()=>void authorizeScript()}>Cấp quyền Apps Script</button></section><section className="dashboard-panel">
      <div className="dashboard-section-title"><h2>Kiểm tra hệ thống</h2>{weekPicker()}</div>
      <p>Kiểm tra quyền Google, thư mục, Sheet, Form, cấu hình OCR và lịch tự khóa.</p>
      <ExplainedButton label="Kiểm tra lại" className="secondary" type="button" disabled={healthBusy} reason="Đang kiểm tra hệ thống; hãy chờ kết quả hoặc dừng chờ dữ liệu." aria-busy={healthBusy} onClick={() => void checkHealth()}>{healthBusy ? 'Đang kiểm tra…' : 'Kiểm tra lại'}</ExplainedButton>
      {health?.checkedAt && <p>Đã kiểm tra lúc {formatTime(health.checkedAt)}</p>}
      <ul className="dashboard-health-list" aria-live="polite">{(health?.checks || []).map(check => <li key={check.id} data-status={check.status}>
        <div><strong>{check.label}</strong><span>{({ ok: 'Ổn', warning: 'Cần chú ý', error: 'Lỗi' })[check.status] || 'Chưa xác định'}</span></div>
        <p>{check.message}</p>
      </li>)}</ul>
    </section><section className="dashboard-panel"><SetupInstructions /></section></>}

    {tab === 'create' && permissions.create && <section className="dashboard-panel">
      <div className="field-label-row"><h2>Tạo tuần từ ảnh thực đơn</h2><FieldHelp label="OCR">OCR đọc chữ và món từ ảnh. Kết quả có thể sai; hãy đối chiếu ảnh, sửa ngày và món trước khi bấm Tạo Form và Sheet. Đọc ảnh không tự tạo tuần.</FieldHelp></div>
      <OcrProgress menu={menu} state={creationState}/>
      <div className="draft-toolbar"><p role="status">{draft.status || 'Nháp lưu riêng trên thiết bị này, không đồng bộ giữa các máy.'}</p><ExplainedButton type="button" className="secondary" disabled={busy || !draft.ready} reason={busy?'Đang xử lý yêu cầu; không xóa nháp trong lúc này.':'Chưa đọc xong nháp trên thiết bị; hãy chờ.'} onClick={()=>void clearDraft()}>Xóa nháp</ExplainedButton></div>
      <ImageInput images={images} activeImage={image} disabled={busy||!draft.ready} onBusy={setBusy} onMessage={setMessage} onChoose={chooseImage} onRemove={removeImage} onImages={(next,append)=>{setCreationState('idle');setImages(next);chooseImage(next[0]);if(!append){setMenu(null);setAllowMissing(false);}setMergeBase(null);}}/>
      {image && file?.name && !file.type && <p className="menu-image-hint">Ảnh đã khôi phục: {file.name}. Không cần chọn lại để tiếp tục OCR hoặc sửa món.</p>}
      <ExplainedButton label="Đọc thực đơn" disabled={busy || !image} reason={busy?'Đang xử lý yêu cầu khác; hãy chờ hoàn tất.':'Chọn ảnh thực đơn trước khi đọc OCR.'} onClick={() => void runOcr()}>{busy ? 'Đang xử lý…' : 'Đọc thực đơn'}</ExplainedButton>
      {image&&(menu||menuHistory.past.length>0||menuHistory.future.length>0)&&<div className="menu-history-tools"><ExplainedButton type="button" className="secondary" disabled={busy || !menuHistory.past.length} reason={busy?'Đang xử lý yêu cầu.':'Chưa có bước sửa trước đó để hoàn tác trong lần mở này.'} onClick={() => moveMenuHistory('undo')}>Hoàn tác</ExplainedButton><ExplainedButton type="button" className="secondary" disabled={busy || !menuHistory.future.length} reason={busy?'Đang xử lý yêu cầu.':'Chưa có bước đã hoàn tác để làm lại.'} onClick={() => moveMenuHistory('redo')}>Làm lại</ExplainedButton><small>Ctrl/⌘ Z · Ctrl/⌘ Shift Z. Lịch sử sửa chỉ giữ trong lần mở này.</small></div>}
      {image && <div className={`menu-review-layout${menu ? '' : ' image-only'}`}>
      <MenuImagePreview src={image} name={file?.name} regionDisabled={busy || !menu} onRegion={menu ? () => setRegionBase({image,menu}) : undefined} />
      {menu && <form className="menu-review" onSubmit={createWeek} onBlur={() => dispatchMenu({ type: 'commit' })} onKeyDown={event => {
        if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'z' && !busy) { event.preventDefault(); moveMenuHistory(event.shiftKey ? 'redo' : 'undo'); }
      }}>
        <label>Tiêu đề tuần<input value={menu.title || ''} maxLength={500} disabled={busy} onChange={event => dispatchMenu({ type: 'edit', group: 'title', value: current => ({ ...current, title: event.target.value }) })} /></label>
        <label>Chọn thứ Hai<input id="ocr-monday" aria-label="Chọn thứ Hai" type="date" value={/^\d{2}\/\d{2}\/\d{4}$/.test(menu.days?.[0]?.date || '') ? menu.days[0].date.split('/').reverse().join('-') : ''} disabled={busy} onChange={event => chooseMonday(event.target.value)} /><small>Tự điền 5 ngày, giữ món/ngày nghỉ. Hoàn tác khôi phục cả tuần.</small></label>
        {existingWeek && <div className="existing-week-warning" role="status"><strong>Tuần này đã có Form — không tạo hoặc ghi đè tuần mới.</strong><div className="dashboard-links">{existingFormUrl && <ExternalLink href={existingFormUrl}>Mở Form</ExternalLink>}{existingSheetUrl && <ExternalLink href={existingSheetUrl}>Mở Sheet</ExternalLink>}<button type="button" className="secondary" disabled={busy} onClick={() => void refreshOverview()}>Tải lại sổ tuần</button></div></div>}
        <h3>Rà soát 5 ngày</h3>
        {reviewLinks.length>0&&<section className="ocr-issue-list" role="region" aria-label="Cần đối chiếu OCR"><h3>Cần đối chiếu OCR</h3><p>Bấm mục cần kiểm tra để tới ô tương ứng. Không tự sửa nội dung.</p><ul>{reviewLinks.map(link=><li key={link.id} data-blocking={link.blocking}><button className="secondary" type="button" disabled={busy} onClick={()=>jumpToReview(link.id)}>{link.label}: {link.message}</button><small>{link.blocking?'Cần xử lý trước khi tạo':'Cảnh báo · đã cho phép thiếu món'}</small></li>)}</ul></section>}
        {menu.days.map((day, dayIndex) => {
          const issue = validation.dayIssues[dayIndex];
          const status = issue.dateError || issue.mealError ? 'error' : issue.missingMealSlots.length ? 'warning' : 'ok';
          const dateNote = `menu-date-note-${dayIndex}`;
          const mealNote = `menu-meal-note-${dayIndex}`;
          return <OcrReviewDay day={day} issue={issue} allowMissing={allowMissing} busy={busy} status={status} key={`${reviewEpoch}-${dayIndex}`} legend={<>{day.day || `Thứ ${dayIndex + 2}`} {status !== 'ok' && <span className="menu-review-badge">{status === 'error' ? 'Cần sửa' : `Thiếu ${issue.missingMealSlots.length} món`}</span>}</>}>
            <label>Ngày<input id={`ocr-date-${dayIndex}`} value={day.date || ''} maxLength={40} placeholder="dd/mm/yyyy" aria-invalid={Boolean(issue.dateError)} aria-describedby={issue.dateError ? dateNote : undefined} onChange={event => editDay(dayIndex, 'date', event.target.value)} /></label>
            {issue.dateError && <p id={dateNote} className="menu-inline-error">{issue.dateError}</p>}
            <label className="menu-closed-toggle"><input id={`ocr-closed-${dayIndex}`} type="checkbox" checked={day.closed === true} onChange={event => editDay(dayIndex, 'closed', event.target.checked)} />Không phục vụ ngày này</label>
            {day.closed === true ? <p className="menu-closed-note">Ngày nghỉ — không tạo câu hỏi chọn món. Món đã nhập vẫn giữ để bỏ đánh dấu hoặc hoàn tác.</p> : <div className="dashboard-meals">{MEAL_SLOTS.map(slot => {
              const missing = issue.missingMealSlots.includes(slot);
              return <label key={slot}>Món {slot + 1}<input id={`ocr-meal-${dayIndex}-${slot}`} value={day.meals?.[slot] || ''} maxLength={500} className={missing ? 'menu-meal-missing' : ''} placeholder={missing ? 'Đối chiếu món này với ảnh' : ''} aria-invalid={Boolean(missing && issue.mealError)} aria-describedby={missing ? mealNote : undefined} onChange={event => editDay(dayIndex, 'meal', event.target.value, slot)} /></label>;
            })}</div>}
            {issue.missingMealSlots.length > 0 && <p id={mealNote} className={issue.mealError ? 'menu-inline-error' : 'menu-inline-warning'}>
              Chưa có {issue.missingMealSlots.map(slot => `Món ${slot + 1}`).join(', ')}. {issue.mealError || 'Nếu ảnh chỉ có 2 món, hãy xác nhận ở cuối bảng.'}
            </p>}
          </OcrReviewDay>;
        })}
        {validation.dateError && <p className="dashboard-warning" role="alert">{validation.dateError}</p>}
        {validation.servingError && <p className="dashboard-warning" role="alert">{validation.servingError}</p>}
        {validation.invalidMealDays.length > 0 && <p className="dashboard-warning" role="alert">Mỗi ngày cần ít nhất 2 món và tối đa 3 món: {validation.invalidMealDays.join(', ')}.</p>}
        {validation.missingMealDays.length > 0 && <label className="dashboard-confirm-missing"><input type="checkbox" checked={allowMissing} disabled={busy} onChange={event => setAllowMissing(event.target.checked)} /> Tôi xác nhận các ngày sau có ít hơn 3 món: {validation.missingMealDays.join(', ')}</label>}
        <ExplainedButton type="submit" disabled={busy || !validation.canCreate || Boolean(existingWeek)} reason={busy?'Đang xử lý yêu cầu; chưa thể tạo thêm.':existingWeek?'Tuần này đã có Form và Sheet. Mở liên kết hiện có hoặc sửa ngày; không tạo trùng.':validation.dateError||validation.servingError||(validation.invalidMealDays.length?'Sửa các ngày chưa đủ 2 món hoặc vượt quá 3 món.':'Đối chiếu và xác nhận các ngày có ít hơn 3 món ở cuối bảng.')}>Tạo Form và Sheet</ExplainedButton>
      </form>}
      </div>}
    </section>}

    {tab === 'delete' && <section className="dashboard-panel">
      <TableWorkspace label="Bảng lượt gửi" expandLabel="Phóng rộng bảng lượt gửi" preferenceKey="dashboard-responses" context={{week:selectedWeek?.name||'Chưa chọn tuần',filters:query.trim()?`Họ tên: ${query.trim()}`:'Không có bộ lọc',sort:responseSort==='name'?'Tên A–Z':responseSort==='oldest'?'Cũ nhất':'Mới nhất'}} headers={['Thời điểm','Họ tên','Món đã chọn','Thao tác']} requiredColumns={[1,3]}>
      <div className="dashboard-section-title"><h2>Lượt gửi và lịch sử thao tác</h2></div>
      <WeekNotice notice={displayedWeek?.week?.weekNotice} serverNow={displayedWeek?.week?.serverNow}/>
<div className="dashboard-sticky-tools" ref={viewState.toolbarRef}>{weekPicker()}<div className="dashboard-refresh-bar"><ExplainedButton label="Tải lại dữ liệu" className="secondary" disabled={busy || weekLoading || !weekKey} reason={busy?'Đang xử lý thao tác; hãy chờ hoàn tất.':weekLoading?'Đang tải lượt gửi; hãy chờ hoặc dừng chờ dữ liệu.':'Chọn một tuần đã đăng ký để tải lượt gửi.'} aria-busy={weekLoading} onClick={() => void loadWeek(weekKey, true)}>{weekLoading ? 'Đang tải lại…' : 'Tải lại dữ liệu'}</ExplainedButton>{newResponses > 0 && <span className="dashboard-new-badge" role="status">Có {newResponses} lượt gửi mới</span>}</div><label className="dashboard-search">Tìm theo họ tên<SearchInput id="dashboard-name-search" label="Tìm theo họ tên" maxLength={200} value={query} onClear={()=>setQuery('')} onChange={event => setQuery(event.target.value)} placeholder="Nhập tên cần tìm" /></label></div>
      {displayedWeek && !weekReady && <p className="dashboard-cache-status" role="status">{cacheTime ? `Bản lưu lúc ${formatTime(cacheTime)}. ` : 'Dữ liệu lần xem trước. '}{weekLoading ? 'Đang xác minh…' : 'Chưa xác minh được; chỉ xem, hãy tải lại trước khi thao tác.'}</p>}
      {displayedWeek && weekReady && <p className="dashboard-hint">Dữ liệu đã xác minh. Tự kiểm tra lượt mới mỗi phút khi tab đang mở; bảng chỉ đổi khi tải lại.</p>}
      {reloadChanges&&weekReady&&<p className="reload-changes" role="status">Thay đổi lượt Form toàn tuần so với lần xác minh trước: <strong>{reloadChanges.added} mới · {reloadChanges.missing} đã mất · {reloadChanges.changed} thay đổi</strong>. Chỉ thông báo, không tự sửa/xóa.</p>}
      {pollError && <p className="dashboard-hint" role="status">{pollError}</p>}
      <p className="dashboard-warning">Chỉ hiện lượt ghép duy nhất giữa Google Form và Sheet. Khôi phục sẽ tạo lượt Form mới; thời điểm gửi gốc được lưu trong lịch sử.</p>
      <div className="dashboard-response-tools">
        <label className="dashboard-sort">Sắp xếp<select aria-label="Sắp xếp" value={responseSort} onChange={event => setResponseSort(event.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="name">Tên A–Z</option>
        </select></label>
        <div className="dashboard-density" role="group" aria-label="Mật độ bảng PC"><span>Bảng PC</span><button type="button" className="secondary" aria-pressed={viewState.view.density === 'compact'} onClick={() => viewState.update({ density: 'compact' })}>Gọn</button><button type="button" className="secondary" aria-pressed={viewState.view.density === 'comfortable'} onClick={() => viewState.update({ density: 'comfortable' })}>Rộng</button></div>
      </div>
      {weekLoading && !displayedWeek ? <ContentSkeleton label="Đang tải lượt gửi…" kind="table"/> : <TableScroll className="dashboard-response-list" ref={viewState.listRef} data-week-key={weekKey}><table className="dashboard-table dashboard-response-table" role="table"><thead><tr>{['Thời điểm','Họ tên','Món đã chọn','Thao tác'].map((label,index)=><th key={label}>{label}<ColumnResizeHandle index={index} label={label}/></th>)}</tr></thead><tbody>
        {visibleResponses.length ? visibleResponses.map(response => <tr key={response.responseId || response.rowNumber || `${response.timestamp}-${response.name}`} data-response-id={response.responseId} className={highlightIds.includes(response.responseId) ? 'new-response' : ''}>
          <td data-label="Thời điểm">{formatTime(response.timestamp)}</td><td data-label="Họ tên"><strong><SearchHighlight text={response.name} query={query}/></strong>{highlightIds.includes(response.responseId) && <span className="new-response-label">Mới</span>}{response.partial && <strong className="dashboard-partial"> · Form đã xóa, Sheet còn hàng</strong>}</td><td data-label="Món đã chọn"><ResponseMeals response={response} week={displayedWeek?.week} /></td>
          <td data-label="Thao tác"><div className="dashboard-row-actions"><button type="button" className="secondary" onClick={() => setQuickResponse(response)}>Xem nhanh</button><RowActionMenu label="Thao tác lượt gửi">{permissions.manageResponses && (response.deletable || !weekReady) ? <ExplainedButton label="Xóa lượt này" type="button" data-close-row-menu className="danger" disabled={busy || !weekReady} reason={busy?'Đang xử lý một thao tác; chưa thể xóa tiếp.':'Dữ liệu hiện tại chưa được xác minh; hãy tải lại dữ liệu trước khi xóa.'} aria-busy={pendingRow?.action === 'delete' && pendingRow.id === response.responseId} onClick={() => void deleteResponse(response)}>{pendingRow?.action === 'delete' && pendingRow.id === response.responseId ? 'Đang xóa…' : response.partial ? 'Xóa nốt hàng Sheet' : 'Xóa lượt này'}</ExplainedButton> : <span title={response.note}>{!permissions.manageResponses ? 'Chỉ xem' : response.partial ? 'Cần kiểm tra thủ công' : 'Không đối chiếu được'}</span>}<SheetRowButton key={`${weekKey}-${weekRequest.current}-${response.responseId}`} weekKey={weekKey} source={response.partial ? 'sheet' : 'form'} response={response} request={request} disabled={busy || !weekReady} /></RowActionMenu></div></td>
        </tr>) : <tr><td className="empty" colSpan="4">{!displayedWeek?'Chưa có dữ liệu đã xác minh. Hãy tải lại dữ liệu.':weekLoading?'Đang đọc kết quả lọc…':<FilterEmptyState title={responseConditions.length?'Không có kết quả phù hợp':'Tuần đang xem chưa có lượt gửi'} conditions={responseConditions} onClear={()=>{setQuery('');document.getElementById('dashboard-name-search')?.focus();}}/>}</td></tr>}
      </tbody></table></TableScroll>}
      {displayedWeek?.page && <div className="dashboard-batch-tools"><p role="status">Đã tải {displayedWeek.responses.length} / {displayedWeek.page.matchedCount} lượt phù hợp · tổng {displayedWeek.page.total} lượt. Bản đối chiếu lúc {formatTime(displayedWeek.page.snapshotAt)}.</p>{displayedWeek.page.nextOffset != null && <ExplainedButton label="Tải thêm lượt gửi" type="button" className="secondary" disabled={!weekReady || busy || weekLoading || moreLoading} reason={busy?'Đang xử lý thao tác.':weekLoading||moreLoading?'Đang đọc lượt gửi.':'Bản đang xem chưa được xác minh; hãy tải lại dữ liệu trước.'} onClick={() => void loadMoreResponses()}>{moreLoading ? 'Đang tải thêm…' : 'Tải thêm lượt gửi'}</ExplainedButton>}</div>}
      </TableWorkspace>
      <TableWorkspace label="Bảng lịch sử thao tác" expandLabel="Phóng rộng bảng lịch sử" preferenceKey="dashboard-history" context={{week:selectedWeek?.name||'Chưa chọn tuần',filters:filterConditions({...auditFilters,action:auditFilters.action?historyActionLabel(auditFilters.action):''},{actor:'Người quản trị',action:'Loại thao tác',from:'Từ ngày',to:'Đến ngày',note:'Tìm ghi chú',errorsOnly:'Chỉ lỗi/chưa hoàn tất'}).map(item=>`${item.label}: ${item.value}`).join(' · ')||'Không có bộ lọc lịch sử'}} headers={['Thao tác','Thời gian','Người thực hiện','Đối tượng','Thao tác bản ghi']} requiredColumns={[0,3,4]}>
      <div className="dashboard-section-title dashboard-history-title"><h2>Lịch sử thao tác</h2><span>{displayedWeek?.historyPage ? `${filteredHistory.length} / ${displayedWeek.historyPage.matchedCount} phù hợp · tổng ${displayedWeek.historyPage.total}` : `${filteredHistory.length} / ${displayedWeek?.history?.length || 0}`} sự kiện</span></div>
      <p>Lịch sử lưu tên, món đã chọn, thời điểm và Gmail quản trị; không lưu email người trả lời.</p>
      <div className="audit-filters" aria-label="Bộ lọc lịch sử"><label>Người quản trị<SearchInput label="Người quản trị" maxLength={254} value={auditFilters.actor || ''} onClear={()=>filterHistory('actor','')} onChange={event => filterHistory('actor',event.target.value)} placeholder="Tìm Gmail quản trị" /></label><label>Loại thao tác<select aria-label="Loại thao tác" value={auditFilters.action || ''} onChange={event => filterHistory('action',event.target.value)}><option value="">Tất cả thao tác</option>{(displayedWeek?.historyPage?.actions || [...new Set((displayedWeek?.history || []).map(event => event.action))]).map(action => <option key={action} value={action}>{historyActionLabel(action)}</option>)}</select></label><label>Từ ngày<input type="date" value={auditFilters.from || ''} onChange={event => filterHistory('from',event.target.value)} /></label><label>Đến ngày<input type="date" value={auditFilters.to || ''} onChange={event => filterHistory('to',event.target.value)} /></label><label>Tìm ghi chú<SearchInput label="Tìm ghi chú" maxLength={200} value={auditFilters.note || ''} onClear={()=>filterHistory('note','')} onChange={event => filterHistory('note',event.target.value)} /></label><label className="audit-error-toggle"><input type="checkbox" checked={auditFilters.errorsOnly || false} onChange={event => filterHistory('errorsOnly',event.target.checked)} />Chỉ lỗi/chưa hoàn tất</label><button type="button" className="secondary" onClick={() => { setAuditFilters({}); setAuditLimit(50); }}>Xóa bộ lọc lịch sử</button></div>
      {auditFilters.from && auditFilters.to && auditFilters.from > auditFilters.to && <p className="dashboard-warning" role="alert">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.</p>}
      {filteredHistory.length ? <TableScroll><table className="dashboard-table dashboard-history-table"><thead><tr>{['Thao tác','Thời gian','Người thực hiện','Đối tượng','Thao tác bản ghi'].map((label,index)=><th key={label}>{index<4?label:''}<ColumnResizeHandle index={index} label={label}/></th>)}</tr></thead><tbody>
        {auditGroups.map(group=><Fragment key={group.key}><tr className="audit-day-heading"><TableSpanCell><button type="button" className="secondary" aria-expanded={!foldedDays.includes(group.key)} onClick={()=>toggleAuditDay(group.key)}>{group.label} · {group.events.length} sự kiện đã tải{group.attention>0&&<strong> · {group.attention} cần kiểm tra</strong>}</button></TableSpanCell></tr>{!foldedDays.includes(group.key)&&group.events.map(event => {
          const alreadyRestored = restoreAttempts.has(event.entryId);
          const restoreEligible = event.action === 'deleted' && event.restorable && !alreadyRestored;
          const canRestore = weekReady && permissions.manageResponses && restoreEligible && displayedWeek?.week?.formStatus === 'open';
          return <tr key={event.id} data-audit-event>
            <td><strong className="dashboard-history-action">{historyActionLabel(event.action)}</strong>{describeHistoryNote(event.note).map((line, index) => <small key={index} className="dashboard-history-note"><SearchHighlight text={line} query={auditFilters.note}/></small>)}</td>
            <td data-label="Thời gian">{group.key==='unknown'?'Chưa có thời điểm':formatTime(event.at)}{event.originalTimestamp > 0 && <small className="dashboard-history-note">Gửi gốc: {formatTime(event.originalTimestamp)}</small>}</td>
            <td data-label="Người thực hiện"><SearchHighlight text={event.actor || '—'} query={auditFilters.actor}/></td>
            <td data-label="Đối tượng"><strong>{event.name || '—'}</strong><small className="dashboard-history-note">{(event.meals || []).join(' · ')}</small></td>
            <td>{canRestore ? <RowActionMenu label="Thao tác lịch sử"><ExplainedButton label="Khôi phục" type="button" data-close-row-menu className="secondary" disabled={busy} reason="Đang xử lý thao tác; hãy chờ kết quả trước khi khôi phục tiếp." aria-busy={pendingRow?.action === 'restore' && pendingRow.id === event.entryId} onClick={() => void restoreResponse(event)}>{pendingRow?.action === 'restore' && pendingRow.id === event.entryId ? 'Đang khôi phục…' : 'Khôi phục'}</ExplainedButton></RowActionMenu> : restoreEligible && weekData?.week?.formStatus === 'closed' ? <span title="Không tự mở Form vì thao tác đó sẽ công khai Form">Form đã đóng</span> : restoreEligible ? <span>Chưa xác định Form</span> : alreadyRestored && event.action === 'deleted' ? <span>Đã xử lý</span> : null}</td>
          </tr>;
        })}</Fragment>)}
      </tbody></table></TableScroll> : !displayedWeek||auditTotal==null?<p>Chưa có dữ liệu lịch sử. Hãy tải lại dữ liệu.</p>:weekLoading?<p>Đang đọc kết quả lọc lịch sử…</p>:<FilterEmptyState title={auditConditions.length||auditTotal>0?'Không có thao tác phù hợp':'Chưa có thao tác nào trong tuần này'} conditions={auditConditions} onClear={key=>{filterHistory(key,key==='errorsOnly'?false:'');document.querySelector('.audit-filters input')?.focus();}}/>}
      {displayedWeek?.historyPage?.nextOffset!=null ? <ExplainedButton label="Tải thêm lịch sử" type="button" className="secondary" disabled={!weekReady||weekLoading||busy||historyLoading} reason={busy?'Đang xử lý thao tác.':weekLoading||historyLoading?'Đang đọc dữ liệu lịch sử.':'Bản đang xem chưa được xác minh; hãy tải lại dữ liệu trước.'} onClick={()=>void loadMoreHistory()}>{historyLoading?'Đang tải lịch sử…':'Tải thêm lịch sử'}</ExplainedButton> : filteredHistory.length > auditLimit && <button type="button" className="secondary" onClick={() => setAuditLimit(value => value + 50)}>Tải thêm lịch sử</button>}
      </TableWorkspace>
    </section>}

    {tab === 'form' && overview.role === 'owner' && <section className="dashboard-panel">
      <div className="dashboard-section-title"><h2>Trạng thái và hạn đăng ký</h2>{weekPicker()}</div>
      {selectedWeek ? <><p>Form: <strong>{selectedWeek.formStatus === 'open' ? 'Đang mở' : selectedWeek.formStatus === 'closed' ? 'Đã đóng' : 'Chưa xác định'}</strong></p><RegistrationDeadline lockAt={selectedWeek.lockAt} status={selectedWeek.formStatus} serverNow={overview.serverNow}/><div className="dashboard-deadline"><div className="field-label-row"><label htmlFor="dashboard-deadline">Hạn mới — giờ Việt Nam</label><FieldHelp label="Hạn đăng ký">Đây là thời điểm Form tự đóng, theo giờ Việt Nam. Nhập một hạn tương lai rồi xác nhận Lưu hạn đăng ký; đổi ô nhập hoặc mở trợ giúp không tự đổi Form. Mở lại Form quá hạn cũng cần hạn tương lai.</FieldHelp></div><input id="dashboard-deadline" type="datetime-local" value={deadline} disabled={busy} onChange={event => setDeadline(event.target.value)} /></div><p className="dashboard-hint">Mở lại Form quá hạn cần chọn hạn tương lai. Lịch tự đóng dùng hạn mới; tuần chưa chỉnh vẫn khóa lúc 00:00 thứ Hai.</p><div className="actions">
        <ExplainedButton disabled={busy || selectedWeek.formStatus !== 'closed'} reason={busy?'Đang cập nhật Form; hãy chờ xác nhận.':selectedWeek.formStatus==='open'?'Form đang mở, không cần mở lại.':'Chưa xác định trạng thái Form; hãy tải lại sổ tuần.'} onClick={() => void controlForm('open')}>Mở Form</ExplainedButton>
        <ExplainedButton className="danger" disabled={busy || selectedWeek.formStatus !== 'open'} reason={busy?'Đang cập nhật Form; hãy chờ xác nhận.':selectedWeek.formStatus==='closed'?'Form đã đóng, không cần đóng lại.':'Chưa xác định trạng thái Form; hãy tải lại sổ tuần.'} onClick={() => void controlForm('close')}>Đóng Form</ExplainedButton>
        <ExplainedButton className="secondary" disabled={busy || selectedWeek.formStatus === 'unknown'} reason={busy?'Đang cập nhật Form; hãy chờ xác nhận.':'Chưa xác định trạng thái Form; hãy tải lại sổ tuần trước khi đổi hạn.'} onClick={() => void controlForm('deadline')}>Lưu hạn đăng ký</ExplainedButton>
      </div></> : <p>Chọn một tuần đã đăng ký.</p>}
      <p className="dashboard-hint">Lịch sử các thay đổi nằm trong “Lượt gửi &amp; lịch sử” của tuần này.</p>
    </section>}

    {tab === 'reconcile' && <section className="dashboard-panel">
      <div className="dashboard-section-title"><div className="field-label-row"><h2>Đối soát Form–Sheet</h2><FieldHelp label="Đối soát Form–Sheet">So sánh lượt Form với hàng trong Sheet của đúng tuần. Ghép duy nhất nghĩa là xác định được đúng một cặp tương ứng. Lượt lệch hoặc ghép không rõ chỉ được báo để kiểm tra, không tự xóa hay sửa.</FieldHelp></div>{weekPicker()}</div><p>Chỉ đọc: không tự sửa, ghép, khôi phục hoặc xóa dữ liệu.</p><ExplainedButton label="Đối soát tuần này" disabled={busy || reconciling || !weekKey} reason={busy?'Đang xử lý thao tác khác.':reconciling?'Đang đối soát Form–Sheet; hãy chờ hoặc dừng chờ dữ liệu.':'Chọn một tuần đã đăng ký trước khi đối soát.'} onClick={() => void reconcileWeek()}>{reconciling ? 'Đang đối soát…' : 'Đối soát tuần này'}</ExplainedButton>
      {reconciliation && <><div className="reconciliation-counts"><p>Form <strong>{reconciliation.formCount}</strong></p><p>Sheet <strong>{reconciliation.sheetCount}</strong></p><p>Ghép duy nhất <strong>{reconciliation.matchedCount}</strong></p><p>Cần kiểm tra <strong>{reconciliation.issues.length}</strong></p></div><ul className="reconciliation-issues">{reconciliation.issues.map((issue, index) => <li key={`${weekKey}-${index}`}><strong>{({ 'form-only': 'Chỉ có trong Form', 'sheet-only': 'Chỉ có trong Sheet', ambiguous: 'Ghép không duy nhất' })[issue.kind]}</strong><p>{issue.name || '(Thiếu tên)'} · {formatTime(issue.timestamp)} · {issue.source === 'sheet' ? 'Sheet' : 'Form'}{issue.rows?.length ? ` · hàng ${issue.rows.join(', ')}` : ''}</p><p>{issue.meals.join(' · ')}</p><SheetRowButton weekKey={weekKey} source={issue.source} response={issue} request={request} disabled={busy} /></li>)}</ul>{!reconciliation.issues.length && <p role="status">Form và Sheet đang khớp duy nhất.</p>}</>}
    </section>}

{tab === 'branding' && overview.role === 'owner' && <section className="dashboard-panel"><h2>Thương hiệu trường</h2><p>Áp dụng cho trang xem, kho tuần, Dashboard và cài đặt. Chỉ lưu thông tin hiển thị công khai.</p>{brandDirty&&<p className="unsaved-state" role="status" aria-label="Chưa lưu thương hiệu">Chưa lưu · Thương hiệu đang sửa chưa áp dụng lên web.</p>}<form className="branding-form" onSubmit={event => void saveBranding(event)}><label>Tên trường<input required maxLength={100} value={brandDraft.schoolName} onChange={event => setBrandDraft({ ...brandDraft, schoolName: event.target.value })} /></label><label>URL ảnh logo HTTPS<input type="url" maxLength={512} placeholder="https://…/logo.png" value={brandDraft.logoUrl} aria-invalid={Boolean(logoIssue||brandDraft.logoUrl&&logoPhase==='error')} aria-describedby={logoFeedbackId} onChange={event => setBrandDraft({ ...brandDraft, logoUrl: event.target.value })} /></label><div id={logoFeedbackId} className="logo-input-feedback" data-state={logoIssue?'invalid':logoPhase}><p role="status" aria-label="Tình trạng logo">{logoMessage}</p>{brandDraft.logoUrl&&!logoIssue&&logoPhase==='error'&&<ExplainedButton type="button" className="secondary" disabled={busy} reason="Đang xử lý thao tác khác; hãy chờ hoàn tất." onClick={()=>setLogoAttempt(value=>value+1)}>Thử tải lại logo</ExplainedButton>}</div><label>Màu chủ đạo<input type="color" value={brandDraft.primaryColor} onChange={event => setBrandDraft({ ...brandDraft, primaryColor: event.target.value })} /></label><BrandingPreview draft={brandDraft} logoAttempt={logoAttempt} onLogoStatus={receiveLogoStatus}/><p className="dashboard-hint">Dùng ảnh HTTPS truy cập được công khai; chưa hỗ trợ tải ảnh lên. Không dán khóa API hoặc liên kết chứa thông tin bí mật.</p><ExplainedButton disabled={busy} reason="Đang xử lý yêu cầu; hãy chờ kết quả trước khi lưu tiếp.">Lưu thương hiệu</ExplainedButton></form></section>}

    {tab === 'access' && overview.role === 'owner' && <section className="dashboard-panel">
      <div className="field-label-row"><h2>Gmail được phép quản trị</h2><FieldHelp label="Quyền quản trị">Chỉ chủ sở hữu chỉnh quyền. Xem cho phép mở Dashboard; OCR/tạo tuần và Xóa/khôi phục là hai quyền riêng. Bật/tắt ô quyền sẽ cập nhật quyền; gỡ Gmail cần xác nhận. Gỡ quyền không chuyển quyền sở hữu hay xóa dữ liệu. Mở trợ giúp không đổi quyền.</FieldHelp></div>
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
    {mergeBase&&<MultiImageReview fragments={mergeBase.fragments} images={mergeBase.images} base={mergeBase.menu} onClose={()=>setMergeBase(null)} onApply={next=>{if(images!==mergeBase.images||menu!==mergeBase.menu)throw new Error('Nháp/ảnh đã thay đổi; hãy đóng và đọc lại.');dispatchMenu({type:'apply',value:next});setAllowMissing(false);setMergeBase(null);setMessage('Đã áp dụng bản ghép. Hãy rà soát ngày/món trước khi tạo tuần.','info');}}/>}
    {regionBase && <RegionOcr image={regionBase.image} menu={regionBase.menu} request={request} onBusy={setBusy} onClose={() => setRegionBase(null)} onApply={(target,result) => {
      if (menu !== regionBase.menu || image !== regionBase.image) throw new Error('Nháp đã thay đổi; đóng cửa sổ và chọn vùng lại.');
      dispatchMenu({type:'edit',value:applyRegionResult(menu,target,result)});setAllowMissing(false);setRegionBase(null);
    }} />}
    {quickResponse && <ResponseQuickView response={currentQuickResponse || quickResponse} week={displayedWeek?.week} verified={weekReady && Boolean(currentQuickResponse)} navigation={{index:quickIndex,total:visibleResponses.length,previous:quickIndex>0?visibleResponses[quickIndex-1]:null,next:quickIndex>=0?visibleResponses[quickIndex+1]:null}} onSelect={response=>{const current=visibleResponses.find(item=>item.responseId===response?.responseId);if(current)setQuickResponse(current);}} onClose={() => setQuickResponse(null)} />}
    {confirmation && <ActionConfirmation message={confirmation.message} changes={confirmation.changes} showReason={confirmation.showReason} onCancel={() => setConfirmation(null)} onConfirm={reason => { const action = confirmation.run; setConfirmation(null); void action(reason); }} />}
  </main></DashboardLayout>;
}

export default Dashboard;
