import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const SESSION_SECONDS = 60 * 60;
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

async function requestAppsScript(url, secret, payload, fetchImpl = fetch, now = Date.now) {
  if (!url || !secret) throw new Error('Apps Script API is not configured.');
  const envelope = createGasEnvelope(payload, secret, now());
  const response = await fetchImpl(url, {
    method: 'POST', redirect: 'manual', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(envelope)
  });
  const redirectStatus = [301, 302, 303, 307, 308].includes(response.status);
  const resultResponse = redirectStatus
    ? await fetchImpl(new URL(response.headers?.get?.('location') || (() => { throw new Error('Apps Script redirect missing location.'); })(), url), { method: 'GET', redirect: 'follow', cache: 'no-store' })
    : response;
  const responseText = await resultResponse.text();
  if (!resultResponse.ok) {
    console.error('Apps Script HTTP error', resultResponse.status, responseText.slice(0, 240));
    throw new Error('Apps Script request failed.');
  }
  let result;
  try { result = JSON.parse(responseText); } catch {
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
      const authorization = await callGas({ action: 'dashboard-authorize', email: session.email });
      const role = authorization?.role;
      if (role !== 'owner' && role !== 'manager') return res.status(403).json({ error: 'Tài khoản này chưa được cấp quyền dashboard.' });
      const permissions = authorization.permissions || { view: true, create: true, manageResponses: true };
      if (permissions.view !== true) return res.status(403).json({ error: 'Tài khoản này không có quyền xem dashboard.' });
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
        payload = weekKey ? { action: 'dashboard-week', email: session.email, weekKey } : { action: 'dashboard-overview', email: session.email };
      } else {
        const body = requestBody(req.body);
        if (['ocr', 'create'].includes(body.action) && permissions.create !== true) return res.status(403).json({ error: 'Tài khoản này không có quyền OCR hoặc tạo tuần.' });
        if ((req.method === 'DELETE' || body.action === 'restore') && permissions.manageResponses !== true) return res.status(403).json({ error: 'Tài khoản này không có quyền xóa hoặc khôi phục.' });
        if (body.action === 'authorize-script') {
          if (role !== 'owner') return res.status(403).json({ error: 'Chỉ chủ sở hữu được cấp quyền Apps Script.' });
          payload = { action: 'dashboard-script-auth', email: session.email };
        } else if (req.method === 'DELETE') payload = { weekKey: body.weekKey, responseId: body.responseId, deleteToken: body.deleteToken, action: 'dashboard-delete', email: session.email };
        else if (body.action === 'ocr') payload = { action: 'dashboard-ocr', email: session.email, image: body.image };
        else if (body.action === 'create') payload = { action: 'dashboard-create', email: session.email, menu: body.menu };
        else if (['add-email', 'remove-email', 'set-permissions'].includes(body.action)) {
          if (role !== 'owner') return res.status(403).json({ error: 'Chỉ chủ sở hữu được quản lý Gmail.' });
          payload = { action: `dashboard-${body.action}`, email: session.email, targetEmail: body.email, permissions: body.permissions };
        } else if (body.action === 'restore') payload = { action: 'dashboard-restore', email: session.email, weekKey: body.weekKey, entryId: body.entryId };
        else return res.status(400).json({ error: 'Thao tác dashboard không hợp lệ.' });
      }
      if (Buffer.byteLength(JSON.stringify(payload)) > 4_200_000) return res.status(413).json({ error: 'Ảnh quá lớn; hãy chọn ảnh nhỏ hơn 3 MB.' });
      const data = await callGas(payload);
      return res.status(200).json(req.method === 'GET' && !req.query?.week ? { ...data, permissions, accountId: createHash('sha256').update(session.sub).digest('hex') } : data);
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

function publicViewerData(data) {
  const headers = Array.isArray(data?.headers) ? data.headers.map(value => String(value ?? '')) : [];
  const hidden = headers.map((value, index) => /email|e-mail|địa chỉ thư điện tử/i.test(value) ? index : -1).filter(index => index >= 0);
  return {
    title: String(data?.title || ''),
    headers: headers.filter((_, index) => !hidden.includes(index)),
    rows: (Array.isArray(data?.rows) ? data.rows : []).map(row => Array.isArray(row)
      ? row.filter((_, index) => !hidden.includes(index)).map(value => String(value ?? '')) : []),
    days: Array.isArray(data?.days) ? data.days : [],
    formUrl: String(data?.formUrl || ''),
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
      const result = publicViewerData(data);
      if (isNewest && data.formStatus === 'closed') {
        try {
          const next = publicViewerData(await readViewerData('', req.query?.refresh === '1', 'read-next-viewer'));
          result.nextForm = { formUrl: next.formUrl, formStatus: next.formStatus, days: next.days };
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
      return res.status(200).json(weekKey ? publicViewerData(data) : { weeks: data.weeks || [] });
    } catch (error) {
      return res.status(502).json({ error: /^Không tìm thấy tuần đã đăng ký\.|^Chỉ xem tuần cũ/.test(error.message) ? error.message : 'Không thể tải kho tuần cũ. Hãy thử lại.' });
    }
  };
}
