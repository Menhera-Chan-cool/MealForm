import assert from 'node:assert/strict';
let draft;
try { draft = await import('./src/ocr-draft.mjs'); } catch { /* Expected before implementation. */ }
assert.equal(typeof draft?.normalizeOcrDraft, 'function', 'draft validation must exist');
const menu = { title: 'Tuần thử', days: [{ day: 'Thứ 2', date: '12/10/2026', meals: ['A', '', 'C'] }] };
const saved = draft.normalizeOcrDraft({ version: 1, accountId: 'account-a', image: 'data:image/png;base64,AA==', filename: 'menu.png', menu, savedAt: 100, secret: 'never-save', allowMissing: true }, 'account-a');
assert.equal(saved.menu.days[0].meals[1], '');
assert.equal(saved.secret, undefined); assert.equal(saved.allowMissing, undefined);
assert.equal(draft.normalizeOcrDraft(saved, 'account-b'), null);
assert.equal(draft.normalizeOcrDraft({ ...saved, version: 9 }, 'account-a'), null);
assert.equal(draft.normalizeOcrDraft({ ...saved, image: 'javascript:alert(1)' }, 'account-a'), null);
assert.equal(draft.normalizeOcrDraft({ ...saved, menu: { ...menu, title: 'x'.repeat(501) } }, 'account-a'), null, 'do not silently truncate unsaved edits');
assert.equal(draft.normalizeOcrDraft({ ...saved, menu: { title: 'Broken', days: {} } }, 'account-a'), null);
await assert.rejects(() => draft.readOcrDraft('account-a'), /trình duyệt|lưu/);
console.log('OCR draft identity, content validation and unavailable-storage errors passed');
