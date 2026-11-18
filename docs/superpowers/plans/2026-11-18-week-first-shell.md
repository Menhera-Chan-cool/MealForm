# Week-first dashboard shell — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay thanh bên và trang Tổng quan của `/dashboard` bằng thanh trên có bộ chọn tuần, tab theo tuần và menu ⚙ (phương án C), kèm nền chuyển động theo quy tắc trong video; không đổi API, Apps Script, quyền hay bước xác nhận.

**Architecture:** Thay lớp vỏ `meal-viewer/src/DashboardLayout.jsx`, giữ nguyên state và các panel trong `Dashboard.jsx`. Logic thuần (tab theo vai trò, hàng của bộ chọn tuần, điều hướng) nằm trong `.mjs` và kiểm thử bằng `node:assert`. Phần DOM kiểm thử bằng Playwright trên entrypoint thật (`production-ui.spec.ts`). Menu ⚙ là menu "Tùy chọn hiển thị" hiện có (`ComfortProvider.jsx`), thêm một khe để Dashboard chèn mục riêng.

**Tech Stack:** React + Vite (`meal-viewer`), `lucide-react`, Playwright 1.64 với Chrome (`mealform-preview`), kiểm thử `node:assert`, CSS thuần. Không thêm thư viện.

**Spec:** `docs/superpowers/specs/2026-11-18-week-first-ui-remake-design.md` (kế hoạch này là giai đoạn 1 của mục 5.7; giai đoạn 2 và 3 lập kế hoạch sau khi bạn duyệt staging lần 1).

## Global Constraints

- Giao diện tiếng Việt; màu chính lấy từ Cài đặt (`BrandingProvider`), không cố định.
- Giữ nguyên quyền owner/manager, mọi xác nhận, nháp OCR, Undo, các biện pháp an toàn danh tính lượt gửi.
- Không đổi API, Apps Script (v82), HMAC, dữ liệu; không thêm thư viện.
- Giữ hỗ trợ tiếp cận: zoom 400%, chữ lớn, tương phản cao, bàn phím, trình đọc màn hình, giảm chuyển động.
- Cơ sở mã là `origin/main` (`d012554`); không dùng nhánh quét mặt.
- Kiểm thử không ghi dữ liệu thật; không push, mở PR hay deploy khi chưa được người dùng cho phép.
- Điểm gãy giữ như hiện nay: 700px và 1100px. Id tab giữ nguyên: `delete`, `form`, `notice`, `reconcile`, `create`, `branding`, `health`, `access`.

## Review Focus

1. Quản lý mở `?tab=branding|health|access|form|notice` bằng URL: phải rơi về Lượt gửi, không thấy dữ liệu của owner. (Task 6)
2. Có nháp chưa lưu (Thông báo tuần, Tạo tuần) rồi đổi tuần hoặc tab: vẫn hỏi xác nhận như cũ, Hủy giữ nguyên. (Task 6)
3. Trường chưa có tuần nào: thanh tuần không vỡ; nút Tạo chỉ hiện khi có quyền tạo. (Task 3, 6)
4. Tên tuần rất dài ở 320px và chữ lớn: không cuộn ngang. (Task 7)
5. Back/Forward sau khi `?tab=overview` được chuyển hướng: không lặp, không mất tuần. (Task 2, 6)

---

### Task 1: Môi trường và đường chuẩn

**Files:**
- Create: `docs/superpowers/specs/2026-11-18-week-first-ui-remake-design.md` (đã sao chép), `docs/superpowers/plans/2026-11-18-week-first-shell.md`

**Interfaces:** không có.

- [ ] **Step 1:** Trong `meal-viewer` và `mealform-preview` chạy `npm ci --ignore-scripts`. Mong đợi: thoát mã 0 ở cả hai.
- [ ] **Step 2:** Chạy đường chuẩn node: `cd meal-viewer && npm test` (chạy nền, quá 10 phút là bình thường). Mong đợi: thoát mã 0.
- [ ] **Step 3:** Chạy đường chuẩn UI: `cd mealform-preview && npm exec -- playwright test --config playwright.production.config.ts`. Mong đợi: tất cả đạt; ghi lại số "N passed" để so ở Task 9.
- [ ] **Step 4:** Commit chỉ hai tệp tài liệu: `docs: add week-first dashboard design and phase-1 plan`.

### Task 2: Điều hướng — tab mặc định và `?tab=overview`

**Files:**
- Modify: `meal-viewer/src/dashboard-navigation.mjs`
- Test: `meal-viewer/dashboard-navigation.test.mjs`

**Interfaces:**
- Produces: `export const DEFAULT_DASHBOARD_TAB = 'delete'`; `readDashboardLocation(search, tabs, weeks, fallback)` giữ nguyên chữ ký, nhưng `tab=overview` được đọc thành `DEFAULT_DASHBOARD_TAB` **chỉ khi** `tabs` không chứa `'overview'` (vỏ cũ vẫn chạy nguyên cho tới Task 6).

- [ ] **Step 1: Viết kiểm thử thất bại** (thêm vào cuối file, trước dòng `console.log`):

```js
assert.equal(nav.DEFAULT_DASHBOARD_TAB,'delete');
const shellTabs=['delete','reconcile','create'],fb={tab:'delete',week:'w1'};
assert.deepEqual(nav.readDashboardLocation('?tab=overview&week=w1',shellTabs,[{weekKey:'w1'}],fb),{tab:'delete',week:'w1'});
assert.deepEqual(nav.readDashboardLocation('?tab=overview&week=w1',['overview','delete'],[{weekKey:'w1'}],{tab:'overview',week:'w1'}),{tab:'overview',week:'w1'});
assert.deepEqual(nav.readDashboardLocation('?tab=branding&week=w1',shellTabs,[{weekKey:'w1'}],fb),fb,'owner-only tab absent from the allowed list falls back');
```

- [ ] **Step 2:** `cd meal-viewer && node dashboard-navigation.test.mjs`. Mong đợi: FAIL vì `DEFAULT_DASHBOARD_TAB` chưa có.
- [ ] **Step 3:** Thêm `DEFAULT_DASHBOARD_TAB` và phép chuyển `overview → DEFAULT_DASHBOARD_TAB` điều kiện như mục Interfaces trong `readDashboardLocation`.
- [ ] **Step 4:** Chạy lại. Mong đợi: PASS.
- [ ] **Step 5:** Commit `feat: read legacy overview URLs as the default dashboard tab`.

### Task 3: Mô hình vỏ (logic thuần)

**Files:**
- Create: `meal-viewer/src/dashboard-shell.mjs`, `meal-viewer/dashboard-shell.test.mjs`
- Modify: `meal-viewer/package.json` (thêm `node dashboard-shell.test.mjs` ngay sau `node dashboard-navigation.test.mjs` trong script `test`)

**Interfaces:**
- Consumes: `groupDashboardWeeks` (`dashboard-model.mjs`), `weekChoices` (`ui-model.mjs`), `weekOptionHint` (`draft-tools.mjs`).
- Produces, trong `dashboard-shell.mjs`:
  - `shellTabs(role: string, permissions: {create?: boolean}): Array<{id: string, label: string, shortLabel: string}>`. Mọi vai trò có `delete` ("Lượt gửi & lịch sử", ngắn "Lượt gửi") và `reconcile` ("Đối soát"); chỉ `role==='owner'` có thêm `form` ("Điều khiển Form", ngắn "Form") và `notice` ("Thông báo tuần", ngắn "Thông báo"). Thứ tự: `delete`, `form`, `notice`, `reconcile`.
  - `shellSettings(role: string): Array<{id: 'branding'|'health'|'access', label: string}>`: `[]` trừ owner; owner: Thương hiệu, Hệ thống, Quyền Gmail theo thứ tự đó.
  - `canCreateWeek(role: string, permissions: {create?: boolean}): boolean` = `permissions.create === true`.
  - `isWeekScopedTab(id: string): boolean` đúng với `delete, form, notice, reconcile, health`.
  - `weekMenuRows(weeks: Week[], weekKey: string, options?: {now?: number, canCreate?: boolean}): Row[]`, với `Row = {kind:'week', weekKey, label, group, selected, hint, status:'open'|'closed'|'unknown'} | {kind:'missing', group:'Tuần này'|'Tuần sau', label:'Chưa có thực đơn', canCreate:boolean}`. Thứ tự: tuần này (hoặc hàng `missing`), tuần sau (hoặc `missing`), rồi các tuần còn lại theo thứ tự của `weekChoices`. `hint` là `weekOptionHint(week)`.

- [ ] **Step 1: Viết kiểm thử thất bại** `dashboard-shell.test.mjs`:

```js
import assert from 'node:assert/strict';
import * as shell from './src/dashboard-shell.mjs';
const now=Date.parse('2026-10-13T03:00:00Z');
assert.deepEqual(shell.shellTabs('owner',{create:true}).map(t=>t.id),['delete','form','notice','reconcile']);
assert.deepEqual(shell.shellTabs('manager',{create:true}).map(t=>t.id),['delete','reconcile']);
assert.equal(shell.shellTabs('owner',{}).find(t=>t.id==='delete').shortLabel,'Lượt gửi');
assert.deepEqual(shell.shellSettings('owner').map(i=>i.id),['branding','health','access']);
assert.deepEqual(shell.shellSettings('manager'),[]);
assert.equal(shell.canCreateWeek('manager',{create:true}),true);
assert.equal(shell.canCreateWeek('manager',{create:false}),false);
assert.equal(shell.isWeekScopedTab('reconcile'),true);
assert.equal(shell.isWeekScopedTab('create'),false);
assert.equal(shell.isWeekScopedTab('branding'),false);
const weeks=[{weekKey:'2026-10-12_2026-10-16',name:'Tuần 12/10/2026 - 16/10/2026',formStatus:'open',responseCount:42},{weekKey:'2026-10-05_2026-10-09',name:'Tuần 05/10/2026 - 09/10/2026',formStatus:'closed',responseCount:2}];
const rows=shell.weekMenuRows(weeks,'2026-10-12_2026-10-16',{now,canCreate:true});
assert.deepEqual(rows.map(r=>[r.kind,r.group]),[['week','Tuần này'],['missing','Tuần sau'],['week','Tuần đã qua']]);
assert.equal(rows[0].selected,true);assert.equal(rows[0].hint,'42 lượt · Form đang mở');assert.equal(rows[0].status,'open');
assert.equal(rows[1].canCreate,true);
assert.deepEqual(shell.weekMenuRows([],'',{now,canCreate:false}).map(r=>[r.kind,r.group,r.canCreate]),[['missing','Tuần này',false],['missing','Tuần sau',false]]);
console.log('Shell tabs follow roles; week rows keep missing weeks visible and respect create permission');
```

- [ ] **Step 2:** `cd meal-viewer && node dashboard-shell.test.mjs`. Mong đợi: FAIL (module chưa có).
- [ ] **Step 3:** Hiện thực các hàm theo mục Interfaces. Dùng `weekChoices` cho thứ tự và nhóm; dùng `groupDashboardWeeks(weeks, now)` để biết tuần này/tuần sau có hay không. Nếu `weekChoices` cho nhóm khác kỳ vọng ở trên, sửa kỳ vọng theo hành vi thật của nó, không sửa `weekChoices`.
- [ ] **Step 4:** Chạy lại. Mong đợi: PASS.
- [ ] **Step 5:** Commit `feat: add dashboard shell model for role tabs and week rows`.

### Task 4: Điều hướng kiểm thử qua một hàm (cải tổ, vẫn xanh)

**Files:**
- Modify: `mealform-preview/tests/ui/production-ui.spec.ts`

**Interfaces:**
- Produces (cùng file, mức module, đặt cạnh `openAudit`/`openResponses`): `async function openSection(page: Page, label: string): Promise<void>` và `function sectionNav(page: Page): Locator`. Hiện thực tạm theo vỏ cũ: `sectionNav` trả `page.locator('.ui-sidebar')`, `openSection` bấm `button` có tên `label` (`exact:true`) trong đó.

- [ ] **Step 1:** Thêm hai hàm. Thay mọi `page.locator('.ui-sidebar').getByRole('button',{name:X,exact:true}).click()` bằng `await openSection(page,X)` và mọi `const nav=page.locator('.ui-sidebar')` bằng `const nav=sectionNav(page)`. Để nguyên hai bài kiểm thử về thu gọn thanh bên (tìm bằng `Thu gọn thanh bên`); Task 6 viết lại chúng.
- [ ] **Step 2:** `grep -n "ui-sidebar" mealform-preview/tests/ui/production-ui.spec.ts`. Mong đợi: chỉ còn trong hai hàm mới và hai bài thu gọn thanh bên.
- [ ] **Step 3:** Chạy cả bộ UI như Task 1 Step 3. Mong đợi: cùng số "N passed" với đường chuẩn.
- [ ] **Step 4:** Commit `test: route dashboard navigation through openSection`.

### Task 5: Menu ⚙ chứa các mục riêng của Dashboard

**Files:**
- Modify: `meal-viewer/src/ComfortProvider.jsx`, `meal-viewer/src/Dashboard.jsx` (khối `dashboard-account` và `dashboard-assist-tools`, quanh dòng 739–741)
- Test: `mealform-preview/tests/ui/production-ui.spec.ts`

**Interfaces:**
- Produces: `export function MenuExtraSlot({children}: {children: ReactNode}): ReactPortal | null` trong `ComfortProvider.jsx`. Nó đưa `children` vào phần tử chủ `<div className="comfort-menu-extra">` nằm trong `.comfort-menu`, ngay dưới `<h2>Tùy chọn hiển thị</h2>`; lập theo đúng mẫu context của `PreferencesSlot` hiện có. Không có chủ (trang xem thực đơn) thì không hiện gì.

- [ ] **Step 1: Viết kiểm thử thất bại** (trong `test.describe('week-first-shell')` mới ở cuối file):

```ts
test('dashboard account, guide and session notices live in the display menu, not on the page',async({page})=>{
  await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/dashboard');
  await expect(page.getByRole('button',{name:'Hướng dẫn mục này',exact:true})).toBeHidden();
  await page.getByRole('button',{name:'Tùy chọn hiển thị',exact:true}).click();
  const menu=page.locator('.comfort-menu');
  await expect(menu.getByRole('button',{name:'Hướng dẫn mục này',exact:true})).toBeVisible();
  await expect(menu.getByRole('button',{name:/^Thông báo phiên này/})).toBeVisible();
  await expect(menu.locator('.comfort-menu-extra')).toContainText('Chủ sở hữu');
});
```

- [ ] **Step 2:** `cd mealform-preview && npm exec -- playwright test --config playwright.production.config.ts -g "display menu, not on the page"`. Mong đợi: FAIL.
- [ ] **Step 3:** Thêm `MenuExtraSlot` và chủ `comfort-menu-extra`. Trong `Dashboard.jsx` chuyển khối tài khoản (email, `accountRoleLabel`, dòng quyền), `ContextGuide` và `SessionFeedback` vào `<MenuExtraSlot>`. Ngăn kéo trợ giúp của `ContextGuide` phải hiển thị ngoài popover (nếu nằm trong DOM của popover thì đưa nó ra `document.body` bằng portal), nếu không đóng menu sẽ đóng luôn ngăn kéo.
- [ ] **Step 4:** Với mọi bài kiểm thử cũ bấm `Hướng dẫn mục này` hoặc `Thông báo phiên này`, thêm bước mở menu `Tùy chọn hiển thị` trước (hàm `openDisplayMenu(page)` mức module). Chạy cả bộ UI. Mong đợi: số đạt bằng đường chuẩn cộng bài mới.
- [ ] **Step 5:** Commit `feat: host dashboard account, guide and notices in the display menu`.

### Task 6: Vỏ máy tính — thanh trên, thanh tuần, tab, bỏ Tổng quan

**Files:**
- Modify: `meal-viewer/src/DashboardLayout.jsx`, `meal-viewer/src/Dashboard.jsx`, `meal-viewer/src/useDashboardHistory.js` (dòng 20), `meal-viewer/src/dashboard-model.mjs` (dòng 212, `dashboardCommands`), `meal-viewer/src/ContextGuide.jsx` (bỏ mục `overview`), `meal-viewer/src/production-ui.css`
- Create: `meal-viewer/src/WeekSwitcher.jsx`
- Test: `mealform-preview/tests/ui/production-ui.spec.ts`

**Interfaces:**
- Consumes: `shellTabs`, `shellSettings`, `canCreateWeek`, `isWeekScopedTab`, `weekMenuRows` (Task 3); `DEFAULT_DASHBOARD_TAB` (Task 2); `MenuExtraSlot` (Task 5).
- Produces: `DashboardLayout({tab, onNavigate, role, permissions, email, schoolName, busy, weekDisabled, onSignOut, warnings, weeks, weekKey, onWeekChange, onRefreshWeeks, weekLinks, children})` với `weekLinks: {formUrl?: string, spreadsheetUrl?: string, folderUrl?: string}` và `weekDisabled: boolean` (Dashboard truyền đúng điều kiện đang khóa `weekPicker()` cũ: `busy || !online || healthBusy`); vẫn xuất `allowedDashboardSections(role, permissions)` trả id của `shellTabs` + `shellSettings` + `'create'` khi `canCreateWeek`. `DashboardOverview` bị xóa.
- Produces: `WeekSwitcher({weeks, weekKey, onChange, onRefresh, canCreate, onCreate, disabled, links})`; phần tử gốc giữ lớp `dashboard-week-picker` (để các neo của `ContextGuide` còn dùng được).
- Hợp đồng DOM cho kiểm thử: `<nav aria-label="Khu vực quản trị">` chứa một `button` cho mỗi tab, tab hiện tại có `aria-current="page"`; nút mở bộ chọn tuần có tên bắt đầu bằng "Tuần "; nút `Tạo tuần` (chỉ khi `canCreateWeek`); nút ⋯ tên "Liên kết của tuần" chứa "Mở Form", "Mở Sheet", "Mở thư mục"; cài đặt owner là ba mục trong menu `Tùy chọn hiển thị`.

- [ ] **Step 1: Viết kiểm thử thất bại** (trong `test.describe('week-first-shell')`; mỗi bài dùng `interceptMealServices`, thêm tham số thứ năm tùy chọn `overrides?: {weeks?: object[]}` để ghi đè danh sách tuần):

```ts
test('owner sees four tabs and the settings; manager sees two tabs and no owner settings',async({page})=>{
  await interceptMealServices(page,'owner');await page.goto('http://127.0.0.1:5175/dashboard');
  const nav=page.getByRole('navigation',{name:'Khu vực quản trị',exact:true});
  await expect(nav.getByRole('button')).toHaveText(['Lượt gửi & lịch sử','Điều khiển Form','Thông báo tuần','Đối soát']);
  await page.getByRole('button',{name:'Tùy chọn hiển thị',exact:true}).click();
  for(const name of ['Thương hiệu','Hệ thống','Quyền Gmail'])await expect(page.locator('.comfort-menu').getByRole('button',{name,exact:true})).toBeVisible();
});
test('a manager sees two tabs and cannot reach owner tabs through the URL',async({page})=>{
  await interceptMealServices(page,'manager');await page.goto('http://127.0.0.1:5175/dashboard?tab=branding');
  const nav=page.getByRole('navigation',{name:'Khu vực quản trị',exact:true});
  await expect(nav.getByRole('button')).toHaveText(['Lượt gửi & lịch sử','Đối soát']);
  await expect(nav.getByRole('button',{name:'Lượt gửi & lịch sử'})).toHaveAttribute('aria-current','page');
});
test('/dashboard and the legacy ?tab=overview open Lượt gửi & lịch sử',async({page})=>{
  await interceptMealServices(page);
  for(const url of ['/dashboard','/dashboard?tab=overview']){
    await page.goto('http://127.0.0.1:5175'+url);
    await expect(page.getByRole('navigation',{name:'Khu vực quản trị',exact:true}).getByRole('button',{name:'Lượt gửi & lịch sử'})).toHaveAttribute('aria-current','page');
    await expect(page).toHaveURL(/tab=delete/);
  }
});
test('changing the week keeps the tab and Back returns to the previous week',async({page})=>{
  await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/dashboard?tab=reconcile');
  const first=new URL(page.url()).searchParams.get('week');
  await page.getByRole('button',{name:/^Tuần /}).first().click();
  await page.getByRole('option').nth(1).click();
  expect(new URL(page.url()).searchParams.get('week')).not.toBe(first);
  await expect(page.getByRole('navigation',{name:'Khu vực quản trị',exact:true}).getByRole('button',{name:'Đối soát'})).toHaveAttribute('aria-current','page');
  await page.goBack();expect(new URL(page.url()).searchParams.get('week')).toBe(first);
});
test('unsaved notice text asks before changing the week and Cancel keeps it',async({page})=>{
  await interceptMealServices(page);await page.goto('http://127.0.0.1:5175/dashboard?tab=notice');
  await page.getByLabel('Nội dung thông báo',{exact:true}).fill('Nháp chưa lưu');
  const before=page.url();
  page.once('dialog',d=>d.dismiss());
  await page.getByRole('button',{name:/^Tuần /}).first().click();await page.getByRole('option').nth(1).click();
  expect(page.url()).toBe(before);
  await expect(page.getByLabel('Nội dung thông báo',{exact:true})).toHaveValue('Nháp chưa lưu');
});
test('a school with no weeks still gets a usable week bar; Tạo tuần appears only with permission',async({page})=>{
  await interceptMealServices(page,'owner','#357185',[],{weeks:[]});await page.goto('http://127.0.0.1:5175/dashboard');
  await page.getByRole('button',{name:/^Tuần /}).first().click();
  await expect(page.getByText('Chưa có thực đơn')).toHaveCount(2);
  await expect(page.getByRole('button',{name:'Tạo tuần',exact:true})).toBeVisible();
});
```

- [ ] **Step 2:** `cd mealform-preview && npm exec -- playwright test --config playwright.production.config.ts -g "week-first-shell"`. Mong đợi: các bài mới FAIL.
- [ ] **Step 3: Hiện thực `WeekSwitcher` trong `WeekSwitcher.jsx`.** Dùng popover gốc như các menu hiện có (`popover="auto"`, `useAnchoredPopover` nếu hợp). Nút mở hiển thị tên tuần đang chọn, nhãn trạng thái và hạn; danh sách là `role="listbox"` với `role="option"` cho từng hàng của `weekMenuRows`; hàng `missing` hiện "Chưa có thực đơn" kèm nút Tạo khi `canCreate`; có mục "Tải lại danh sách tuần" gọi `onRefresh`. Nút ⋯ mở menu liên kết dùng `ExternalLink` hiện có, chỉ liên kết `https://`. Esc đóng và trả focus về nút mở. `disabled` khóa mọi nút. Tên tuần dài thì cắt `text-overflow: ellipsis`, tên đầy đủ trong `title`.
- [ ] **Step 4: Viết lại `DashboardLayout.jsx`**: thanh trên (tên "Quản trị thực đơn", tên trường, `WeekSwitcher` chỉ khi `isWeekScopedTab(tab)`, nút `Tạo tuần`, chủ của menu ⚙ là `DisplayPreferencesSlot` có sẵn), hàng tab bằng `<nav aria-label="Khu vực quản trị">`, số cảnh báo lấy từ `warnings[id]` như cũ. Nhãn tab dùng "lưới ẩn" để chiều rộng không đổi khi in đậm: `.ui-shell-tab` là `inline-grid`, nhãn và một bản in đậm ẩn cùng `grid-area:1/1`. Ba mục cài đặt owner và "Mở trang xem thực đơn", "Đăng xuất" nằm trong `MenuExtraSlot` ở menu ⚙ (gọi `onNavigate(id)` và `onSignOut`).
- [ ] **Step 5: Nối `Dashboard.jsx`.** Truyền `weeks={overview.weeks||[]}`, `weekKey`, `onWeekChange={selectWeek}` (đúng hàm đang qua `weekPicker()` để giữ chắn nháp), `onRefreshWeeks={()=>void refreshOverview()}`, `weekLinks` của `selectedWeek`, `weekDisabled={busy||!online||healthBusy}`. Xóa hàm `weekPicker`, năm chỗ gọi nó, nhánh `tab==='overview'` và import `DashboardOverview`. Đặt `LoadedAttention` (cùng props `warnings`, `weekName`, `loaded`, `owner`, `onOpen` như đang truyền cho Tổng quan) ở đầu panel Đối soát và panel Hệ thống. Đổi ba chỗ dự phòng sang `DEFAULT_DASHBOARD_TAB`: `initialLocation` (dòng 134), nhánh `setTab('overview')` (dòng 442) và `useDashboardHistory.js`. Trong `dashboardCommands` bỏ tab `overview`. Khi `weeks` rỗng, tab Lượt gửi hiện trạng thái trống có nút `Tạo tuần` nếu có quyền.
- [ ] **Step 6: CSS** trong `production-ui.css`: thay các quy tắc của `ui-sidebar*`, `ui-mobile-nav`, `ui-more-*`, `ui-overview*` bằng lớp `ui-shell-*` mới; chưa xóa các quy tắc cũ ở tệp CSS khác (Task 9). Viền dùng màu trong suốt (`rgb(... / .12)`) và bo góc lồng nhau cho phần tử mới.
- [ ] **Step 7: Đổi hiện thực `openSection`/`sectionNav`** sang DOM mới: tab bấm trong `nav`; `branding|health|access` mở menu `Tùy chọn hiển thị` rồi bấm mục; `create` bấm `Tạo tuần`. Viết lại hai bài "Thu gọn thanh bên" thành bài về bộ chọn tuần thu gọn tên dài ở 1024px.
- [ ] **Step 8:** Chạy cả bộ UI. Mong đợi: các bài mới đạt. Mỗi bài cũ hỏng chỉ được sửa theo một trong hai cách: đổi bước điều hướng sang DOM mới, hoặc sửa lỗi thật trong mã; bài từng bắt đầu ở Tổng quan thì mở đúng tab nó cần. Ghi danh sách bài đã sửa vào thông điệp commit.
- [ ] **Step 9:** `cd meal-viewer && npm test`. Mong đợi: thoát mã 0 (kiểm thử node bám vào `overview` ở `production-ui.test.mjs`, `admin-upgrades.test.mjs`, `advanced.test.mjs`, `session-client.test.mjs` được cập nhật nếu chúng khẳng định điều đã bị bỏ có chủ ý).
- [ ] **Step 10:** Commit `feat: replace the dashboard sidebar and overview with a week-first shell`.

### Task 7: Bản điện thoại

**Files:**
- Modify: `meal-viewer/src/DashboardLayout.jsx`, `meal-viewer/src/WeekSwitcher.jsx`, `meal-viewer/src/production-ui.css`
- Test: `mealform-preview/tests/ui/production-ui.spec.ts`

**Interfaces:**
- Consumes: hợp đồng DOM của Task 6.
- Produces: ở ≤700px, `nav[aria-label="Khu vực quản trị"]` cố định ở đáy (có `padding-bottom: env(safe-area-inset-bottom)`), dùng `shortLabel`; popover của bộ chọn tuần và của menu ⚙ hiển thị như bảng trượt từ đáy với `max-height: min(80dvh, 560px)`; hàng tab tràn ngang thì mờ dần mép bằng `mask-image`.

- [ ] **Step 1: Viết kiểm thử thất bại:**

```ts
for(const width of [320,390,844])test(`shell has no horizontal overflow at ${width}px with a long week name and large text`,async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('meal-text-size','large'));
  const long='Tuần 12/10/2026 - 16/10/2026 (bản đã chỉnh lại sau cuộc họp phụ huynh đầu năm học)';
  await interceptMealServices(page,'owner','#357185',[],{weeks:[{weekKey:'2026-10-12_2026-10-16',name:long,formStatus:'open',responseCount:42}]});
  await page.setViewportSize({width,height:width===844?390:700});await page.goto('http://127.0.0.1:5175/dashboard');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('on a phone the tabs sit at the bottom and the week list opens as a bottom sheet that Esc closes',async({page})=>{
  await interceptMealServices(page);await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5175/dashboard');
  const nav=page.getByRole('navigation',{name:'Khu vực quản trị',exact:true}),box=(await nav.boundingBox())!;
  expect(box.y+box.height).toBeGreaterThan(844-4);
  await expect(nav.getByRole('button',{name:'Lượt gửi'})).toBeVisible();
  const trigger=page.getByRole('button',{name:/^Tuần /}).first();await trigger.click();
  const sheet=page.getByRole('listbox');const s=(await sheet.boundingBox())!;expect(s.y+s.height).toBeGreaterThan(844-4);
  await page.keyboard.press('Escape');await expect(sheet).toBeHidden();await expect(trigger).toBeFocused();
});
```

- [ ] **Step 2:** Chạy `-g "no horizontal overflow|bottom sheet"`. Mong đợi: FAIL.
- [ ] **Step 3:** Hiện thực CSS và nhãn ngắn như mục Interfaces; nội dung chính có `padding-bottom` bằng chiều cao thanh tab để không bị che. Mục tiêu bấm tối thiểu 44px.
- [ ] **Step 4:** Chạy lại hai bài, rồi cả bộ UI. Mong đợi: đạt, số đạt không giảm.
- [ ] **Step 5:** Commit `feat: bottom tabs and bottom sheets for the dashboard on phones`.

### Task 8: Nền chuyển động

**Files:**
- Modify: `meal-viewer/src/motion.css`, `meal-viewer/src/AppearanceProvider.jsx`
- Test: `mealform-preview/tests/ui/production-ui.spec.ts`

**Interfaces:**
- Produces: biến `--meal-press-scale: .97` và `--meal-press-duration: 150ms` trong `:root` của `motion.css`; lớp `theme-switching` được `AppearanceProvider` thêm vào `<html>` trong lúc đổi giao diện sáng/tối rồi gỡ ở khung kế tiếp, và `.theme-switching *{transition:none !important}`. Mọi quy tắc chỉ hiệu lực dưới `data-motion-level=full|light` như hệ thống hiện có.

- [ ] **Step 1: Viết kiểm thử thất bại:**

```ts
for(const [motion,expected] of [['full','matrix(0.97, 0, 0, 0.97, 0, 0)'],['off','none']] as const)test(`pressed buttons scale to .97 only when motion is ${motion}`,async({page})=>{
  await interceptMealServices(page);
  await page.addInitScript(m=>localStorage.setItem('meal-appearance',JSON.stringify({theme:'light',motion:m})),motion);
  await page.goto('http://127.0.0.1:5175/dashboard');
  const button=page.getByRole('button',{name:'Tạo tuần',exact:true}),box=(await button.boundingBox())!;
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await expect.poll(()=>button.evaluate(el=>getComputedStyle(el).transform)).toBe(expected);
  await page.mouse.up();
});
test('the OS reduced-motion setting removes the press transform under the default appearance',async({page})=>{
  await interceptMealServices(page);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:5175/dashboard');
  const button=page.getByRole('button',{name:'Tạo tuần',exact:true}),box=(await button.boundingBox())!;
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await expect.poll(()=>button.evaluate(el=>getComputedStyle(el).transform)).toBe('none');await page.mouse.up();
});
```

- [ ] **Step 2:** Chạy `-g "pressed buttons|enter from .97"`. Mong đợi: FAIL (hiện là `.98`).
- [ ] **Step 3:** Trong `motion.css` thay `scale(.98)` ở trạng thái nhấn bằng `scale(var(--meal-press-scale))` với `transition: transform var(--meal-press-duration) ease-out`; đổi điểm bắt đầu của `@starting-style` và trạng thái đóng của `.comfort-menu`, `.ui-more-menu` và các popover mới của bộ chọn tuần sang `scale(.97)`, đúng khoảng 150–250ms đã có; chỉ animate `transform` và `opacity`. Thêm lớp `theme-switching` trong `AppearanceProvider.jsx`.
- [ ] **Step 4:** Chạy lại hai bài, rồi cả bộ UI. Mong đợi: đạt.
- [ ] **Step 5:** Commit `feat: press, entrance and theme-switch motion rules`.

### Task 9: Dọn dẹp, kiểm tra tổng và dừng chờ bạn

**Files:**
- Modify: các CSS còn quy tắc của vỏ cũ (`draft-tools.css`, `motion.css`, `operate-accessibility.css`, `operating-feedback.css`, `reading-layouts.css`, `task-layouts.css`, `task-workspaces.css`, `ui-clarity.css`), `meal-viewer/src/AppAttentionControls.jsx`, `meal-viewer/src/useFocusVisibility.js`, `mealform-preview/src/ProductionUI.stories.tsx`
- Create: `VERIFICATION-week-first-shell-2026-11-18.md` (theo khuôn các tệp `VERIFICATION-*.md` có sẵn)

**Interfaces:** không có.

- [ ] **Step 1:** `grep -rnE "ui-sidebar|ui-mobile-nav|ui-nav-item|ui-more-|ui-overview|overview-task|week-ledger|ui-current-weeks|ui-week-card|sidebar-tooltip|data-sidebar-collapsed" meal-viewer/src mealform-preview/src`. Với mỗi kết quả: xóa quy tắc không còn phần tử nào dùng, hoặc đổi sang lớp `ui-shell-*`; giữ `ui-nav-warning`, `ui-skip-link`, `ui-anchored-popover`. Chạy lại lệnh. Mong đợi: không còn kết quả ngoài ba lớp được giữ.
- [ ] **Step 2:** Cập nhật `ProductionUI.stories.tsx` cho khớp vỏ mới. Chạy trong `mealform-preview`: `npm test && npm run build && npm run build-storybook`. Mong đợi: thoát mã 0 cả ba.
- [ ] **Step 3:** Thêm bài ảnh chụp xem lại (không so điểm ảnh) lưu vào `mealform-preview/review/week-first-shell/` ở 1440×900, 1024×768, 768×1024, 390×844, 320×568, sáng và tối, và một lượt chữ lớn, màu cưỡng bức (`page.emulateMedia({forcedColors:'active'})`), zoom 400% (viewport 320 rộng). Mỗi ảnh kèm khẳng định không cuộn ngang.
- [ ] **Step 4:** Chạy toàn bộ: `cd meal-viewer && npm test && npm run build`, rồi cả bộ UI. Mong đợi: tất cả đạt; số UI không thấp hơn đường chuẩn trừ các bài được viết lại có ghi lý do.
- [ ] **Step 5:** Viết `VERIFICATION-week-first-shell-2026-11-18.md` gồm: lệnh đã chạy, số đạt trước và sau, danh sách bài cũ đã sửa và lý do, giới hạn (chưa thử điện thoại vật lý, trình đọc màn hình, Chromatic cloud), và xác nhận không có ghi dữ liệu thật. Commit `docs: record week-first shell phase 1 verification`.
- [ ] **Step 6: DỪNG.** Không push, không mở PR, không deploy. Báo kết quả cho người dùng và xin phép từng việc: duyệt lại quyền Vercel cho team, push nhánh `ui/week-first-shell-2026-11-18`, mở PR vào `main`, dựng staging (build môi trường production, không gán tên miền). Chỉ làm sau khi được đồng ý rõ.
