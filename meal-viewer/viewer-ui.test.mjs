import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const vite = await createServer({
  configFile: false,
  root: fileURLToPath(new URL('.', import.meta.url)),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent'
});

try {
  const { default: DetailTable } = await vite.ssrLoadModule('/src/DetailTable.jsx');
  const { default: FilterControls } = await vite.ssrLoadModule('/src/FilterControls.jsx');
  const { default: MealFormLink } = await vite.ssrLoadModule('/src/MealFormLink.jsx');
  const { default: ChevronIcon } = await vite.ssrLoadModule('/src/ChevronIcon.jsx');
  const { default: FormStatus } = await vite.ssrLoadModule('/src/FormStatus.jsx');
  const { shouldAnimateDisclosureClose } = await vite.ssrLoadModule('/src/useDisclosureAnimation.js');
  const { shouldShowViewerMessage } = await vite.ssrLoadModule('/src/viewer-model.mjs');
  const { MotionPreferenceToggle } = await vite.ssrLoadModule('/src/App.jsx');
  const { default: SetupChecklist } = await vite.ssrLoadModule('/src/SetupChecklist.jsx');
  const { dashboardRequest } = await vite.ssrLoadModule('/src/Dashboard.jsx');
  const originalFetch = globalThis.fetch;
  try {
    let unauthorizedStatus = 0;
    globalThis.fetch = async () => ({ status: 401, ok: false, json: async () => ({ error: 'Phiên đã hết hạn.' }) });
    await assert.rejects(dashboardRequest('/api/dashboard', {}, (_, status) => { unauthorizedStatus = status; }), /hết hạn/);
    assert.equal(unauthorizedStatus, 401, 'expired requests must return directly to login, not require a manual logout');
  } finally { globalThis.fetch = originalFetch; }
  const setup = renderToStaticMarkup(createElement(SetupChecklist, { authenticated: false }));
  assert.match(setup, /class="action-link"[^>]*href="\/newest"/);
  assert.match(setup, /class="action-link"[^>]*href="https:\/\/drive\.google\.com\//);
  const html = renderToStaticMarkup(createElement(DetailTable, {
    model: {
      headers: ['Dấu thời gian', 'Họ và tên', 'Thứ 2'],
      rows: [['25/09/2026 12:00', 'Nguyễn An', 'Cơm gà']]
    }
  }));

  assert.match(html, /mobile-cell-label[^>]*>Họ và tên<\/span>/);
  assert.match(html, /mobile-cell-label[^>]*>Thứ 2<\/span>/);
  assert.match(html, /<span>Nguyễn An<\/span>/);
  assert.match(html, /<span>Cơm gà<\/span>/);

  const filters = renderToStaticMarkup(createElement(FilterControls, {
    days: [{ day: 'Thứ 3 (29/09/2026)' }],
    nameOptions: ['Anh Tuấn'],
    mealOptions: ['Cơm gà'],
    filters: { name: 'Anh Tuấn', day: 'Thứ 3 (29/09/2026)', meal: 'Cơm gà' },
    onChange() {}
  }));
  assert.equal([...filters.matchAll(/class="chevron-icon(?: expanded)?"[^>]*aria-hidden="true"/g)].length, 4, 'three dropdowns and mobile filter disclosure have chevrons');
  assert.equal([...filters.matchAll(/role="listbox"/g)].length, 3, 'all three filters should use the same animated dropdown');
  assert.doesNotMatch(filters, />⌄</);
  assert.match(filters, /class="combo-menu[^"]*"[^>]*aria-hidden="true"[^>]*inert=""/);

  const formUrl = 'https://docs.google.com/forms/d/e/example/viewform';
  const unknownLink = renderToStaticMarkup(createElement(MealFormLink, { formUrl, status: 'unknown' }));
  const openLink = renderToStaticMarkup(createElement(MealFormLink, { formUrl, status: 'open' }));
  const closedLink = renderToStaticMarkup(createElement(MealFormLink, { formUrl, status: 'closed' }));
  assert.match(unknownLink, /class="form-link meal-form-link unknown"/);
  assert.match(openLink, /class="form-link meal-form-link open"/);
  assert.match(closedLink, /class="form-link meal-form-link closed"/);
  assert.match(openLink, /href="https:\/\/docs\.google\.com\/forms\/d\/e\/example\/viewform"/);
  assert.match(renderToStaticMarkup(createElement(ChevronIcon, { expanded: false })), /class="chevron-icon"/);
  assert.match(renderToStaticMarkup(createElement(ChevronIcon, { expanded: true })), /class="chevron-icon expanded"/);
  const loadingStatus = renderToStaticMarkup(createElement(FormStatus, { status: 'unknown' }));
  const openStatus = renderToStaticMarkup(createElement(FormStatus, { status: 'open' }));
  const closedStatus = renderToStaticMarkup(createElement(FormStatus, { status: 'closed' }));
  assert.match(loadingStatus, /aria-label="Loading form"/);
  assert.match(loadingStatus, /form-status-spinner/);
  assert.doesNotMatch(loadingStatus, /Chưa xác định trạng thái Form/);
  assert.match(openStatus, /aria-label="Form đang mở"/);
  assert.match(openStatus, /class="form-status-animation fax-animation"/);
  assert.match(openStatus, /class="fax-envelope-open"/);
  assert.match(openStatus, /class="fax-envelope-closed"/);
  assert.match(openStatus, /class="fax-success-ring"/);
  assert.match(openStatus, /class="fax-success-smile"/);
  assert.match(openStatus, /class="fax-success-check"/);
  assert.match(openStatus, /class="form-status-message">Form đang mở/);
  assert.ok(openStatus.indexOf('class="form-status-animation fax-animation"') < openStatus.indexOf('class="form-status-message"'));
  assert.match(closedStatus, /aria-label="Form đã đóng"/);
  assert.match(closedStatus, /class="form-status-animation closed-cross-animation"/);
  assert.equal([...closedStatus.matchAll(/class="closed-cross-line/g)].length, 2);
  assert.equal(shouldAnimateDisclosureClose(true, 'full'), true);
  assert.equal(shouldAnimateDisclosureClose(true, ''), false);
  assert.equal(shouldAnimateDisclosureClose(false, ''), true);
  assert.equal(shouldShowViewerMessage('Đang tải dữ liệu…'), false);
  assert.equal(shouldShowViewerMessage('Không thể tải dữ liệu thực đơn.'), true);

  const cssFile = readdirSync(new URL('./dist/assets/', import.meta.url)).find(file => file.endsWith('.css'));
  const css = readFileSync(new URL(`./dist/assets/${cssFile}`, import.meta.url), 'utf8');
  const mobileGrid = css.indexOf('.actions{grid-template-columns:repeat(3,minmax(0,1fr))');
  const desktopFlex = css.indexOf('.actions{flex-wrap:wrap;align-items:center;gap:9px;display:flex}');
  const oldMobileButtons = css.indexOf('.actions button{flex:1;min-height:48px;font-size:17px}');
  const evenMobileButtons = css.indexOf('.actions button{white-space:normal;width:100%;min-width:0;min-height:64px;');
  assert.ok(mobileGrid > desktopFlex, 'mobile grid must override desktop toolbar layout');
  assert.ok(evenMobileButtons > oldMobileButtons, 'equal mobile button sizing must override old sizing');
  assert.match(css, /\.combo-menu\.open\{/);
  assert.doesNotMatch(css, /body:has\(\.combo\.active\):before/);
  assert.match(css, /\.collapse-panel\.collapsed\{[^}]*transform:translateY\(-10px\)/);
  assert.match(css, /animation:[^;}]*form-status-arrive/);
  assert.match(css, /\.detail-results\{animation:[^;}]*detail-filter-in/);
  assert.match(css, /\.meal-form-link\.unknown\{[^}]*background-color:#e8c04a/);
  assert.match(css, /animation:[^;}]*meal-form-open/);
  assert.match(css, /\.combo-menu\.open\{[^}]*height:calc\(/);
  assert.match(css, /\.combo-menu\.closing\{[^}]*transition:height \.65s/);
  assert.match(css, /\.combo-menu\.open \.combo-option\{animation:[^;}]*dropdown-option-in/);
  assert.match(css, /\.combo-menu\.closing \.combo-option\{animation:[^;}]*dropdown-option-out/);
  assert.match(css, /\.collapse-panel\.closing\{/);
  assert.match(css, /\.detail-results\{animation:\.45s cubic-bezier/);
  assert.match(css, /animation:\.95s cubic-bezier\(\.22,1,\.36,1\) both meal-form-open/);
  assert.match(css, /\.form-status\{[^}]*background-color \.95s cubic-bezier\(\.22,1,\.36,1\)/);
  assert.match(css, /\.meal-form-link\.closed\{[^}]*background-color:#fff0ef/);
  assert.match(css, /\.chevron-icon\{[^}]*transition:transform \.32s cubic-bezier/);
  assert.match(css, /\.chevron-icon\.expanded\{transform:rotate\(180deg\)\}/);
  assert.match(css, /\.combo\.active input\{/);
  assert.match(css, /\.combo\.active:after\{/);
  assert.match(css, /\.section-toggle\[data-active=true\]\{[^}]*background:#087f5b/);
  assert.match(css, /\.section-toggle\{(?=[^}]*display:grid)(?=[^}]*place-items:center)[^}]*\}/);
  assert.match(css, /@keyframes dropdown-option-in/);
  assert.match(css, /@keyframes dropdown-option-out/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{[^}]*animation:none!important/);
  assert.match(css, /:root:not\(\[data-motion-override=full\]\)/);
  assert.match(css, /@keyframes donut-loading/);
  assert.match(css, /@keyframes fax-icon-travel/);
  assert.ok(css.includes('78%{opacity:1;transform:translate(-50%,-50%)translate(-90px)scale(.9)}'), 'status icon must clear the label path before it centers');
  assert.match(css, /\.form-status-sequence\.open \.form-status-animation\{[^}]*animation:4\.6s/);
  assert.match(css, /@keyframes fax-status-text-in/);
  assert.match(css, /@keyframes fax-document-sequence/);
  assert.match(css, /@keyframes fax-envelope-open-sequence/);
  assert.match(css, /@keyframes fax-envelope-closed-sequence/);
  assert.match(css, /@keyframes fax-success-ring/);
  assert.match(css, /@keyframes fax-success-smile/);
  assert.match(css, /@keyframes fax-success-check/);
  assert.match(css, /@keyframes closed-cross-draw/);
  assert.match(css, /\.form-status-sequence\.closed \.form-status-animation\{[^}]*fax-icon-travel/);
  assert.match(css, /@keyframes fax-status-text-in\{0%\{opacity:0;left:calc\(50% \+ 30px\);transform:translateY\(-50%\)\}to\{opacity:1;left:50%;transform:translate\(-50%,-50%\)\}\}/);
  assert.match(renderToStaticMarkup(createElement(MotionPreferenceToggle, { reducedMotion: true, fullMotion: false, onToggle() {} })), /aria-pressed="false"[^>]*>Bật hiệu ứng đầy đủ/);
  assert.equal(renderToStaticMarkup(createElement(MotionPreferenceToggle, { reducedMotion: false, fullMotion: false, onToggle() {} })), '');
} finally {
  await vite.close();
}

console.log('Responsive viewer control checks passed');
