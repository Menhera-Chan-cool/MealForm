import { test, expect } from '@playwright/test';

test('viewer responsive layout, focus and large text stay readable across PC/mobile themes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('/viewer');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `review/viewer/current-${width}-light.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const control of await page.locator('.viewer-nav a, .viewer-heading button, .viewer-tools button').all()) {
      const box = (await control.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole('button', { name: 'Tùy chọn viewer' }).click();
    await page.getByRole('menuitemradio', { name: 'Tối', exact: true }).click();
    await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))));
    await page.screenshot({ path: `review/viewer/current-${width}-dark.png` });
    await page.getByRole('button', { name: 'Tùy chọn viewer' }).click();
    await page.getByRole('menuitemradio', { name: 'Lớn', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))));
    await page.screenshot({ path: `review/viewer/current-${width}-large-dark.png` });
  }
  await page.getByRole('link', { name: 'Kho tuần cũ', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Kho tuần cũ', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))));
  await page.screenshot({ path: 'review/viewer/archive-mobile-dark.png', fullPage: true });
  await page.getByRole('button', { name: /Xem tuần 28/ }).click();
  await expect(page.locator('.viewer-summary')).toContainText('02/10/2026');
  await page.getByRole('button', { name: 'Nâng cao', exact: true }).click();
  await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))));
  await page.screenshot({ path: 'review/viewer/advanced-mobile-dark.png' });
  expect(errors).toEqual([]);
});

test('Storybook viewer states render locally with stable readable captures', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const [story, heading] of [['next-week-mobile', 'Thực đơn tuần sau'], ['empty-next', 'Chưa có thực đơn'], ['loading', 'Đang tải dữ liệu'], ['error-state', 'Chưa tải được'], ['login', 'Đăng nhập hoặc'], ['week-notice', 'Thực đơn tuần này']]) {
    await page.setViewportSize({ width: 390, height: 960 });
    await page.goto(`http://127.0.0.1:6006/iframe.html?id=mealform-viewer--${story}&viewMode=story`);
    await expect(page.locator('.viewer-preview')).toContainText(heading);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `review/viewer/story-${story}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});
