import assert from 'node:assert/strict';
import { inspectMenu } from './src/dashboard-model.mjs';
import fs from 'node:fs';
import vm from 'node:vm';

const menu = {
  days: [
    { day: 'Thứ 2', date: '28/09/2026', meals: ['A', 'B', 'C'] },
    { day: 'Thứ 3', date: '29/09/2026', meals: ['A', 'B'] },
    { day: 'Thứ 4', date: '30/09/2026', meals: ['A', 'B', 'C'] },
    { day: 'Thứ 5', date: '01/10/2026', meals: ['A', 'B', 'C'] },
    { day: 'Thứ 6', date: '02/10/2026', meals: ['A', 'B', 'C'] }
  ]
};

assert.deepEqual(inspectMenu(menu).missingMealDays, ['Thứ 3']);
assert.equal(inspectMenu(menu).canCreate, false);
assert.equal(inspectMenu(menu, true).canCreate, true);
assert.ok(inspectMenu({ ...menu, days: menu.days.map((day, i) => i ? day : { ...day, date: '29/09/2026' }) }).dateError);
assert.equal(inspectMenu({ ...menu, days: menu.days.map((day, i) => i ? day : { ...day, meals: ['A'] }) }).canCreate, false);
const issues = inspectMenu({ ...menu, days: menu.days.map((day, i) => i === 2 ? { ...day, date: '31/02/2026', meals: ['A', '', 'C'] } : day) });
assert.ok(Array.isArray(issues.dayIssues));
assert.match(issues.dayIssues[2].dateError, /không hợp lệ/);
assert.deepEqual(issues.dayIssues[2].missingMealSlots, [1]);
assert.equal(issues.dayIssues[0].dateError, '');
const wrongWeek = inspectMenu({ ...menu, days: menu.days.map((day, i) => i === 3 ? { ...day, date: '08/10/2026' } : day) });
assert.match(wrongWeek.dayIssues[3].dateError, /01\/10\/2026/);
assert.equal(inspectMenu({ ...menu, days: menu.days.map((day, i) => i ? day : { ...day, date: '' }) }).dayIssues[1].dateError, '');
assert.equal(inspectMenu(menu, true).dayIssues[1].missingMealSlots.length, 1);
const gas = vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../MealForm.gs', import.meta.url), 'utf8'), gas);
const draft = { ...menu, days: menu.days.map((day, i) => i === 2 ? { ...day, meals: ['', 'A', ''] } : day) };
assert.deepEqual(Array.from(gas.normalizeMenu_(draft, true).days[2].meals), ['', 'A', '']);
assert.throws(() => gas.normalizeMenu_(draft), /ít nhất 2 món/);
console.log('Dashboard menu validation checks passed');
