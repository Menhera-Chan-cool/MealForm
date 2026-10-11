async page => {
  const p = await page.context().newPage();
  let hold = false, release, overviewRelease, failed = false, account = 'qol-owner', polls = 0, writes = [];
  const week = { weekKey: 'qol-week', name: 'Tuần kiểm thử', formStatus: 'open', lockAt: '2030-10-12T00:00:00+07:00', responseCount: 1 };
  const row = { responseId: 'one', deleteToken: 'DO-NOT-PERSIST', timestamp: 1791456000000, name: 'Người kiểm thử', meals: ['Cơm gà'], rowNumber: 2, deletable: true };
  let ids = ['one'];
  const note = JSON.stringify({ before: { formStatus: 'open', lockAt: week.lockAt }, after: { formStatus: 'closed', lockAt: week.lockAt } });
  await p.clock.install();
  await p.route('**/api/session', r => r.fulfill({ json: { authenticated: r.request().method() !== 'DELETE' } }));
  await p.route('**/api/branding', r => r.fulfill({ json: { schoolName: '', logoUrl: '', primaryColor: '#087f5b', updatedAt: 0 } }));
  await p.route('**/api/dashboard*', async r => {
    const url = r.request().url(), method = r.request().method();
    if (method !== 'GET') { writes.push(r.request().postDataJSON()); return r.fulfill({ json: { deleted: true, changed: true } }); }
    if (url.includes('updates=1')) { polls++; return r.fulfill({ json: { weekKey: week.weekKey, responseIds: ids } }); }
    if (url.includes('locate=1')) return r.fulfill({ json: { spreadsheetId: 'test-sheet', sheetId: 71, rows: [5, 6] } });
    if (url.includes('reconcile=1')) return r.fulfill({ json: { formCount: 2, sheetCount: 2, matchedCount: 0, issues: [{ kind: 'ambiguous', source: 'form', responseId: 'one', name: row.name, timestamp: row.timestamp, meals: row.meals, rows: [2, 3] }] } });
    if (url.includes('access=1')) return r.fulfill({ json: { role: 'owner', accountId: account, permissions: { view: true, create: true, manageResponses: true }, weeks: [{ ...week, formStatus: 'unknown' }], overviewPending: true } });
    if (url.includes('?week=')) {
      if (hold) await new Promise(resolve => { release = resolve; });
      if (failed) return r.fulfill({ status: 502, json: { error: 'Lỗi mạng thử nghiệm' } });
      return r.fulfill({ json: { week, responseCount: 1, responseIds: ids, responses: [row], history: [{ id: 'audit', action: 'form-closed', at: row.timestamp, actor: 'owner@example.com', name: 'Điều khiển Form', note }] } });
    }
    if (hold) await new Promise(resolve => { overviewRelease = resolve; });
    return r.fulfill({ json: { role: 'owner', accountId: account, permissions: { view: true, create: true, manageResponses: true }, weeks: [week], allowedEmails: [] } });
  });
  const checks = [];
  for (const width of [1280,390]) {
    hold = false; failed = false;
    await p.setViewportSize({ width, height: 920 });
    await p.goto('http://127.0.0.1:5176/dashboard');
    await p.getByRole('button', { name: 'Lượt gửi & lịch sử', exact: true }).click();
    await p.getByRole('button', { name: 'Tải lại dữ liệu', exact: true }).waitFor({ timeout: 3000 });
    await p.getByRole('button', { name: 'Xóa lượt này', exact: true }).waitFor();
    await p.waitForFunction(() => ![...document.querySelectorAll('button')].find(b => b.textContent === 'Xóa lượt này')?.disabled);
    if ((await p.locator('.dashboard-history-table').innerText()).includes('"formStatus"')) throw Error('Raw JSON still visible');
    if (!(await p.locator('.dashboard-history-table').innerText()).includes('không đổi')) throw Error('Deadline text missing');
    if (await p.evaluate(() => Object.entries(localStorage).some(([k,v]) => k.startsWith('meal-dashboard-cache') && v.includes('DO-NOT-PERSIST')))) throw Error('Delete token cached');
    hold = true;
    await p.reload();
    await p.locator('[data-response-id="one"]').filter({hasText:'Người kiểm thử'}).waitFor({ timeout: 3000 });
    if (!await p.getByRole('button', { name: 'Xóa lượt này', exact: true }).isDisabled()) throw Error('Cached deletion enabled');
    await p.getByText(/Bản lưu.*Đang xác minh/).waitFor();
    await p.getByRole('button',{name:'Xem nhanh',exact:true}).click();
    await p.getByRole('dialog').getByText(/Bản lưu chưa xác minh/).waitFor();
    row.meals=['Cá mới'];
    if (!release) await p.waitForFunction(() => document.querySelector('.dashboard-cache-status'));
    hold = false; release(); overviewRelease?.();
    await p.waitForFunction(() => ![...document.querySelectorAll('button')].find(b => b.textContent === 'Xóa lượt này')?.disabled);
    await p.getByRole('dialog').getByText('Cá mới',{exact:true}).waitFor({timeout:3000});
    await p.keyboard.press('Escape');row.meals=['Cơm gà'];
    ids = ['two'];
    await p.clock.runFor(61000);
    await p.getByText('Có 1 lượt gửi mới', { exact: true }).waitFor();
    await p.locator('[data-response-id="one"]').filter({hasText:'Người kiểm thử'}).waitFor();
    await p.getByRole('button', { name: 'Tải lại dữ liệu', exact: true }).click();
    await p.waitForFunction(() => !document.querySelector('.dashboard-new-badge'));
    ids = ['one'];
    await p.getByRole('button', { name: 'Xóa lượt này', exact: true }).click();
    await p.getByRole('dialog').waitFor();
    await p.getByLabel('Lý do (tùy chọn)').fill('Người gửi yêu cầu xóa');
    await p.getByRole('button', { name: 'Xác nhận', exact: true }).click();
    await p.waitForFunction(() => !document.querySelector('dialog[open]'));
    await p.waitForFunction(() => ![...document.querySelectorAll('button')].find(b => b.textContent === 'Xóa lượt này')?.disabled);
    if (writes.at(-1)?.reason !== 'Người gửi yêu cầu xóa') throw Error('Deletion reason not forwarded');
    await p.getByRole('button', { name: 'Mở hàng trong Sheet', exact: true }).click();
    await p.getByRole('link', { name: 'Hàng 5', exact: true }).waitFor();
    if ((await p.getByRole('link', { name: 'Hàng 5', exact: true }).getAttribute('href')) !== 'https://docs.google.com/spreadsheets/d/test-sheet/edit#gid=71&range=A5') throw Error('Wrong row/gid');
    await p.getByRole('button', { name: 'Điều khiển Form', exact: true }).click();
    await p.getByRole('button', { name: 'Đóng Form', exact: true }).click();
    await p.getByLabel('Lý do (tùy chọn)').fill('Đã chốt số lượng');
    await p.getByRole('button', { name: 'Xác nhận', exact: true }).click();
    await p.waitForFunction(() => !document.querySelector('dialog[open]'));
    await p.getByText('Đã cập nhật Form và lịch khóa.', { exact: true }).first().waitFor();
    if (writes.at(-1)?.reason !== 'Đã chốt số lượng') throw Error('Form reason not forwarded');
    await p.getByRole('button', { name: 'Lượt gửi & lịch sử', exact: true }).click();
    await p.waitForFunction(() => ![...document.querySelectorAll('button')].find(b => b.textContent === 'Xóa lượt này')?.disabled);
    if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Document overflow');
    if (width === 390) await p.screenshot({ path: 'dashboard-qol-mobile.png', fullPage: true });
    failed = true;
    await p.getByRole('button', { name: 'Tải lại dữ liệu', exact: true }).click();
    await p.getByRole('alert').filter({ hasText: 'Lỗi mạng thử nghiệm' }).waitFor();
    if (!await p.getByRole('button', { name: 'Xóa lượt này', exact: true }).isDisabled()) throw Error('Failed refresh left mutation enabled');
    await p.locator('[data-response-id="one"]').filter({hasText:'Người kiểm thử'}).waitFor();
    checks.push({ width, cacheVisibleBeforeResponse: true, tokenNotPersisted: true, accurateBadge: true, notes: true, freshSheetLocation: true, readableHistory: true, errorKeepsReadOnlyRows: true });
  }
  failed = false;
  await p.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await p.getByRole('heading', { name: 'Đăng nhập để quản trị' }).waitFor();
  if (await p.evaluate(() => Object.keys(localStorage).some(k => k.startsWith('meal-dashboard-cache')))) throw Error('Logout did not clear cache');
  checks.push({ polls, logoutClearedCache: true });
  await p.close();
  return checks;
}
