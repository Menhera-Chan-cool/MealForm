import { Fragment,useCallback, useEffect,useId,useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
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
import TableWorkspace,{ColumnResizeHandle,TableSpanCell,WorkspaceRow} from './TableWorkspace.jsx';
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
import {DashboardLayout,DashboardOverview,allowedDashboardSections} from './DashboardLayout.jsx';
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
import FriendlyTime from './FriendlyTime.jsx';
import CharacterCounter from './CharacterCounter.jsx';
import SystemReport from './SystemReport.jsx';
import useAppAttention from './useAppAttention.js';
import AppAttentionControls from './AppAttentionControls.jsx';
import MemberPermissionsEditor from './MemberPermissionsEditor.jsx';
import DeviceData from './DeviceData.jsx';
import SubmissionFilters from './SubmissionFilters.jsx';
import {permissionChanges,filterSubmissions,sendTimeRange} from './dashboard-nine.mjs';
import {TEXT_LIMITS,healthCounts} from './operating-ui.mjs';
import OcrFindBar from './OcrFindBar.jsx';
import {findOcrFields} from './ocr-navigation.mjs';
import FormErrorSummary from './FormErrorSummary.jsx';
import OcrWorkspace from './OcrWorkspace.jsx';
import ContextualSaveBar from './ContextualSaveBar.jsx';
import {brandFieldErrors} from './operate-accessibility.mjs';
import CreationReceipt from './CreationReceipt.jsx';
import useDashboardHistory from './useDashboardHistory.js';
import {readDashboardLocation} from './dashboard-navigation.mjs';
import DraftInspection from './DraftInspection.jsx';
import DraftTransfer from './DraftTransfer.jsx';
import SessionFeedback from './SessionFeedback.jsx';
import ContextGuide from './ContextGuide.jsx';
import ConnectionNotice,{useOnlineState} from './ConnectionNotice.jsx';
import BrandContrast from './BrandContrast.jsx';
import DraftMealSlots from './DraftMealSlots.jsx';
import {moveDraftMeal} from './draft-tools.mjs';
import MutationReceipt from './MutationReceipt.jsx';
import {normalizeMutationReceipt} from './mutation-receipt.mjs';

const MEAL_SLOTS = [0, 1, 2];

export async function dashboardRequest(url = '/api/dashboard', options = {}, onUnauthorized) {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
  const body = await response.json();
  if(options.signal?.aborted)throw cancelledRead();
  if (!response.ok) {
    const message = errorMessage(body.error, 'Không thể hoàn tất thao tác.');
    if (response.status === 401 || response.status === 403) onUnauthorized?.(message, response.status);
    throw Object.assign(new Error(message), { status: response.status,receipt:normalizeMutationReceipt(body.receipt) });
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
  const online=useOnlineState();
  const {gate:reads,pending:readPending}=useReadWait();
  const request = async (url, options) => {
    if(!online)throw new TypeError('Thiết bị đang báo ngoại tuyến. Bản đã tải chỉ đọc; không có thao tác nào được xếp hàng để gửi lại.');
    if(options?.method&&options.method!=='GET'){warningRevision.current++;setHealth(null);setReconciliation(null);}
    const ticket=(!options?.method||options.method==='GET')?reads.begin():null;
    try {
      const body=await dashboardRequest(url, ticket?{...options,signal:ticket.signal}:options, (message, status) => { weekRequest.current++; reads.cancel(); clearDashboardCache(); onUnauthorized?.(message, status); });
      if(ticket&&!reads.current(ticket))throw cancelledRead();
      return body;
    } catch (error) { if(error.name!=='AbortError')setFailure(safeErrorReport(dashboardOperation(url, options), error)); throw error; }
    finally{if(ticket)reads.finish(ticket);}
  };
  const [savedWeek] = useState(() => lastDashboardWeek(initialData?.accountId, (initialData?.weeks || []).map(week => week.weekKey)));
  const initialLocation=readDashboardLocation(window.location.search,allowedDashboardSections(initialData?.role,initialData?.permissions||{create:true}).map(section=>section.id),initialData?.weeks||[],{tab:savedWeek?'delete':'overview',week:savedWeek||initialData?.weeks?.[0]?.weekKey||''});
  const initialWeek = initialLocation.week;
  const [overview, setOverview] = useState(initialData || { role: '', weeks: [], allowedEmails: [] });
  const [tab, setTabState] = useState(initialLocation.tab);
  const attention=useAppAttention(overview.accountId,tab==='create');
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
  const followDeleteFocus=useRef(null);
  const [quickResponse, setQuickResponse] = useState(null);
  const [regionBase, setRegionBase] = useState(null);
  const [highlightIds, setHighlightIds] = useState([]);
  const [auditFilters, setAuditFilters] = useState({});
  const [auditLimit, setAuditLimit] = useState(50);
  const highlightTimer = useRef(null);
  const [email, setEmail] = useState('');
  const [permissionDrafts,setPermissionDrafts]=useState({});
  const permissionDirty=Object.keys(permissionDrafts).length>0;
  function stagePermission(member,value){setPermissionDrafts(current=>{const next={...current};if(value&&permissionChanges(member.permissions,value).length)next[member.email]=value;else delete next[member.email];return next;});}
  const [memberQuery,setMemberQuery]=useState(''),[memberPermission,setMemberPermission]=useState('');
  const members=overview.members||(overview.allowedEmails||[]).map(email=>({email,permissions:{view:true,create:true,manageResponses:true}}));
  const visibleMembers=members.filter(member=>foldSearchText(member.email).includes(foldSearchText(memberQuery).trim())&&(!memberPermission||member.permissions[memberPermission]===true));
  const [file, setFile] = useState(null);
  const [image, setImage] = useState('');
  const [images,setImages]=useState([]);
  const [mergeBase,setMergeBase]=useState(null);
  const [menuHistory, dispatchMenu] = useReducer(menuHistoryReducer, undefined, () => menuHistoryReducer(undefined, { type: 'reset', value: null }));
  const menu = menuHistory.present;
  const [originalMenu,setOriginalMenu]=useState(null),[draftSource,setDraftSource]=useState('');
  const [sourceStale,setSourceStale]=useState(false);
  const [editorFocused,setEditorFocused]=useState(false),focusScroll=useRef(null);
  function toggleEditorFocus(){const next=!editorFocused;if(next)focusScroll.current={top:window.scrollY,left:window.scrollX};setEditorFocused(next);requestAnimationFrame(()=>{if(next)document.querySelector('.editor-focus-tools')?.scrollIntoView({block:'start'});else if(focusScroll.current)window.scrollTo({...focusScroll.current,behavior:'instant'});});}
  useEffect(()=>{if(tab!=='create')setEditorFocused(false);},[tab]);
  useEffect(()=>{const escape=event=>{if(editorFocused&&event.key==='Escape'&&!document.querySelector('dialog:modal,:popover-open')){event.preventDefault();toggleEditorFocus();}};document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);},[editorFocused]);
  const [reviewEpoch,setReviewEpoch]=useState(0);
  const [ocrQuery,setOcrQuery]=useState(''),[ocrActive,setOcrActive]=useState('');
  const setMenu = value => {if(!value){setOriginalMenu(null);setDraftSource('');setSourceStale(false);}setReviewEpoch(epoch=>epoch+1);setOcrQuery('');setOcrActive('');dispatchMenu({ type: 'reset', value });};
  const [creationState,setCreationState]=useState('idle');
  const [createdWeek,setCreatedWeek]=useState(null);
  const [ocrAttempt,setOcrAttempt]=useState(0),ocrWorkspace=useRef(null);
  const [allowMissing, setAllowMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, updateMessage] = useState('');
  const [failure, setFailure] = useState(null);
  const [toast, setToast] = useState(null);
  const [sessionEvents,setSessionEvents]=useState([]),feedbackId=useRef(0);
  const [pendingRow, setPendingRow] = useState(null);
  const weekRequest = useRef(0);
  const weekLoadTimer=useRef(null);
  const currentWeekData = useRef(weekData);
  currentWeekData.current = weekData;
  const dismissToast = useCallback(() => setToast(null), []);
  function setMessage(text, kind) {
    updateMessage(text);
    if (!text || kind === 'success' || /^Đã |^Apps Script đã/.test(text)) setFailure(null);
    if (text) {const severity=kind||(/^Đã |^Apps Script đã/.test(text)?'success':/^Đang /.test(text)?'info':'error');setToast({message:text,kind:severity});if(!/^Đang /.test(text))setSessionEvents(current=>[{id:++feedbackId.current,at:Date.now(),context:tabTitle,message:severity==='error'?'Thao tác chưa hoàn tất. Kiểm tra thông báo đang hiện và dữ liệu trước khi thử lại; không tự gửi lại thao tác.':text.slice(0,300)},...current].slice(0,20));}
  }
  const [authorizationUrl, setAuthorizationUrl] = useState('');
  const [health, setHealth] = useState(null);
  const [healthBusy, setHealthBusy] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [formAttempt,setFormAttempt]=useState(0);
  const deadlineIssue=!deadline||!Number.isFinite(Date.parse(`${deadline}:00+07:00`))||Date.parse(`${deadline}:00+07:00`)<=Date.now()?'Chọn hạn đăng ký hợp lệ ở tương lai.':'';
  const [reconciliation, setReconciliation] = useState(null);
  const [reconciling,setReconciling]=useState(false);
  const warningRevision=useRef(0),healthRequest=useRef(0),nameCountId=useId();
  const warnings={};
  if(!reconciling&&reconciliation?.weekKey===weekKey&&reconciliation.issues?.length)warnings.reconcile={count:reconciliation.issues.length,description:`Đã tải ${formatTime(reconciliation.readAt)} · ${selectedWarningWeek()}`,details:[...new Set(reconciliation.issues.map(issue=>({'form-only':'Chỉ có trong Form','sheet-only':'Chỉ có trong Sheet',ambiguous:'Ghép không duy nhất'})[issue.kind]||'Cần kiểm tra'))].join(' · ')};
  if(!healthBusy&&health?.uiWeekKey===weekKey){const counts=healthCounts(health.checks);const count=counts.warning+counts.error+counts.unknown;if(count)warnings.health={count,description:`Đã tải ${formatTime(health.readAt)} · ${selectedWarningWeek()}`,details:health.checks.filter(check=>check.status!=='ok').map(check=>check.label||'Mục chưa xác định').join(' · ')};}
  function selectedWarningWeek(){return (overview.weeks||[]).find(week=>week.weekKey===weekKey)?.name||'Tuần đang chọn';}
  const [brandDraft, setBrandDraft] = useState(branding);
  const [mutationReceipt,setMutationReceipt]=useState(null);
  const [brandAttempt,setBrandAttempt]=useState(0);
  const brandErrors=brandFieldErrors(brandDraft).map(error=>({...error,id:({schoolName:'brand-school-name',logoUrl:'brand-logo-url',primaryColor:'brand-color'})[error.field]}));
  const logoFeedbackId=useId(),[logoAttempt,setLogoAttempt]=useState(0),[logoState,setLogoState]=useState(null),logoRequest=useRef(null);
  logoRequest.current={url:brandDraft.logoUrl,attempt:logoAttempt};
  function receiveLogoStatus(value){if(value.url===logoRequest.current.url&&value.attempt===logoRequest.current.attempt)setLogoState(value);}
  const logoIssue=logoInputIssue(brandDraft.logoUrl),logoPhase=logoState?.url===brandDraft.logoUrl&&logoState.attempt===logoAttempt?logoState.state:'loading';
  const logoMessage=!brandDraft.logoUrl?'Chưa chọn logo; đây là trường tùy chọn.':logoIssue||({loading:'Đang tải ảnh xem trước…',loaded:'Ảnh đã tải được trên trình duyệt này.',error:'Chưa tải được ảnh trên trình duyệt. Kiểm tra liên kết ảnh công khai hoặc thử tải lại; lỗi này không xác nhận ảnh đã bị xóa.'})[logoPhase];
  const [brandSaved,setBrandSaved]=useState(branding),[noticeDirty,setNoticeDirty]=useState(false);
  const noticeEditor=useRef(null),brandDirty=brandHasEdits(brandDraft,brandSaved);
  const confirmDiscard=useUnsavedChanges(brandDirty||noticeDirty||permissionDirty);
  function leaveDrafts(){
    if(!confirmDiscard())return false;
    if(brandDirty){setBrandDraft(brandSaved);setBrandAttempt(0);}
    noticeEditor.current?.discard();setNoticeDirty(false);setPermissionDrafts({});return true;
  }
  const selectedWeek = (overview.weeks || []).find(week => week.weekKey === weekKey);
  const permissions = overview.permissions || { view: true, create: true, manageResponses: true };
  const draft = useOcrDraft(overview.accountId, permissions.create === true, { image, filename: file?.name || '', images:images.length?images:undefined, menu,originalMenu,source:draftSource,sourceStale }, saved => {
    setImage(saved.image); setFile({ name: saved.filename }); setMenu(saved.menu);setOriginalMenu(saved.originalMenu||null);setDraftSource(saved.source||'');setSourceStale(saved.sourceStale===true); setAllowMissing(false);
    setImages(saved.images||(saved.image?[{dataUrl:saved.image,name:saved.filename||'Ảnh nháp'}]:[]));
  });

  const viewState = useDashboardView(overview.accountId, weekKey, tab, weekData, weekVerified);
  const query = viewState.view.query, responseSort = viewState.view.sort;
  const advancedResponses=viewState.view.nameMatch==='exact'||Boolean(viewState.view.sentPreset&&viewState.view.sentPreset!=='all');
  const responseScope=JSON.stringify([query,responseSort,viewState.view.nameMatch||'contains',viewState.view.sentPreset||'all',viewState.view.sentFrom||'',viewState.view.sentTo||'']);
  function changeResponseFilters(patch){clearTimeout(weekLoadTimer.current);weekRequest.current++;reads.cancel();setWeekVerified(false);viewState.update(patch);}
  const setQuery = value => changeResponseFilters({ query: value });
  const setResponseSort = value => changeResponseFilters({ sort: value });
  function navigate(nextTab=tab,nextWeek=weekKey,recordHistory=true,restored){
    if(nextTab===tab&&nextWeek===weekKey&&!restored)return true;
    if(busy||document.querySelector('dialog:modal:not(.quick-dialog)')||!leaveDrafts())return false;
    viewState.save();if(nextTab!==tab)setQuickResponse(null);if(recordHistory)navigationHistory.push(nextTab,nextWeek);setTabState(nextTab);
    if(restored){viewState.restore(restored.view,nextWeek);setAuditFilters(restored.auditFilters);setAuditLimit(restored.auditLimit);}
    if(nextWeek!==weekKey){setQuickResponse(null);setWeekKey(nextWeek);}return true;
  }
  const setTab=next=>navigate(next,weekKey),selectWeek=next=>navigate(tab,next);
  useEffect(()=>{const opened=event=>{if(event.data?.type==='meal-open-ocr-notice'&&!navigate('create',weekKey))setMessage('Có kết quả OCR chưa xem. Hoàn tất thao tác hoặc lưu/bỏ thay đổi rồi mở Tạo tuần.','info');};navigator.serviceWorker?.addEventListener('message',opened);return()=>navigator.serviceWorker?.removeEventListener('message',opened);},[weekKey,tab,busy,brandDirty,noticeDirty,permissionDirty]);
  const navigationHistory=useDashboardHistory({account:overview.accountId,tab,week:weekKey,tabs:allowedDashboardSections(overview.role,permissions).map(section=>section.id),weeks:overview.weeks||[],capture:()=>({view:viewState.save()||viewState.view,auditFilters:{...auditFilters},auditLimit}),onNavigate:(nextTab,nextWeek,snapshot)=>navigate(nextTab,nextWeek,false,snapshot)});
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
    warningRevision.current++;setHealth(null);setReconciliation(null);
    setMessage(STOP_WAIT_MESSAGE,'info');
  }

  const validation = useMemo(() => inspectMenu(menu, allowMissing), [menu, allowMissing]);
  const reviewLinks=useMemo(()=>ocrReviewLinks(menu,validation,allowMissing),[menu,validation,allowMissing]);
  const imageOrderBlocked=menu||menuHistory.past.length||menuHistory.future.length||mergeBase||regionBase?'Đã có kết quả OCR hoặc lịch sử sửa. Chọn lại bộ ảnh để bắt đầu bản mới trước khi sắp xếp.':'';
  const ocrMatches=useMemo(()=>findOcrFields(menu,ocrQuery),[menu,ocrQuery]),ocrIndex=ocrMatches.findIndex(hit=>hit.id===ocrActive);
  function queryOcr(value){setOcrQuery(value);setOcrActive('');}
  function moveOcrMatch(direction){if(busy||!ocrMatches.length)return;const index=ocrIndex<0?(direction>0?0:ocrMatches.length-1):(ocrIndex+direction+ocrMatches.length)%ocrMatches.length;setOcrActive(ocrMatches[index].id);jumpToReview(ocrMatches[index].id);}
  function ocrFieldClass(id,existing=''){return [existing,ocrMatches.some(hit=>hit.id===id)?'ocr-search-hit':'',ocrIndex>=0&&ocrActive===id?'ocr-search-current':''].filter(Boolean).join(' ');}
  function jumpToReview(id){
    if(busy)return;const target=document.getElementById(id)||(/^ocr-meal-(\d+)-/.test(id)?document.getElementById('ocr-closed-'+id.split('-')[2]):null);if(!target)return;
    const focus=()=>{target.scrollIntoView({block:'center'});target.focus({preventScroll:true});};
    if(ocrWorkspace.current)ocrWorkspace.current.showEditor(focus);else requestAnimationFrame(focus);
  }
  const existingWeek = (overview.weeks || []).find(week => week.weekKey === menuCalendarKey(menu));
  const existingFormUrl = mealRegistrationTarget(existingWeek).formUrl;
  const existingSheetUrl = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]+(?:\/|$)/.test(existingWeek?.spreadsheetUrl || '') ? existingWeek.spreadsheetUrl : '';
  const displayedWeek = weekData?.week?.weekKey === weekKey ? weekData : null;
  const weekReady = online && weekVerified && Boolean(displayedWeek) && (!advancedResponses||displayedWeek.responseFilterScope===responseScope&&!sendTimeRange(viewState.view).error&&displayedWeek.page?.nextOffset==null) && (!displayedWeek.page || (displayedWeek.page.query === query && displayedWeek.page.sort === responseSort));
  const currentQuickResponse = quickResponse && displayedWeek?.responses.find(response => response.responseId === quickResponse.responseId);
  const [advancedLimit,setAdvancedLimit]=useState(50);
  useEffect(()=>setAdvancedLimit(50),[weekKey,responseScope]);
  const matchingResponses = filterSubmissions(displayedWeek?.responses,query,viewState.view).slice().sort((left, right) => {
      if (responseSort === 'name') return String(left.name || '').localeCompare(String(right.name || ''), 'vi', { sensitivity: 'base' });
      const difference = Number(left.timestamp || 0) - Number(right.timestamp || 0);
      return responseSort === 'oldest' ? difference : -difference;
    });
  const visibleResponses=advancedResponses?matchingResponses.slice(0,advancedLimit):matchingResponses;
  const quickMatches=quickResponse?.responseId?visibleResponses.flatMap((response,index)=>response.responseId===quickResponse.responseId?[index]:[]):[];
  useLayoutEffect(()=>{
    const pending=followDeleteFocus.current;
    if(!pending)return;
    if(pending.week!==weekKey){followDeleteFocus.current=null;return;}
    if(!displayedWeek||displayedWeek.responses.some(item=>item.responseId===pending.removed))return;
    followDeleteFocus.current=null;
    if(document.activeElement===document.body){
      const target=pending.neighbor?document.querySelector(`[data-response-id="${CSS.escape(pending.neighbor)}"] .dashboard-row-actions button:not(:disabled)`):null;
      (target||document.getElementById('dashboard-name-search'))?.focus();
    }
  },[displayedWeek,weekKey]);
  const quickIndex=quickMatches.length===1?quickMatches[0]:-1;
  const restoreAttempts = new Set((displayedWeek?.history || []).filter(event => /^restore-/.test(event.action) || event.action === 'restored').map(event => event.entryId));
  const filteredHistory = filterAuditHistory(displayedWeek?.history || [], auditFilters);
  const auditScope=JSON.stringify([weekKey,auditFilters]),[foldedAudit,setFoldedAudit]=useState({scope:'',keys:[]});
  const foldedDays=foldedAudit.scope===auditScope?foldedAudit.keys:[],auditGroups=groupAuditDays(filteredHistory.slice(0,auditLimit));
  function toggleAuditDay(key){setFoldedAudit({scope:auditScope,keys:foldedDays.includes(key)?foldedDays.filter(value=>value!==key):[...foldedDays,key]});}
  const appliedResponseConditions=filterConditions({name:query,nameMatch:viewState.view.nameMatch==='exact'?'Khớp toàn bộ họ tên':'',sentPreset:({today:'Hôm nay',yesterday:'Hôm qua',custom:'Khoảng ngày giờ'})[viewState.view.sentPreset]||'',sentFrom:viewState.view.sentPreset==='custom'?viewState.view.sentFrom:'',sentTo:viewState.view.sentPreset==='custom'?viewState.view.sentTo:''},{name:'Họ tên',nameMatch:'Kiểu khớp tên',sentPreset:'Thời điểm gửi',sentFrom:'Gửi từ',sentTo:'Gửi đến'});
  const responseConditions=(displayedWeek?.page?.total??displayedWeek?.responseCount)===0?[]:appliedResponseConditions;
  function responseFilterPatch(key){return key==='name'?{query:''}:key==='nameMatch'?{nameMatch:'contains'}:key==='sentPreset'?{sentPreset:'all'}:{[key]:''};}
  const auditTotal=displayedWeek?.historyPage?.total??displayedWeek?.history?.length;
  const auditConditions=auditTotal===0?[]:filterConditions({...auditFilters,action:auditFilters.action?historyActionLabel(auditFilters.action):''},{actor:'Người quản trị',action:'Loại thao tác',from:'Từ ngày',to:'Đến ngày',note:'Tìm ghi chú',errorsOnly:'Chỉ lỗi/chưa hoàn tất'});
  function filterHistory(key, value) { setAuditFilters(current => ({ ...current, [key]:value })); setAuditLimit(50); }

  async function refreshOverview() {
    warningRevision.current++;setHealth(null);setReconciliation(null);
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
      while (result.page?.nextOffset != null && (advancedResponses || result.responses.length < wantedRows)) {
        setWeekData(result);
        const next = await request(`/api/dashboard?${params}&offset=${result.page.nextOffset}&revision=${result.page.revision}`);
        if (generation !== weekRequest.current) return false;
        if (next.resetRequired) throw new Error('Bản đối chiếu đã đổi hoặc hết hạn; hãy tải lại dữ liệu.');
        result = { ...result, page:next.page, responses:[...result.responses,...next.responses] };
      }
      result={...result,responseFilterScope:responseScope};
      setWeekData(result);
      setReloadChanges(manual?compareResponseVersions(verifiedBaseline.current,result):null);
      verifiedBaseline.current={week:result.week,responseVersions:result.responseVersions,responseVersionBinding:result.responseVersionBinding};
      clearTimeout(highlightTimer.current);
      const previousIds = new Set(keep ? previous.responseIds || [] : []);
      setHighlightIds(manual && keep ? (result.responseIds || []).filter(id => !previousIds.has(id)) : []);
      if (manual) highlightTimer.current = setTimeout(() => setHighlightIds([]), 8000);
      setWeekVerified(true); setCacheTime(Date.now());
      writeDashboardCache(overview.accountId, key, result);
      if(manual&&document.visibilityState==='visible')attention.updates(0,key);
      if(manual)setMessage('Đã tải lại dữ liệu của tuần đang chọn.','success');else setMessage('');
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
  }, [tab, weekKey, responseScope, auditFilters]);
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
        if (!stopped && generation === weekRequest.current && result.weekKey === weekKey) { const count=countNewResponseIds(result.responseIds, baseline);setNewResponses(count);if(count>0)attention.updates(count,weekKey);setPollError(''); }
      } catch { if (!stopped && generation === weekRequest.current) setPollError('Chưa kiểm tra được lượt mới; dùng “Tải lại dữ liệu” để thử lại.'); }
      finally { checking = false; }
    }
    const interval = window.setInterval(() => void check(), 60000);
    document.addEventListener('visibilitychange', check);
    return () => { stopped = true; window.clearInterval(interval); document.removeEventListener('visibilitychange', check); };
  }, [weekVerified, weekData, weekKey, busy, tab]);
  useEffect(()=>{warningRevision.current++;setHealth(null);setReconciliation(null);},[weekKey]);
  useEffect(() => { if (tab === 'health' && overview.role === 'owner') void checkHealth(); }, [tab, weekKey, overview.role]);
  useEffect(() => {
    if ((tab === 'create' && !permissions.create) || (['health','notice'].includes(tab) && overview.role !== 'owner')) setTab('overview');
  }, [tab, permissions.create, overview.role]);
  useEffect(() => {
    const time = Date.parse(selectedWeek?.lockAt || '');
    setDeadline(Number.isFinite(time) ? new Date(time + 7 * 3600000).toISOString().slice(0, 16) : '');
    setReconciliation(null);
    setHealth(null);
  }, [weekKey, selectedWeek?.lockAt]);
  useEffect(() => {if(!brandHasEdits(brandDraft,brandSaved)){setBrandDraft(branding);setBrandSaved(branding);}}, [branding]);

  async function controlForm(mode, reason) {
    if(!online){setMessage('Thiết bị đang báo ngoại tuyến; không gửi thao tác.');return;}
    if (overview.role !== 'owner' || !selectedWeek) return;
    const lockAt = mode === 'close' ? selectedWeek.lockAt : `${deadline}:00+07:00`;
    if (mode !== 'close' && deadlineIssue) { setFormAttempt(value=>value+1);setMessage(deadlineIssue); return; }
    const verb = mode === 'open' ? 'Mở lại' : mode === 'close' ? 'Đóng' : 'Đổi hạn đăng ký cho';
    if (reason === undefined) { const status=value=>value==='open'?'Đang mở':value==='closed'?'Đã đóng':'Chưa xác định';setConfirmation({ confirmLabel:mode==='open'?'Mở lại Form':mode==='close'?'Đóng Form':'Đổi hạn đăng ký', message: `${verb} Form ${selectedWeek.name}?${mode === 'close' ? ' Người dùng sẽ không gửi được lượt mới.' : ` Hạn mới: ${deadline.replace('T', ' ')} (giờ Việt Nam).`} Thao tác được ghi lịch sử.`,changes:reviewChanges({status:status(selectedWeek.formStatus),deadline:formatTime(Date.parse(selectedWeek.lockAt))},{status:status(mode==='open'?'open':mode==='close'?'closed':selectedWeek.formStatus),deadline:formatTime(Date.parse(lockAt))},{status:'Trạng thái Form',deadline:'Hạn đăng ký (giờ Việt Nam)'}), run: note => controlForm(mode, note) }); return; }
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
    const revision=warningRevision.current;
    setReconciling(true); setReconciliation(null); setMessage('Đang đối soát Form và Sheet…');
    try {
      const result = await request(`/api/dashboard?reconcile=1&week=${encodeURIComponent(weekKey)}`);
      if(generation!==weekRequest.current||revision!==warningRevision.current)return;
      setReconciliation({ ...result, weekKey,readAt:Date.now() });
      setMessage(result.issues.length ? `Đã đối soát: có ${result.issues.length} bản ghi cần kiểm tra. Không sửa hoặc xóa dữ liệu.` : 'Đã đối soát: Form và Sheet khớp duy nhất.', result.issues.length ? 'info' : 'success');
    } catch (error) { if(error.name!=='AbortError')setMessage(error.message); }
    finally { if(generation===weekRequest.current)setReconciling(false); }
  }

  async function saveBranding(event,proposal) {
    if(!online){event?.preventDefault?.();setMessage('Thiết bị đang báo ngoại tuyến; không gửi thao tác.');return;}
    event?.preventDefault();
    if (overview.role !== 'owner'||busy) return;
    if(!proposal&&brandErrors.length){setBrandAttempt(value=>value+1);return;}
    if(!proposal){const snapshot={draft:{...brandDraft},revision:brandSaved.updatedAt};setConfirmation({confirmLabel:'Lưu thương hiệu',message:'Áp dụng tên trường, logo và màu này cho toàn bộ web?',changes:reviewChanges(brandSaved,snapshot.draft,{schoolName:'Tên trường',logoUrl:'URL logo',primaryColor:'Màu chủ đạo'}),showReason:false,run:()=>saveBranding(null,snapshot)});return;}
    setBusy(true); setMessage('Đang lưu thương hiệu…');
    try {
      const result = await request('/api/dashboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'set-branding', branding: proposal.draft, expectedUpdatedAt: proposal.revision }) });
      if(typeof result?.schoolName!=='string'||typeof result.logoUrl!=='string'||brandFieldErrors(result).length||!Number.isFinite(result.updatedAt)||result.updatedAt<0)throw new Error('Chưa nhận được xác nhận lưu thương hiệu hợp lệ. Bản đang sửa được giữ; hãy kiểm tra trước khi thử lưu lại.');
      setBrandDraft(result);setBrandSaved(result);
      setBrandAttempt(0);
      window.dispatchEvent(new CustomEvent('meal-branding-changed', { detail: result }));
      setMessage('Đã cập nhật thương hiệu.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function checkHealth() {
    const ticket=reads.begin();
    const generation=++healthRequest.current;
    const revision=warningRevision.current;
    setHealthBusy(true);
    setHealth(null);
    try {
      const response = await fetch(`/api/dashboard?health=1&week=${encodeURIComponent(weekKey)}`, { credentials: 'same-origin', cache: 'no-store',signal:ticket.signal });
      const report = await response.json();
      if(!reads.current(ticket)||revision!==warningRevision.current||generation!==healthRequest.current)throw cancelledRead();
      if (response.status === 401 || response.status === 403) { onUnauthorized(errorMessage(report.error), response.status); return; }
      if (!Array.isArray(report.checks)) throw new Error('Không nhận được kết quả kiểm tra.');
      setHealth({...report,uiWeekKey:weekKey,readAt:Date.now()});
      if (!response.ok || report.checks.some(check => check.status === 'error')) setFailure(safeErrorReport('health', { status: response.status }));
    } catch (error) {
      if(error.name==='AbortError')return;
      if(revision!==warningRevision.current||generation!==healthRequest.current)return;
      setHealth({uiWeekKey:weekKey,readAt:Date.now(), checks: [{ id: 'network', label: 'Kết nối máy chủ', status: 'error', message: 'Không kết nối được để kiểm tra. Hãy thử lại khi có mạng.' }] });
      setFailure(safeErrorReport('health', error));
    } finally { if(reads.current(ticket)&&generation===healthRequest.current)setHealthBusy(false);reads.finish(ticket); }
  }

  function chooseImage(entry){setImage(entry.dataUrl);setFile({name:entry.name,type:entry.dataUrl.split(';')[0].slice(5)});}
  async function eraseDraft(){await draft.clear();setCreationState('idle');setImages([]);setImage('');setMenu(null);setFile(null);setAllowMissing(false);}
  async function clearDraft(){
    if(!window.confirm('Xóa nháp ảnh và món đang sửa trên thiết bị này?'))return;
    try{await eraseDraft();}catch(error){setMessage(error.message);}
  }
  function replaceImage(index,entry){
    const before=images[index];if(!before||busy||!draft.ready)return;
    const next={...entry,...(before.label!==undefined?{label:before.label}:{})};
    setImages(current=>current.map((value,i)=>i===index?next:value));if(image===before.dataUrl)chooseImage(next);
    if(menu)setSourceStale(true);setCreationState('idle');setMergeBase(null);setRegionBase(null);setAllowMissing(false);
  }
  async function removeImage(index){
    if(images.length===1){await clearDraft();return;}
    const next=images.filter((_image,i)=>i!==index);setImages(next);
    if(!next.some(entry=>entry.dataUrl===image))chooseImage(next[0]);
  }

  async function runOcr() {
    if(!online){setMessage('Thiết bị đang báo ngoại tuyến; không gửi thao tác.');return;}
    if (!image) { setMessage('Hãy chọn ảnh thực đơn trước.'); return; }
    setCreationState('idle');setBusy(true); setMessage('Đang đọc ảnh thực đơn…');
    try {
      if(images.length>1){
        const result=await request('/api/dashboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'ocr-images',images:images.map(entry=>entry.dataUrl)})});
        if(!Array.isArray(result.fragments)||result.fragments.length!==images.length||result.fragments.some((fragment,i)=>fragment.imageIndex!==i))throw new Error('Kết quả OCR không khớp các ảnh nguồn; nháp cũ được giữ.');
        buildImageMerge(result.fragments,menu);
        setMergeBase({images,menu,fragments:result.fragments});attention.completed();setMessage('OCR xong. Rà soát các nguồn và xung đột trước khi áp dụng.','info');return;
      }
      const result = await request('/api/dashboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ocr', image })
      });
      const days = (result.days || []).map(day => ({ ...day, meals: [...(day.meals || [])].slice(0, 3) }));
      const next={title:result.title||'Thực đơn bán trú',days};setMenu(next);setOriginalMenu(next);setDraftSource('');setSourceStale(false);
      setAllowMissing(false);if(days.length>0)attention.completed();
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
    if(!online){event?.preventDefault?.();setMessage('Thiết bị đang báo ngoại tuyến; không gửi thao tác.');return;}
    event.preventDefault();
    if (existingWeek) { setMessage('Tuần này đã có Form; dùng liên kết hiện có hoặc tải lại sổ tuần. Không ghi đè.', 'info'); return; }
    if (!validation.canCreate) {
      setOcrAttempt(value=>value+1);
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
      const createdKey=menuCalendarKey(payload),receipt={...result,weekKey:createdKey,weekFolderName:result.weekFolderName||`Tuần ${payload.days[0]?.date||''} - ${payload.days.at(-1)?.date||''}`};
      setCreatedWeek(receipt);setCreationState('done');
      if (result.alreadyExists) setMessage('Tuần này đã có Form. Mình đã lấy lại các liên kết hiện có.');
      else setMessage('Đã tạo Form, Spreadsheet và thư mục tuần.');
      try { await draft.clear(); } catch { setMessage('Tuần đã tạo nhưng chưa xóa được nháp trên thiết bị. Hãy xóa nháp thủ công.'); }
      setMenu(null); setImages([]); setImage(''); setFile(null); setAllowMissing(false);
      const next = await refreshOverview();
      const registered=next?.weeks?.find(week=>week.weekKey===createdKey);
      if(registered){setWeekKey(createdKey);setCreatedWeek({...registered,...receipt,registered:true});}
      setWeekData(null);
    } catch (error) { setCreationState('idle');setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function deleteResponse(response, reason) {
    if(!online){setMessage('Thiết bị đang báo ngoại tuyến; không gửi thao tác.');return;}
    const focusIndex=visibleResponses.findIndex(item=>item.responseId===response.responseId);
    const neighbor=visibleResponses[focusIndex+1]||visibleResponses[focusIndex-1];
    const time = formatTime(response.timestamp);
    if (!weekReady || !response.deletable || !response.deleteToken) return;
    const prompt = response.partial
      ? `Form đã xóa lượt của ${response.name} lúc ${time}, nhưng Sheet còn hàng dữ liệu. Xóa nốt hàng Sheet này?`
      : `Xóa lượt gửi của ${response.name} lúc ${time} khỏi Form và Sheet?`;
    if (reason === undefined) { setConfirmation({ message: prompt, confirmLabel:response.partial?'Xóa hàng Sheet còn sót':'Xóa lượt gửi này', run: note => deleteResponse(response, note) }); return; }
    clearDashboardCache(undefined, true); setWeekVerified(false);
    setPendingRow({ action: 'delete', id: response.responseId });
    setBusy(true);setMutationReceipt(null); setMessage('Đang xóa lượt gửi…');
    const receiptScope={operation:'delete',weekKey,recordId:response.responseId};
    try {
      const result=await request('/api/dashboard', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekKey, responseId: response.responseId, deleteToken: response.deleteToken, reason })
      });
      const receipt=normalizeMutationReceipt(result.receipt,receiptScope);setMutationReceipt(receipt||{...receiptScope,form:'unknown',sheet:'unknown',verified:false,checkedAt:0});
      followDeleteFocus.current={week:weekKey,removed:response.responseId,neighbor:neighbor?.responseId};
      await refreshOverview();
      await loadWeek(weekKey);
      setMessage(!receipt?.verified?'Máy chủ đã trả kết quả nhưng chưa xác minh hoàn tất cả Form và Sheet. Hãy kiểm tra kết quả từng nguồn.':response.partial
        ? `Đã hoàn tất xóa hàng Sheet còn sót của ${response.name}.`
        : `Đã xóa lượt gửi của ${response.name} khỏi Form và Sheet.`);
    } catch (error) { setMutationReceipt(normalizeMutationReceipt(error.receipt,receiptScope)||{...receiptScope,form:'unknown',sheet:'unknown',verified:false,checkedAt:0});await loadWeek(weekKey); setMessage(error.message); }
    finally { setBusy(false); setPendingRow(null); }
  }

  async function restoreResponse(event) {
    if(!online){event?.preventDefault?.();setMessage('Thiết bị đang báo ngoại tuyến; không gửi thao tác.');return;}
    if (!weekReady || !event.restorable || !event.entryId || restoreAttempts.has(event.entryId)) return;
    const originalTime = formatTime(event.originalTimestamp);
    if (!window.confirm(`Khôi phục lượt của ${event.name} (gửi gốc lúc ${originalTime})? Lượt sẽ được tạo mới trong Form, nên thời điểm gửi trong Form sẽ là thời điểm hiện tại.`)) return;
    clearDashboardCache(undefined, true); setWeekVerified(false);
    setPendingRow({ action: 'restore', id: event.entryId });
    setBusy(true);setMutationReceipt(null); setMessage('Đang khôi phục lượt gửi…');
    const receiptScope={operation:'restore',weekKey,recordId:event.entryId};
    try {
      const result=await request('/api/dashboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', weekKey, entryId: event.entryId })
      });
      const receipt=normalizeMutationReceipt(result.receipt,receiptScope);setMutationReceipt(receipt||{...receiptScope,form:'unknown',sheet:'unknown',verified:false,checkedAt:0});
      await refreshOverview();
      await loadWeek(weekKey);
      setMessage(receipt?.verified?`Đã khôi phục lượt của ${event.name}. Thời điểm gốc được giữ trong lịch sử.`:'Máy chủ đã trả kết quả nhưng chưa xác minh khôi phục đủ cả hai nguồn. Không bấm khôi phục lại; kiểm tra lịch sử/đối soát.');
    } catch (error) { setMutationReceipt(normalizeMutationReceipt(error.receipt,receiptScope)||{...receiptScope,form:'unknown',sheet:'unknown',verified:false,checkedAt:0});await loadWeek(weekKey); setMessage(error.message); }
    finally { setBusy(false); setPendingRow(null); }
  }

  async function changeAllowedEmail(action, address = email, memberPermissions) {
    if(!online){setMessage('Thiết bị đang báo ngoại tuyến; không gửi thao tác.');return;}
    const target = address.trim();
    if (!target) return;
    setBusy(true); setMessage('Đang cập nhật quyền…');
    try {
      const result = await request('/api/dashboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email: target, permissions: memberPermissions })
      });
      if(action==='set-permissions'){
        const matches=Array.isArray(result.members)?result.members.filter(member=>member.email===target):[];
        if(matches.length!==1||!Array.isArray(result.allowedEmails)||!result.allowedEmails.includes(target)||!['view','create','manageResponses'].every(key=>typeof memberPermissions?.[key]==='boolean'&&matches[0].permissions?.[key]===memberPermissions[key]))throw Error('Máy chủ chưa xác nhận quyền đã lưu. Bản nháp được giữ; kiểm tra lại dữ liệu quyền trước khi thử tiếp.');
      }
      setOverview(current => ({ ...current, allowedEmails: result.allowedEmails || [], members: result.members || [] }));
      if(action!=='add-email')setPermissionDrafts(current=>{const next={...current};delete next[target];return next;});
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
    return <DashboardWeekPicker weeks={overview.weeks || []} value={weekKey} disabled={busy || !online || healthBusy} onChange={selectWeek} />;
  }

  async function signOut(){
          if(!leaveDrafts())return;
          setSigningOut(true);
          weekRequest.current++; setWeekVerified(false); setWeekLoading(false); clearDashboardCache();
          try { await onSignOut(); }
          catch (error) { setMessage(errorMessage(error, 'Chưa đăng xuất được. Hãy thử lại.')); }
          finally { setSigningOut(false); }

  }
  useEffect(()=>{if(!online){setWeekVerified(false);warningRevision.current++;setHealth(null);setReconciliation(null);}},[online]);
  const missingScriptPermission = isAppsScriptPermissionError(message);
  return <DashboardLayout editorFocused={editorFocused} warnings={warnings} tab={tab} onNavigate={setTab} role={overview.role} permissions={permissions} email={overview.email} schoolName={branding.schoolName} busy={busy||signingOut} onSignOut={signOut}><main id="dashboard-content" className="dashboard-shell meal-ui" data-density={viewState.view.density}>
    <header className="dashboard-header">
      <div><h1>Dashboard quản trị</h1><p className="sub">Quản lý tuần thực đơn, tạo Form từ ảnh và xử lý lượt gửi.</p></div>
      <DisplayPreferencesSlot/>
    </header>
    <div className="dashboard-account" aria-label="Tài khoản đang đăng nhập"><strong>{overview.email || 'Đang xác minh Gmail…'}</strong><span>{accountRoleLabel({ ...overview, permissions })}</span><small>{permissions.create ? 'OCR/tạo tuần' : 'Không tạo tuần'} · {permissions.manageResponses ? 'Xóa/khôi phục' : 'Không xóa lượt gửi'}</small></div>
    <ConnectionNotice online={online} savedAt={cacheTime} hasData={Boolean(displayedWeek)}/>
    <div className="dashboard-assist-tools"><ContextGuide tab={tab} disabled={busy||Boolean(confirmation)||Boolean(regionBase)||Boolean(mergeBase)}/><SessionFeedback entries={sessionEvents} onClear={()=>setSessionEvents([])}/></div>
    <VersionNotice disabled={busy || !online || signingOut || Boolean(regionBase) || Boolean(mergeBase) || Boolean(confirmation)} beforeReload={async()=>{if(!leaveDrafts())return false;viewState.save();await draft.flush();}} />
    {message && <div className={`dashboard-message ${missingScriptPermission || /không|lỗi|chưa/i.test(message) ? 'error' : ''}`} role={missingScriptPermission?'alert':'status'} aria-live="polite">{missingScriptPermission&&<strong>Thiếu quyền Apps Script. </strong>}{message}{missingScriptPermission&&(overview.role==='owner'?<button className="secondary" type="button" disabled={busy||!online} onClick={()=>void authorizeScript()}>Cấp quyền Apps Script</button>:<span> Liên hệ chủ sở hữu để cấp quyền.</span>)}{authorizationUrl && <> <ExternalLink className="action-link" href={authorizationUrl}>Mở trang cấp quyền Google</ExternalLink></>}</div>}

    <ErrorReportButton report={failure || draft.failure} />
    {readPending>0&&<div className="read-wait">{!busy&&<ElapsedWait active label={reconciling?'Đang đối soát':healthBusy?'Đang kiểm tra hệ thống':weekLoading?'Đang tải lượt gửi':'Đang chờ dữ liệu'} requestKey={JSON.stringify([tab,weekKey,query,responseSort,auditFilters])}/>}<button type="button" className="secondary" disabled={busy||!online} onClick={stopWaiting}>Dừng chờ dữ liệu</button><small>Chỉ dừng chờ trên trình duyệt; không hủy thao tác máy chủ.</small></div>}
    <ElapsedWait active={busy} label={creationState==='creating'?'Đang tạo Form và Sheet':pendingRow?.action==='delete'?'Đang xóa lượt gửi':pendingRow?.action==='restore'?'Đang khôi phục lượt gửi':'Đang xử lý yêu cầu'} requestKey={`${weekKey}:${creationState}:${pendingRow?.id||''}`}/>
    {tab==='notice'&&overview.role==='owner'&&<section className="dashboard-panel"><h2>Thông báo tuần</h2>{weekPicker()}<WeekNoticeEditor key={weekKey} ref={noticeEditor} onDirtyChange={setNoticeDirty} weekKey={weekKey} weekName={selectedWeek?.name} request={request} busy={busy||!online} onBusy={setBusy} onMessage={setMessage}/></section>}
    {tab === 'overview' && (readPending>0 && overview.overviewPending && !overview.weeks?.length ? <ContentSkeleton label="Đang tải sổ tuần…"/> : <DashboardOverview attention={warnings} attentionWeek={selectedWeek?.name||'Chưa chọn tuần'} attentionLoaded={Boolean(health?.uiWeekKey===weekKey||reconciliation?.weekKey===weekKey)} onAttention={id=>navigate(id,weekKey)} weeks={overview.weeks||[]} busy={busy} owner={overview.role==='owner'} onRefresh={()=>void refreshOverview()} onView={key=>navigate('delete',key)} onControl={key=>navigate('form',key)}/>)}

    {tab === 'health' && overview.role === 'owner' && <><section className="dashboard-panel system-authorization"><h2>Cấp quyền Apps Script</h2><p>Cấp các quyền Google mà script hiện yêu cầu để đọc ảnh, tạo và quản lý Form/Sheet. Chỉ chủ sở hữu thực hiện bước này.</p><button className="secondary" type="button" disabled={busy||!online} onClick={()=>void authorizeScript()}>Cấp quyền Apps Script</button></section><section className="dashboard-panel">
      <div className="dashboard-section-title"><h2>Kiểm tra hệ thống</h2>{weekPicker()}</div>
      <p>Kiểm tra quyền Google, thư mục, Sheet, Form, cấu hình OCR và lịch tự khóa.</p>
      <ExplainedButton label="Kiểm tra lại" className="secondary" type="button" disabled={healthBusy} reason="Đang kiểm tra hệ thống; hãy chờ kết quả hoặc dừng chờ dữ liệu." aria-busy={healthBusy} onClick={() => void checkHealth()}>{healthBusy ? 'Đang kiểm tra…' : 'Kiểm tra lại'}</ExplainedButton>
      {health?.checkedAt && <p>Đã kiểm tra lúc {formatTime(health.checkedAt)}</p>}
      <SystemReport report={health?.uiWeekKey===weekKey?health:null} busy={healthBusy}/>
    </section><DeviceData account={overview.accountId} disabled={busy||!draft.ready} onClearDraft={eraseDraft} onClearCache={()=>{weekRequest.current++;setWeekData(null);setCacheTime(0);setWeekVerified(false);verifiedBaseline.current=null;setReloadChanges(null);}}/><section className="dashboard-panel"><details className="system-details"><summary>Hướng dẫn cài đặt (7 bước)</summary><SetupInstructions /></details></section></>}

    {tab === 'create' && permissions.create && <section className="dashboard-panel">
      <div className="field-label-row"><h2>Tạo tuần từ ảnh thực đơn</h2><div className="ocr-header-tools"><AppAttentionControls attention={attention}/><FieldHelp label="OCR">OCR đọc chữ và món từ ảnh. Kết quả có thể sai; hãy đối chiếu ảnh, sửa ngày và món trước khi bấm Tạo Form và Sheet. Đọc ảnh không tự tạo tuần.</FieldHelp></div></div>
      <div className="editor-focus-tools"><button type="button" className="secondary" aria-pressed={editorFocused} onClick={toggleEditorFocus}>{editorFocused?'Thoát chế độ tập trung':'Tập trung sửa thực đơn'}</button>{editorFocused&&<span>Chỉ thu gọn giao diện; nháp và lịch sử sửa được giữ.</span>}</div>
      <OcrProgress menu={menu} state={creationState}/>
      <CreationReceipt week={createdWeek} onResponses={key=>navigate('delete',key)} onNew={()=>{setCreatedWeek(null);setCreationState('idle');document.querySelector('.image-upload-target')?.focus();}}/>
      <div className="draft-toolbar"><p role="status">{draft.status || 'Nháp lưu riêng trên thiết bị này, không đồng bộ giữa các máy.'}</p><ExplainedButton type="button" className="secondary" disabled={busy || !online || !draft.ready} reason={busy?'Đang xử lý yêu cầu; không xóa nháp trong lúc này.':'Chưa đọc xong nháp trên thiết bị; hãy chờ.'} onClick={()=>void clearDraft()}>Xóa nháp</ExplainedButton></div>
      {sourceStale&&<p className="dashboard-warning" role="status" aria-label="Nguồn ảnh đã thay đổi">Nguồn ảnh đã thay đổi. Kết quả OCR và bản sửa hiện tại chưa phản ánh ảnh mới. Nháp và Undo được giữ; chỉ bấm Đọc thực đơn khi muốn đọc lại.</p>}
      <DraftTransfer menu={menu} disabled={busy||!online||!draft.ready||Boolean(mergeBase)||Boolean(regionBase)} onApply={(next,before,kind)=>{if(busy||!online||!draft.ready||before!==menu)throw Error('Nháp đã thay đổi hoặc chưa thể sửa; hãy xem trước lại.');dispatchMenu({type:'apply',value:next});if(!menu)setOriginalMenu(next);if(!image)setDraftSource('table');setAllowMissing(false);setCreationState('idle');setMessage(kind==='table'?'Đã áp dụng bảng vào nháp. Chưa tạo Form/Sheet.':'Đã sao chép món trong nháp. Có thể hoàn tác.','success');}}/>
      {menu&&<DraftInspection menu={menu} original={originalMenu} onJump={jumpToReview} disabled={busy||!online}/>}
      <ImageInput onReplace={replaceImage} onLabel={(index,label)=>{if(!busy&&draft.ready&&!mergeBase&&!regionBase)setImages(current=>current.map((entry,i)=>i===index?{...entry,label}:entry));}} onReorder={next=>{if(!busy&&draft.ready&&!imageOrderBlocked)setImages(next);}} reorderBlocked={imageOrderBlocked} images={images} activeImage={image} disabled={busy||!draft.ready} onBusy={setBusy} onMessage={setMessage} onChoose={chooseImage} onRemove={removeImage} onImages={(next,append)=>{setCreationState('idle');setImages(next);chooseImage(next[0]);if(!append){setMenu(null);setAllowMissing(false);}setMergeBase(null);}}/>
      {image && file?.name && !file.type && <p className="menu-image-hint">Ảnh đã khôi phục: {file.name}. Không cần chọn lại để tiếp tục OCR hoặc sửa món.</p>}
      <ExplainedButton label="Đọc thực đơn" className={menu?'secondary':''} disabled={busy || !online || !image} reason={busy?'Đang xử lý yêu cầu khác; hãy chờ hoàn tất.':'Chọn ảnh thực đơn trước khi đọc OCR.'} onClick={() => void runOcr()}>{busy ? 'Đang xử lý…' : 'Đọc thực đơn'}</ExplainedButton>
      {(menu||menuHistory.past.length>0||menuHistory.future.length>0)&&<div className="menu-history-tools"><ExplainedButton type="button" className="secondary" disabled={busy || !online || !menuHistory.past.length} reason={busy?'Đang xử lý yêu cầu.':'Chưa có bước sửa trước đó để hoàn tác trong lần mở này.'} onClick={() => moveMenuHistory('undo')}>Hoàn tác</ExplainedButton><ExplainedButton type="button" className="secondary" disabled={busy || !online || !menuHistory.future.length} reason={busy?'Đang xử lý yêu cầu.':'Chưa có bước đã hoàn tác để làm lại.'} onClick={() => moveMenuHistory('redo')}>Làm lại</ExplainedButton><small>Ctrl/⌘ Z · Ctrl/⌘ Shift Z. Lịch sử sửa chỉ giữ trong lần mở này.</small></div>}
      {(image||menu) && <OcrWorkspace ref={ocrWorkspace} hasMenu={Boolean(menu)} source={image?<MenuImagePreview src={image} name={file?.name} regionDisabled={busy || !menu} onRegion={menu ? () => setRegionBase({image,menu}) : undefined} />:<p>Bản nháp nhập từ bảng; không có ảnh nguồn.</p>}>
      {menu && <form className="menu-review" onSubmit={createWeek} onBlur={() => dispatchMenu({ type: 'commit' })} onKeyDown={event => {
        if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'z' && !busy) { event.preventDefault(); moveMenuHistory(event.shiftKey ? 'redo' : 'undo'); }
      }}>
        <fieldset className="draft-edit-fields" disabled={busy||!online}>
        <OcrFindBar query={ocrQuery} onQuery={queryOcr} matches={ocrMatches} index={ocrIndex} disabled={busy||!online} onMove={moveOcrMatch}/>
        <label>Tiêu đề tuần (không bắt buộc)<input id="ocr-title" aria-label="Tiêu đề tuần" enterKeyHint="next" className={ocrFieldClass('ocr-title')} value={menu.title || ''} maxLength={500} disabled={busy||!online} onChange={event => dispatchMenu({ type: 'edit', group: 'title', value: current => ({ ...current, title: event.target.value }) })} /></label>
        <label>Chọn thứ Hai<input id="ocr-monday" aria-label="Chọn thứ Hai" type="date" value={/^\d{2}\/\d{2}\/\d{4}$/.test(menu.days?.[0]?.date || '') ? menu.days[0].date.split('/').reverse().join('-') : ''} disabled={busy||!online} onChange={event => chooseMonday(event.target.value)} /><small>Tự điền 5 ngày, giữ món/ngày nghỉ. Hoàn tác khôi phục cả tuần.</small></label>
        {existingWeek && <div className="existing-week-warning" role="status"><strong>Tuần này đã có Form — không tạo hoặc ghi đè tuần mới.</strong><div className="dashboard-links">{existingFormUrl && <ExternalLink href={existingFormUrl}>Mở Form</ExternalLink>}{existingSheetUrl && <ExternalLink href={existingSheetUrl}>Mở Sheet</ExternalLink>}<button type="button" className="secondary" disabled={busy||!online} onClick={() => void refreshOverview()}>Tải lại sổ tuần</button></div></div>}
        <h3>Rà soát 5 ngày</h3>
        {reviewLinks.length>0&&<div className="ocr-issue-list" role="region" aria-label="Cần đối chiếu OCR"><FormErrorSummary label="Lỗi cần sửa trước khi tạo tuần" errors={reviewLinks} attempt={ocrAttempt} onJump={jumpToReview}/></div>}
        {menu.days.map((day, dayIndex) => {
          const issue = validation.dayIssues[dayIndex];
          const status = issue.dateError || issue.mealError ? 'error' : issue.missingMealSlots.length ? 'warning' : 'ok';
          const dateNote = `menu-date-note-${dayIndex}`;
          return <OcrReviewDay day={day} issue={issue} allowMissing={allowMissing} busy={busy} status={status} key={`${reviewEpoch}-${dayIndex}`} legend={<>{day.day || `Thứ ${dayIndex + 2}`} {status !== 'ok' && <span className="menu-review-badge">{status === 'error' ? 'Cần sửa' : `Thiếu ${issue.missingMealSlots.length} món`}</span>}</>}>
            <label>Ngày<input id={`ocr-date-${dayIndex}`} aria-label="Ngày" enterKeyHint="next" className={ocrFieldClass(`ocr-date-${dayIndex}`)} value={day.date || ''} maxLength={40} placeholder="dd/mm/yyyy" aria-invalid={Boolean(issue.dateError)} aria-describedby={`${dateNote}-hint${issue.dateError?' '+dateNote:''}`} onChange={event => editDay(dayIndex, 'date', event.target.value)} /><small id={dateNote+'-hint'}>Ngày/tháng/năm, ví dụ 19/10/2026. Đối chiếu đúng thứ trên ảnh.</small></label>
            {issue.dateError && <p id={dateNote} className="menu-inline-error">{issue.dateError}</p>}
            <label className="menu-closed-toggle"><input id={`ocr-closed-${dayIndex}`} type="checkbox" checked={day.closed === true} onChange={event => editDay(dayIndex, 'closed', event.target.checked)} />Không phục vụ ngày này</label>
            {day.closed === true ? <p className="menu-closed-note">Ngày nghỉ — không tạo câu hỏi chọn món. Món đã nhập vẫn giữ để bỏ đánh dấu hoặc hoàn tác.</p> : <DraftMealSlots day={day} dayIndex={dayIndex} disabled={busy||!online} onMove={(from,to)=>{dispatchMenu({type:'edit',value:current=>moveDraftMeal(current,dayIndex,from,to)});setAllowMissing(false);}}>{MEAL_SLOTS.map(slot => {
              const missing = issue.missingMealSlots.includes(slot);
              const id=`ocr-meal-${dayIndex}-${slot}`,feedback=reviewLinks.find(link=>link.id===id);
              return <label key={slot}>Món {slot + 1}<input id={id} aria-label={'Món '+(slot+1)} enterKeyHint="next" value={day.meals?.[slot] || ''} maxLength={500} className={ocrFieldClass(id,missing ? 'menu-meal-missing' : '')} placeholder={missing ? 'Đối chiếu món này với ảnh' : ''} aria-invalid={Boolean(feedback?.blocking)} aria-describedby={feedback?id+'-error':undefined} onChange={event => editDay(dayIndex, 'meal', event.target.value, slot)} />{feedback&&<small id={id+'-error'} className={feedback.blocking?'menu-inline-error':'menu-inline-warning'}>{feedback.message}</small>}</label>;
            })}</DraftMealSlots>}
          </OcrReviewDay>;
        })}
        {validation.dateError && <p className="dashboard-warning" role="alert">{validation.dateError}</p>}
        {validation.servingError && <p className="dashboard-warning" role="alert">{validation.servingError}</p>}
        {validation.invalidMealDays.length > 0 && <p className="dashboard-warning" role="alert">Mỗi ngày cần ít nhất 2 món và tối đa 3 món: {validation.invalidMealDays.join(', ')}.</p>}
        {validation.missingMealDays.length > 0 && <label className="dashboard-confirm-missing"><input type="checkbox" checked={allowMissing} disabled={busy||!online} onChange={event => setAllowMissing(event.target.checked)} /> Tôi xác nhận các ngày sau có ít hơn 3 món: {validation.missingMealDays.join(', ')}</label>}
        <ExplainedButton type="submit" disabled={busy || !online || Boolean(existingWeek)} reason={busy?'Đang xử lý yêu cầu; chưa thể tạo thêm.':existingWeek?'Tuần này đã có Form và Sheet. Mở liên kết hiện có hoặc sửa ngày; không tạo trùng.':validation.dateError||validation.servingError||(validation.invalidMealDays.length?'Sửa các ngày chưa đủ 2 món hoặc vượt quá 3 món.':'Đối chiếu và xác nhận các ngày có ít hơn 3 món ở cuối bảng.')}>Tạo Form và Sheet</ExplainedButton>
        </fieldset>
      </form>}
      </OcrWorkspace>}
    </section>}

    {tab === 'delete' && <section className="dashboard-panel">
      {mutationReceipt?.weekKey===weekKey&&<MutationReceipt receipt={mutationReceipt}/>}
      <TableWorkspace label="Bảng lượt gửi" expandLabel="Phóng rộng bảng lượt gửi" preferenceKey="dashboard-responses" context={{week:selectedWeek?.name||'Chưa chọn tuần',filters:appliedResponseConditions.map(item=>`${item.label}: ${item.value}`).join(' · ')||'Không có bộ lọc',sort:responseSort==='name'?'Tên A–Z':responseSort==='oldest'?'Cũ nhất':'Mới nhất'}} headers={['Thời điểm','Họ tên','Món đã chọn','Thao tác']} requiredColumns={[1,3]}>
      <div className="dashboard-section-title"><h2>Lượt gửi và lịch sử thao tác</h2></div>
      <WeekNotice notice={displayedWeek?.week?.weekNotice} serverNow={displayedWeek?.week?.serverNow}/>
<div className="dashboard-sticky-tools" ref={viewState.toolbarRef}>{weekPicker()}<div className="dashboard-refresh-bar"><ExplainedButton label="Tải lại dữ liệu" className="secondary" disabled={busy || !online || weekLoading || !weekKey} reason={busy?'Đang xử lý thao tác; hãy chờ hoàn tất.':weekLoading?'Đang tải lượt gửi; hãy chờ hoặc dừng chờ dữ liệu.':'Chọn một tuần đã đăng ký để tải lượt gửi.'} aria-busy={weekLoading} onClick={() => void loadWeek(weekKey, true)}>{weekLoading ? 'Đang tải lại…' : 'Tải lại dữ liệu'}</ExplainedButton>{newResponses > 0 && <span className="dashboard-new-badge" role="status">Có {newResponses} lượt gửi mới</span>}</div><label className="dashboard-search">Tìm theo họ tên<SearchInput id="dashboard-name-search" label="Tìm theo họ tên" maxLength={200} value={query} onClear={()=>setQuery('')} onChange={event => setQuery(event.target.value)} placeholder="Nhập tên cần tìm" /></label></div>
      <SubmissionFilters value={viewState.view} onChange={changeResponseFilters}/>
      {displayedWeek&&<p className="dashboard-filter-result" role="status" aria-live="polite" aria-atomic="true" aria-label="Kết quả lọc lượt gửi">Còn {advancedResponses&&weekReady?matchingResponses.length:visibleResponses.length} lượt gửi {advancedResponses&&weekReady?'phù hợp trong toàn bộ kết quả tìm tên':'trong phần đã tải'}.{!weekReady&&' Bản đang xem chưa được xác minh.'}</p>}
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
      {weekLoading && !displayedWeek ? <ContentSkeleton label="Đang tải lượt gửi…" kind="table"/> : <TableScroll className="dashboard-response-list" ref={viewState.listRef} data-week-key={weekKey}><table className="dashboard-table dashboard-response-table" role="table"><thead><WorkspaceRow>{['Thời điểm','Họ tên','Món đã chọn','Thao tác'].map((label,index)=><th key={label}>{label}<ColumnResizeHandle index={index} label={label}/></th>)}</WorkspaceRow></thead><tbody>
        {visibleResponses.length ? visibleResponses.map(response => <WorkspaceRow key={response.responseId || response.rowNumber || `${response.timestamp}-${response.name}`} data-response-id={response.responseId} className={highlightIds.includes(response.responseId) ? 'new-response' : ''}>
          <td data-label="Thời điểm"><FriendlyTime value={response.timestamp}/></td><td data-label="Họ tên"><strong><SearchHighlight text={response.name} query={query}/></strong>{highlightIds.includes(response.responseId) && <span className="new-response-label">Mới</span>}{response.partial && <strong className="dashboard-partial"> · Form đã xóa, Sheet còn hàng</strong>}</td><td data-label="Món đã chọn"><ResponseMeals response={response} week={displayedWeek?.week} /></td>
          <td data-label="Thao tác"><div className="dashboard-row-actions"><button type="button" className="secondary" onClick={() => setQuickResponse(response)}>Xem nhanh</button><RowActionMenu label="Thao tác lượt gửi"><div role="group" aria-label="Kiểm tra lượt gửi"><SheetRowButton key={`${weekKey}-${weekRequest.current}-${response.responseId}`} weekKey={weekKey} source={response.partial ? 'sheet' : 'form'} response={response} request={request} disabled={busy || !online || !weekReady} /></div><div className="row-menu-danger" role="group" aria-label="Thao tác xóa">{permissions.manageResponses && (response.deletable || !weekReady) ? <ExplainedButton label="Xóa lượt này" type="button" data-close-row-menu className="danger" disabled={busy || !online || !weekReady} reason={busy?'Đang xử lý một thao tác; chưa thể xóa tiếp.':'Dữ liệu hiện tại chưa được xác minh; hãy tải lại dữ liệu trước khi xóa.'} aria-busy={pendingRow?.action === 'delete' && pendingRow.id === response.responseId} onClick={() => void deleteResponse(response)}>{pendingRow?.action === 'delete' && pendingRow.id === response.responseId ? 'Đang xóa…' : response.partial ? 'Xóa nốt hàng Sheet' : 'Xóa lượt này'}</ExplainedButton> : <span title={response.note}>{!permissions.manageResponses ? 'Chỉ xem' : response.partial ? 'Cần kiểm tra thủ công' : 'Không đối chiếu được'}</span>}</div></RowActionMenu></div></td>
        </WorkspaceRow>) : <tr><td className="empty" colSpan="4">{!displayedWeek?'Chưa có dữ liệu đã xác minh. Hãy tải lại dữ liệu.':weekLoading?'Đang đọc kết quả lọc…':<FilterEmptyState title={responseConditions.length?'Không có kết quả phù hợp':'Tuần đang xem chưa có lượt gửi'} conditions={responseConditions} recoveries={displayedWeek.page?[]:responseConditions.map(condition=>{const patch=responseFilterPatch(condition.key);return {key:condition.key,count:filterSubmissions(displayedWeek.responses,patch.query??query,{...viewState.view,...patch}).length};})} onClear={key=>{changeResponseFilters(responseFilterPatch(key));document.getElementById('dashboard-name-search')?.focus();}}/>}</td></tr>}
      </tbody></table></TableScroll>}
      {advancedResponses&&<p className="dashboard-hint">Bộ lọc này cần đọc đủ các đợt kết quả tìm tên trong cùng bản đối chiếu. Nếu dừng chờ hoặc chưa tải đủ, số đang thấy chỉ thuộc phần đã tải.</p>}
      {advancedResponses&&weekReady&&matchingResponses.length>advancedLimit&&<button type="button" className="secondary" onClick={()=>setAdvancedLimit(value=>value+50)}>Hiện thêm lượt phù hợp</button>}
      {displayedWeek?.page && <div className="dashboard-batch-tools"><p role="status">Đã tải {displayedWeek.responses.length} / {displayedWeek.page.matchedCount} kết quả tìm tên{advancedResponses&&weekReady?` · Hiện ${visibleResponses.length} / ${matchingResponses.length} lượt phù hợp bộ lọc`:''} · tổng {displayedWeek.page.total} lượt. Bản đối chiếu lúc {formatTime(displayedWeek.page.snapshotAt)}.</p>{displayedWeek.page.nextOffset != null && <ExplainedButton label="Tải thêm lượt gửi" type="button" className="secondary" disabled={!weekReady || busy || weekLoading || moreLoading} reason={busy?'Đang xử lý thao tác.':weekLoading||moreLoading?'Đang đọc lượt gửi.':'Bản đang xem chưa được xác minh; hãy tải lại dữ liệu trước.'} onClick={() => void loadMoreResponses()}>{moreLoading ? 'Đang tải thêm…' : 'Tải thêm lượt gửi'}</ExplainedButton>}</div>}
      </TableWorkspace>
      <TableWorkspace label="Bảng lịch sử thao tác" expandLabel="Phóng rộng bảng lịch sử" preferenceKey="dashboard-history" context={{week:selectedWeek?.name||'Chưa chọn tuần',filters:filterConditions({...auditFilters,action:auditFilters.action?historyActionLabel(auditFilters.action):''},{actor:'Người quản trị',action:'Loại thao tác',from:'Từ ngày',to:'Đến ngày',note:'Tìm ghi chú',errorsOnly:'Chỉ lỗi/chưa hoàn tất'}).map(item=>`${item.label}: ${item.value}`).join(' · ')||'Không có bộ lọc lịch sử'}} headers={['Thao tác','Thời gian','Người thực hiện','Đối tượng','Thao tác bản ghi']} requiredColumns={[0,3,4]}>
      <div className="dashboard-section-title dashboard-history-title"><h2>Lịch sử thao tác</h2><span>{displayedWeek?.historyPage ? `${filteredHistory.length} / ${displayedWeek.historyPage.matchedCount} phù hợp · tổng ${displayedWeek.historyPage.total}` : `${filteredHistory.length} / ${displayedWeek?.history?.length || 0}`} sự kiện</span></div>
      <p>Lịch sử lưu tên, món đã chọn, thời điểm và Gmail quản trị; không lưu email người trả lời.</p>
      <div className="audit-filters" aria-label="Bộ lọc lịch sử"><label>Người quản trị<SearchInput label="Người quản trị" maxLength={254} value={auditFilters.actor || ''} onClear={()=>filterHistory('actor','')} onChange={event => filterHistory('actor',event.target.value)} placeholder="Tìm Gmail quản trị" /></label><label>Loại thao tác<select aria-label="Loại thao tác" value={auditFilters.action || ''} onChange={event => filterHistory('action',event.target.value)}><option value="">Tất cả thao tác</option>{(displayedWeek?.historyPage?.actions || [...new Set((displayedWeek?.history || []).map(event => event.action))]).map(action => <option key={action} value={action}>{historyActionLabel(action)}</option>)}</select></label><label>Từ ngày<input type="date" value={auditFilters.from || ''} onChange={event => filterHistory('from',event.target.value)} /></label><label>Đến ngày<input type="date" value={auditFilters.to || ''} onChange={event => filterHistory('to',event.target.value)} /></label><label>Tìm ghi chú<SearchInput label="Tìm ghi chú" maxLength={200} value={auditFilters.note || ''} onClear={()=>filterHistory('note','')} onChange={event => filterHistory('note',event.target.value)} /></label><label className="audit-error-toggle"><input type="checkbox" checked={auditFilters.errorsOnly || false} onChange={event => filterHistory('errorsOnly',event.target.checked)} />Chỉ lỗi/chưa hoàn tất</label><button type="button" className="secondary" onClick={() => { setAuditFilters({}); setAuditLimit(50); }}>Xóa bộ lọc lịch sử</button></div>
      {auditFilters.from && auditFilters.to && auditFilters.from > auditFilters.to && <p className="dashboard-warning" role="alert">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.</p>}
      {filteredHistory.length ? <TableScroll><table className="dashboard-table dashboard-history-table"><thead><WorkspaceRow>{['Thao tác','Thời gian','Người thực hiện','Đối tượng','Thao tác bản ghi'].map((label,index)=><th key={label}>{index<4?label:''}<ColumnResizeHandle index={index} label={label}/></th>)}</WorkspaceRow></thead><tbody>
        {auditGroups.map(group=><Fragment key={group.key}><tr className="audit-day-heading"><TableSpanCell><button type="button" className="secondary" aria-expanded={!foldedDays.includes(group.key)} onClick={()=>toggleAuditDay(group.key)}>{group.label} · {group.events.length} sự kiện đã tải{group.attention>0&&<strong> · {group.attention} cần kiểm tra</strong>}</button></TableSpanCell></tr>{!foldedDays.includes(group.key)&&group.events.map(event => {
          const alreadyRestored = restoreAttempts.has(event.entryId);
          const restoreEligible = event.action === 'deleted' && event.restorable && !alreadyRestored;
          const canRestore = weekReady && permissions.manageResponses && restoreEligible && displayedWeek?.week?.formStatus === 'open';
          return <WorkspaceRow key={event.id} data-audit-event>
            <td><button type="button" className="audit-filter-shortcut dashboard-history-action" aria-label={'Lọc lịch sử theo '+historyActionLabel(event.action)} onClick={()=>filterHistory('action',event.action)}>{historyActionLabel(event.action)}</button>{describeHistoryNote(event.note).map((line, index) => <small key={index} className="dashboard-history-note"><SearchHighlight text={line} query={auditFilters.note}/></small>)}</td>
            <td data-label="Thời gian">{group.key==='unknown'?'Chưa có thời điểm':formatTime(event.at)}{event.originalTimestamp > 0 && <small className="dashboard-history-note">Gửi gốc: {formatTime(event.originalTimestamp)}</small>}</td>
            <td data-label="Người thực hiện">{event.actor?<button type="button" className="audit-filter-shortcut" aria-label={'Lọc lịch sử theo '+event.actor} onClick={()=>filterHistory('actor',event.actor)}><SearchHighlight text={event.actor} query={auditFilters.actor}/></button>:'—'}</td>
            <td data-label="Đối tượng"><strong>{event.name || '—'}</strong><small className="dashboard-history-note">{(event.meals || []).join(' · ')}</small></td>
            <td>{canRestore ? <RowActionMenu label="Thao tác lịch sử"><ExplainedButton label="Khôi phục" type="button" data-close-row-menu className="secondary" disabled={busy||!online} reason="Đang xử lý thao tác; hãy chờ kết quả trước khi khôi phục tiếp." aria-busy={pendingRow?.action === 'restore' && pendingRow.id === event.entryId} onClick={() => void restoreResponse(event)}>{pendingRow?.action === 'restore' && pendingRow.id === event.entryId ? 'Đang khôi phục…' : 'Khôi phục'}</ExplainedButton></RowActionMenu> : restoreEligible && weekData?.week?.formStatus === 'closed' ? <span title="Không tự mở Form vì thao tác đó sẽ công khai Form">Form đã đóng</span> : restoreEligible ? <span>Chưa xác định Form</span> : alreadyRestored && event.action === 'deleted' ? <span>Đã xử lý</span> : null}</td>
          </WorkspaceRow>;
        })}</Fragment>)}
      </tbody></table></TableScroll> : !displayedWeek||auditTotal==null?<p>Chưa có dữ liệu lịch sử. Hãy tải lại dữ liệu.</p>:weekLoading?<p>Đang đọc kết quả lọc lịch sử…</p>:<FilterEmptyState title={auditConditions.length||auditTotal>0?'Không có thao tác phù hợp':'Chưa có thao tác nào trong tuần này'} conditions={auditConditions} recoveries={displayedWeek.historyPage?[]:auditConditions.map(condition=>({key:condition.key,count:filterAuditHistory(displayedWeek.history,{...auditFilters,[condition.key]:condition.key==='errorsOnly'?false:''}).length,unit:'sự kiện'}))} onClear={key=>{filterHistory(key,key==='errorsOnly'?false:'');document.querySelector('.audit-filters input')?.focus();}}/>}
      {displayedWeek?.historyPage?.nextOffset!=null ? <ExplainedButton label="Tải thêm lịch sử" type="button" className="secondary" disabled={!weekReady||weekLoading||busy||historyLoading} reason={busy?'Đang xử lý thao tác.':weekLoading||historyLoading?'Đang đọc dữ liệu lịch sử.':'Bản đang xem chưa được xác minh; hãy tải lại dữ liệu trước.'} onClick={()=>void loadMoreHistory()}>{historyLoading?'Đang tải lịch sử…':'Tải thêm lịch sử'}</ExplainedButton> : filteredHistory.length > auditLimit && <button type="button" className="secondary" onClick={() => setAuditLimit(value => value + 50)}>Tải thêm lịch sử</button>}
      </TableWorkspace>
    </section>}

    {tab === 'form' && overview.role === 'owner' && <section className="dashboard-panel">
      <div className="dashboard-section-title"><h2>Trạng thái và hạn đăng ký</h2>{weekPicker()}</div>
      {formAttempt>0&&deadlineIssue&&<FormErrorSummary label="Lỗi cần sửa trước khi đổi hạn Form" attempt={formAttempt} errors={[{id:'dashboard-deadline',label:'Hạn mới — giờ Việt Nam',message:deadlineIssue}]}/>}
      {selectedWeek ? <><p>Form: <strong>{selectedWeek.formStatus === 'open' ? 'Đang mở' : selectedWeek.formStatus === 'closed' ? 'Đã đóng' : 'Chưa xác định'}</strong></p><RegistrationDeadline lockAt={selectedWeek.lockAt} status={selectedWeek.formStatus} serverNow={overview.serverNow}/><div className="dashboard-deadline"><div className="field-label-row"><label htmlFor="dashboard-deadline">Hạn mới — giờ Việt Nam</label><FieldHelp label="Hạn đăng ký">Đây là thời điểm Form tự đóng, theo giờ Việt Nam. Nhập một hạn tương lai rồi xác nhận Lưu hạn đăng ký; đổi ô nhập hoặc mở trợ giúp không tự đổi Form. Mở lại Form quá hạn cũng cần hạn tương lai.</FieldHelp></div><input id="dashboard-deadline" type="datetime-local" enterKeyHint="done" aria-invalid={formAttempt>0&&Boolean(deadlineIssue)} aria-describedby={'dashboard-deadline-hint'+(formAttempt>0&&deadlineIssue?' dashboard-deadline-error':'')} value={deadline} disabled={busy||!online} onChange={event => setDeadline(event.target.value)} /><small id="dashboard-deadline-hint">Chọn ngày và giờ tương lai theo giờ Việt Nam (UTC+7).</small>{formAttempt>0&&deadlineIssue&&<p id="dashboard-deadline-error" className="menu-inline-error">{deadlineIssue}</p>}</div><p className="dashboard-hint">Mở lại Form quá hạn cần chọn hạn tương lai. Lịch tự đóng dùng hạn mới; tuần chưa chỉnh vẫn khóa lúc 00:00 thứ Hai.</p><div className="actions">
        <ExplainedButton disabled={busy || !online || selectedWeek.formStatus !== 'closed'} reason={busy?'Đang cập nhật Form; hãy chờ xác nhận.':selectedWeek.formStatus==='open'?'Form đang mở, không cần mở lại.':'Chưa xác định trạng thái Form; hãy tải lại sổ tuần.'} onClick={() => void controlForm('open')}>Mở Form</ExplainedButton>
        <ExplainedButton className="danger" disabled={busy || !online || selectedWeek.formStatus !== 'open'} reason={busy?'Đang cập nhật Form; hãy chờ xác nhận.':selectedWeek.formStatus==='closed'?'Form đã đóng, không cần đóng lại.':'Chưa xác định trạng thái Form; hãy tải lại sổ tuần.'} onClick={() => void controlForm('close')}>Đóng Form</ExplainedButton>
        <ExplainedButton className="secondary" disabled={busy || !online || selectedWeek.formStatus === 'unknown'} reason={busy?'Đang cập nhật Form; hãy chờ xác nhận.':'Chưa xác định trạng thái Form; hãy tải lại sổ tuần trước khi đổi hạn.'} onClick={() => void controlForm('deadline')}>Lưu hạn đăng ký</ExplainedButton>
      </div></> : <p>Chọn một tuần đã đăng ký.</p>}
      <p className="dashboard-hint">Lịch sử các thay đổi nằm trong “Lượt gửi &amp; lịch sử” của tuần này.</p>
    </section>}

    {tab === 'reconcile' && <section className="dashboard-panel">
      <div className="dashboard-section-title"><div className="field-label-row"><h2>Đối soát Form–Sheet</h2><FieldHelp label="Đối soát Form–Sheet">So sánh lượt Form với hàng trong Sheet của đúng tuần. Ghép duy nhất nghĩa là xác định được đúng một cặp tương ứng. Lượt lệch hoặc ghép không rõ chỉ được báo để kiểm tra, không tự xóa hay sửa.</FieldHelp></div>{weekPicker()}</div><p>Chỉ đọc: không tự sửa, ghép, khôi phục hoặc xóa dữ liệu.</p><ExplainedButton label="Đối soát tuần này" disabled={busy || !online || reconciling || !weekKey} reason={busy?'Đang xử lý thao tác khác.':reconciling?'Đang đối soát Form–Sheet; hãy chờ hoặc dừng chờ dữ liệu.':'Chọn một tuần đã đăng ký trước khi đối soát.'} onClick={() => void reconcileWeek()}>{reconciling ? 'Đang đối soát…' : 'Đối soát tuần này'}</ExplainedButton>
      {reconciliation && <><div className="reconciliation-counts"><p>Form <strong>{reconciliation.formCount}</strong></p><p>Sheet <strong>{reconciliation.sheetCount}</strong></p><p>Ghép duy nhất <strong>{reconciliation.matchedCount}</strong></p><p>Cần kiểm tra <strong>{reconciliation.issues.length}</strong></p></div><ul className="reconciliation-issues">{reconciliation.issues.map((issue, index) => <li key={`${weekKey}-${index}`}><strong>{({ 'form-only': 'Chỉ có trong Form', 'sheet-only': 'Chỉ có trong Sheet', ambiguous: 'Ghép không duy nhất' })[issue.kind]}</strong><p>{issue.name || '(Thiếu tên)'} · {formatTime(issue.timestamp)} · {issue.source === 'sheet' ? 'Sheet' : 'Form'}{issue.rows?.length ? ` · hàng ${issue.rows.join(', ')}` : ''}</p><p>{issue.meals.join(' · ')}</p><SheetRowButton weekKey={weekKey} source={issue.source} response={issue} request={request} disabled={busy||!online} /></li>)}</ul>{!reconciliation.issues.length && <p role="status">Form và Sheet đang khớp duy nhất.</p>}</>}
    </section>}

{tab === 'branding' && overview.role === 'owner' && <section className="dashboard-panel">
  <h2>Thương hiệu trường</h2><p>Áp dụng cho trang xem, kho tuần, Dashboard và cài đặt. Chỉ lưu thông tin hiển thị công khai.</p>
  <form noValidate className="branding-form" onSubmit={event => void saveBranding(event)}>
    {brandAttempt>0&&<FormErrorSummary label="Lỗi cần sửa trước khi lưu thương hiệu" errors={brandErrors} attempt={brandAttempt}/>}
    <div className="branding-field-row"><div className="branding-name-control"><label>Tên trường<input id="brand-school-name" enterKeyHint="next" aria-label="Tên trường" aria-invalid={brandErrors.some(error=>error.field==='schoolName')} required maxLength={TEXT_LIMITS.schoolName} aria-describedby={nameCountId+' brand-school-name-hint'+(brandErrors.some(error=>error.field==='schoolName')?' brand-school-name-error':'')} value={brandDraft.schoolName} onChange={event => setBrandDraft({ ...brandDraft, schoolName: event.target.value })} /></label><small id="brand-school-name-hint">Tên hiển thị trên website, tối đa 100 ký tự.</small>{brandErrors.filter(error=>error.field==='schoolName').map(error=><p id="brand-school-name-error" className="menu-inline-error" key={error.field}>{error.message}</p>)}<CharacterCounter id={nameCountId} value={brandDraft.schoolName} limit={TEXT_LIMITS.schoolName} label="Tên trường"/></div><button type="button" className="secondary" aria-label="Dùng lại tên trường đã lưu" disabled={busy||brandDraft.schoolName===brandSaved.schoolName} onClick={()=>setBrandDraft(value=>({...value,schoolName:brandSaved.schoolName}))}>Dùng lại đã lưu</button></div>
    <div className="branding-field-row"><label>URL ảnh logo HTTPS (không bắt buộc)<input id="brand-logo-url" aria-label="URL ảnh logo HTTPS" type="url" inputMode="url" enterKeyHint="next" autoCapitalize="none" spellCheck={false} maxLength={512} placeholder="https://…/logo.png" value={brandDraft.logoUrl} aria-invalid={Boolean(logoIssue||brandDraft.logoUrl&&logoPhase==='error')} aria-describedby={logoFeedbackId+' '+logoFeedbackId+'-hint'} onChange={event => setBrandDraft({ ...brandDraft, logoUrl: event.target.value })} /><small id={logoFeedbackId+'-hint'}>Không bắt buộc. Dùng URL ảnh HTTPS công khai, tối đa 512 ký tự; không nhập khóa bí mật.</small></label><button type="button" className="secondary" aria-label="Dùng lại logo đã lưu" disabled={busy||brandDraft.logoUrl===(brandSaved.logoUrl||'')} onClick={()=>setBrandDraft(value=>({...value,logoUrl:brandSaved.logoUrl||''}))}>Dùng lại đã lưu</button></div>
    <div id={logoFeedbackId} className="logo-input-feedback" data-state={logoIssue?'invalid':logoPhase}><p role="status" aria-label="Tình trạng logo">{logoMessage}</p>{brandDraft.logoUrl&&!logoIssue&&logoPhase==='error'&&<ExplainedButton type="button" className="secondary" disabled={busy||!online} reason="Đang xử lý thao tác khác; hãy chờ hoàn tất." onClick={()=>setLogoAttempt(value=>value+1)}>Thử tải lại logo</ExplainedButton>}</div>
    <div className="branding-field-row"><label>Màu chủ đạo<input id="brand-color" type="color" value={brandDraft.primaryColor} onChange={event => setBrandDraft({ ...brandDraft, primaryColor: event.target.value })} /></label><button type="button" className="secondary" aria-label="Dùng lại màu đã lưu" disabled={busy||brandDraft.primaryColor===brandSaved.primaryColor} onClick={()=>setBrandDraft(value=>({...value,primaryColor:brandSaved.primaryColor}))}>Dùng lại đã lưu</button></div>
    <BrandContrast color={brandDraft.primaryColor} disabled={busy||!online} onChoose={primaryColor=>setBrandDraft(value=>({...value,primaryColor}))}/>
    <BrandingPreview draft={brandDraft} saved={brandSaved} logoAttempt={logoAttempt} onLogoStatus={receiveLogoStatus}/>
    <p className="dashboard-hint">Dùng ảnh HTTPS truy cập được công khai; chưa hỗ trợ tải ảnh lên. Không dán khóa API hoặc liên kết chứa thông tin bí mật.</p><ContextualSaveBar dirty={brandDirty} scope="thương hiệu" saveLabel="Lưu thương hiệu" busy={busy} onDiscard={()=>{setBrandDraft(brandSaved);setBrandAttempt(0);}}/>
  </form>
</section>}

    {tab === 'access' && overview.role === 'owner' && <section className="dashboard-panel">
      <div className="field-label-row"><h2>Gmail được phép quản trị</h2><FieldHelp label="Quyền quản trị">Chỉ chủ sở hữu chỉnh quyền. Xem cho phép mở Dashboard; OCR/tạo tuần và Xóa/khôi phục là hai quyền riêng. Bật/tắt ô chỉ sửa bản nháp. Bấm Lưu quyền mới áp dụng; gỡ Gmail cần xác nhận. Gỡ quyền không chuyển quyền sở hữu hay xóa dữ liệu. Mở trợ giúp không đổi quyền.</FieldHelp></div>
      <p>Gmail mới mặc định chỉ xem. Gmail cũ giữ quyền hiện có cho đến khi chủ chỉnh.</p>
      <form className="dashboard-access-form" onSubmit={event => { event.preventDefault(); void changeAllowedEmail('add-email'); }}>
        <label>Thêm Gmail<input type="email" inputMode="email" enterKeyHint="done" autoCapitalize="none" spellCheck={false} value={email} onChange={event => setEmail(event.target.value)} placeholder="ten@gmail.com" required /></label>
        <button disabled={busy||!online}>Cấp quyền</button>
      </form>
      <div className="member-discovery" role="search" aria-label="Tìm và lọc quyền Gmail">
        <label>Tìm Gmail đã cấp quyền<SearchInput label="Tìm Gmail đã cấp quyền" value={memberQuery} maxLength={254} placeholder="Nhập email cần tìm" onChange={event=>setMemberQuery(event.target.value)} onClear={()=>setMemberQuery('')}/></label>
        <label>Lọc theo quyền<select aria-label="Lọc theo quyền" value={memberPermission} onChange={event=>setMemberPermission(event.target.value)}><option value="">Tất cả quyền</option><option value="view">Có quyền Xem</option><option value="create">Có quyền OCR / tạo tuần</option><option value="manageResponses">Có quyền Xóa / khôi phục</option></select></label>
      </div>
      <p className="member-discovery-result" role="status" aria-live="polite" aria-atomic="true" aria-label="Kết quả lọc quyền Gmail">Hiện {visibleMembers.length}/{members.length} tài khoản đã tải. Chỉ lọc hiển thị, không đổi quyền.</p>
      {!members.length?<p>Chưa có Gmail được cấp quyền.</p>:!visibleMembers.length&&<p>Không có Gmail khớp bộ lọc. Hãy xóa từ khóa hoặc chọn Tất cả quyền.</p>}
      {permissionDirty&&<p role="status">Có {Object.keys(permissionDrafts).length} tài khoản còn thay đổi chưa lưu. Bộ lọc danh sách không bỏ bản nháp.</p>}
      <ul className="dashboard-email-list">{visibleMembers.map(member=><MemberPermissionsEditor key={member.email} member={member} draft={permissionDrafts[member.email]} onDraft={value=>stagePermission(member,value)} disabled={busy||!online} onSave={value=>void changeAllowedEmail('set-permissions',member.email,value)} onRemove={()=>{if(window.confirm(`Gỡ quyền dashboard của ${member.email}?`))void changeAllowedEmail('remove-email',member.email);}}/>)}</ul>
    </section>}
    <ActionToast message={toast?.message} kind={toast?.kind} onDismiss={dismissToast} />
    {mergeBase&&<MultiImageReview fragments={mergeBase.fragments} images={mergeBase.images} base={mergeBase.menu} onClose={()=>setMergeBase(null)} onApply={next=>{if(images!==mergeBase.images||menu!==mergeBase.menu)throw new Error('Nháp/ảnh đã thay đổi; hãy đóng và đọc lại.');dispatchMenu({type:'apply',value:next});if(!originalMenu)setOriginalMenu(next);setAllowMissing(false);setSourceStale(false);setMergeBase(null);setMessage('Đã áp dụng bản ghép. Hãy rà soát ngày/món trước khi tạo tuần.','info');}}/>}
    {regionBase && <RegionOcr onResultReady={attention.completed} image={regionBase.image} menu={regionBase.menu} request={request} onBusy={setBusy} onClose={() => setRegionBase(null)} onApply={(target,result) => {
      if (menu !== regionBase.menu || image !== regionBase.image) throw new Error('Nháp đã thay đổi; đóng cửa sổ và chọn vùng lại.');
      dispatchMenu({type:'edit',value:applyRegionResult(menu,target,result)});setAllowMissing(false);setRegionBase(null);
    }} />}
    {quickResponse && <ResponseQuickView response={currentQuickResponse || quickResponse} week={displayedWeek?.week} verified={weekReady && Boolean(currentQuickResponse)} navigation={{index:quickIndex,total:visibleResponses.length,previous:quickIndex>0?visibleResponses[quickIndex-1]:null,next:quickIndex>=0?visibleResponses[quickIndex+1]:null}} onSelect={response=>{const current=visibleResponses.find(item=>item.responseId===response?.responseId);if(current)setQuickResponse(current);}} onClose={() => setQuickResponse(null)} />}
    {confirmation && <ActionConfirmation confirmLabel={confirmation.confirmLabel} message={confirmation.message} changes={confirmation.changes} showReason={confirmation.showReason} onCancel={() => setConfirmation(null)} onConfirm={reason => { const action = confirmation.run; setConfirmation(null); void action(reason); }} />}
  </main></DashboardLayout>;
}

export default Dashboard;
