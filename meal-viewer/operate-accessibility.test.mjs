import assert from 'node:assert/strict';
import {validateImageFiles} from './src/image-import.mjs';
assert.throws(()=>validateImageFiles([{name:'menu-3.webp',type:'application/pdf',size:12}]),/menu-3\.webp/,'invalid file identifies the original filename');
let ui;
try{ui=await import('./src/operate-accessibility.mjs');}catch{}
assert.equal(typeof ui?.shortFilename,'function');
assert.equal(ui.shortFilename('menu.png'),'menu.png');
assert.equal(ui.shortFilename('a'.repeat(60)+'.webp'),'a'.repeat(24)+'…'+'a'.repeat(12)+'.webp');
assert.equal(ui.shortFilename('😀'.repeat(60)+'.png'),'😀'.repeat(24)+'…'+'😀'.repeat(12)+'.png');
assert.deepEqual(ui.brandFieldErrors({schoolName:' ',logoUrl:'http://bad.test/x.png',primaryColor:'#123456'}).map(error=>error.field),['schoolName','logoUrl']);
assert.equal(ui.brandFieldErrors({schoolName:'Trường A',logoUrl:'',primaryColor:'#123456'}).length,0);
assert.deepEqual(ui.noticeFieldErrors('', '2026-02-30').map(error=>error.field),['text','endsOn']);
assert.equal(ui.noticeFieldErrors('Nghỉ thứ Tư','2026-10-21').length,0);
console.log('Named upload errors, original-safe filename display and actual form field errors passed');
