import assert from 'node:assert/strict';
import fs from 'node:fs';
const file=new URL('./dist/version.json',import.meta.url);
assert.equal(fs.existsSync(file),true,'build must emit public non-secret version metadata');
const metadata=JSON.parse(fs.readFileSync(file,'utf8'));
assert.deepEqual(Object.keys(metadata),['id']);assert.match(metadata.id,/^[\w-]{1,100}$/);
console.log('Public version metadata contains one non-secret build identity');
