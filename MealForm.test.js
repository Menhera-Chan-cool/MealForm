const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, 'MealForm.gs'), 'utf8');
assert.ok(!source.includes('function getCleanupDateKey_('));
assert.ok(!source.includes('function configureMealFormIdentity_('));
assert.ok(source.includes('form.setCollectEmail(false);'));
const calls = [];
const userProperties = new Map([['MEAL_DASHBOARD_ALLOWED_EMAILS', JSON.stringify(['manager@example.com'])]]);
const scriptProperties = new Map([['MEAL_FORM_OWNER_EMAIL', 'owner@example.com'], ['MEAL_FORM_ROOT_FOLDER_ID', 'recipient-folder'], ['MEAL_VIEWER_ORIGIN', 'https://recipient.example']]);
const weekFolder = {
  getId: () => 'week-folder-id',
  getUrl: () => 'https://drive.google.com/drive/folders/week-folder-id',
  getName: () => 'Tuần 21/09/2026 - 25/09/2026'
};
const rootFolder = { createFolder: name => { calls.push(['createFolder', name]); return weekFolder; } };
const files = new Map([
  ['form-id', { moveTo: folder => calls.push(['moveTo', 'form-id', folder.getId()]) }],
  ['sheet-id', { moveTo: folder => calls.push(['moveTo', 'sheet-id', folder.getId()]) }]
]);
const context = {
  DriveApp: {
    getFolderById: id => { assert.strictEqual(id, 'recipient-folder'); return rootFolder; },
    getFileById: id => files.get(id)
  },
  PropertiesService: {
    getUserProperties: () => ({
      getProperty: key => userProperties.get(key) || '',
      setProperty: (key, value) => userProperties.set(key, value),
      deleteProperty: key => userProperties.delete(key)
    }),
    getScriptProperties: () => ({
      getProperty: key => scriptProperties.get(key) || '',
      setProperty: (key, value) => scriptProperties.set(key, value),
      deleteProperty: key => scriptProperties.delete(key)
    })
  },
  console
};
vm.runInNewContext(source, context);

assert.strictEqual(typeof context.getMealWeekFolderName_, 'function');
assert.strictEqual(typeof context.createMealWeekFolder_, 'function');
const menu = { days: [
  { date: '21/09/2026' }, { date: '22/09/2026' }, { date: '23/09/2026' },
  { date: '24/09/2026' }, { date: '25/09/2026' }
] };
assert.strictEqual(context.getMealWeekFolderName_(menu), 'Tuần 21/09/2026 - 25/09/2026');
const placed = context.createMealWeekFolder_(menu, { getId: () => 'form-id' }, { getId: () => 'sheet-id' });
assert.strictEqual(JSON.stringify(placed), JSON.stringify({
  id: 'week-folder-id',
  url: 'https://drive.google.com/drive/folders/week-folder-id',
  name: 'Tuần 21/09/2026 - 25/09/2026'
}));
assert.deepStrictEqual(calls, [
  ['createFolder', 'Tuần 21/09/2026 - 25/09/2026'],
  ['moveTo', 'form-id', 'week-folder-id'],
  ['moveTo', 'sheet-id', 'week-folder-id']
]);
assert.strictEqual(context.getMealDashboardAccessRole_('OWNER@example.com'), 'owner');
assert.strictEqual(context.getMealDashboardAccessRole_('Manager@example.com'), 'manager');
assert.strictEqual(context.getMealDashboardAccessRole_('stranger@example.com'), '');
assert.strictEqual(context.handleMealDashboardRequest_({ action: 'dashboard-authorize', email: 'manager@example.com' }).role, 'manager');
assert.throws(() => context.handleMealDashboardRequest_({ action: 'dashboard-create', email: 'stranger@example.com', menu: {} }), /chưa được cấp quyền/);
assert.throws(() => context.handleMealDashboardRequest_({ action: 'dashboard-add-email', email: 'manager@example.com', targetEmail: 'new@example.com' }), /Chỉ chủ sở hữu/);

const responseTime = new Date('2026-09-24T04:30:00Z');
const responseRows = [
  [responseTime, 'Nguyễn An', 'GÀ KHO THƠM', 'CÁ KHO'],
  [responseTime, 'Nguyễn An', 'THỊT RAM', 'CÁ KHO']
];
const layout = { timestampIndex: 0, nameIndex: 1, dayIndexes: [2, 3] };
assert.strictEqual(context.findDashboardResponseRow_(responseRows, {
  timestamp: responseTime,
  name: 'Nguyễn An',
  meals: ['THỊT RAM', 'CÁ KHO']
}, layout), 3);
assert.strictEqual(context.findDashboardResponseRow_(responseRows, {
  timestamp: responseTime,
  name: 'Nguyễn An',
  meals: ['CÁ CHIÊN', 'CÁ KHO']
}, layout), 0);
assert.strictEqual(context.findDashboardResponseRow_([
  responseRows[0], responseRows[0]
], {
  timestamp: responseTime,
  name: 'Nguyễn An',
  meals: ['GÀ KHO THƠM', 'CÁ KHO']
}, layout), 0);

const legacyHeaders = ['Timestamp', 'Họ và tên', 'Email', 'Thứ 2', 'Thứ 3'];
const legacyLayout = context.getResponseLayout_(legacyHeaders);
const legacyResponse = {
  getTimestamp: () => responseTime,
  getItemResponses: () => [
    ['Họ và tên', 'Nguyễn An'], ['Email', 'an@example.com'],
    ['Thứ 2', 'GÀ KHO'], ['Thứ 3', 'CÁ KHO']
  ].map(([title, value]) => ({ getItem: () => ({ getTitle: () => title }), getResponse: () => value }))
};
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.dashboardResponseTarget_(legacyResponse, legacyLayout, legacyHeaders))), {
  timestamp: responseTime.toISOString(), name: 'Nguyễn An', meals: ['GÀ KHO', 'CÁ KHO']
});

const deleteTime = new Date('2026-09-24T04:30:00Z');
const questions = ['Họ và tên', 'Thứ 2', 'Thứ 3'].map((title, index) => ({ getId: () => index + 1, getTitle: () => title, getType: () => index ? 'MULTIPLE_CHOICE' : 'TEXT' }));
const itemResponses = values => values.map((value, index) => ({ getResponse: () => value, getItem: () => questions[index] }));
const responseOne = { getId: () => 'response-one', getTimestamp: () => deleteTime, getItemResponses: () => itemResponses(['Nguyễn An', 'GÀ KHO THƠM', 'CÁ KHO']) };
const responseTwo = { getId: () => 'response-two', getTimestamp: () => deleteTime, getItemResponses: () => itemResponses(['Nguyễn An', 'THỊT RAM', 'CÁ KHO']) };
let formResponses = [responseOne, responseTwo];
let responseRowsForDelete = [
  ['Timestamp', 'Họ và tên', 'Thứ 2', 'Thứ 3'],
  [deleteTime, 'Nguyễn An', 'GÀ KHO THƠM', 'CÁ KHO'],
  [deleteTime, 'Nguyễn An', 'THỊT RAM', 'CÁ KHO']
];
let failNextSheetDelete = false;
const responseSheet = {
  getFormUrl: () => 'https://docs.google.com/forms/d/e/test/viewform',
  getLastColumn: () => 4,
  getLastRow: () => responseRowsForDelete.length,
  getRange: (row, column, rowCount) => ({
    getDisplayValues: () => responseRowsForDelete.slice(row - 1, row - 1 + rowCount).map(values => values.slice(column - 1, column + 3)),
    getValues: () => responseRowsForDelete.slice(row - 1, row - 1 + rowCount).map(values => values.slice(column - 1, column + 3))
  }),
  deleteRow: row => {
    if (failNextSheetDelete) { failNextSheetDelete = false; throw new Error('simulated sheet error'); }
    responseRowsForDelete.splice(row - 1, 1);
  }
};
const dashboardForm = {
  getItems: () => questions,
  collectsEmail: () => false,
  getResponses: () => formResponses.slice(),
  getPublishedUrl: () => 'https://docs.google.com/forms/d/e/test/viewform',
  isAcceptingResponses: () => true,
  deleteResponse: responseId => { formResponses = formResponses.filter(response => response.getId() !== responseId); }
};
userProperties.set('MEAL_FORM_REGISTRY', JSON.stringify({
  '2026-09-21_2026-09-22_2026-09-23_2026-09-24_2026-09-25': { formId: 'form-1', spreadsheetId: 'sheet-1' }
}));
scriptProperties.set('MEAL_DASHBOARD_HMAC_SECRET', 'dashboard-test-secret');
context.DriveApp = { getFileById: () => ({ isTrashed: () => false }) };
context.FormApp = { ItemType: { TEXT: 'TEXT', MULTIPLE_CHOICE: 'MULTIPLE_CHOICE' }, openById: () => dashboardForm };
const auditRows = [];
let auditHidden = false;
const auditSheet = {
  getLastRow: () => auditRows.length, appendRow: row => auditRows.push(row),
  isSheetHidden: () => auditHidden, hideSheet: () => { auditHidden = true; },
  getRange: (row, column, rowCount) => ({
    setValues(values) { values.forEach((value, index) => { auditRows[row - 1 + index] = value; }); },
    getValues: () => auditRows.slice(row - 1, row - 1 + rowCount).map(values => values.slice(column - 1)),
    getDisplayValues: () => auditRows.slice(row - 1, row - 1 + rowCount).map(values => values.slice(column - 1).map(String))
  })
};
context.SpreadsheetApp = { openById: () => ({ getSheetByName: () => auditRows.length ? auditSheet : null, insertSheet: () => auditSheet, getName: () => 'Test week', getUrl: () => 'https://docs.google.com/spreadsheets/d/sheet-1/edit', getSheets: () => [responseSheet] }) };
context.CacheService = { getScriptCache: () => ({ remove() {} }) };
context.LockService = { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) };
context.Utilities = {
  Charset: { UTF_8: 'UTF-8' },
  getUuid: () => crypto.randomUUID(),
  computeHmacSha256Signature: (value, key) => Array.from(crypto.createHmac('sha256', key).update(value).digest(), byte => byte > 127 ? byte - 256 : byte),
  base64EncodeWebSafe: (value, charset) => Buffer.from(charset === 'UTF-8' ? value : value.replace(/[^\x00-\x7f]/g, '?')).toString('base64url'),
  base64DecodeWebSafe: value => Array.from(Buffer.from(value, 'base64url')),
  newBlob: value => ({ getDataAsString: () => Buffer.from(value).toString('utf8') })
};
const deleteTarget = { timestamp: deleteTime, name: 'Nguyễn An', meals: ['THỊT RAM', 'CÁ KHO'] };
let targetReads = 0;
let titleReads = 0;
for (const question of questions) {
  const readTitle = question.getTitle;
  question.getTitle = () => { titleReads++; return readTitle(); };
}
for (const response of [responseOne, responseTwo]) {
  const readAnswers = response.getItemResponses;
  response.getItemResponses = () => { targetReads++; return readAnswers(); };
}
const listedWeek = context.getMealDashboardWeek_('2026-09-21_2026-09-22_2026-09-23_2026-09-24_2026-09-25');
assert.strictEqual(listedWeek.responses.length, 2);
assert.strictEqual(listedWeek.responses.every(response => response.deletable), true);
assert.strictEqual(targetReads, 2, 'read each Form response once, not once per Sheet row');
assert.strictEqual(titleReads, 3, 'read each question title once per week request');
const deleteRequest = {
  weekKey: '2026-09-21_2026-09-22_2026-09-23_2026-09-24_2026-09-25',
  responseId: 'response-two',
  deleteToken: context.createMealDashboardDeleteToken_('2026-09-21_2026-09-22_2026-09-23_2026-09-24_2026-09-25', 'response-two', deleteTarget)
};
const unicodeTarget = { timestamp: deleteTime, name: 'Tuất anh Beos', meals: ['XÍU MẠI SỐT TIÊU ĐEN', 'GÀ CHIÊN SỐT XÍ MUỘI'] };
const unicodeToken = context.createMealDashboardDeleteToken_(deleteRequest.weekKey, 'unicode-response', unicodeTarget);
const unicodeVerified = context.readMealDashboardDeleteToken_(unicodeToken);
assert.strictEqual(unicodeVerified.name, 'Tuất anh Beos');
assert.deepStrictEqual(Array.from(unicodeVerified.meals), ['XÍU MẠI SỐT TIÊU ĐEN', 'GÀ CHIÊN SỐT XÍ MUỘI']);
assert.throws(() => context.readMealDashboardDeleteToken_(unicodeToken.slice(0, -1) + (unicodeToken.endsWith('0') ? '1' : '0')), /không hợp lệ/);
const expiredTarget = JSON.parse(Buffer.from(deleteRequest.deleteToken.split('.')[0], 'base64url').toString('utf8'));
expiredTarget.issuedAt = Date.now() - 900001;
const expiredPayload = JSON.stringify(expiredTarget);
const expiredToken = Buffer.from(expiredPayload).toString('base64url') + '.' + crypto.createHmac('sha256', 'dashboard-test-secret').update(expiredPayload).digest('hex');
assert.throws(() => context.readMealDashboardDeleteToken_(expiredToken), /hết hạn/);
const deletion = context.deleteMealDashboardResponse_(deleteRequest);
assert.strictEqual(deletion.deleted, true);
assert.strictEqual(deletion.alreadyDeleted, false);
assert.strictEqual(deletion.restorable, true);
assert.strictEqual(auditRows.at(-1)[1], 'deleted');
assert.deepStrictEqual(formResponses.map(response => response.getId()), ['response-one']);
assert.strictEqual(responseRowsForDelete.length, 2);
assert.strictEqual(responseRowsForDelete[1][2], 'GÀ KHO THƠM');

formResponses = [responseOne, responseTwo];
responseRowsForDelete = [
  ['Timestamp', 'Họ và tên', 'Thứ 2', 'Thứ 3'],
  [deleteTime, 'Nguyễn An', 'GÀ KHO THƠM', 'CÁ KHO'],
  [deleteTime, 'Nguyễn An', 'THỊT RAM', 'CÁ KHO']
];
failNextSheetDelete = true;
assert.throws(() => context.deleteMealDashboardResponse_(deleteRequest), /Phản hồi Form đã xóa nhưng Sheet chưa xóa/);
assert.strictEqual(formResponses.some(response => response.getId() === 'response-two'), false);
assert.strictEqual(responseRowsForDelete.length, 3);
const partialWeek = context.getMealDashboardWeek_('2026-09-21_2026-09-22_2026-09-23_2026-09-24_2026-09-25');
const orphan = partialWeek.responses.find(response => response.partial);
assert.ok(orphan && orphan.deletable && orphan.name === 'Nguyễn An');
const orphanDeletion = context.deleteMealDashboardResponse_({
  weekKey: deleteRequest.weekKey, responseId: orphan.responseId, deleteToken: orphan.deleteToken
});
assert.strictEqual(orphanDeletion.deleted, true);
assert.strictEqual(orphanDeletion.alreadyDeleted, false);
assert.strictEqual(orphanDeletion.restorable, false);
assert.strictEqual(responseRowsForDelete.length, 2);

formResponses = [responseOne, responseTwo];
responseRowsForDelete = [
  ['Timestamp', 'Họ và tên', 'Thứ 2', 'Thứ 3'],
  [deleteTime, 'Nguyễn An', 'GÀ KHO THƠM', 'CÁ KHO'],
  [deleteTime, 'Nguyễn An', 'THỊT RAM', 'CÁ KHO']
];
assert.throws(() => context.deleteMealDashboardResponse_({
  weekKey: deleteRequest.weekKey, responseId: orphan.responseId, deleteToken: orphan.deleteToken
}), /đã thay đổi|tải lại/i);
assert.strictEqual(responseRowsForDelete.length, 3);

formResponses = [responseOne];
responseRowsForDelete = [
  ['Timestamp', 'Họ và tên', 'Thứ 2', 'Thứ 3'],
  [deleteTime, 'Nguyễn An', 'THỊT RAM', 'CÁ KHO'],
  [deleteTime, 'Nguyễn An', 'THỊT RAM', 'CÁ KHO']
];
assert.throws(() => context.deleteMealDashboardResponse_(deleteRequest), /không duy nhất|mơ hồ|trùng/i);
assert.strictEqual(responseRowsForDelete.length, 3);
assert.ok(!/ensureCleanupTrigger_\(\);/.test(source));
assert.ok(!/trashMealFile_\(/.test(source));
console.log('MealForm folder lifecycle checks passed');
