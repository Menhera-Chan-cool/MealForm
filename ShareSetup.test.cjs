const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const properties = new Map();
let folders = [];
let formCreations = 0;
const context = vm.createContext({
  Utilities: { formatDate: () => '2026-10-07' },
  PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties.get(key) || '' }) },
  ScriptApp: { AuthMode: { FULL: 'FULL' }, requireAllScopes() {} },
  DriveApp: { getFolderById(id) { folders.push(id); return { getName: () => 'Recipient folder' }; } },
  FormApp: { create() { formCreations++; throw new Error('A setup check must not create Forms'); } },
  HtmlService: { createHtmlOutput(html) { return { html, setTitle() { return this; } }; } }
});
vm.runInContext(fs.readFileSync(path.join(__dirname, 'MealForm.gs'), 'utf8'), context);

// Wrong configuration must not create a Form or send users to the original owner's site.
assert.throws(() => context.getViewerUrl_('test-sheet', null), /MEAL_VIEWER_ORIGIN/);
properties.set('MEAL_VIEWER_ORIGIN', 'https://recipient.example/');
assert.equal(context.getViewerUrl_('test-sheet', null), 'https://recipient.example/?view=test-sheet');
assert.ok(context.doGet({ parameter: { view: 'test-sheet' } }).html.includes('https://recipient.example/?view=test-sheet'));
assert.ok(context.doGet({ parameter: {} }).html.includes('https://recipient.example/dashboard'));
for (const invalid of ['http://recipient.example', 'https://recipient.example/dashboard', 'https://recipient.example?x=1', 'https://recipient.example\" onclick=\"alert(1)']) {
  properties.set('MEAL_VIEWER_ORIGIN', invalid);
  assert.throws(() => context.getViewerUrl_('test-sheet', null), /MEAL_VIEWER_ORIGIN/);
}
properties.set('MEAL_VIEWER_ORIGIN', 'https://recipient.example');
assert.throws(() => context.authorizeMealViewerAccess(), /MEAL_FORM_ROOT_FOLDER_ID/);
assert.deepEqual(folders, []);
properties.set('MEAL_FORM_ROOT_FOLDER_ID', 'https://drive.google.com/drive/folders/recipient-folder');
assert.throws(() => context.authorizeMealViewerAccess(), /MEAL_FORM_ROOT_FOLDER_ID/);
properties.set('MEAL_FORM_ROOT_FOLDER_ID', 'recipient-folder');
assert.equal(context.authorizeMealViewerAccess(), 'Recipient folder');
assert.deepEqual(folders, ['recipient-folder']);
properties.set('MEAL_FORM_OWNER_EMAIL', 'owner@example.com');
properties.delete('MEAL_FORM_ROOT_FOLDER_ID');
const menu = { days: ['12/10/2026', '13/10/2026', '14/10/2026', '15/10/2026', '16/10/2026'].map((date, index) => ({ day: `Thứ ${index + 2}`, date, meals: ['Món A', 'Món B', 'Món C'] })) };
assert.throws(() => context.createMealForm(menu, 'owner@example.com'), /MEAL_FORM_ROOT_FOLDER_ID/);
assert.equal(formCreations, 0);
console.log('Share setup: isolated domain, folder, and pre-creation configuration checks passed');
