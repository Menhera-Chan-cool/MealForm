import { test, expect } from '@playwright/test';

test('desktop has grouped tools and switches theme without a green fallback', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Dashboard quản trị' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Quản trị' })).toBeVisible();
  await page.getByRole('button', { name: 'Tùy chọn giao diện' }).click();
  await page.getByRole('menuitemradio', { name: 'Tối', exact: true }).click();
  await expect(page.locator('.admin-preview')).toHaveClass(/theme-dark/);
  await expect(page.locator('.admin-preview')).toHaveCSS('background-color', 'rgb(13, 21, 23)');
  await expect(page.getByRole('button', { name: 'Xem lượt gửi', exact: true })).toHaveCSS('background-color', 'rgb(53, 113, 133)');
  await expect(page.locator('.week-card')).toHaveCSS('color', 'rgb(225, 234, 237)');
  await expect(page.locator('.status-badge')).toHaveCSS('background-color', 'rgb(35, 48, 53)');
});

test('mobile icon controls meet the 44px target even when Radix replaces data-slot', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 960 });
  await page.goto('/');
  const size = await page.getByRole('button', { name: 'Tùy chọn giao diện' }).boundingBox();
  expect(size!.width).toBeGreaterThanOrEqual(44);
  expect(size!.height).toBeGreaterThanOrEqual(44);
});

test('mobile More keeps all tools reachable and submission quick view is read-only', async ({ page }) => {
  const remoteRequests: string[] = [];
  page.on('request', req => { if (!req.url().startsWith('http://127.0.0.1')) remoteRequests.push(req.url()); });
  await page.setViewportSize({ width: 390, height: 960 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Điều hướng điện thoại' });
  await nav.getByRole('button', { name: 'Thêm', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mở trang xem', exact: true })).toBeVisible();
  for (const name of ['Điều khiển Form', 'Thông báo tuần', 'Đối soát', 'Thương hiệu', 'Hệ thống', 'Quyền Gmail']) {
    await expect(page.getByRole('button', { name: new RegExp(`^${name}`) })).toBeVisible();
  }
  await nav.getByRole('button', { name: 'Lượt gửi', exact: true }).click();
  await expect(page.getByText('Minh Anh', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Xem nhanh lượt của Minh Anh' }).click();
  await expect(page.getByRole('dialog')).toContainText('Chỉ xem · dữ liệu minh họa');
  await expect(page.getByRole('dialog')).toContainText('Thứ Sáu');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(remoteRequests).toEqual([]);
});

test('navigation buttons change preview surface but never mutate production', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Điều khiển Form', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Điều khiển Form', exact: true })).toBeVisible();
  await expect(page.getByText('Bản xem bố cục — không kết nối dữ liệu thật.')).toBeVisible();
  await page.getByRole('button', { name: 'Tổng quan', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Xem lượt gửi', exact: true })).toBeVisible();
});

test('image drop stays local and rejects non-image files', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Tạo tuần bằng OCR', exact: true }).first().click();
  await page.locator('.upload-area').evaluate(element => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(['demo'], 'menu.png', { type: 'image/png' }));
    element.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: transfer }));
  });
  await expect(page.getByRole('status')).toContainText('menu.png');
  await page.locator('.upload-area').evaluate(element => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(['demo'], 'menu.txt', { type: 'text/plain' }));
    element.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: transfer }));
  });
  await expect(page.locator('.preview-notice')).toContainText('Chỉ chọn ảnh PNG, JPEG hoặc WEBP.');
  await expect(page.locator('.ocr-preview [role="status"]')).toContainText('menu.png');
});
