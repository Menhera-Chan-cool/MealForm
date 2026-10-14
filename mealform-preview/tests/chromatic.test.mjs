import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('Chromatic refuses to upload without a project token and explains recovery', () => {
  const env = { ...process.env };
  delete env.CHROMATIC_PROJECT_TOKEN;
  const result = spawnSync(process.execPath, ['scripts/chromatic.mjs'], { cwd: new URL('../', import.meta.url), env, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CHROMATIC_PROJECT_TOKEN/);
});
