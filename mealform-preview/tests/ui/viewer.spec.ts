import { test, expect } from '@playwright/test';

test('viewer filters immediately using original accent-folded model and preserves sort options', async ({ page }) => {
  await page.goto('/viewer');
  await expect(page.getByRole('heading', { name: 'Thực đơn tuần này', exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Họ tên', exact: true }).fill('truong');
  await page.getByRole('combobox', { name: 'Họ tên', exact: true }).press('Escape');
  await expect(page.locator('.viewer-details')).toContainText('Trường An');
  await expect(page.locator('.viewer-details')).not.toContainText('Minh Anh');
  await page.getByRole('button', { name: 'Xóa bộ lọc', exact: true }).click();
  await expect(page.locator('.viewer-details')).toContainText('Minh Anh');
  await page.getByRole('combobox', { name: 'Sắp xếp', exact: true }).click();
  await expect(page.getByRole('option', { name: 'Cũ nhất', exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Tên A–Z', exact: true })).toBeVisible();
});

test('mobile expands secondary filters, keeps controls and full meal cards within screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 960 });
  await page.goto('/viewer');
  await page.getByRole('button', { name: 'Bộ lọc', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Ngày', exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Món', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Áp dụng', exact: true })).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Họ tên', exact: true }).fill('truong');
  await page.getByRole('button', { name: 'Hôm nay', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Họ tên', exact: true })).toHaveValue('');
  await expect(page.locator('.viewer-summary')).toContainText('13/10/2026');
  await page.getByRole('button', { name: 'Tùy chọn viewer' }).click();
  await page.getByRole('menuitemradio', { name: 'Tối', exact: true }).click();
  await expect(page.locator('.viewer-preview')).toHaveCSS('background-color', 'rgb(13, 21, 23)');
  await expect(page.locator('.combo-toggle .chevron-icon').first()).toHaveCSS('stroke', 'rgb(225, 234, 237)');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('archive uses month filter and opens a selected old week without /old', async ({ page }) => {
  await page.goto('/viewer');
  await page.getByRole('link', { name: 'Kho tuần cũ', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Kho thực đơn tuần cũ' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Tháng', exact: true }).click();
  await page.getByRole('option', { name: '09/2026', exact: true }).click();
  await expect(page.locator('.viewer-archive')).toContainText('28/09/2026');
  await expect(page.locator('.viewer-archive')).not.toContainText('05/10/2026');
  await page.getByRole('button', { name: /Xem tuần 28/ }).click();
  await expect(page.getByRole('heading', { name: 'Thực đơn tuần đã chọn' })).toBeVisible();
});

test('next week and advanced source remain reachable and preview never sends data to a service', async ({ page }) => {
  const outbound: string[] = [];
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1')) outbound.push(request.url()); });
  await page.goto('/viewer');
  await page.getByRole('link', { name: 'Tuần sau', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Thực đơn tuần sau' })).toBeVisible();
  await page.getByRole('button', { name: 'Nâng cao', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'URL Spreadsheet' })).toBeVisible();
  await page.getByRole('textbox', { name: 'URL Spreadsheet' }).fill('invalid');
  await page.getByRole('button', { name: 'Lấy dữ liệu', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('URL hoặc mã Spreadsheet chưa hợp lệ');
  expect(outbound).toEqual([]);
});
