function getMealRootFolderId_() {
  const id = cleanMealText_(PropertiesService.getScriptProperties().getProperty('MEAL_FORM_ROOT_FOLDER_ID'));
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(id)) throw new Error('Hãy cấu hình MEAL_FORM_ROOT_FOLDER_ID bằng ID thư mục Drive, không phải URL.');
  return id;
}

function getMealViewerOrigin_() {
  const origin = cleanMealText_(PropertiesService.getScriptProperties().getProperty('MEAL_VIEWER_ORIGIN')).replace(/\/+$/, '');
  if (!/^https:\/\/[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?(?::\d{1,5})?$/.test(origin)) throw new Error('Hãy cấu hình MEAL_VIEWER_ORIGIN là https://domain-cua-ban, không có đường dẫn hoặc tham số.');
  return origin;
}

// WEB APP VÀ TRANG XEM

function doGet(e) {
  const viewId = e && e.parameter && e.parameter.view;
  if (viewId) {
    const target = getMealViewerOrigin_() + '/?view=' + encodeURIComponent(normalizeViewerSheetId_(viewId));
    return HtmlService.createHtmlOutput('<!doctype html><html lang="vi"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=' + target + '"><title>Đang chuyển trang</title><p>Đang chuyển đến <a href="' + target + '">trang xem thực đơn</a>…</p></html>')
      .setTitle('Đang chuyển đến trang xem thực đơn');
  }
  if (e && e.parameter && e.parameter.api === '1') {
    return HtmlService.createHtmlOutput('Đây là điểm cuối API chỉ nhận yêu cầu đã ký.').setTitle('Meal viewer API');
  }
  const target = getMealViewerOrigin_() + '/dashboard';
  return HtmlService.createHtmlOutput('<!doctype html><html lang="vi"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=' + target + '"><title>Dashboard thực đơn</title><p>Mở <a href="' + target + '">Dashboard quản trị</a>.</p></html>');
}

function normalizeViewerSheetId_(value) {
  const id = cleanMealText_(value);
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(id)) throw new Error('Liên kết bảng xem không hợp lệ.');
  return id;
}

function getViewerUrl_(spreadsheetId, menu) {
  const id = normalizeViewerSheetId_(spreadsheetId);
  const start = parseDateKey_(menu && menu.days && menu.days[0] && menu.days[0].date);
  const current = getMealCalendarWeekStart_(0);
  const weekKey = start && start < current ? getMenuWeekKey_(menu) || getMealFormWeekKeyBySpreadsheetId_(id) : '';
  const route = start === current ? 'newest' : start === addDateKey_(current, 7) ? 'next' : weekKey ? 'history?week=' + encodeURIComponent(weekKey) : '';
  return getMealViewerOrigin_() + '/' + (route || '?view=' + encodeURIComponent(id));
}

function getViewerData_(spreadsheetId, forceRefresh) {
  const id = normalizeViewerSheetId_(spreadsheetId);
  lockScheduledMealForms_();
  const cache = typeof CacheService !== 'undefined' && typeof CacheService.getScriptCache === 'function'
    ? CacheService.getScriptCache()
    : null;
  const cacheKey = 'meal-viewer-v2:' + id;
  if (cache && !forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached) {
      try { return JSON.parse(cached); } catch (error) { /* Ignore a stale cache entry. */ }
    }
  }
  const data = readViewerData_(id);
  if (cache) {
    try { cache.put(cacheKey, JSON.stringify(data), 45); } catch (error) { /* Cache is best effort. */ }
  }
  return data;
}

function doPost(e) {
  try {
    const contents = e && e.postData && e.postData.contents;
    if (!contents || contents.length > 4200000) throw new Error('Yêu cầu quá lớn hoặc không hợp lệ.');
    const envelope = JSON.parse(contents);
    const hint = envelope && typeof envelope.payload === 'string' ? JSON.parse(envelope.payload) : null;
    if (hint && String(hint.action || '').indexOf('dashboard-') === 0) {
      if (contents.length > 4200000) throw new Error('Ảnh quá lớn; hãy chọn ảnh nhỏ hơn 3 MB.');
      return createMealViewerJsonOutput_({ data: handleMealDashboardRequest_(verifyMealDashboardEnvelope_(envelope)) });
    }
    if (contents.length > 10000) throw new Error('Yêu cầu không hợp lệ.');
    const request = verifyMealViewerEnvelope_(envelope);
    if (!request || ['read-viewer', 'read-latest-viewer', 'read-next-viewer', 'read-history', 'read-history-viewer', 'read-branding'].indexOf(request.action) < 0) throw new Error('Yêu cầu không hợp lệ.');
    if (request.action === 'read-branding') return createMealViewerJsonOutput_({ data: getMealBranding_() });
    if (request.action === 'read-history') return createMealViewerJsonOutput_({ data: { weeks: getMealHistoryWeeks_() } });
    if (request.action === 'read-history-viewer') return createMealViewerJsonOutput_({ data: getMealHistoryViewerData_(request.weekKey, request.forceRefresh === true) });
    if (request.action === 'read-latest-viewer') {
      const latest = getLatestMealFormRegistration_();
      if (!latest) throw new Error('Chưa có thực đơn cho tuần này.');
      return createMealViewerJsonOutput_({ data: getViewerData_(latest.spreadsheetId, request.forceRefresh === true) });
    }
    if (request.action === 'read-next-viewer') {
      const next = getNextMealFormRegistration_();
      if (!next) throw new Error('Chưa có thực đơn cho tuần sau.');
      return createMealViewerJsonOutput_({ data: getViewerData_(next.spreadsheetId, request.forceRefresh === true) });
    }
    const spreadsheetId = normalizeViewerSheetId_(request.sheetId);
    return createMealViewerJsonOutput_({ data: getViewerData_(spreadsheetId, request.forceRefresh === true) });
  } catch (error) {
    return createMealViewerJsonOutput_({ error: cleanMealText_(error && error.message) || 'Yêu cầu bị từ chối.' });
  }
}

function verifyMealViewerEnvelope_(envelope) {
  return verifyMealEnvelope_(envelope, 'MEAL_VIEWER_HMAC_SECRET', 4096, 'meal-viewer-nonce:');
}

function verifyMealDashboardEnvelope_(envelope) {
  return verifyMealEnvelope_(envelope, 'MEAL_DASHBOARD_HMAC_SECRET', 4180000, 'meal-dashboard-nonce:');
}

function verifyMealEnvelope_(envelope, secretKey, maxPayloadLength, replayPrefix) {
  if (!envelope || !/^\d{10,13}$/.test(String(envelope.timestamp || '')) ||
      !/^[A-Za-z0-9_-]{20,80}$/.test(String(envelope.nonce || '')) ||
      typeof envelope.payload !== 'string' || envelope.payload.length > maxPayloadLength ||
      !/^[a-f0-9]{64}$/i.test(String(envelope.signature || ''))) throw new Error('Yêu cầu bị từ chối.');
  const timestamp = Number(envelope.timestamp);
  const timestampMs = timestamp < 1000000000000 ? timestamp * 1000 : timestamp;
  if (!isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 300000) throw new Error('Yêu cầu đã hết hạn.');
  const secret = PropertiesService.getScriptProperties().getProperty(secretKey);
  if (!secret) throw new Error('Chưa cấu hình chữ ký API xem.');
  const signed = String(envelope.timestamp) + '\n' + envelope.nonce + '\n' + envelope.payload;
  const expected = mealViewerHmacHex_(signed, secret);
  if (!constantTimeMealViewerEqual_(expected, String(envelope.signature).toLowerCase())) throw new Error('Yêu cầu bị từ chối.');

  const cache = CacheService.getScriptCache();
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const replayKey = replayPrefix + envelope.nonce;
    if (cache.get(replayKey)) throw new Error('Yêu cầu đã được dùng.');
    cache.put(replayKey, '1', Math.max(1, Math.ceil((timestampMs + 300000 - Date.now()) / 1000)));
  } finally {
    lock.releaseLock();
  }
  return JSON.parse(envelope.payload);
}

function mealViewerHmacHex_(value, secret) {
  return Utilities.computeHmacSha256Signature(value, secret, Utilities.Charset.UTF_8).map(function(byte) {
    const hex = (byte & 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function constantTimeMealViewerEqual_(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

function createMealViewerJsonOutput_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function readViewerData_(spreadsheetId) {
  const spreadsheet = SpreadsheetApp.openById(normalizeViewerSheetId_(spreadsheetId));
  let responseFormUrl = '';
  const responseSheet = spreadsheet.getSheets().find(function(sheet) {
    if (!sheet || typeof sheet.getFormUrl !== 'function') return false;
    responseFormUrl = cleanMealText_(sheet.getFormUrl());
    return Boolean(responseFormUrl);
  });
  if (!responseSheet) throw new Error('Không tìm thấy trang câu trả lời của Form.');

  const columnCount = responseSheet.getLastColumn();
  if (columnCount < 2) throw new Error('Trang câu trả lời chưa có đủ cột dữ liệu.');
  const rowCount = Math.max(responseSheet.getLastRow() - 1, 0);
  const headers = responseSheet.getRange(1, 1, 1, columnCount).getDisplayValues()[0];
  const rows = rowCount ? responseSheet.getRange(2, 1, rowCount, columnCount).getDisplayValues() : [];
  const days = [];
  const summary = spreadsheet.getSheetByName('Tổng hợp');
  if (summary) {
    const summaryRowCount = Math.max(Math.min(summary.getLastRow() - 2, 1000), 0);
    let currentDay = '';
    let summaryDone = false;
    if (summaryRowCount) summary.getRange(3, 1, summaryRowCount, 2).getDisplayValues().forEach(function(values) {
      if (summaryDone) return;
      const firstCell = cleanMealText_(values[0]);
      if (/^CHI TIẾT LỰA CHỌN$/i.test(firstCell)) { summaryDone = true; return; }
      if (/^Dấu thời gian$/i.test(firstCell) && /^Họ và tên$/i.test(cleanMealText_(values[1]))) { summaryDone = true; return; }
      if (values[0]) currentDay = values[0];
      if (!currentDay || !values[1]) return;
      let day = days.find(function(item) { return item.day === currentDay; });
      if (!day) { day = { day: currentDay, meals: [] }; days.push(day); }
      if (day.meals.indexOf(values[1]) < 0) day.meals.push(values[1]);
    });
  }
  if (!days.length) {
    const fallbackLayout = getResponseLayout_(headers);
    fallbackLayout.dayIndexes.forEach(function(index) {
      if (index >= 0 && headers[index]) days.push({ day: headers[index], meals: [] });
    });
  }
  const viewerLayout = getResponseLayout_(headers, {
    days: days.map(function(day) { return { day: day.day, date: '' }; })
  });
  if (days.some(function(day) { return !day.meals.length; })) {
    days.forEach(function(day, dayIndex) {
      const valueIndex = viewerLayout.dayIndexes[dayIndex];
      if (valueIndex < 0) return;
      rows.forEach(function(row) {
        const meal = cleanMealText_(row[valueIndex]);
        if (meal && day.meals.indexOf(meal) < 0) day.meals.push(meal);
      });
    });
  }
  const timestampIndex = viewerLayout.timestampIndex >= 0 ? viewerLayout.timestampIndex : 0;
  const nameIndex = viewerLayout.nameIndex >= 0 ? viewerLayout.nameIndex : 1;
  const allDayIndexes = getResponseLayout_(headers).dayIndexes;
  const visibleDayIndexes = viewerLayout.dayIndexes.concat(allDayIndexes.filter(function(index) {
    return viewerLayout.dayIndexes.indexOf(index) < 0;
  }));
  const visibleIndexes = [timestampIndex, nameIndex].concat(visibleDayIndexes);
  const visibleHeaders = visibleIndexes.map(function(index) { return headers[index] || ''; });
  const visibleRows = rows.map(function(row) {
    return visibleIndexes.map(function(index) { return row[index] || ''; });
  });
  const formInfo = getViewerFormInfo_(spreadsheetId, responseSheet, responseFormUrl);
  return {
    title: spreadsheet.getName(), headers: visibleHeaders, rows: visibleRows, days: days,
    formUrl: formInfo.formUrl, formStatus: formInfo.formStatus
  };
}

function getViewerFormInfo_(spreadsheetId, responseSheet, fallbackUrl) {
  let formUrl = cleanMealText_(fallbackUrl);
  let form = null;
  try {
    const weekKey = getMealFormWeekKeyBySpreadsheetId_(spreadsheetId);
    const registry = getMealFormRegistry_();
    const item = weekKey ? registry[weekKey] : null;
    if (item && item.formId) {
      form = FormApp.openById(item.formId);
      formUrl = cleanMealText_(item.responseUrl) || formUrl;
    } else if (formUrl && typeof FormApp.openByUrl === 'function') {
      form = FormApp.openByUrl(formUrl);
    }
    if (form && typeof form.getPublishedUrl === 'function') formUrl = cleanMealText_(form.getPublishedUrl()) || formUrl;
  } catch (error) {
    // Keep the response link available even when Form status cannot be read.
  }
  let formStatus = 'unknown';
  try {
    if (form && typeof form.isAcceptingResponses === 'function') formStatus = form.isAcceptingResponses() ? 'open' : 'closed';
  } catch (error) {
    // The viewer can still use the response link when status lookup fails.
  }
  return { formUrl: formUrl, formStatus: formStatus };
}

// QUYỀN TRUY CẬP VÀ ĐỌC ẢNH

function shouldRetryApi_(status) {
  return [429, 500, 502, 503, 504].indexOf(Number(status)) >= 0;
}

function getVilaoConfig_() {
  const properties = PropertiesService.getScriptProperties();
  const apiKey = properties.getProperty('VILAO_API_KEY');
  const baseUrl = properties.getProperty('VILAO_BASE_URL');
  const model = properties.getProperty('VILAO_MODEL');
  if (!apiKey) throw new Error('Chưa cấu hình VILAO_API_KEY trong Script Properties.');
  if (!baseUrl) throw new Error('Chưa cấu hình VILAO_BASE_URL trong Script Properties.');
  if (!model) throw new Error('Chưa cấu hình VILAO_MODEL trong Script Properties.');
  return { apiKey: apiKey, baseUrl: baseUrl.replace(/\/+$/, ''), model: model };
}

function initializeMealFormOwner_() {
  const email = cleanMealText_(Session.getEffectiveUser().getEmail()).toLocaleLowerCase();
  if (!email) throw new Error('Không xác định được email chủ sở hữu. Hãy chạy hàm này trong Apps Script bằng tài khoản chủ.');
  const properties = PropertiesService.getScriptProperties();
  const current = cleanMealText_(properties.getProperty('MEAL_FORM_OWNER_EMAIL')).toLocaleLowerCase();
  if (current && current !== email) throw new Error('Đã cấu hình một chủ sở hữu khác; không tự ghi đè.');
  properties.setProperty('MEAL_FORM_OWNER_EMAIL', email);
  return 'Đã lưu tài khoản chủ sở hữu: ' + email;
}

function isMealFormOwner_() {
  if (typeof Session === 'undefined' || typeof PropertiesService === 'undefined') return false;
  const owner = cleanMealText_(PropertiesService.getScriptProperties().getProperty('MEAL_FORM_OWNER_EMAIL')).toLocaleLowerCase();
  const active = cleanMealText_(Session.getActiveUser().getEmail()).toLocaleLowerCase();
  return Boolean(owner && active && owner === active);
}

function assertMealFormOwner_() {
  if (!isMealFormOwner_()) throw new Error('Chức năng này chỉ dành cho chủ sở hữu.');
}

function assertMealDashboardAccess_(email, permission) {
  if (!getMealDashboardAccessRole_(email)) throw new Error('Tài khoản này chưa được cấp quyền dashboard.');
  if (!getMealDashboardPermissions_(email)[permission || 'view']) throw new Error('Tài khoản này không có quyền thực hiện thao tác.');
}

function normalizeDashboardEmail_(value) {
  return cleanMealText_(value).toLocaleLowerCase();
}

function getMealDashboardAllowedEmails_() {
  const properties = getMealFormRegistryProperties_();
  try {
    const emails = JSON.parse(properties.getProperty('MEAL_DASHBOARD_ALLOWED_EMAILS') || '[]');
    return Array.isArray(emails) ? emails.map(normalizeDashboardEmail_).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function getMealDashboardAccessRole_(email) {
  const normalized = normalizeDashboardEmail_(email);
  if (!normalized) return '';
  const owner = normalizeDashboardEmail_(PropertiesService.getScriptProperties().getProperty('MEAL_FORM_OWNER_EMAIL'));
  if (owner && normalized === owner) return 'owner';
  return getMealDashboardAllowedEmails_().indexOf(normalized) >= 0 ? 'manager' : '';
}

function getMealDashboardPermissionRecords_() {
  try {
    const records = JSON.parse(getMealFormRegistryProperties_().getProperty('MEAL_DASHBOARD_PERMISSIONS') || '{}');
    return records && typeof records === 'object' && !Array.isArray(records) ? records : null;
  } catch (error) { return null; }
}

function getMealDashboardPermissions_(email) {
  const role = getMealDashboardAccessRole_(email);
  const denied = { view: false, create: false, manageResponses: false };
  if (!role) return denied;
  if (role === 'owner') return { view: true, create: true, manageResponses: true };
  const records = getMealDashboardPermissionRecords_();
  if (!records) return denied;
  if (!Object.prototype.hasOwnProperty.call(records, normalizeDashboardEmail_(email))) return { view: true, create: true, manageResponses: true };
  const entry = records[normalizeDashboardEmail_(email)];
  if (!entry || ['view', 'create', 'manageResponses'].some(function(key) { return typeof entry[key] !== 'boolean'; })) return denied;
  return { view: entry.view, create: entry.create, manageResponses: entry.manageResponses };
}

function getMealDashboardMembers_() {
  return getMealDashboardAllowedEmails_().map(function(email) { return { email: email, permissions: getMealDashboardPermissions_(email) }; });
}

function updateMealDashboardPermissions_(actorEmail, targetEmail, permissions) {
  if (getMealDashboardAccessRole_(actorEmail) !== 'owner') throw new Error('Chỉ chủ sở hữu được quản lý Gmail.');
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
  const email = normalizeDashboardEmail_(targetEmail);
  if (getMealDashboardAccessRole_(email) === 'owner') throw new Error('Không thể thay đổi quyền của chủ sở hữu.');
  if (getMealDashboardAllowedEmails_().indexOf(email) < 0) throw new Error('Gmail này chưa được cấp quyền dashboard.');
  if (!permissions || permissions.view !== true || ['create', 'manageResponses'].some(function(key) { return typeof permissions[key] !== 'boolean'; })) throw new Error('Cấu hình quyền không hợp lệ.');
  const records = getMealDashboardPermissionRecords_();
  if (!records) throw new Error('Dữ liệu quyền bị lỗi; chủ sở hữu cần kiểm tra thủ công.');
  records[email] = { view: true, create: permissions.create, manageResponses: permissions.manageResponses };
  getMealFormRegistryProperties_().setProperty('MEAL_DASHBOARD_PERMISSIONS', JSON.stringify(records));
  return getMealDashboardMembers_();
  } finally { lock.releaseLock(); }
}

function handleMealDashboardRequest_(request) {
  if (!request || String(request.action || '').indexOf('dashboard-') !== 0) throw new Error('Thao tác dashboard không hợp lệ.');
  const role = getMealDashboardAccessRole_(request.email);
  const permissions = getMealDashboardPermissions_(request.email);
  if (request.action === 'dashboard-authorize') return { role: role, permissions: permissions };
  if (!role) throw new Error('Tài khoản này chưa được cấp quyền dashboard.');
  assertMealDashboardAccess_(request.email);
  if (request.action === 'dashboard-form-control' || request.action === 'dashboard-set-branding') {
    if (role !== 'owner') throw new Error('Chỉ chủ sở hữu được thay đổi Form và thương hiệu.');
    return request.action === 'dashboard-form-control' ? controlMealDashboardForm_(request) : setMealBranding_(request);
  }
  if (request.action === 'dashboard-reconcile') return getMealDashboardWeek_(request.weekKey, true);
  if (['dashboard-ocr', 'dashboard-create'].indexOf(request.action) >= 0) assertMealDashboardAccess_(request.email, 'create');
  if (['dashboard-delete', 'dashboard-restore'].indexOf(request.action) >= 0) assertMealDashboardAccess_(request.email, 'manageResponses');
  if (request.action === 'dashboard-health') {
    if (role !== 'owner') throw new Error('Chỉ chủ sở hữu được kiểm tra cấu hình hệ thống.');
    return getMealDashboardHealth_(request.weekKey);
  }
  if (request.action === 'dashboard-script-auth') {
    if (role !== 'owner') throw new Error('Chỉ chủ sở hữu được cấp quyền Apps Script.');
    const authorization = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    const authorizationRequired = authorization.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED;
    return {
      authorizationRequired: authorizationRequired,
      authorizationUrl: authorizationRequired ? authorization.getAuthorizationUrl() : ''
    };
  }
  if (request.action === 'dashboard-overview') {
    lockScheduledMealForms_();
    return { role: role, permissions: permissions, weeks: getMealDashboardWeeks_(), allowedEmails: role === 'owner' ? getMealDashboardAllowedEmails_() : [], members: role === 'owner' ? getMealDashboardMembers_() : [] };
  }
  if (request.action === 'dashboard-week') {
    const week = getMealDashboardWeek_(request.weekKey);
    if (!permissions.manageResponses) {
      week.responses.forEach(function(response) { response.deletable = false; response.deleteToken = ''; });
      week.history.forEach(function(event) { event.restorable = false; });
    }
    return week;
  }
  if (request.action === 'dashboard-ocr') return analyzeMenuImage(request.image, request.email);
  if (request.action === 'dashboard-create') return createMealForm(request.menu, request.email);
  if (request.action === 'dashboard-add-email' || request.action === 'dashboard-remove-email') {
    return { allowedEmails: updateMealDashboardAccess_(request.email, request.targetEmail, request.action === 'dashboard-add-email'), members: getMealDashboardMembers_() };
  }
  if (request.action === 'dashboard-set-permissions') return { members: updateMealDashboardPermissions_(request.email, request.targetEmail, request.permissions), allowedEmails: getMealDashboardAllowedEmails_() };
  if (request.action === 'dashboard-delete') return deleteMealDashboardResponse_(request);
  if (request.action === 'dashboard-restore') return restoreMealDashboardResponse_(request);
  throw new Error('Thao tác dashboard không hợp lệ.');
}

function updateMealDashboardAccess_(actorEmail, targetEmail, add) {
  if (getMealDashboardAccessRole_(actorEmail) !== 'owner') throw new Error('Chỉ chủ sở hữu được quản lý Gmail.');
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
  const email = normalizeDashboardEmail_(targetEmail);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Địa chỉ Gmail không hợp lệ.');
  const owner = normalizeDashboardEmail_(PropertiesService.getScriptProperties().getProperty('MEAL_FORM_OWNER_EMAIL'));
  if (email === owner) throw new Error('Không thể thay đổi quyền của chủ sở hữu.');
  const properties = getMealFormRegistryProperties_();
  const emails = getMealDashboardAllowedEmails_();
  const index = emails.indexOf(email);
  const records = getMealDashboardPermissionRecords_();
  if (!records) throw new Error('Dữ liệu quyền bị lỗi; chủ sở hữu cần kiểm tra thủ công.');
  if (add && index < 0) { emails.push(email); records[email] = { view: true, create: false, manageResponses: false }; }
  if (!add && index >= 0) {
    emails.splice(index, 1);
    // Revoke membership before deleting the override, which would otherwise restore legacy rights.
    properties.setProperty('MEAL_DASHBOARD_ALLOWED_EMAILS', JSON.stringify(emails.sort()));
    delete records[email];
  }
  properties.setProperty('MEAL_DASHBOARD_PERMISSIONS', JSON.stringify(records));
  properties.setProperty('MEAL_DASHBOARD_ALLOWED_EMAILS', JSON.stringify(emails.sort()));
  return emails;
  } finally { lock.releaseLock(); }
}

function getMealDashboardHealth_(weekKey) {
  const checks = [];
  const check = function(id, label, read, guidance) {
    try { checks.push({ id: id, label: label, status: 'ok', message: read() }); }
    catch (error) { checks.push({ id: id, label: label, status: 'error', message: guidance }); }
  };
  check('permissions', 'Quyền Google', function() {
    const info = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    if (info.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) throw new Error('missing');
    return 'Đã cấp các quyền mà Apps Script đang yêu cầu.';
  }, 'Chủ sở hữu cần bấm Cấp quyền Apps Script và xác nhận các quyền còn thiếu.');
  check('folder', 'Thư mục lưu tuần', function() {
    DriveApp.getFolderById(getMealRootFolderId_()).getName();
    return 'Đọc được thư mục lưu Form và Sheet.';
  }, 'Kiểm tra quyền Drive và quyền truy cập thư mục lưu tuần.');
  check('ocr', 'Cấu hình OCR', function() {
    const config = getVilaoConfig_();
    if (!config.baseUrl.startsWith('https://')) throw new Error('invalid');
    return 'Đã có cấu hình OCR. Kiểm tra này không gửi ảnh hoặc gọi lượt đọc ảnh.';
  }, 'Chủ sở hữu cần kiểm tra khóa OCR, địa chỉ HTTPS và model trong Script Properties.');
  check('signatures', 'Cấu hình chữ ký API', function() {
    const properties = PropertiesService.getScriptProperties();
    if (!properties.getProperty('MEAL_VIEWER_HMAC_SECRET') || !properties.getProperty('MEAL_DASHBOARD_HMAC_SECRET')) throw new Error('missing');
    return 'Đã cấu hình chữ ký cho trang xem và Dashboard.';
  }, 'Chưa đủ cấu hình chữ ký API trong Apps Script.');
  check('permissions-data', 'Dữ liệu phân quyền', function() {
    if (!getMealDashboardPermissionRecords_() || getMealDashboardAllowedEmails_().some(function(email) { return !getMealDashboardPermissions_(email).view; })) throw new Error('invalid');
    return 'Dữ liệu quyền hợp lệ; Gmail cũ giữ quyền, Gmail mới chỉ xem.';
  }, 'Dữ liệu quyền không hợp lệ; quyền thành viên bị chặn an toàn. Chủ cần kiểm tra MEAL_DASHBOARD_PERMISSIONS trong User Properties.');
  const registry = getMealFormRegistry_();
  const selectedKey = cleanMealText_(weekKey) || Object.keys(registry).find(function(key) { return parseDateKey_(key.split('_')[0]) === getMealCalendarWeekStart_(0); });
  if (weekKey && !registry[selectedKey]) throw new Error('Tuần này chưa được đăng ký.');
  const item = selectedKey ? registry[selectedKey] : null;
  if (item) {
    check('sheet', 'Dữ liệu tuần đã chọn', function() {
      const sheet = SpreadsheetApp.openById(item.spreadsheetId);
      if (!sheet.getSheets().some(function(tab) { return Boolean(tab.getFormUrl()); })) throw new Error('missing');
      return 'Đọc được Sheet và tìm thấy trang câu trả lời liên kết Form.';
    }, 'Kiểm tra quyền Sheets và liên kết Form với trang câu trả lời của tuần đã chọn.');
    check('form', 'Form tuần đã chọn', function() {
      return FormApp.openById(item.formId).isAcceptingResponses() ? 'Form đang mở.' : 'Form đã đóng.';
    }, 'Kiểm tra quyền Forms và Form của tuần đã chọn còn tồn tại.');
  } else checks.push({ id: 'week', label: 'Sổ tuần', status: 'warning', message: 'Chưa có thực đơn tuần này. Chọn một tuần đã đăng ký để kiểm tra dữ liệu.' });
  check('auto-lock', 'Tự khóa khi bắt đầu tuần', function() {
    const triggerIds = ScriptApp.getProjectTriggers().map(function(trigger) { return trigger.getUniqueId(); });
    const missing = Object.keys(registry).some(function(key) {
      const entry = registry[key];
      const date = parseDateKey_(key.split('_')[0]);
      const deadline = getMealFormLockDeadline_(key, entry);
      return date && entry && !entry.locked && (new Date(deadline).getTime() <= Date.now() || entry.lockAt !== deadline || triggerIds.indexOf(entry.lockTriggerId) < 0);
    });
    if (missing) throw new Error('missing');
    return 'Các tuần đang chờ được khóa khi bắt đầu thứ Hai, theo giờ Việt Nam.';
  }, 'Chủ sở hữu cần chạy setupMealFormAutomation trong Apps Script để cập nhật lịch khóa.');
  return { checkedAt: Date.now(), timezone: 'Asia/Ho_Chi_Minh', weekName: item ? item.weekFolderName || selectedKey : '', checks: checks };
}

function dashboardTimestampMs_(value) {
  if (value && typeof value.getTime === 'function') return value.getTime();
  const number = Number(value);
  if (isFinite(number) && number > 0) return number;
  const parsed = new Date(value).getTime();
  return isFinite(parsed) ? parsed : 0;
}

function dashboardResponseMatches_(row, target, layout) {
  const timestampIndex = layout.timestampIndex >= 0 ? layout.timestampIndex : 0;
  const nameIndex = layout.nameIndex >= 0 ? layout.nameIndex : 1;
  return dashboardResponseTargetsMatch_({
    timestamp: row[timestampIndex],
    name: row[nameIndex],
    meals: layout.dayIndexes.map(function(column) { return row[column]; })
  }, target);
}

function dashboardResponseTargetsMatch_(left, right) {
  const leftTimestamp = dashboardTimestampMs_(left && left.timestamp);
  const rightTimestamp = dashboardTimestampMs_(right && right.timestamp);
  if (!leftTimestamp || !rightTimestamp || Math.floor(leftTimestamp / 1000) !== Math.floor(rightTimestamp / 1000)) return false;
  if (normalizeResponseName_(left.name) !== normalizeResponseName_(right.name)) return false;
  const leftMeals = Array.isArray(left.meals) ? left.meals : [];
  const rightMeals = Array.isArray(right.meals) ? right.meals : [];
  return leftMeals.length === rightMeals.length && leftMeals.every(function(meal, index) {
    return cleanMealText_(meal) === cleanMealText_(rightMeals[index]);
  });
}

function findDashboardResponseRow_(rows, target, layout) {
  const matches = findDashboardResponseRows_(rows, target, layout);
  return matches.length === 1 ? matches[0] : 0;
}

function findDashboardResponseRows_(rows, target, layout) {
  const matches = [];
  (rows || []).forEach(function(row, index) {
    if (dashboardResponseMatches_(row, target, layout)) matches.push(index + 2);
  });
  return matches;
}

function getMealDashboardHistorySheet_(spreadsheet, createIfMissing) {
  const headers = ['id', 'action', 'at', 'actor', 'entryId', 'responseId', 'originalTimestamp', 'name', 'mealsJson', 'restorePayloadJson', 'restorable', 'note'];
  let sheet = spreadsheet.getSheetByName('_DashboardHistory');
  if (sheet && !createIfMissing && sheet.getLastRow() === 0) return null;
  if (!sheet && !createIfMissing) return null;
  if (!sheet) { sheet = spreadsheet.insertSheet('_DashboardHistory'); sheet.getRange(1, 1, 1, headers.length).setValues([headers]); }
  else if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  else if (sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0].join('|') !== headers.join('|')) throw new Error('Cấu trúc lịch sử dashboard không hợp lệ; không thể thay đổi dữ liệu an toàn.');
  if (createIfMissing && !sheet.isSheetHidden()) sheet.hideSheet();
  return sheet;
}

function appendMealDashboardHistoryEvent_(sheet, event) {
  const id = Utilities.getUuid();
  sheet.appendRow([id, event.action, Date.now(), normalizeDashboardEmail_(event.actor), event.entryId || id,
    event.responseId || '', dashboardTimestampMs_(event.originalTimestamp), cleanMealText_(event.name),
    JSON.stringify(event.meals || []), event.restorePayloadJson || '', event.restorable === true, cleanMealText_(event.note)]);
  return { id: id, rowNumber: sheet.getLastRow() };
}

function updateMealDashboardHistoryEvent_(sheet, rowNumber, event) {
  sheet.getRange(rowNumber, 1, 1, 12).setValues([[
    event.id, event.action, event.at, event.actor, event.entryId, event.responseId || '',
    dashboardTimestampMs_(event.originalTimestamp), cleanMealText_(event.name),
    JSON.stringify(event.meals || []), event.restorePayloadJson || '', event.restorable === true, cleanMealText_(event.note)
  ]]);
}

function readMealDashboardHistory_(sheet) {
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues().map(function(row, index) {
    let meals = [];
    try { meals = JSON.parse(row[8] || '[]'); } catch (error) { /* Leave malformed history visible. */ }
    return { id: cleanMealText_(row[0]), action: cleanMealText_(row[1]), at: dashboardTimestampMs_(row[2]),
      actor: cleanMealText_(row[3]), entryId: cleanMealText_(row[4]), responseId: cleanMealText_(row[5]),
      originalTimestamp: dashboardTimestampMs_(row[6]), name: cleanMealText_(row[7]),
      meals: Array.isArray(meals) ? meals.map(cleanMealText_) : [], restorable: row[10] === true,
      note: cleanMealText_(row[11]), rowNumber: index + 2, restorePayloadJson: cleanMealText_(row[9]) };
  });
}

function dashboardResponseRestorePayload_(form, response) {
  const items = form.getItems();
  if (form.collectsEmail() || items.some(function(item) { return /e-?mail|gmail|địa chỉ.*thư/i.test(cleanMealText_(item.getTitle())); })) return { restorable: false, reason: 'Form có trường thu thập email; không lưu email để khôi phục.' };
  const supported = [FormApp.ItemType.TEXT, FormApp.ItemType.MULTIPLE_CHOICE];
  if (items.some(function(item) { return supported.indexOf(item.getType()) < 0; })) return { restorable: false, reason: 'Form có loại câu hỏi chưa hỗ trợ khôi phục.' };
  const responses = response.getItemResponses();
  if (responses.length !== items.length) return { restorable: false, reason: 'Form thiếu câu trả lời hoặc đã đổi cấu trúc.' };
  const values = responses.map(function(itemResponse) {
    const question = itemResponse.getItem();
    const type = question.getType();
    return { itemId: question.getId(), type: String(type), value: String(itemResponse.getResponse() == null ? '' : itemResponse.getResponse()) };
  });
  return { restorable: true, payloadJson: JSON.stringify(values), reason: '' };
}

function getMealDashboardHistoryForClient_(sheet) {
  if (!sheet) return [];
  return readMealDashboardHistory_(sheet).sort(function(left, right) { return right.at - left.at; }).slice(0, 50)
    .map(function(event) {
      return {
        id: event.id, action: event.action, at: event.at, actor: event.actor, entryId: event.entryId,
        responseId: event.responseId, originalTimestamp: event.originalTimestamp, name: event.name,
        meals: event.meals, restorable: event.restorable, note: event.note
      };
    });
}

function getMealDashboardWeeks_() {
  const registry = getMealFormRegistry_();
  return Object.keys(registry).map(function(weekKey) {
    const item = registry[weekKey];
    if (!item || !isLiveMealFile_(item.formId) || !isLiveMealFile_(item.spreadsheetId)) return null;
    try {
      const spreadsheet = SpreadsheetApp.openById(item.spreadsheetId);
      const responseSheet = spreadsheet.getSheets().find(function(sheet) { return Boolean(sheet.getFormUrl()); });
      const responseCount = responseSheet ? Math.max(responseSheet.getLastRow() - 1, 0) : 0;
      const form = FormApp.openById(item.formId);
      return {
        weekKey: weekKey,
        name: item.weekFolderName || spreadsheet.getName(),
        responseCount: responseCount,
        formStatus: form.isAcceptingResponses() ? 'open' : 'closed',
        formUrl: cleanMealText_(item.responseUrl) || form.getPublishedUrl(),
        spreadsheetUrl: item.spreadsheetUrl || spreadsheet.getUrl(),
        folderUrl: item.weekFolderUrl || '',
        lockAt: getMealFormLockDeadline_(weekKey, item)
      };
    } catch (error) {
      return {
        weekKey: weekKey,
        name: item.weekFolderName || 'Tuần chưa rõ tên',
        responseCount: null,
        formStatus: 'unknown',
        formUrl: item.responseUrl || '',
        spreadsheetUrl: item.spreadsheetUrl || '',
        folderUrl: item.weekFolderUrl || '',
        lockAt: getMealFormLockDeadline_(weekKey, item),
        error: 'Không đọc được trạng thái tuần.'
      };
    }
  }).filter(Boolean).sort(function(left, right) {
    return String(right.weekKey).localeCompare(String(left.weekKey));
  });
}

function getMealHistoryWeeks_() {
  const registry = getMealFormRegistry_();
  const current = getMealCalendarWeekStart_(0);
  return Object.keys(registry).map(function(key) {
    const item = registry[key];
    const start = parseDateKey_(key.split('_')[0]);
    if (!start || start >= current || !item || !isLiveMealFile_(item.formId) || !isLiveMealFile_(item.spreadsheetId)) return null;
    const end = addDateKey_(start, 4);
    return { weekKey: key, name: item.weekFolderName || 'Tuần ' + formatMealFolderDate_(start) + ' - ' + formatMealFolderDate_(end), startDate: start, endDate: end };
  }).filter(Boolean).sort(function(left, right) { return right.startDate.localeCompare(left.startDate); });
}

function getMealHistoryViewerData_(weekKey, forceRefresh) {
  const key = cleanMealText_(weekKey);
  const registry = getMealFormRegistry_();
  const item = registry[key];
  if (!item || !isLiveMealFile_(item.formId) || !isLiveMealFile_(item.spreadsheetId)) throw new Error('Không tìm thấy tuần đã đăng ký.');
  const start = parseDateKey_(key.split('_')[0]);
  if (!start || start >= getMealCalendarWeekStart_(0)) throw new Error('Chỉ xem tuần cũ trong kho thực đơn.');
  return getViewerData_(item.spreadsheetId, forceRefresh);
}

function dashboardResponseTarget_(response, layout, headers, itemTitles) {
  const answers = response.getItemResponses();
  const titles = answers.map(function(answer) {
    try {
      const item = answer.getItem();
      const id = itemTitles ? String(item.getId()) : '';
      if (itemTitles && itemTitles[id] !== undefined) return itemTitles[id];
      const title = normalizeResponseHeader_(item.getTitle());
      if (itemTitles) itemTitles[id] = title;
      return title;
    } catch (error) { return ''; }
  });
  const hasTitles = titles.some(Boolean);
  const responseForColumn = function(column, fallbackIndex) {
    const title = normalizeResponseHeader_((headers || [])[column]);
    const titleIndex = title ? titles.indexOf(title) : -1;
    if (titleIndex >= 0) return answers[titleIndex].getResponse();
    return hasTitles ? '' : (answers[fallbackIndex] ? answers[fallbackIndex].getResponse() : '');
  };
  const fallbackName = answers[0] && !/E-?MAIL|GMAIL|THU.*DIEN.*TU/i.test(titles[0]) ? answers[0].getResponse() : '';
  const name = responseForColumn(layout.nameIndex, 0) || fallbackName;
  return {
    timestamp: response.getTimestamp(),
    name: name,
    meals: layout.dayIndexes.map(function(column, index) { return responseForColumn(column, index + 1); })
  };
}

function getMealDashboardWeek_(weekKey, onlyReconciliation) {
  const key = cleanMealText_(weekKey);
  const item = getMealFormRegistry_()[key];
  if (!item || !isLiveMealFile_(item.spreadsheetId) || !isLiveMealFile_(item.formId)) throw new Error('Không tìm thấy tuần đã đăng ký.');
  const spreadsheet = SpreadsheetApp.openById(item.spreadsheetId);
  const sheet = spreadsheet.getSheets().find(function(value) { return Boolean(value.getFormUrl()); });
  if (!sheet) throw new Error('Không tìm thấy trang câu trả lời của tuần.');
  const columnCount = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, columnCount).getDisplayValues()[0];
  const layout = getResponseLayout_(headers);
  const rowCount = Math.max(sheet.getLastRow() - 1, 0);
  const rows = rowCount ? sheet.getRange(2, 1, rowCount, columnCount).getValues() : [];
  const form = FormApp.openById(item.formId);
  const formResponses = form.getResponses();
  const itemTitles = Object.create(null);
  const formTargets = formResponses.map(function(response) { return dashboardResponseTarget_(response, layout, headers, itemTitles); });
  const candidateRows = formTargets.map(function(target) { return findDashboardResponseRows_(rows, target, layout); });
  const rowUses = rows.map(function(_row, index) { return candidateRows.filter(function(matches) { return matches.indexOf(index + 2) >= 0; }).length; });
  const issues = [];
  const responses = formResponses.map(function(response, index) {
    const target = formTargets[index];
    const responseId = cleanMealText_(response.getId());
    const matches = candidateRows[index];
    const rowNumber = responseId && matches.length === 1 && rowUses[matches[0] - 2] === 1 ? matches[0] : 0;
    if (!rowNumber) issues.push({ kind: matches.length ? 'ambiguous' : 'form-only', source: 'form', name: cleanMealText_(target.name), timestamp: dashboardTimestampMs_(target.timestamp), meals: target.meals.map(cleanMealText_), rows: matches });
    return { responseId: responseId, timestamp: dashboardTimestampMs_(target.timestamp), name: cleanMealText_(target.name),
      meals: target.meals.map(cleanMealText_), rowNumber: rowNumber, deletable: Boolean(responseId && rowNumber),
      deleteToken: !onlyReconciliation && responseId && rowNumber ? createMealDashboardDeleteToken_(key, responseId, target) : '',
      note: responseId && rowNumber ? '' : 'Không ghép được duy nhất phản hồi Form với hàng Sheet; không thể xóa an toàn.' };
  });
  rows.forEach(function(row, index) {
    const target = { timestamp: row[layout.timestampIndex], name: row[layout.nameIndex], meals: layout.dayIndexes.map(function(column) { return row[column]; }) };
    if (rowUses[index] !== 1 || candidateRows.some(function(matches) { return matches.length !== 1 && matches.indexOf(index + 2) >= 0; })) issues.push({ kind: rowUses[index] ? 'ambiguous' : 'sheet-only', source: 'sheet', name: cleanMealText_(target.name), timestamp: dashboardTimestampMs_(target.timestamp), meals: target.meals.map(cleanMealText_), rows: [index + 2] });
    const stillInForm = formTargets.some(function(target) { return dashboardResponseMatches_(row, target, layout); });
    if (stillInForm) return;
    const matches = findDashboardResponseRows_(rows, target, layout);
    const responseId = 'sheet-orphan-' + (index + 2);
    responses.push({
      responseId: responseId, timestamp: dashboardTimestampMs_(target.timestamp), name: cleanMealText_(target.name),
      meals: target.meals.map(cleanMealText_), rowNumber: index + 2, partial: true, deletable: matches.length === 1,
      deleteToken: !onlyReconciliation && matches.length === 1 ? createMealDashboardDeleteToken_(key, responseId, target) : '',
      note: matches.length === 1 ? '' : 'Có nhiều hàng Sheet giống nhau; cần kiểm tra thủ công.'
    });
  });
  responses.sort(function(left, right) { return right.timestamp - left.timestamp; });
  const reconciliation = { formCount: formResponses.length, sheetCount: rowCount, matchedCount: candidateRows.filter(function(matches) { return matches.length === 1 && rowUses[matches[0] - 2] === 1; }).length, issues: issues };
  if (onlyReconciliation) return reconciliation;
  return { week: { weekKey: key, name: item.weekFolderName || spreadsheet.getName(), formUrl: cleanMealText_(item.responseUrl) || form.getPublishedUrl(),
      spreadsheetUrl: item.spreadsheetUrl || spreadsheet.getUrl(), folderUrl: item.weekFolderUrl || '',
      formStatus: form.isAcceptingResponses() ? 'open' : 'closed', lockAt: getMealFormLockDeadline_(key, item) }, responseCount: rowCount, responses: responses, reconciliation: reconciliation, history: getMealDashboardHistoryForClient_(getMealDashboardHistorySheet_(spreadsheet, false)) };
}

function createMealDashboardDeleteToken_(weekKey, responseId, target) {
  const secret = PropertiesService.getScriptProperties().getProperty('MEAL_DASHBOARD_HMAC_SECRET');
  if (!secret) throw new Error('Chưa cấu hình chữ ký dashboard.');
  const payload = JSON.stringify({ weekKey: weekKey, responseId: responseId, issuedAt: Date.now(), timestamp: dashboardTimestampMs_(target.timestamp),
    name: cleanMealText_(target.name), meals: (target.meals || []).map(cleanMealText_) });
  return Utilities.base64EncodeWebSafe(payload, Utilities.Charset.UTF_8) + '.' + mealViewerHmacHex_(payload, secret);
}

function readMealDashboardDeleteToken_(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2 || !/^[a-f0-9]{64}$/i.test(parts[1])) throw new Error('Lượt gửi đã thay đổi; hãy tải lại danh sách.');
  const secret = PropertiesService.getScriptProperties().getProperty('MEAL_DASHBOARD_HMAC_SECRET');
  if (!secret) throw new Error('Chưa cấu hình chữ ký dashboard.');
  const payload = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString('UTF-8');
  if (!constantTimeMealViewerEqual_(mealViewerHmacHex_(payload, secret), parts[1].toLowerCase())) throw new Error('Mã xác nhận lượt gửi không hợp lệ.');
  const target = JSON.parse(payload);
  if (!isFinite(Number(target.issuedAt)) || Date.now() - Number(target.issuedAt) > 900000 || Number(target.issuedAt) - Date.now() > 300000) {
    throw new Error('Mã xác nhận đã hết hạn; hãy tải lại danh sách lượt gửi.');
  }
  return target;
}

function deleteMealDashboardResponse_(request) {
  const target = readMealDashboardDeleteToken_(request.deleteToken);
  const weekKey = cleanMealText_(request.weekKey);
  const responseId = cleanMealText_(request.responseId);
  if (target.weekKey !== weekKey || target.responseId !== responseId) throw new Error('Lượt gửi đã thay đổi; hãy tải lại danh sách.');
  const item = getMealFormRegistry_()[weekKey];
  if (!item || !isLiveMealFile_(item.spreadsheetId) || !isLiveMealFile_(item.formId)) throw new Error('Tuần này không còn trong sổ tuần.');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const spreadsheet = SpreadsheetApp.openById(item.spreadsheetId);
    const responseSheet = spreadsheet.getSheets().find(function(value) { return Boolean(value.getFormUrl()); });
    if (!responseSheet) throw new Error('Không tìm thấy trang câu trả lời của tuần.');
    const columnCount = responseSheet.getLastColumn();
    const headers = responseSheet.getRange(1, 1, 1, columnCount).getDisplayValues()[0];
    const layout = getResponseLayout_(headers);
    const form = FormApp.openById(item.formId);
    const currentResponses = form.getResponses();
    const formResponse = currentResponses.find(function(value) { return cleanMealText_(value.getId()) === responseId; }) || null;
    if (formResponse && dashboardResponseFingerprint_(dashboardResponseTarget_(formResponse, layout, headers)) !== dashboardResponseFingerprint_(target)) throw new Error('Lượt gửi đã thay đổi; hãy tải lại danh sách.');
    const sameSecond = currentResponses.filter(function(value) { return Math.floor(dashboardTimestampMs_(value.getTimestamp()) / 1000) === Math.floor(dashboardTimestampMs_(target.timestamp) / 1000); });
    const matchingForms = sameSecond.filter(function(value) { return dashboardResponseTargetsMatch_(dashboardResponseTarget_(value, layout, headers), target); });
    if (formResponse && matchingForms.length !== 1) throw new Error('Phản hồi Form ghép không duy nhất; dữ liệu chưa bị xóa.');
    if (!formResponse && matchingForms.length) throw new Error('Lượt gửi đã thay đổi; hãy tải lại danh sách.');
    const rowCount = Math.max(responseSheet.getLastRow() - 1, 0);
    const rows = rowCount ? responseSheet.getRange(2, 1, rowCount, columnCount).getValues() : [];
    const matchingRows = findDashboardResponseRows_(rows, target, layout);
    const rowNumber = matchingRows.length === 1 ? matchingRows[0] : 0;
    if (formResponse && !rowNumber) throw new Error('Không tìm thấy hàng Sheet duy nhất cho lượt gửi này; có thể không tồn tại hoặc bị trùng. Dữ liệu chưa bị xóa.');
    if (!formResponse && matchingRows.length > 1) throw new Error('Có nhiều hàng Sheet trùng lượt gửi còn sót; cần kiểm tra thủ công, không có dữ liệu nào bị xóa.');
    if (!formResponse && !rowNumber) return { deleted: true, alreadyDeleted: true };
    const historySheet = getMealDashboardHistorySheet_(spreadsheet, true);
    const snapshot = formResponse ? dashboardResponseRestorePayload_(form, formResponse) : { restorable: false, reason: 'Lượt Form đã mất trước khi xóa hàng Sheet; không thể khôi phục đầy đủ.' };
    const audit = appendMealDashboardHistoryEvent_(historySheet, {
      action: 'delete-pending', actor: request.email, responseId: responseId,
      originalTimestamp: target.timestamp, name: target.name, meals: target.meals,
      restorePayloadJson: snapshot.payloadJson || '', restorable: snapshot.restorable, note: snapshot.reason || ''
    });
    const auditEvent = {
      id: audit.id, at: Date.now(), actor: normalizeDashboardEmail_(request.email), entryId: audit.id,
      responseId: responseId, originalTimestamp: target.timestamp, name: target.name,
      meals: target.meals, restorePayloadJson: snapshot.payloadJson || '', restorable: snapshot.restorable, note: snapshot.reason || ''
    };
    let formDeleted = false;
    try {
      if (formResponse) { form.deleteResponse(responseId); formDeleted = true; }
      if (rowNumber) responseSheet.deleteRow(rowNumber);
    } catch (error) {
      auditEvent.action = formDeleted ? 'partial' : 'delete-review';
      auditEvent.restorable = false;
      auditEvent.note = formDeleted ? 'Form đã xóa nhưng Sheet chưa xóa; cần kiểm tra thủ công.' : 'Không xác nhận được thao tác xóa Form; hãy kiểm tra Form và Sheet trước khi thử lại. ' + cleanMealText_(error && error.message);
      updateMealDashboardHistoryEvent_(historySheet, audit.rowNumber, auditEvent);
      if (formDeleted) throw new Error('Phản hồi Form đã xóa nhưng Sheet chưa xóa. Hãy tải lại và kiểm tra lịch sử để xử lý tiếp.');
      throw error;
    }
    auditEvent.action = snapshot.restorable ? 'deleted' : 'not-restorable';
    updateMealDashboardHistoryEvent_(historySheet, audit.rowNumber, auditEvent);
    try { CacheService.getScriptCache().remove('meal-viewer-v2:' + item.spreadsheetId); } catch (error) { /* Cache is best effort. */ }
    return { deleted: true, alreadyDeleted: false, restorable: snapshot.restorable, note: snapshot.reason || '' };
  } finally { lock.releaseLock(); }
}

function restoreMealDashboardResponse_(request) {
  const weekKey = cleanMealText_(request.weekKey);
  const entryId = cleanMealText_(request.entryId);
  if (!/^[a-f0-9-]{20,50}$/i.test(entryId)) throw new Error('Lịch sử khôi phục không hợp lệ.');
  const item = getMealFormRegistry_()[weekKey];
  if (!item || !isLiveMealFile_(item.spreadsheetId) || !isLiveMealFile_(item.formId)) throw new Error('Tuần này không còn trong sổ tuần.');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const spreadsheet = SpreadsheetApp.openById(item.spreadsheetId);
    const responseSheet = spreadsheet.getSheets().find(function(value) { return Boolean(value.getFormUrl()); });
    const historySheet = getMealDashboardHistorySheet_(spreadsheet, false);
    if (!responseSheet || !historySheet) throw new Error('Không tìm thấy phản hồi hoặc lịch sử của tuần.');
    const history = readMealDashboardHistory_(historySheet);
    const matches = history.filter(function(event) { return event.id === entryId && event.entryId === entryId && event.action === 'deleted'; });
    if (matches.length !== 1 || !matches[0].restorable || !matches[0].restorePayloadJson) throw new Error('Lượt này không thể khôi phục hoặc lịch sử đã thay đổi.');
    if (history.some(function(event) { return event.entryId === entryId && /^restore-/.test(event.action) || event.entryId === entryId && event.action === 'restored'; })) throw new Error('Lượt này đã được khôi phục hoặc đang cần kiểm tra.');
    const deleted = matches[0];
    const columnCount = responseSheet.getLastColumn();
    const headers = responseSheet.getRange(1, 1, 1, columnCount).getDisplayValues()[0];
    const layout = getResponseLayout_(headers);
    const form = FormApp.openById(item.formId);
    if (!form.isAcceptingResponses()) throw new Error('Form đang đóng. Mở Form rồi tải lại Dashboard để khôi phục; hệ thống sẽ không tự mở Form ra công khai.');
    const formItems = form.getItems();
    const supported = [FormApp.ItemType.TEXT, FormApp.ItemType.MULTIPLE_CHOICE];
    if (form.collectsEmail() || formItems.some(function(question) { return /e-?mail|gmail|địa chỉ.*thư/i.test(cleanMealText_(question.getTitle())) || supported.indexOf(question.getType()) < 0; })) throw new Error('Form hiện đã có trường email hoặc loại câu hỏi không hỗ trợ; không thể khôi phục an toàn.');
    const rowCount = Math.max(responseSheet.getLastRow() - 1, 0);
    const rows = rowCount ? responseSheet.getRange(2, 1, rowCount, columnCount).getValues() : [];
    const nameIndex = layout.nameIndex >= 0 ? layout.nameIndex : 1;
    const wantedName = normalizeResponseName_(deleted.name);
    if (form.getResponses().some(function(value) { return normalizeResponseName_(dashboardResponseTarget_(value, layout, headers).name) === wantedName; }) || rows.some(function(row) { return normalizeResponseName_(row[nameIndex]) === wantedName; })) throw new Error('Đã có lượt đang hoạt động cùng tên. Hãy kiểm tra danh sách trước khi khôi phục để tránh ghi đè lượt mới hơn.');
    let archivedItems;
    try { archivedItems = JSON.parse(deleted.restorePayloadJson); } catch (error) { archivedItems = null; }
    if (!Array.isArray(archivedItems) || archivedItems.length !== formItems.length) throw new Error('Cấu trúc Form đã đổi từ lúc xóa; không thể khôi phục an toàn.');
    const response = form.createResponse();
    archivedItems.forEach(function(saved) {
      const itemId = Number(saved.itemId);
      if (!isFinite(itemId) || !/^(TEXT|MULTIPLE_CHOICE)$/.test(saved.type)) throw new Error('Dữ liệu lịch sử không hợp lệ.');
      const question = form.getItemById(itemId);
      if (!question || String(question.getType()) !== saved.type) throw new Error('Cấu trúc Form đã đổi từ lúc xóa; không thể khôi phục an toàn.');
      const itemResponse = saved.type === 'TEXT' ? question.asTextItem().createResponse(String(saved.value)) : question.asMultipleChoiceItem().createResponse(String(saved.value));
      response.withItemResponse(itemResponse);
    });
    const audit = appendMealDashboardHistoryEvent_(historySheet, { action: 'restore-pending', actor: request.email,
      entryId: entryId, originalTimestamp: deleted.originalTimestamp, name: deleted.name, meals: deleted.meals,
      note: 'Đang khôi phục; thời điểm gửi mới sẽ khác thời điểm gửi gốc.' });
    const restoreEvent = { id: audit.id, at: Date.now(), actor: normalizeDashboardEmail_(request.email), entryId: entryId,
      responseId: '', originalTimestamp: deleted.originalTimestamp, name: deleted.name, meals: deleted.meals,
      restorable: false, note: 'Đang khôi phục; thời điểm gửi mới sẽ khác thời điểm gửi gốc.' };
    let submitted;
    try { submitted = response.submit(); }
    catch (error) {
      restoreEvent.action = 'restore-review';
      restoreEvent.note = 'Không xác định chắc chắn Form đã nhận phản hồi hay chưa. Không bấm khôi phục lại; hãy kiểm tra Form và Sheet. ' + cleanMealText_(error && error.message);
      updateMealDashboardHistoryEvent_(historySheet, audit.rowNumber, restoreEvent);
      throw new Error('Khôi phục chưa xác nhận được. Lịch sử đã được đánh dấu cần kiểm tra để tránh tạo trùng.');
    }
    const restoredTarget = dashboardResponseTarget_(submitted, layout, headers);
    const currentCount = Math.max(responseSheet.getLastRow() - 1, 0);
    const currentRows = currentCount ? responseSheet.getRange(2, 1, currentCount, columnCount).getValues() : [];
    const matchingRows = findDashboardResponseRows_(currentRows, restoredTarget, layout);
    if (!submitted.getId() || !form.getResponses().some(function(value) { return cleanMealText_(value.getId()) === cleanMealText_(submitted.getId()); }) || matchingRows.length !== 1) {
      restoreEvent.action = 'restore-review'; restoreEvent.responseId = cleanMealText_(submitted.getId());
      restoreEvent.note = 'Form đã nhận phản hồi nhưng không ghép được duy nhất với Sheet; cần kiểm tra thủ công.';
      updateMealDashboardHistoryEvent_(historySheet, audit.rowNumber, restoreEvent);
      throw new Error('Form đã khôi phục nhưng chưa xác nhận được đúng một hàng Sheet; lịch sử được đánh dấu cần kiểm tra.');
    }
    restoreEvent.action = 'restored'; restoreEvent.responseId = cleanMealText_(submitted.getId());
    restoreEvent.note = 'Đã khôi phục. Form ghi thời điểm gửi mới; thời điểm gốc vẫn được giữ trong lịch sử.';
    updateMealDashboardHistoryEvent_(historySheet, audit.rowNumber, restoreEvent);
    try { CacheService.getScriptCache().remove('meal-viewer-v2:' + item.spreadsheetId); } catch (error) { /* Cache is best effort. */ }
    return { restored: true, responseId: restoreEvent.responseId, timestamp: dashboardTimestampMs_(submitted.getTimestamp()) };
  } finally { lock.releaseLock(); }
}

function dashboardResponseFingerprint_(target) {
  return JSON.stringify([
    dashboardTimestampMs_(target.timestamp),
    normalizeResponseName_(target.name),
    (target.meals || []).map(cleanMealText_)
  ]);
}

function analyzeMenuImage(dataUrl, dashboardEmail) {
  if (dashboardEmail) assertMealDashboardAccess_(dashboardEmail, 'create');
  else assertMealFormOwner_();
  const image = parseImageDataUrl_(dataUrl);
  const config = getVilaoConfig_();

  const payload = {
    model: config.model,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Đọc bảng thực đơn tiếng Việt trong ảnh. Chỉ lấy Món 1, Món 2, Món 3 từ Thứ 2 đến Thứ 6. Giữ nguyên dấu tiếng Việt và ngày tháng. Không lấy món sáng, đồ xào, món canh hoặc tráng miệng. Nếu thiếu tên một món, giữ chỗ đó bằng chuỗi rỗng; mỗi ngày vẫn có tối đa 3 vị trí món. Chỉ trả về JSON hợp lệ, không markdown, theo dạng {"title":"...","days":[{"day":"Thứ 2","date":"...","meals":["...","...","..."]}]}.' },
        { type: 'image_url', image_url: { url: 'data:' + image.mimeType + ';base64,' + image.data } }
      ]
    }]
  };
  const url = config.baseUrl + '/chat/completions';
  const options = {
    method: 'post', contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + config.apiKey },
    payload: JSON.stringify(payload), muteHttpExceptions: true
  };
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = UrlFetchApp.fetch(url, options);
    const status = response.getResponseCode();
    if (status === 200) break;
    if (!shouldRetryApi_(status) || attempt === 2) {
      throw new Error('ViLao không đọc được ảnh (HTTP ' + status + '): ' + response.getContentText().slice(0, 300));
    }
    Utilities.sleep([1000, 3000][attempt]);
  }
  const body = JSON.parse(response.getContentText());
  const text = extractVilaoText_(body);
  if (!text) throw new Error('ViLao không trả về thực đơn.');
  return normalizeMenu_(parseModelJson_(text), true);
}

function extractVilaoText_(body) {
  const content = body && body.choices && body.choices[0] && body.choices[0].message && body.choices[0].message.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(function(part) {
      return typeof part === 'string' ? part : (part && (part.text || part.content) || '');
    }).join('');
  }
  return '';
}

function parseModelJson_(value) {
  const text = String(value || '').trim().replace(/^\x60{3}(?:json)?\s*/i, '').replace(/\s*\x60{3}$/, '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  return JSON.parse(start >= 0 && end > start ? text.slice(start, end + 1) : text);
}

function parseImageDataUrl_(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error('Chỉ hỗ trợ ảnh PNG, JPEG hoặc WEBP.');
  if (match[2].length > 14 * 1024 * 1024) throw new Error('Ảnh quá lớn; hãy dùng ảnh dưới 10 MB.');
  return { mimeType: match[1], data: match[2] };
}

function initializeMealFormOwner() {
  return initializeMealFormOwner_();
}

function authorizeMealViewerAccess() {
  ScriptApp.requireAllScopes(ScriptApp.AuthMode.FULL);
  return DriveApp.getFolderById(getMealRootFolderId_()).getName();
}

// TẠO FORM VÀ KIỂM TRA THỰC ĐƠN

function createMealForm(menu, dashboardEmail) {
  if (dashboardEmail) assertMealDashboardAccess_(dashboardEmail, 'create');
  else assertMealFormOwner_();
  const normalized = normalizeMenu_(menu);
  validateMenuDates_(normalized);
  DriveApp.getFolderById(getMealRootFolderId_()).getName();
  getMealViewerOrigin_();
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    disableCleanupTriggers_();
    const weekKey = getMenuWeekKey_(normalized);
    const existing = findRegisteredMealForm_(weekKey);
    if (existing) {
      ensureMealFormLockTrigger_(weekKey);
      ensureFormSubmitTrigger_(existing.spreadsheetId);
      return {
        alreadyExists: true,
        message: 'Tuần này đã có Form.',
        editUrl: existing.editUrl,
        responseUrl: existing.responseUrl,
        spreadsheetUrl: existing.spreadsheetUrl,
        weekFolderId: existing.weekFolderId || '',
        weekFolderUrl: existing.weekFolderUrl || '',
        weekFolderName: existing.weekFolderName || '',
        viewerUrl: getViewerUrl_(existing.spreadsheetId, normalized)
      };
    }

    const spec = buildFormSpec_(normalized);
    const form = FormApp.create(spec.title).setDescription(spec.description);
    form.setCollectEmail(false);
    spec.items.forEach(function(item) {
      if (item.type === 'text') {
        form.addTextItem().setTitle(item.title).setRequired(item.required);
        return;
      }
      const question = form.addMultipleChoiceItem().setTitle(item.title).setRequired(item.required);
      question.setChoices(item.choices.map(function(choice) { return question.createChoice(choice); }));
    });
      const spreadsheet = SpreadsheetApp.create('Ăn bán trú - ' + spec.description);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
    SpreadsheetApp.flush();

    let responseSheet = null;
    for (let attempt = 0; attempt < 10 && !responseSheet; attempt++) {
      responseSheet = spreadsheet.getSheets().find(function(sheet) { return Boolean(sheet.getFormUrl()); }) || null;
      if (!responseSheet) Utilities.sleep(250);
    }
    if (responseSheet) {
      const detectedColumnCount = typeof responseSheet.getLastColumn === 'function' ? Number(responseSheet.getLastColumn()) : 0;
      const responseColumnCount = Math.max(spec.items.length + 1, isFinite(detectedColumnCount) ? detectedColumnCount : 0);
      formatResponseSheet_(responseSheet, responseColumnCount);
      createSummarySheet_(spreadsheet, responseSheet, normalized, responseColumnCount);
    }

    const weekFolder = createMealWeekFolder_(normalized, form, spreadsheet);

    const result = {
      editUrl: form.getEditUrl(),
      responseUrl: form.getPublishedUrl(),
      spreadsheetUrl: spreadsheet.getUrl(),
      weekFolderId: weekFolder.id,
      weekFolderUrl: weekFolder.url,
      weekFolderName: weekFolder.name,
      viewerUrl: getViewerUrl_(spreadsheet.getId(), normalized)
    };
    registerMealForm_(weekKey, {
      formId: form.getId(),
      spreadsheetId: spreadsheet.getId(),
      weekFolderId: weekFolder.id,
      weekFolderUrl: weekFolder.url,
      weekFolderName: weekFolder.name,
      lockAt: getMealFormLockAt_(normalized),
      editUrl: result.editUrl,
      responseUrl: result.responseUrl,
      spreadsheetUrl: result.spreadsheetUrl
    });
    ensureMealFormLockTrigger_(weekKey);
    ensureFormSubmitTrigger_(spreadsheet.getId());
    return result;
  } finally {
    lock.releaseLock();
  }
}

function formatMealFolderDate_(value) {
  const key = parseDateKey_(value);
  if (!key) return cleanMealText_(value);
  const parts = key.split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function getMealWeekFolderName_(menu) {
  const days = menu && Array.isArray(menu.days) ? menu.days : [];
  const first = days.length ? formatMealFolderDate_(days[0] && days[0].date) : '';
  const last = days.length ? formatMealFolderDate_(days[days.length - 1] && days[days.length - 1].date) : '';
  if (!first || !last) throw new Error('Không xác định được khoảng ngày của tuần để tạo thư mục.');
  return 'Tuần ' + first + ' - ' + last;
}

function createMealWeekFolder_(menu, form, spreadsheet) {
  if (!form || !spreadsheet) throw new Error('Thiếu Form hoặc Spreadsheet để lưu vào thư mục tuần.');
  const rootFolder = DriveApp.getFolderById(getMealRootFolderId_());
  const folder = rootFolder.createFolder(getMealWeekFolderName_(menu));
  DriveApp.getFileById(form.getId()).moveTo(folder);
  DriveApp.getFileById(spreadsheet.getId()).moveTo(folder);
  return { id: folder.getId(), url: folder.getUrl(), name: folder.getName() };
}

function getMenuWeekKey_(menu) {
  const days = menu && Array.isArray(menu.days) ? menu.days : [];
  const dates = days.map(function(day) { return parseDateKey_(day && day.date); });
  return dates.length === 5 && dates.every(function(date) { return Boolean(date); }) ? dates.join('_') : '';
}

function validateMenuDates_(menu) {
  const days = menu && Array.isArray(menu.days) ? menu.days : [];
  const dates = days.map(function(day) { return parseDateKey_(day && day.date); });
  if (dates.length !== 5 || dates.some(function(date) { return !date; })) {
    throw new Error('Mỗi ngày trong thực đơn phải có ngày hợp lệ từ Thứ 2 đến Thứ 6.');
  }
  const firstParts = dates[0].split('-').map(Number);
  const firstDate = new Date(Date.UTC(firstParts[0], firstParts[1] - 1, firstParts[2]));
  if (firstDate.getUTCDay() !== 1) throw new Error('Ngày Thứ 2 phải là thứ Hai.');
  dates.forEach(function(date, index) {
    if (date !== addDateKey_(dates[0], index)) {
      throw new Error('Các ngày phải liên tiếp từ Thứ 2 đến Thứ 6.');
    }
  });
  return dates;
}

function getMealFormLockAt_(menu) {
  const days = menu && Array.isArray(menu.days) ? menu.days : [];
  const firstDate = days.length ? parseDateKey_(days[0] && days[0].date) : '';
  return firstDate ? firstDate + 'T00:00:00+07:00' : '';
}

function parseDateKey_(value) {
  const text = cleanMealText_(value);
  let match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  let day;
  let month;
  let year;
  if (match) {
    day = Number(match[1]); month = Number(match[2]); year = Number(match[3]);
  } else {
    match = text.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
    if (!match) return '';
    year = Number(match[1]); month = Number(match[2]); day = Number(match[3]);
  }
  if (year < 2000 || month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return '';
  return String(year).padStart(4, '0') + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
}

function addDateKey_(dateKey, days) {
  const parts = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  date.setUTCDate(date.getUTCDate() + Number(days));
  return date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0') + '-' + String(date.getUTCDate()).padStart(2, '0');
}

function normalizeMenu_(menu, reviewOnly = false) {
  const days = menu && Array.isArray(menu.days) ? menu.days : [];
  if (days.length !== 5) throw new Error('Cần đủ 5 ngày từ Thứ 2 đến Thứ 6.');
  const expected = ['THU 2', 'THU 3', 'THU 4', 'THU 5', 'THU 6'];
  const normalizedDays = days.map(function(day, index) {
    const label = cleanMealText_(day && day.day);
    const plainLabel = label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    if (!plainLabel.includes(expected[index])) throw new Error('Các ngày phải theo thứ tự từ Thứ 2 đến Thứ 6.');
    const mealSlots = day && Array.isArray(day.meals) ? day.meals.map(cleanMealText_) : [];
    if (mealSlots.length > 3) throw new Error(label + ' có tối đa 3 món.');
    const meals = reviewOnly ? mealSlots : mealSlots.filter(Boolean);
    if (!reviewOnly && meals.length < 2) throw new Error(label + ' cần ít nhất 2 món.');
    return { day: label, date: cleanMealText_(day.date), meals: meals };
  });
  return { title: cleanMealText_(menu.title), days: normalizedDays };
}

function buildFormSpec_(menu) {
  return {
    title: 'Ăn bán trú',
    description: menu.title || 'Chọn món ăn bán trú từ Thứ 2 đến Thứ 6.',
    items: [{ type: 'text', title: 'Họ và tên', required: true }].concat(menu.days.map(function(day) {
      return {
        type: 'multipleChoice',
        title: day.day + (day.date ? ' (' + day.date + ')' : ''),
        choices: day.meals.slice(),
        required: true
      };
    }))
  };
}

function cleanMealText_(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

// CÂU TRẢ LỜI VÀ LOẠI TRÙNG

function normalizeResponseName_(value) {
  return cleanMealText_(value).toLocaleLowerCase();
}

function normalizeResponseEmail_(value) {
  return cleanMealText_(value).replace(/\s+/g, '').toLocaleLowerCase();
}

function normalizeResponseHeader_(value) {
  return cleanMealText_(value).toLocaleLowerCase();
}

function findResponseHeaderIndex_(headers, candidates) {
  const normalizedHeaders = Array.isArray(headers) ? headers.map(normalizeResponseHeader_) : [];
  const wanted = (candidates || []).map(normalizeResponseHeader_);
  return normalizedHeaders.findIndex(function(header) { return wanted.indexOf(header) >= 0; });
}

function getResponseLayout_(headers, menu) {
  const safeHeaders = Array.isArray(headers) ? headers : [];
  const timestampIndex = findResponseHeaderIndex_(safeHeaders, ['Dấu thời gian', 'Timestamp']);
  const emailIndex = findResponseHeaderIndex_(safeHeaders, ['Địa chỉ email', 'Email Address', 'Email']);
  const nameIndex = findResponseHeaderIndex_(safeHeaders, ['Họ và tên', 'Full name', 'Name']);
  const known = [timestampIndex, emailIndex, nameIndex];
  const available = safeHeaders.map(function(_, index) { return index; }).filter(function(index) {
    return known.indexOf(index) < 0;
  });
  const days = menu && Array.isArray(menu.days) ? menu.days : [];
  const normalizedHeaders = safeHeaders.map(normalizeResponseHeader_);
  const dayIndexes = days.length ? days.map(function(day, dayIndex) {
    const label = cleanMealText_(day && day.day) + (day && day.date ? ' (' + cleanMealText_(day.date) + ')' : '');
    const normalizedLabel = normalizeResponseHeader_(label);
    let found = normalizedHeaders.indexOf(normalizedLabel);
    if (found < 0 && day) {
      const normalizedDay = normalizeResponseHeader_(day.day);
      const normalizedDate = normalizeResponseHeader_(day.date);
      found = normalizedHeaders.findIndex(function(header) {
        return header === normalizedDay || (normalizedDate && header.indexOf(normalizedDay) >= 0 && header.indexOf(normalizedDate) >= 0);
      });
    }
    return found >= 0 ? found : (available[dayIndex] == null ? -1 : available[dayIndex]);
  }) : available;
  return { timestampIndex: timestampIndex, emailIndex: emailIndex, nameIndex: nameIndex, dayIndexes: dayIndexes };
}

function findDuplicateResponseRowsByIdentity_(rows, submittedName, submittedEmail, submittedRowNumber, nameColumnIndex, emailColumnIndex) {
  const wantedName = normalizeResponseName_(submittedName);
  const wantedEmail = normalizeResponseEmail_(submittedEmail);
  if (!Array.isArray(rows) || (!wantedName && !wantedEmail)) return [];
  const safeNameIndex = Number(nameColumnIndex) >= 0 ? Number(nameColumnIndex) : 1;
  const safeEmailIndex = Number(emailColumnIndex) >= 0 ? Number(emailColumnIndex) : -1;
  return rows.reduce(function(duplicates, row, index) {
    const sheetRow = index + 2;
    if (sheetRow === submittedRowNumber) return duplicates;
    const rowEmail = safeEmailIndex >= 0 ? normalizeResponseEmail_(row && row[safeEmailIndex]) : '';
    const sameIdentity = wantedEmail ? rowEmail === wantedEmail : (!rowEmail && normalizeResponseName_(row && row[safeNameIndex]) === wantedName);
    if (sameIdentity) duplicates.push(sheetRow);
    return duplicates;
  }, []);
}

function findDuplicateResponseRows_(rows, submittedName, submittedRowNumber) {
  return findDuplicateResponseRowsByIdentity_(rows, submittedName, '', submittedRowNumber, 1, -1);
}

function ensureFormSubmitTrigger_(spreadsheetId) {
  if (!spreadsheetId) return;
  const exists = ScriptApp.getProjectTriggers().some(function(trigger) {
    if (trigger.getHandlerFunction() !== 'replaceDuplicateMealResponse_') return false;
    try {
      return trigger.getTriggerSourceId() === spreadsheetId;
    } catch (error) {
      return false;
    }
  });
  if (exists) return;
  ScriptApp.newTrigger('replaceDuplicateMealResponse_')
    .forSpreadsheet(spreadsheetId).onFormSubmit().create();
}

function removeFormSubmitTrigger_(spreadsheetId) {
  if (!spreadsheetId) return;
  ScriptApp.getProjectTriggers().slice().forEach(function(trigger) {
    if (trigger.getHandlerFunction() !== 'replaceDuplicateMealResponse_') return;
    try {
      if (trigger.getTriggerSourceId() === spreadsheetId) ScriptApp.deleteTrigger(trigger);
    } catch (error) {
      // Ignore an already removed or inaccessible trigger during cleanup.
    }
  });
}

function replaceDuplicateMealResponse_(event) {
  const range = event && event.range;
  if (!range || typeof range.getSheet !== 'function') return;
  const sheet = range.getSheet();
  const parent = sheet && typeof sheet.getParent === 'function' ? sheet.getParent() : null;
  const spreadsheetId = parent && typeof parent.getId === 'function' ? parent.getId() : '';
  if (!getMealFormWeekKeyBySpreadsheetId_(spreadsheetId)) return;

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const submittedRow = range.getRow();
    const lastRow = sheet.getLastRow();
    const columnCount = Math.max(sheet.getLastColumn(), 2);
    if (submittedRow < 2 || submittedRow > lastRow || lastRow < 2) return;
    const headers = sheet.getRange(1, 1, 1, columnCount).getDisplayValues()[0];
    const layout = getResponseLayout_(headers);
    const nameColumnIndex = layout.nameIndex >= 0 ? layout.nameIndex : 1;
    const submittedValues = sheet.getRange(submittedRow, 1, 1, columnCount).getDisplayValues()[0];
    const submittedName = submittedValues[nameColumnIndex] || '';
    const submittedEmail = layout.emailIndex >= 0 ? submittedValues[layout.emailIndex] || '' : '';
    const rows = sheet.getRange(2, 1, lastRow - 1, columnCount).getDisplayValues();
    const duplicateRows = findDuplicateResponseRowsByIdentity_(rows, submittedName, submittedEmail, submittedRow, nameColumnIndex, layout.emailIndex);
    const identityRows = duplicateRows.concat([submittedRow]);
    // ponytail: Form Responses appends rows; keep the newest row even if triggers finish out of order.
    const keepRow = Math.max.apply(null, identityRows);
    identityRows.filter(function(rowNumber) { return rowNumber !== keepRow; })
      .sort(function(left, right) { return right - left; })
      .forEach(function(rowNumber) { sheet.deleteRow(rowNumber); });
  } finally {
    lock.releaseLock();
  }
}

// ĐĂNG KÝ TUẦN VÀ TỰ ĐỘNG HÓA

function getMealFormWeekKeyBySpreadsheetId_(spreadsheetId) {
  const registry = getMealFormRegistry_();
  return Object.keys(registry).find(function(weekKey) {
    return registry[weekKey] && registry[weekKey].spreadsheetId === spreadsheetId;
  }) || '';
}

function getLatestMealFormRegistration_(nowValue) {
  return getMealFormRegistrationForWeek_(0, nowValue);
}

function getPreviousMealFormRegistration_(nowValue) {
  return getMealFormRegistrationForWeek_(-1, nowValue);
}

function getNextMealFormRegistration_(nowValue) {
  return getMealFormRegistrationForWeek_(1, nowValue);
}

function getMealCalendarWeekStart_(offset, nowValue) {
  const today = Utilities.formatDate(nowValue === undefined ? new Date() : new Date(nowValue), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  const weekday = new Date(today + 'T00:00:00Z').getUTCDay();
  return addDateKey_(today, -((weekday + 6) % 7) + offset * 7);
}

function getMealFormRegistrationForWeek_(offset, nowValue) {
  const start = getMealCalendarWeekStart_(offset, nowValue);
  const registry = getMealFormRegistry_();
  const key = Object.keys(registry).find(function(weekKey) {
    const item = registry[weekKey];
    return parseDateKey_(String(weekKey).split('_')[0]) === start && item && item.spreadsheetId && isLiveMealFile_(item.spreadsheetId);
  });
  return key ? registry[key] : null;
}

function getMealFormRegistryProperties_() {
  if (typeof PropertiesService === 'undefined') return null;
  return typeof PropertiesService.getUserProperties === 'function'
    ? PropertiesService.getUserProperties()
    : PropertiesService.getScriptProperties();
}

function getMealFormRegistry_() {
  const properties = getMealFormRegistryProperties_();
  if (!properties) return {};
  const raw = properties.getProperty('MEAL_FORM_REGISTRY');
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveMealFormRegistry_(registry) {
  const properties = getMealFormRegistryProperties_();
  if (!properties) return;
  if (Object.keys(registry).length) properties.setProperty('MEAL_FORM_REGISTRY', JSON.stringify(registry));
  else properties.deleteProperty('MEAL_FORM_REGISTRY');
}

function migrateLegacyMealFormRegistry_() {
  if (typeof PropertiesService === 'undefined' || typeof PropertiesService.getUserProperties !== 'function') return false;
  const scriptProperties = PropertiesService.getScriptProperties();
  const legacy = scriptProperties.getProperty('MEAL_FORM_REGISTRY');
  if (!legacy) return false;
  try {
    const parsed = JSON.parse(legacy);
    if (!parsed || typeof parsed !== 'object') return false;
  } catch (error) {
    return false;
  }
  const userProperties = PropertiesService.getUserProperties();
  if (!userProperties.getProperty('MEAL_FORM_REGISTRY')) {
    userProperties.setProperty('MEAL_FORM_REGISTRY', legacy);
  }
  scriptProperties.deleteProperty('MEAL_FORM_REGISTRY');
  return true;
}

function migrateLegacyMealFormRegistry() {
  assertMealFormOwner_();
  return migrateLegacyMealFormRegistry_();
}

function isLiveMealFile_(id) {
  if (!id) return false;
  try {
    return !DriveApp.getFileById(id).isTrashed();
  } catch (error) {
    return false;
  }
}

function findRegisteredMealForm_(weekKey) {
  if (!weekKey) return null;
  const registry = getMealFormRegistry_();
  const item = registry[weekKey];
  if (!item) return null;
  if (isLiveMealFile_(item.formId) && isLiveMealFile_(item.spreadsheetId)) return item;
  delete registry[weekKey];
  saveMealFormRegistry_(registry);
  return null;
}

function registerMealForm_(weekKey, item) {
  if (!weekKey) return;
  const registry = getMealFormRegistry_();
  registry[weekKey] = item;
  saveMealFormRegistry_(registry);
}

function removeMealFormLockTrigger_(triggerId) {
  if (!triggerId) return;
  ScriptApp.getProjectTriggers().slice().forEach(function(trigger) {
    try {
      if (typeof trigger.getUniqueId === 'function' && trigger.getUniqueId() === triggerId) {
        ScriptApp.deleteTrigger(trigger);
      }
    } catch (error) {
      // Ignore an already removed or inaccessible trigger during cleanup.
    }
  });
}

function ensureMealFormLockTrigger_(weekKey) {
  if (!weekKey) return;
  const registry = getMealFormRegistry_();
  const item = registry[weekKey];
  if (!item || item.locked || !item.formId) return;
  const firstDate = parseDateKey_(String(weekKey).split('_')[0]);
  if (!firstDate) return;
  const desiredLockAt = getMealFormLockDeadline_(weekKey, item);
  if (item.lockAt !== desiredLockAt) {
    removeMealFormLockTrigger_(item.lockTriggerId);
    item.lockAt = desiredLockAt;
    delete item.lockTriggerId;
  }
  const lockTime = new Date(item.lockAt).getTime();
  if (!isFinite(lockTime)) return;
  const hasTrigger = item.lockTriggerId && ScriptApp.getProjectTriggers().some(function(trigger) {
    try {
      return typeof trigger.getUniqueId === 'function' && trigger.getUniqueId() === item.lockTriggerId;
    } catch (error) {
      return false;
    }
  });
  if (hasTrigger) {
    saveMealFormRegistry_(registry);
    return;
  }
  if (lockTime <= Date.now()) {
    if (closeRegisteredMealForm_(item)) saveMealFormRegistry_(registry);
    return;
  }
  const trigger = ScriptApp.newTrigger('lockScheduledMealForms_')
    .timeBased().at(new Date(lockTime)).create();
  if (trigger && typeof trigger.getUniqueId === 'function') item.lockTriggerId = trigger.getUniqueId();
  saveMealFormRegistry_(registry);
}

function ensureRegisteredMealFormLockTriggers_() {
  const registry = getMealFormRegistry_();
  Object.keys(registry).forEach(function(weekKey) {
    const item = registry[weekKey];
    if (item && isLiveMealFile_(item.spreadsheetId)) ensureMealFormLockTrigger_(weekKey);
  });
}

function closeRegisteredMealForm_(item) {
  if (!isLiveMealFile_(item.formId)) return false;
  FormApp.openById(item.formId).setAcceptingResponses(false);
  try { CacheService.getScriptCache().remove('meal-viewer-v2:' + item.spreadsheetId); } catch (error) { /* Cache is best effort. */ }
  removeMealFormLockTrigger_(item.lockTriggerId);
  item.locked = true;
  delete item.lockTriggerId;
  return true;
}

function lockScheduledMealForms_(nowValue) {
  const explicitTime = typeof nowValue === 'string' || typeof nowValue === 'number' || nowValue instanceof Date;
  const now = explicitTime ? new Date(nowValue).getTime() : Date.now();
  if (!isFinite(now)) return;
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
  const registry = getMealFormRegistry_();
  let changed = false;
  Object.keys(registry).forEach(function(weekKey) {
    const item = registry[weekKey];
    if (!item || item.locked || !item.formId) return;
    const firstDate = parseDateKey_(String(weekKey).split('_')[0]);
    if (!firstDate) return;
    const lockAt = getMealFormLockDeadline_(weekKey, item);
    const lockTime = new Date(lockAt).getTime();
    if (!isFinite(lockTime) || lockTime > now) return;
    try {
      if (closeRegisteredMealForm_(item)) { item.lockAt = lockAt; changed = true; }
    } catch (error) {
      // Keep the item pending so a later setup run can retry the lock.
    }
  });
  if (changed) saveMealFormRegistry_(registry);
  } finally { lock.releaseLock(); }
}

function ensureRegisteredMealFormTriggers_() {
  const registry = getMealFormRegistry_();
  Object.keys(registry).forEach(function(weekKey) {
    const item = registry[weekKey];
    if (item && isLiveMealFile_(item.spreadsheetId)) ensureFormSubmitTrigger_(item.spreadsheetId);
  });
}

function disableCleanupTriggers_() {
  ScriptApp.getProjectTriggers().slice().forEach(function(trigger) {
    try {
      if (trigger.getHandlerFunction() === 'cleanupExpiredMealForms_') ScriptApp.deleteTrigger(trigger);
    } catch (error) {
      // Ignore an already removed or inaccessible legacy trigger.
    }
  });
}

function setupMealFormAutomation() {
  assertMealFormOwner_();
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
  disableCleanupTriggers_();
  ensureRegisteredMealFormTriggers_();
  ensureRegisteredMealFormLockTriggers_();
  return 'Đã bật tự khóa Form khi tuần bắt đầu vào 00:00 thứ Hai, giờ Việt Nam.';
  } finally { lock.releaseLock(); }
}

function cleanupExpiredMealForms_() {
  // Giữ hàm để các trigger cũ không thể xóa dữ liệu trong lúc chuyển đổi.
  return;
}

// BẢNG TỔNG HỢP

function createSummarySheet_(spreadsheet, responseSheet, menu, columnCount) {
  const sheet = spreadsheet.insertSheet('Tổng hợp', 0);
  const responseReference = quoteSheetName_(responseSheet.getName());
  const detectedColumnCount = typeof responseSheet.getLastColumn === 'function' ? Number(responseSheet.getLastColumn()) : 0;
  const responseColumnCount = Math.max(Number(columnCount) || 0, isFinite(detectedColumnCount) ? detectedColumnCount : 0);
  const responseHeaders = responseSheet.getRange(1, 1, 1, responseColumnCount).getDisplayValues();
  const layout = getResponseLayout_(responseHeaders[0] || [], menu);
  const timestampIndex = layout.timestampIndex >= 0 ? layout.timestampIndex : 0;
  const nameIndex = layout.nameIndex >= 0 ? layout.nameIndex : 1;
  const nameColumn = columnLetter_(nameIndex + 1);
  const detailHeaders = [responseHeaders[0] && responseHeaders[0][timestampIndex] || 'Dấu thời gian', responseHeaders[0] && responseHeaders[0][nameIndex] || 'Họ và tên'];
  menu.days.forEach(function(day, dayIndex) {
    const responseIndex = layout.dayIndexes[dayIndex];
    detailHeaders.push(responseHeaders[0] && responseHeaders[0][responseIndex] || day.day + (day.date ? ' (' + day.date + ')' : ''));
  });
  if (layout.emailIndex >= 0) detailHeaders.push(responseHeaders[0][layout.emailIndex] || 'Địa chỉ email');
  const detailColumnCount = detailHeaders.length;
  const summaryRows = [];
  const summaryStartRow = 3;

  menu.days.forEach(function(day, dayIndex) {
    const dayLabel = day.day + (day.date ? ' (' + day.date + ')' : '');
    day.meals.forEach(function(meal, mealIndex) {
      summaryRows.push([dayLabel, meal, '']);
    });
  });

  sheet.getRange(1, 1).setValue('TỔNG HỢP LỰA CHỌN — ' + (menu.title || 'Ăn bán trú'));
  sheet.getRange(2, 1, 1, 3).setValues([['Ngày', 'Món', 'Số lượng']]);
  sheet.getRange(summaryStartRow, 1, summaryRows.length, 3).setValues(summaryRows);
  let summaryIndex = 0;
  menu.days.forEach(function(day, dayIndex) {
    const dayLabel = day.day + (day.date ? ' (' + day.date + ')' : '');
    day.meals.forEach(function() {
      const row = summaryStartRow + summaryIndex++;
      const responseColumn = columnLetter_(layout.dayIndexes[dayIndex] + 1);
      const escapedDayLabel = dayLabel.replace(/"/g, '""');
      const countFormula = 'IF($F$4="Tất cả";COUNTIFS(' + responseReference + '!' + responseColumn + ':' + responseColumn + ';B' + row + ';' + responseReference + '!' + nameColumn + ':' + nameColumn + ';"<>");COUNTIFS(' + responseReference + '!' + responseColumn + ':' + responseColumn + ';B' + row + ';' + responseReference + '!' + nameColumn + ':' + nameColumn + ';$F$4))';
      sheet.getRange(row, 3).setFormula(
        '=IF(OR(AND($F$2<>"Tất cả";$F$2<>"' + escapedDayLabel + '");AND($F$3<>"Tất cả";$F$3<>B' + row + '));0;' + countFormula + ')'
      );
    });
  });

  configureSummaryFilters_(sheet, responseSheet, menu);

  const detailTitleRow = summaryStartRow + summaryRows.length + 1;
  const detailHeaderRow = detailTitleRow + 1;
  const detailDataRow = detailHeaderRow + 1;
  sheet.getRange(detailTitleRow, 1).setValue('CHI TIẾT LỰA CHỌN');
  sheet.getRange(detailHeaderRow, 1, 1, detailColumnCount).setValues([detailHeaders]);
  sheet.getRange(detailDataRow, 1).setFormula(
    buildDetailFilterFormula_(responseReference, menu, layout, responseColumnCount)
  );

  sheet.setFrozenRows(2);
  sheet.setHiddenGridlines(true);
  sheet.setTabColor('#087f5b');
  sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#d9f1e3');
  sheet.getRange(2, 1, 1, 3)
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#087f5b')
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
  sheet.getRange(summaryStartRow, 1, summaryRows.length, 3)
    .setVerticalAlignment('middle').setWrap(true);
  let dayRow = summaryStartRow;
  menu.days.forEach(function(day) {
    sheet.getRange(dayRow, 1, day.meals.length, 1)
      .mergeVertically().setHorizontalAlignment('center').setVerticalAlignment('middle');
    dayRow += day.meals.length;
  });
  sheet.getRange(2, 1, summaryRows.length + 1, 3)
    .setBorder(true, true, true, true, true, true);
  sheet.getRange(detailTitleRow, 1, 1, detailColumnCount)
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#087f5b')
    .setBorder(true, true, true, true, true, true);
  sheet.getRange(detailHeaderRow, 1, 1, detailColumnCount)
    .setFontWeight('bold').setBackground('#d9f1e3')
    .setBorder(true, true, true, true, true, true);
  const detailRows = Math.max(sheet.getMaxRows() - detailDataRow + 1, 1);
  sheet.getRange(detailDataRow, 1, detailRows, detailColumnCount)
    .setFontSize(13).setVerticalAlignment('middle').setWrap(true)
    .setBorder(true, true, true, true, true, true);
  sheet.getRange(detailDataRow, 1, detailRows, 1)
    .setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sheet.setRowHeights(detailDataRow, detailRows, 36);
  sheet.setColumnWidth(1, 210);
  sheet.setColumnWidth(2, 240);
  sheet.setColumnWidth(3, 150);
  if (detailColumnCount > 3) sheet.setColumnWidths(4, detailColumnCount - 3, 300);
  if (layout.emailIndex >= 0) sheet.hideColumns(detailColumnCount);
  protectSummaryRange_(sheet.getRange(1, 1, summaryRows.length + 2, 3), 'Khóa tổng hợp và công thức');
  protectSummaryRange_(sheet.getRange(detailTitleRow, 1, detailRows + 2, detailColumnCount), 'Khóa chi tiết lựa chọn');
  return sheet;
}

function configureSummaryFilters_(sheet, responseSheet, menu) {
  const detectedColumnCount = typeof responseSheet.getLastColumn === 'function' ? Number(responseSheet.getLastColumn()) : 0;
  const responseColumnCount = Math.max(2, isFinite(detectedColumnCount) ? detectedColumnCount : 2);
  const responseHeaders = responseSheet.getRange(1, 1, 1, responseColumnCount).getDisplayValues()[0];
  const layout = getResponseLayout_(responseHeaders, menu);
  const nameColumnNumber = (layout.nameIndex >= 0 ? layout.nameIndex : 1) + 1;
  const dayLabels = menu.days.map(function(day) {
    return day.day + (day.date ? ' (' + day.date + ')' : '');
  });
  const mealLabels = [];
  menu.days.forEach(function(day) {
    day.meals.forEach(function(meal) {
      if (mealLabels.indexOf(meal) < 0) mealLabels.push(meal);
    });
  });

  sheet.getRange(1, 5).setValue('BỘ LỌC');
  sheet.getRange(2, 5, 3, 1).setValues([['Ngày'], ['Món'], ['Họ tên']]);
  sheet.getRange(2, 6, 3, 1).setValues([['Tất cả'], ['Tất cả'], ['Tất cả']]);
  sheet.getRange(1, 5, 1, 2)
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#087f5b')
    .setHorizontalAlignment('center');
  sheet.getRange(2, 5, 3, 1)
    .setFontWeight('bold').setBackground('#eaf7ef');
  sheet.getRange(2, 6, 3, 1)
    .setBackground('#fffdf5').setBorder(true, true, true, true, true, true);

  sheet.getRange(2, 6).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['Tất cả'].concat(dayLabels), true)
      .setAllowInvalid(false).build()
  );
  sheet.getRange(3, 6).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['Tất cả'].concat(mealLabels), true)
      .setAllowInvalid(false).build()
  );
  sheet.getRange(4, 6).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInRange(
        responseSheet.getRange(2, nameColumnNumber, Math.max(responseSheet.getMaxRows() - 1, 1), 1),
        true
      )
      .setAllowInvalid(true).build()
  );

  sheet.getRange(1, 10, dayLabels.length, 1)
    .setValues(dayLabels.map(function(label) { return [label]; }));
  sheet.hideColumns(10);
}

function buildDetailFilterFormula_(responseReference, menu, layout, columnCount) {
  // Đảm bảo tên sheet được bọc trong dấu nháy đơn nếu chưa có
  const cleanRef = responseReference.replace(/^'|'$/g, '');
  const sheetPrefix = "'" + cleanRef + "'!";
  
  const endColumn = columnLetter_(columnCount);
  const nameIndex = layout.nameIndex >= 0 ? layout.nameIndex : 1;
  const timestampIndex = layout.timestampIndex >= 0 ? layout.timestampIndex : 0;
  const nameColumnLetter = columnLetter_(nameIndex + 1);

  // Dùng INDIRECT để Google Forms chèn dòng không làm nhảy dải ô A2:endColumn và B2:B
  const responseRows = 'INDIRECT("' + sheetPrefix + 'A2:' + endColumn + '")';
  const nameColumn = 'INDIRECT("' + sheetPrefix + nameColumnLetter + '2:' + nameColumnLetter + '")';
  const allRows = 'ROW(' + nameColumn + ')>0';

  const mealColumnLetters = layout.dayIndexes.map(function(responseIndex) {
    return columnLetter_(responseIndex + 1);
  });
  
  const mealMatches = mealColumnLetters.map(function(responseColumn) {
    return 'INDIRECT("' + sheetPrefix + responseColumn + '2:' + responseColumn + '")=$F$3';
  });
  const anyMeal = '((' + mealMatches.join(')+(') + '))>0';

  const selectedDay = 'INDEX(CHOOSECOLS(' + responseRows + ';' + layout.dayIndexes.map(function(index) { return index + 1; }).join(';') + ');0;MATCH($F$2;$J$1:$J$5;0))';
  
  const dayCondition = 'IF($F$2="Tất cả";IF($F$3="Tất cả";' + allRows + ';' + anyMeal + ');' +
    'IF($F$3="Tất cả";' + selectedDay + '<>"";' + selectedDay + '=$F$3))';
    
  const nameCondition = 'IF($F$4="Tất cả";' + allRows + ';LOWER(' + nameColumn + ')=LOWER($F$4))';

  const selectedColumns = [timestampIndex, nameIndex].concat(layout.dayIndexes);
  if (layout.emailIndex >= 0) selectedColumns.push(layout.emailIndex);

  return '=IFERROR(CHOOSECOLS(FILTER(' + responseRows + ';' + nameColumn + '<>"";' + nameCondition + ';' + dayCondition + ');' + selectedColumns.map(function(index) { return index + 1; }).join(';') + ');"Không có kết quả")';
}

function protectSummaryRange_(range, description) {
  const protection = range.protect().setDescription(description);
  protection.setWarningOnly(false);
  if (protection.canDomainEdit()) protection.setDomainEdit(false);
}

function quoteSheetName_(name) {
  return "'" + String(name).replace(/'/g, "''") + "'";
}

function columnLetter_(number) {
  let result = '';
  for (let value = Number(number); value > 0; value = Math.floor((value - 1) / 26)) {
    result = String.fromCharCode(65 + ((value - 1) % 26)) + result;
  }
  return result;
}

function formatResponseSheet_(sheet, columnCount) {
  const detectedColumnCount = typeof sheet.getLastColumn === 'function' ? Number(sheet.getLastColumn()) : 0;
  columnCount = Math.max(Number(columnCount) || 0, isFinite(detectedColumnCount) ? detectedColumnCount : 0, 2);
  sheet.setFrozenRows(1);
  sheet.setHiddenGridlines(true);
  sheet.setTabColor('#087f5b');
  sheet.getRange(1, 1, 1, columnCount)
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#087f5b')
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
  sheet.getRange(2, 1, Math.max(sheet.getMaxRows() - 1, 1), columnCount)
    .setFontSize(12).setVerticalAlignment('middle').setWrap(true)
    .applyRowBanding(SpreadsheetApp.BandingTheme.GREEN, false, false);
  sheet.setRowHeights(2, Math.max(sheet.getMaxRows() - 1, 1), 34);
  sheet.setColumnWidth(1, 180);
  const headers = sheet.getRange(1, 1, 1, columnCount).getDisplayValues()[0];
  const layout = getResponseLayout_(headers);
  sheet.setColumnWidth((layout.nameIndex >= 0 ? layout.nameIndex : 1) + 1, 240);
  if (columnCount > 2) sheet.setColumnWidths(3, columnCount - 2, 320);
  if (layout.emailIndex >= 0 && typeof sheet.hideColumns === 'function') sheet.hideColumns(layout.emailIndex + 1);
}


function parseMealDashboardDeadline_(value) {
  const text = cleanMealText_(value);
  const match = text.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(Z|\+07:00)$/);
  if (!match || !parseDateKey_(match[1]) || Number(match[2]) > 23 || Number(match[3]) > 59 || Number(match[4] || 0) > 59 || !isFinite(new Date(text).getTime())) throw new Error('Hạn đăng ký không hợp lệ.');
  if (new Date(text).getTime() <= Date.now()) throw new Error('Hạn đăng ký phải ở tương lai.');
  return match[1] + 'T' + match[2] + ':' + match[3] + ':' + (match[4] || '00') + match[5];
}

function controlMealDashboardForm_(request) {
  const key = cleanMealText_(request.weekKey);
  if (['open', 'close', 'deadline'].indexOf(request.mode) < 0) throw new Error('Thao tác Form không hợp lệ.');
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const registry = getMealFormRegistry_();
    const item = registry[key];
    if (!item || !isLiveMealFile_(item.formId) || !isLiveMealFile_(item.spreadsheetId)) throw new Error('Không tìm thấy tuần đã đăng ký.');
    const form = FormApp.openById(item.formId);
    const before = { formStatus: form.isAcceptingResponses() ? 'open' : 'closed', lockAt: getMealFormLockDeadline_(key, item) };
    if (request.expectedStatus !== before.formStatus || request.expectedLockAt !== before.lockAt) throw new Error('Trạng thái Form hoặc hạn đăng ký đã thay đổi; hãy tải lại.');
    const deadline = request.mode === 'close' ? before.lockAt : parseMealDashboardDeadline_(request.deadline || before.lockAt);
    const after = { formStatus: request.mode === 'deadline' ? before.formStatus : request.mode === 'open' ? 'open' : 'closed', lockAt: deadline };
    const sheet = getMealDashboardHistorySheet_(SpreadsheetApp.openById(item.spreadsheetId), true);
    const audit = appendMealDashboardHistoryEvent_(sheet, { action: 'form-control-pending', actor: request.email, name: 'Điều khiển Form', note: JSON.stringify({ before: before, after: after }) });
    const event = { id: audit.id, entryId: audit.id, at: Date.now(), actor: normalizeDashboardEmail_(request.email), name: 'Điều khiển Form', restorable: false, note: JSON.stringify({ before: before, after: after }) };
    try {
      if (request.mode !== 'deadline') form.setAcceptingResponses(after.formStatus === 'open');
      if ((form.isAcceptingResponses() ? 'open' : 'closed') !== after.formStatus) throw new Error('Không xác nhận được trạng thái Form.');
      removeMealFormLockTrigger_(item.lockTriggerId);
      delete item.lockTriggerId;
      item.locked = after.formStatus === 'closed';
      item.lockAt = deadline;
      if (request.mode !== 'close') item.customLockAt = deadline;
      saveMealFormRegistry_(registry);
      ensureMealFormLockTrigger_(key);
      event.action = request.mode === 'open' ? 'form-opened' : request.mode === 'close' ? 'form-closed' : 'form-deadline-updated';
      updateMealDashboardHistoryEvent_(sheet, audit.rowNumber, event);
    } catch (error) {
      event.action = 'form-control-review';
      event.note += ' | Chưa hoàn tất: ' + cleanMealText_(error && error.message);
      try { updateMealDashboardHistoryEvent_(sheet, audit.rowNumber, event); } catch (auditError) { /* Original failure remains visible. */ }
      throw new Error('Thay đổi Form chưa hoàn tất; hãy kiểm tra trạng thái, hạn và lịch sử trước khi thử lại.');
    } finally {
      try { CacheService.getScriptCache().remove('meal-viewer-v2:' + item.spreadsheetId); } catch (cacheError) { /* Cache is best effort. */ }
    }
    return { changed: true, formStatus: after.formStatus, lockAt: deadline };
  } finally { lock.releaseLock(); }
}

function normalizeMealBranding_(value) {
  if (!value || typeof value.schoolName !== 'string' || value.schoolName.length > 100 || /[\x00-\x1f]/.test(value.schoolName)) throw new Error('Tên trường không hợp lệ (tối đa 100 ký tự).');
  const logo = typeof value.logoUrl === 'string' ? value.logoUrl.trim() : '';
  if (logo.length > 512 || (logo && !/^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::\d{1,5})?(?:[/?#][^\s\x00-\x1f]*)?$/i.test(logo))) throw new Error('Logo phải là URL ảnh HTTPS hợp lệ, không có tài khoản/mật khẩu.');
  if (typeof value.primaryColor !== 'string' || !/^#[0-9a-f]{6}$/i.test(value.primaryColor)) throw new Error('Màu chủ đạo không hợp lệ.');
  return { schoolName: value.schoolName.trim(), logoUrl: logo, primaryColor: value.primaryColor.toLowerCase(), updatedAt: Number(value.updatedAt) || 0 };
}

function getMealBranding_(fresh) {
  const defaults = { schoolName: '', logoUrl: '', primaryColor: '#087f5b', updatedAt: 0 };
  try {
    const cache = typeof CacheService !== 'undefined' ? CacheService.getScriptCache() : null;
    if (!fresh && cache && typeof cache.get === 'function') {
      const cached = cache.get('meal-branding-v1');
      if (cached) return normalizeMealBranding_(JSON.parse(cached));
    }
    const raw = PropertiesService.getScriptProperties().getProperty('MEAL_BRANDING');
    const result = raw ? normalizeMealBranding_(JSON.parse(raw)) : defaults;
    if (cache && typeof cache.put === 'function') try { cache.put('meal-branding-v1', JSON.stringify(result), 60); } catch (cacheError) { /* Cache is best effort. */ }
    return result;
  } catch (error) { return defaults; }
}

function setMealBranding_(request) {
  const value = normalizeMealBranding_(request.branding);
  if (!value.schoolName) throw new Error('Tên trường không được để trống.');
  const lock = LockService.getScriptLock(); lock.waitLock(5000);
  try {
    const current = getMealBranding_(true);
    if (Number(request.expectedUpdatedAt) !== current.updatedAt) throw new Error('Thương hiệu đã thay đổi; hãy tải lại trước khi lưu.');
    value.updatedAt = Math.max(Date.now(), current.updatedAt + 1);
    PropertiesService.getScriptProperties().setProperty('MEAL_BRANDING', JSON.stringify(value));
    try { CacheService.getScriptCache().remove('meal-branding-v1'); } catch (error) { /* Cache is best effort. */ }
    return value;
  } finally { lock.releaseLock(); }
}

function getMealFormLockDeadline_(weekKey, item) {
  if (item && item.customLockAt) return cleanMealText_(item.customLockAt);
  const firstDate = parseDateKey_(String(weekKey).split('_')[0]);
  return firstDate ? firstDate + 'T00:00:00+07:00' : '';
}
