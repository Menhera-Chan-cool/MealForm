import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildTokens } from '../scripts/build-tokens.mjs';

// Catches lost Token Set aliases, missing units and theme bleed in the actual compiler output.
test('compiles Free Token Sets to theme variables and a Tailwind bridge', async () => {
  const tokens = JSON.parse(await readFile(new URL('../../meal-viewer/design/tokens.json', import.meta.url), 'utf8'));
  const dir = await mkdtemp(join(tmpdir(), 'mealform-tokens-'));
  await buildTokens(tokens, dir);
  assert.equal(await access(join(dir, 'variables.css')).then(() => true, () => false), true, 'compiler must write variables.css');
  const css = await readFile(join(dir, 'variables.css'), 'utf8');
  assert.match(css, /--token-color-primary:\s*#357185/i);
  assert.match(css, /--token-space-md:\s*16px/);
  assert.match(css, /--token-font-family:\s*['"]?Noto Sans/);
  assert.match(css, /--token-light-background:\s*#f5f8f9/i);
  assert.match(css, /--token-dark-background:\s*#0d1517/i);
  assert.doesNotMatch(css, /\{(?:brand|neutral)\./);
  const bridge = await readFile(join(dir, 'tailwind.css'), 'utf8');
  assert.match(bridge, /--color-background:\s*var\(--background\)/);
  assert.match(bridge, /--primary:\s*var\(--token-color-primary\)/);
  const first = css;
  await buildTokens(tokens, dir);
  assert.equal(await access(join(dir, 'variables.css')).then(() => true, () => false), true, 'compiler must write updated brand');
  assert.equal(await readFile(join(dir, 'variables.css'), 'utf8'), first);
});

// Catches accidental fallback to green or stale brand constants after a token edit.
test('changing the source brand propagates through shared aliases', async () => {
  const tokens = JSON.parse(await readFile(new URL('../../meal-viewer/design/tokens.json', import.meta.url), 'utf8'));
  tokens.primitives.brand.primary.value = '#7c3aed';
  const dir = await mkdtemp(join(tmpdir(), 'mealform-brand-'));
  await buildTokens(tokens, dir);
  assert.match(await readFile(join(dir, 'variables.css'), 'utf8'), /--token-color-primary:\s*#7c3aed/i);
});

test('fails on an unresolved alias instead of silently shipping broken CSS', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mealform-bad-token-'));
  await assert.rejects(buildTokens({ shared: { color: { primary: { value: '{missing.color}', type: 'color' } } } }, dir));
});

test('fails on cyclic token references', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mealform-cycle-'));
  await assert.rejects(buildTokens({ shared: {
    a: { value: '{b}', type: 'color' }, b: { value: '{a}', type: 'color' }
  } }, dir));
});
