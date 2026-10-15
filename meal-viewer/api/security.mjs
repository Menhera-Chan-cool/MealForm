import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import {registrationDeadlineTime} from '../src/viewer-model.mjs';

export const SESSION_SECONDS = 30 * 24 * 60 * 60;
const SHEET_ID = /^[A-Za-z0-9_-]{1,100}$/;

function mac(value, secret, encoding = 'base64url') {
  return createHmac('sha256', secret).update(value, 'utf8').digest(encoding);
}

function equalMac(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createSessionToken(identity, secret, now = Date.now()) {
  if (!identity?.sub || !secret) throw new Error('Session identity and secret are required.');
  const claims = { sub: String(identity.sub), exp: Math.floor(now / 1000) + SESSION_SECONDS };
  if (identity.email) claims.email = String(identity.email).trim().toLocaleLowerCase();
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${payload}.${mac(payload, secret)}`;
}

export function readSessionToken(token, secret, now = Date.now()) {
  try {
    if (!token || !secret) return null;
    const [payload, signature, extra] = String(token).split('.');
    if (!payload || !signature || extra !== undefined || !equalMac(mac(payload, secret), signature)) return null;
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!claims.sub || !Number.isInteger(claims.exp) || claims.exp <= Math.floor(now / 1000)) return null;
    return { sub: String(claims.sub), email: String(claims.email || '').toLocaleLowerCase(), exp: claims.exp };
  } catch {
    return null;
  }
}

export function isGoogleIdentity(claims, clientId, now = Date.now()) {
  if (!claims || !clientId) return false;
  const issuer = claims.iss;
  return String(claims.aud || '') === clientId &&
    (issuer === 'https://accounts.google.com' || issuer === 'accounts.google.com') &&
    Boolean(claims.sub) &&
    (claims.email_verified === true || claims.email_verified === 'true') &&
    Number(claims.exp) > Math.floor(now / 1000) &&
    Number(claims.iat) <= Math.floor(now / 1000) + 60;
}

export function createGasEnvelope(payload, secret, now = Date.now(), nonce = randomBytes(18).toString('base64url')) {
  if (!secret) throw new Error('Apps Script signing secret is required.');
  const timestamp = String(Math.floor(now / 1000));
  const serialized = JSON.stringify(payload);
  return {
    timestamp,
    nonce,
    payload: serialized,
    signature: mac([timestamp, nonce, serialized].join('\n'), secret, 'hex')
  };
}

async function requestAppsScript(url, secret, payload, fetchImpl = fetch, now = Date.now, retried = false) {
  if (!url || !secret) throw new Error('Apps Script API is not configured.');
  const readOnly = payload.action?.startsWith('read-') || ['dashboard-authorize', 'dashboard-overview', 'dashboard-week', 'dashboard-batch', 'dashboard-week-notice', 'dashboard-health', 'dashboard-reconcile', 'dashboard-response-ids', 'dashboard-locate'].includes(payload.action);
  const signal = readOnly ? AbortSignal.timeout(20000) : undefined;
  const retryRead = () => requestAppsScript(url, secret, payload, fetchImpl, now, true);
  const envelope = createGasEnvelope(payload, secret, now());
  const response = await fetchImpl(url, {
    method: 'POST', redirect: 'manual', cache: 'no-store', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(envelope)
  });
  const redirectStatus = [301, 302, 303, 307, 308].includes(response.status);
  const resultResponse = redirectStatus
    ? await fetchImpl(new URL(response.headers?.get?.('location') || (() => { throw new Error('Apps Script redirect missing location.'); })(), url), { method: 'GET', redirect: 'follow', cache: 'no-store', signal })
    : response;
  const responseText = await resultResponse.text();
  if (!resultResponse.ok) {
    if (readOnly && !retried && (resultResponse.status === 404 || resultResponse.status === 429 || resultResponse.status >= 500)) return retryRead();
    console.error('Apps Script HTTP error', resultResponse.status, responseText.slice(0, 240));
    throw new Error('Apps Script request failed.');
  }
  let result;
  try { result = JSON.parse(responseText); } catch {
    if (readOnly && !retried) return retryRead();
    console.error('Apps Script returned non-JSON data', responseText.slice(0, 240));
    throw new Error('Apps Script returned invalid data.');
  }
  if (result?.error || !result?.data) {
    console.error('Apps Script rejected request', JSON.stringify(result?.error || result).slice(0, 240));
    throw new Error(typeof result?.error === 'string' ? result.error : 'Apps Script rejected the request.');
  }
  return result.data;
}

export function createGasReader({ url, secret, fetchImpl = fetch, now = Date.now }) {
  return async function readViewerData(sheetId, forceRefresh = false, action = 'read-viewer') {
    const payload = { action, forceRefresh };
    if (action === 'read-viewer') payload.sheetId = sheetId;
    if (action === 'read-history-viewer') payload.weekKey = sheetId;
    return requestAppsScript(url, secret, payload, fetchImpl, now);
  };
}

export function createDashboardGasClient({ url, secret, fetchImpl = fetch, now = Date.now }) {
  return payload => requestAppsScript(url, secret, payload, fetchImpl, now);
}

export function requestBody(body) {
  if (typeof body === 'string') return JSON.parse(body);
  return body && typeof body === 'object' ? body : {};
}

function requestIsSameOrigin(req) {
  try {
    const origin = new URL(req.headers?.origin || '');
    const host = String(req.headers?.['x-forwarded-host'] || req.headers?.host || '').split(',')[0].trim().toLowerCase();
    return origin.host.toLowerCase() === host && origin.protocol === 'https:';
  } catch {
    return false;
  }
}

export function dashboardConfiguration(env) {
  return {
    session: String(env.SESSION_SECRET || '').length >= 32,
    viewer: String(env.GAS_HMAC_SECRET || '').length >= 32,
    dashboard: String(env.GAS_DASHBOARD_HMAC_SECRET || '').length >= 32,
    google: Boolean(env.GOOGLE_OAUTH_CLIENT_ID) && env.GOOGLE_OAUTH_CLIENT_ID === env.VITE_GOOGLE_OAUTH_CLIENT_ID
  };
}

export function createDashboardHandler({ secret, callGas, readViewerData, configuration, now = Date.now }) {
  return async function dashboardHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const session = readSessionToken(cookieValue(req.headers?.cookie, 'meal_session'), secret, now());
    if (!session?.email) return res.status(401).json({ error: 'Đăng nhập Google để mở dashboard.' });
    if (!['GET', 'POST', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed.' });
    if (req.method !== 'GET' && !requestIsSameOrigin(req)) return res.status(403).json({ error: 'Origin không hợp lệ.' });

    try {
      const authorization = await callGas({ action: 'dashboard-authorize', email: session.email, includeWeeks: req.method === 'GET' && req.query?.access === '1' });
      const role = authorization?.role;
      if (role !== 'owner' && role !== 'manager') return res.status(403).json({ error: 'Tài khoản này chưa được cấp quyền dashboard.' });
      const permissions = authorization.permissions || { view: true, create: true, manageResponses: true };
      if (permissions.view !== true) return res.status(403).json({ error: 'Tài khoản này không có quyền xem dashboard.' });
      if (req.method === 'GET' && req.query?.access === '1') return res.status(200).json({ role, permissions, email: session.email, weeks: authorization.weeks || [], accountId: createHash('sha256').update(session.sub).digest('hex'), overviewPending: true });
      if (req.method === 'GET' && req.query?.health === '1') {
        if (role !== 'owner') return res.status(403).json({ error: 'Chỉ chủ sở hữu được kiểm tra cấu hình hệ thống.' });
        const health = await callGas({ action: 'dashboard-health', email: session.email, weekKey: String(req.query?.week || '') });
        const checks = [{ id: 'bridge', label: 'Kết nối Dashboard', status: 'ok', message: 'Kết nối Apps Script và chữ ký quản trị hợp lệ.' }, ...(health.checks || [])];
        for (const [key, label] of [['session', 'Cấu hình phiên đăng nhập'], ['viewer', 'Cấu hình API trang xem'], ['dashboard', 'Cấu hình API quản trị'], ['google', 'Client ID server / frontend khớp nhau']]) {
          if (configuration) checks.push({ id: `config-${key}`, label, status: configuration[key] ? 'ok' : 'error', message: configuration[key] ? 'Đã cấu hình trên máy chủ.' : 'Chủ sở hữu cần kiểm tra biến môi trường Vercel.' });
        }
        if (readViewerData) {
          try {
            await readViewerData('', false, 'read-latest-viewer');
            checks.push({ id: 'viewer-api', label: 'Kết nối trang xem', status: 'ok', message: 'API trang xem đọc được tuần hiện tại.' });
          } catch (error) {
            const missingWeek = /^Chưa có thực đơn cho tuần này\.$/.test(error?.message || '');
            checks.push({ id: 'viewer-api', label: 'Kết nối trang xem', status: missingWeek ? 'warning' : 'error', message: missingWeek ? 'API kết nối được; tuần hiện tại chưa có thực đơn.' : 'Kiểm tra deployment Apps Script, chữ ký API trang xem và quyền đọc dữ liệu.' });
          }
        }
        return res.status(200).json({ ...health, checkedAt: now(), checks });
      }
      let payload;
      if (req.method === 'GET') {
        const weekKey = String(req.query?.week || '');
        if ((req.query?.reconcile === '1' || req.query?.updates === '1' || req.query?.locate === '1') && !weekKey) return res.status(400).json({ error: 'Chọn tuần trước khi kiểm tra.' });
        payload = weekKey ? { action: req.query?.reconcile === '1' ? 'dashboard-reconcile' : req.query?.updates === '1' ? 'dashboard-response-ids' : req.query?.locate === '1' ? 'dashboard-locate' : 'dashboard-week', email: session.email, weekKey } : { action: 'dashboard-overview', email: session.email };
        if(req.query?.notice==='1'){
          if(role!=='owner')return res.status(403).json({error:'Chỉ chủ sở hữu được quản lý thông báo tuần.'});
          if(!weekKey)return res.status(400).json({error:'Chọn tuần để quản lý thông báo.'});
          payload={action:'dashboard-week-notice',email:session.email,weekKey};
        }
        if (req.query?.batch === '1') {
          const offset = Number(req.query.offset || 0), query = String(req.query.query || ''), sort = String(req.query.sort || 'newest'), revision = String(req.query.revision || '');
          if (!weekKey || !Number.isSafeInteger(offset) || offset < 0 || offset > 100000 || query.length > 200 || !['newest','oldest','name'].includes(sort) || (revision && !/^[a-f0-9]{64}$/.test(revision))) return res.status(400).json({ error: 'Tham số tải lượt gửi không hợp lệ.' });
          let audit;try{if(String(req.query.audit||'').length>2000)throw Error();audit=JSON.parse(req.query.audit||'{}');}catch{return res.status(400).json({error:'Bộ lọc lịch sử không hợp lệ.'});}
          const historyOffset=Number(req.query.historyOffset||0);
          if(!audit||Array.isArray(audit)||typeof audit!=='object'||!Number.isSafeInteger(historyOffset)||historyOffset<0||historyOffset>100000)return res.status(400).json({error:'Bộ lọc lịch sử không hợp lệ.'});
          payload = { action:'dashboard-batch', email:session.email, weekKey, offset, query, sort, revision, audit, historyOffset, forceRefresh:req.query.refresh === '1' };
        }
        if (req.query?.locate === '1') {
          if (String(req.query?.target || '').length > 4000) return res.status(400).json({ error: 'Lượt Sheet không hợp lệ.' });
          Object.assign(payload, { source: req.query?.source, responseId: req.query?.responseId, target: req.query?.target ? JSON.parse(req.query.target) : undefined });
        }
      } else {
        const body = requestBody(req.body);
        if (['ocr', 'ocr-images', 'ocr-region', 'create'].includes(body.action) && permissions.create !== true) return res.status(403).json({ error: 'Tài khoản này không có quyền OCR hoặc tạo tuần.' });
        if ((req.method === 'DELETE' || body.action === 'restore') && permissions.manageResponses !== true) return res.status(403).json({ error: 'Tài khoản này không có quyền xóa hoặc khôi phục.' });
        if (req.method === 'POST' && ['form-control', 'set-branding', 'set-week-notice'].includes(body.action)) {
          if (role !== 'owner') return res.status(403).json({ error: 'Chỉ chủ sở hữu được thay đổi Form và thương hiệu.' });
          payload = body.action === 'set-week-notice'
            ? {action:'dashboard-set-week-notice',email:session.email,weekKey:body.weekKey,text:body.text,endsOn:body.endsOn,expectedUpdatedAt:body.expectedUpdatedAt}
            : body.action === 'form-control'
            ? { action: 'dashboard-form-control', email: session.email, weekKey: body.weekKey, mode: body.mode, deadline: body.deadline, expectedStatus: body.expectedStatus, expectedLockAt: body.expectedLockAt, reason: body.reason }
            : { action: 'dashboard-set-branding', email: session.email, branding: body.branding, expectedUpdatedAt: body.expectedUpdatedAt };
        } else if (body.action === 'authorize-script') {
          if (role !== 'owner') return res.status(403).json({ error: 'Chỉ chủ sở hữu được cấp quyền Apps Script.' });
          payload = { action: 'dashboard-script-auth', email: session.email };
        } else if (req.method === 'DELETE') payload = { weekKey: body.weekKey, responseId: body.responseId, deleteToken: body.deleteToken, action: 'dashboard-delete', email: session.email, reason: body.reason };
        else if (body.action === 'ocr') payload = { action: 'dashboard-ocr', email: session.email, image: body.image };
        else if (body.action === 'ocr-images') payload = { action: 'dashboard-ocr-images', email: session.email, images: body.images };
        else if (body.action === 'ocr-region') payload = { action: 'dashboard-ocr-region', email: session.email, image: body.image, target: body.target };
        else if (body.action === 'create') payload = { action: 'dashboard-create', email: session.email, menu: body.menu };
        else if (['add-email', 'remove-email', 'set-permissions'].includes(body.action)) {
          if (role !== 'owner') return res.status(403).json({ error: 'Chỉ chủ sở hữu được quản lý Gmail.' });
          payload = { action: `dashboard-${body.action}`, email: session.email, targetEmail: body.email, permissions: body.permissions };
        } else if (body.action === 'restore') payload = { action: 'dashboard-restore', email: session.email, weekKey: body.weekKey, entryId: body.entryId };
        else return res.status(400).json({ error: 'Thao tác dashboard không hợp lệ.' });
      }
      if (Buffer.byteLength(JSON.stringify(payload)) > 4_200_000) return res.status(413).json({ error: 'Ảnh quá lớn; hãy chọn ảnh nhỏ hơn 3 MB.' });
      const data = await callGas(payload);
      return res.status(200).json(req.method === 'GET' && !req.query?.week ? { ...data, permissions, email: session.email, accountId: createHash('sha256').update(session.sub).digest('hex') } : data);
    } catch (error) {
      if (req.method === 'GET' && req.query?.health === '1') return res.status(502).json({ checkedAt: now(), checks: [{ id: 'bridge', label: 'Kết nối Apps Script', status: 'error', message: 'Không hoàn tất được kiểm tra. Kiểm tra deployment, chữ ký API và cấp lại quyền Apps Script bằng tài khoản chủ.' }] });
      return res.status(502).json({ error: String(error?.message || 'Không thể hoàn tất thao tác dashboard.').slice(0, 300) });
    }
  };
}

export function cookieValue(header, name) {
  for (const part of String(header || '').split(';')) {
    const separator = part.indexOf('=');
    if (separator >= 0 && part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim();
  }
  return '';
}

function publicViewerData(data, now) {
  const headers = Array.isArray(data?.headers) ? data.headers.map(value => String(value ?? '')) : [];
  const hidden = headers.map((value, index) => /email|e-mail|địa chỉ thư điện tử/i.test(value) ? index : -1).filter(index => index >= 0);
  return {
    title: String(data?.title || ''),
    serverNow: now,
    weekNotice: typeof data?.weekNotice?.text === 'string' && data.weekNotice.text.trim() && data.weekNotice.text.length <= 500 && Number.isFinite(data.weekNotice.expiresAt) && data.weekNotice.expiresAt > now ? {text:data.weekNotice.text,expiresAt:data.weekNotice.expiresAt} : null,
    ...(Array.isArray(data?.closedDays) && data.closedDays.length ? {
      closedDays: data.closedDays.filter(value => typeof value === 'string').slice(0, 5),
      calendarDays: (Array.isArray(data.calendarDays) ? data.calendarDays : []).filter(value => typeof value === 'string').slice(0, 5)
    } : {}),
    headers: headers.filter((_, index) => !hidden.includes(index)),
    rows: (Array.isArray(data?.rows) ? data.rows : []).map(row => Array.isArray(row)
      ? row.filter((_, index) => !hidden.includes(index)).map(value => value == null ? null : String(value)) : []),
    days: Array.isArray(data?.days) ? data.days : [],
    formUrl: String(data?.formUrl || ''),
    lockAt: registrationDeadlineTime(data?.lockAt)===null?null:data.lockAt,
    formStatus: data?.formStatus === 'open' || data?.formStatus === 'closed' ? data.formStatus : 'unknown'
  };
}

export function createViewerHandler({ secret, readViewerData, now = Date.now }) {
  return async function viewerHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
    if (req.query?.old === '1') return res.status(410).json({ error: 'Tuần cũ đã chuyển sang /history. Đăng nhập Google để xem kho thực đơn.' });
    const isNewest = req.query?.newest === '1';
    const isNext = req.query?.next === '1';
    const isWeek = isNewest || isNext;
    const session = readSessionToken(cookieValue(req.headers?.cookie, 'meal_session'), secret, now());
    if (!isWeek && !session) return res.status(401).json({ error: 'Đăng nhập Google để xem thực đơn.' });
    const sheetId = String(req.query?.view || '');
    if (!isWeek && !SHEET_ID.test(sheetId)) return res.status(400).json({ error: 'Liên kết bảng xem không hợp lệ.' });
    try {
      const action = isNewest ? 'read-latest-viewer' : isNext ? 'read-next-viewer' : 'read-viewer';
      const data = await readViewerData(sheetId, req.query?.refresh === '1', action);
      const result = publicViewerData(data,now());
      if (isNewest && data.formStatus === 'closed') {
        try {
          const next = publicViewerData(await readViewerData('', req.query?.refresh === '1', 'read-next-viewer'),now());
          result.nextForm = { formUrl: next.formUrl, formStatus: next.formStatus, days: next.days, calendarDays: next.calendarDays, lockAt: next.lockAt, serverNow: next.serverNow };
        } catch (error) {
          if (!/^Chưa có thực đơn cho tuần sau\.$/.test(error?.message || '')) result.nextFormUnavailable = true;
        }
      }
      return res.status(200).json(result);
    } catch (error) {
      if (/^Chưa có thực đơn cho tuần (này|trước|sau)\.$/.test(error?.message || '')) return res.status(404).json({ error: error.message });
      console.error('Viewer data load failed', error?.message || String(error));
      return res.status(502).json({ error: 'Không thể tải dữ liệu thực đơn. Hãy thử tải lại sau.' });
    }
  };
}

export function createHistoryHandler({ secret, readViewerData, now = Date.now }) {
  return async function historyHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
    const session = readSessionToken(cookieValue(req.headers?.cookie, 'meal_session'), secret, now());
    if (!session) return res.status(401).json({ error: 'Đăng nhập Google để xem kho tuần cũ.' });
    const weekKey = String(req.query?.week || '');
    if (weekKey && !/^[A-Za-z0-9_-]{1,120}$/.test(weekKey)) return res.status(400).json({ error: 'Tuần không hợp lệ.' });
    try {
      const data = await readViewerData(weekKey, req.query?.refresh === '1', weekKey ? 'read-history-viewer' : 'read-history');
      return res.status(200).json(weekKey ? publicViewerData(data,now()) : { weeks: data.weeks || [] });
    } catch (error) {
      return res.status(502).json({ error: /^Không tìm thấy tuần đã đăng ký\.|^Chỉ xem tuần cũ/.test(error.message) ? error.message : 'Không thể tải kho tuần cũ. Hãy thử lại.' });
    }
  };
}
