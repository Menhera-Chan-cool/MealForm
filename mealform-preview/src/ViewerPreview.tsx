import { useEffect, useState } from 'react';
import { BarChart3, Users, MoreHorizontal, ChevronDown, RefreshCw, Search, X, ArrowLeft } from 'lucide-react';
import FilterControls, { ComboSelect } from '../../meal-viewer/src/FilterControls.jsx';
import { ALL, buildDetailModel, readViewerFilters, todayDayLabel, spreadsheetIdFromUrl } from '../../meal-viewer/src/viewer-model.mjs';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem } from './components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './components/ui/sheet';
import './viewer-preview.css';
import '../../meal-viewer/src/ui-clarity.css';
import '../../meal-viewer/src/reading-polish.css';

type Week = 'current' | 'next' | 'history' | 'old';
type State = 'ready' | 'empty' | 'loading' | 'error' | 'login';
const menu = [
  ['XÍU MẠI SỐT TIÊU ĐEN', 'BÚN NEM NƯỚNG CHẢ GIÒ', 'GÀ KHO LÁ QUẾ'],
  ['GÀ CHIÊN SỐT XÍ MUỘI', 'MÌ QUẢNG THỊT HEO TRỨNG CÚT', 'BÚN THÁI'],
  ['CÁ FILE CHIÊN SẢ ỚT', 'NUI SỐT CÀ THỊT BẰM', 'HỦ TIẾU HEO XÀO SATẾ'],
  ['ĐẬU HŨ NHỒI THỊT KHO CÀ CHUA', 'CHẢ CÁ THỊT BẰM KHO TIÊU', 'CÁ CƠM RIM MẮM'],
  ['CƠM GÀ HẢI NAM', 'BÚN BÒ HUẾ', 'MÌ CAY']
];
const archived = [
  { range: '05/10/2026 – 09/10/2026', month: '10/2026', count: 22, start: '2026-10-05' },
  { range: '28/09/2026 – 02/10/2026', month: '09/2026', count: 21, start: '2026-09-28' },
  { range: '21/09/2026 – 25/09/2026', month: '09/2026', count: 18, start: '2026-09-21' }
];
const titles = { current: 'Thực đơn tuần này', next: 'Thực đơn tuần sau', history: 'Kho thực đơn tuần cũ', old: 'Thực đơn tuần đã chọn' };
const sortLabels = { newest: 'Mới nhất', oldest: 'Cũ nhất', name: 'Tên A–Z' };
const names = ['Minh Anh', 'Hoàng Nam', 'Trường An', ...Array.from({ length: 20 }, (_, i) => `Người dùng mẫu ${i + 1}`)];

// Fixed demonstration calendar, not a replacement for production's real-time routing.
function fixture(start: string) {
  const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu'].map((name, i) => {
    const date = new Date(`${start}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + i);
    return { day: `${name} · ${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`, meals: menu[i] };
  });
  return { days, headers: ['Thời điểm', 'Họ tên', ...days.map(day => day.day)], rows: names.map((name, i) => [`08/10/2026 20:${String(59 - i).padStart(2, '0')}:00`, name, ...menu.map(meals => meals[i < 8 ? 0 : i < 17 ? 1 : 2])]) };
}

export function ViewerPreview({ initialWeek = 'current', initialTheme = 'light', state = 'ready', initialAdvanced = false, nextRegistration = false, showNotices = false }: { initialWeek?: Week; initialTheme?: 'light' | 'dark'; state?: State; initialAdvanced?: boolean; nextRegistration?: boolean; showNotices?: boolean }) {
  const [week, setWeek] = useState<Week>(initialWeek);
  const [oldWeek, setOldWeek] = useState(archived[1]);
  const [theme, setTheme] = useState<string>(initialTheme);
  const [large, setLarge] = useState(false);
  const [motion, setMotion] = useState('full');
  const [filters, setFilters] = useState(readViewerFilters(''));
  const [sort, setSort] = useState<keyof typeof sortLabels>('newest');
  const [month, setMonth] = useState(ALL);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [advanced, setAdvanced] = useState(initialAdvanced);
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('');
  const [commands, setCommands] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [stopped, setStopped] = useState(false);
  const appearance = theme === 'dark' || theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const data = fixture(week === 'old' ? oldWeek.start : week === 'next' ? '2026-10-19' : '2026-10-12');
  const model: { headers: string[]; rows: string[][]; sourceRows: string[][] } = buildDetailModel(data, filters, sort);
  const range = week === 'old' ? oldWeek.range : week === 'next' ? '19/10/2026 – 23/10/2026' : '12/10/2026 – 16/10/2026';
  const notify = (label: string) => setMessage(`${label}: minh họa UI, không kết nối hoặc thay đổi dữ liệu thật.`);
  const navigate = (next: Week) => { setWeek(next); setFilters(readViewerFilters('')); setMessage(''); setAdvanced(false); setStopped(false); };
  const changeFilter = (key: string, value: string) => setFilters(previous => ({ ...previous, [key]: value }));
  useEffect(() => { const listener = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommands(true); } }; window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener); }, []);

  return <div className={`viewer-preview theme-${appearance} ${large ? 'viewer-large' : ''}`} data-motion={motion} onKeyDownCapture={event => {
    // Escape closes the reused list; suppress Chromium's native search-field clearing.
    if (event.key === 'Escape' && event.target instanceof HTMLInputElement && event.target.type === 'search') event.preventDefault();
  }}>
    <a className="skip-link" href="#viewer-content">Đến nội dung chính</a>
    <main id="viewer-content" className="viewer-content"><div className="viewer-demo">Dữ liệu minh họa · Không kết nối production</div>
      <header className="viewer-heading"><div><h1>{titles[week]}</h1>{week !== 'history' && <p className="muted viewer-dates">{range}</p>}</div>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Tùy chọn viewer"><MoreHorizontal aria-hidden="true" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className={`theme-${appearance} appearance-menu`}>
          <DropdownMenuItem onSelect={() => setCommands(true)}>Lệnh nhanh Ctrl/⌘ K</DropdownMenuItem><DropdownMenuLabel>Cỡ chữ</DropdownMenuLabel><DropdownMenuRadioGroup value={large ? 'large' : 'normal'} onValueChange={value => setLarge(value === 'large')}><DropdownMenuRadioItem value="normal">Bình thường</DropdownMenuRadioItem><DropdownMenuRadioItem value="large">Lớn</DropdownMenuRadioItem></DropdownMenuRadioGroup>
          <DropdownMenuLabel>Giao diện</DropdownMenuLabel><DropdownMenuRadioGroup value={theme} onValueChange={setTheme}><DropdownMenuRadioItem value="light">Sáng</DropdownMenuRadioItem><DropdownMenuRadioItem value="dark">Tối</DropdownMenuRadioItem><DropdownMenuRadioItem value="system">Theo hệ thống</DropdownMenuRadioItem></DropdownMenuRadioGroup>
          <DropdownMenuLabel>Hiệu ứng</DropdownMenuLabel><DropdownMenuRadioGroup value={motion} onValueChange={setMotion}><DropdownMenuRadioItem value="full">Đầy đủ</DropdownMenuRadioItem><DropdownMenuRadioItem value="light">Nhẹ</DropdownMenuRadioItem><DropdownMenuRadioItem value="off">Tắt</DropdownMenuRadioItem></DropdownMenuRadioGroup>
        </DropdownMenuContent></DropdownMenu>
      </header>
      <nav className="viewer-nav" aria-label="Chọn trang thực đơn">{(['current', 'next', 'history'] as const).map((next, i) => <Button key={next} variant={week === next ? 'default' : 'outline'} asChild><a href={`#${next}`} aria-current={week === next ? 'page' : undefined} onClick={() => navigate(next)}>{['Tuần này', 'Tuần sau', 'Kho tuần cũ'][i]}</a></Button>)}</nav>
      {message && <div className="preview-notice" role="status"><span>{message}</span><Button variant="ghost" size="icon" aria-label="Ẩn thông báo" onClick={() => setMessage('')}><X aria-hidden="true" /></Button></div>}
      {state === 'login' ? <Card className="viewer-state"><h2>Đăng nhập hoặc xem với tư cách khách</h2><p>Trang xem chỉ xác minh tài khoản Google, không yêu cầu quyền Drive, Sheets hay Forms.</p><Button onClick={() => notify('Đăng nhập Google')}>Đăng nhập Google</Button><Button variant="outline" onClick={() => notify('Xem với tư cách khách')}>Tiếp tục với tư cách khách</Button><p className="muted">Kho tuần cũ vẫn cần đăng nhập.</p></Card>
      : week === 'history' ? <section className="viewer-archive"><p className="muted">Chỉ hiện tuần cũ. Cần đăng nhập Google để xem.</p><div className="archive-controls"><label>Tháng<ComboSelect onSelect={undefined} placeholder={undefined} id="archive-month" label="Tháng" value={month} values={['10/2026', '09/2026']} onChange={setMonth} searchable={false} /></label><Button variant="outline" onClick={() => notify('Tải lại kho tuần')}>Tải lại</Button></div>{archived.filter(item => month === ALL || item.month === month).map(item => <Card key={item.start} className="viewer-archive-card"><div><h2>{item.range}</h2><p className="muted">{item.count} lượt gửi · Đã đóng</p></div><Button variant="outline" aria-label={`Xem tuần ${item.range}`} onClick={() => { setOldWeek(item); navigate('old'); }}>Xem tuần</Button></Card>)}</section>
      : state !== 'ready' ? <Card className="viewer-state"><h2>{state === 'empty' ? 'Chưa có thực đơn cho tuần sau.' : state === 'error' ? 'Chưa tải được dữ liệu tuần này.' : stopped ? 'Đã dừng chờ trên trình duyệt' : 'Đang tải dữ liệu…'}</h2><p className="muted">{state === 'empty' ? 'Bạn vẫn có thể xem tuần này hoặc tải lại để kiểm tra.' : 'Bản lưu gần nhất vẫn chỉ đọc. Không hủy tác vụ máy chủ.'}</p>{state === 'loading' && !stopped && <><div className="skeleton"/><div className="skeleton"/></>}<Button variant="outline" onClick={() => state === 'loading' ? setStopped(true) : notify('Tải lại dữ liệu')}>{state === 'loading' ? 'Dừng chờ dữ liệu' : 'Tải lại dữ liệu'}</Button></Card>
      : <>
        {week === 'old' && <Button variant="ghost" onClick={() => navigate('history')}><ArrowLeft aria-hidden="true" size={18}/>Chọn tuần khác</Button>}
        {showNotices && <div className="preview-notice"><p>Đã điều chỉnh thực đơn. Vui lòng kiểm tra món trước khi chọn.</p></div>}
        <FilterControls days={data.days} nameOptions={names} mealOptions={menu.flat()} filters={filters} onChange={changeFilter} />
        <div className="viewer-toolbar"><div className="viewer-tools"><Button variant="outline" onClick={() => { const today = todayDayLabel(data.days, Date.parse('2026-10-13T03:00:00Z')); today ? setFilters({ name: ALL, meal: ALL, day: today }) : notify('Tuần này không có ngày hôm nay'); }}>Hôm nay</Button><Button variant="outline" onClick={() => notify('Tải lại dữ liệu')}><RefreshCw aria-hidden="true" size={16}/><span>{showNotices ? 'Có dữ liệu mới · Cập nhật' : 'Tải lại dữ liệu'}</span></Button><Button variant="outline" aria-expanded={advanced} onClick={() => setAdvanced(value => !value)}>Nâng cao</Button><Button variant="ghost" onClick={() => setFilters(readViewerFilters(''))}>Xóa bộ lọc</Button></div><div className="viewer-form"><Badge variant="secondary">{week === 'next' ? 'Form đang mở' : 'Form đã đóng'}</Badge><Button variant={week === 'next' || nextRegistration ? 'default' : 'outline'} onClick={() => notify(nextRegistration && week === 'current' ? 'Đăng ký tuần sau' : 'Chọn món')}>{nextRegistration && week === 'current' ? 'Đăng ký tuần sau' : 'Chọn món'}</Button></div></div>
        {advanced && <Card className="viewer-advanced"><h2>Lấy dữ liệu từ Spreadsheet</h2><p className="muted">Mở nguồn chỉ xem riêng; không sửa Sheet.</p><label htmlFor="preview-source">URL Spreadsheet</label><input id="preview-source" value={source} onChange={event => setSource(event.target.value)} placeholder="Dán URL hoặc mã Spreadsheet"/><Button onClick={() => setMessage(spreadsheetIdFromUrl(source) ? 'Nguồn hợp lệ: preview không gửi yêu cầu đến Spreadsheet thật.' : 'URL hoặc mã Spreadsheet chưa hợp lệ')}>Lấy dữ liệu</Button></Card>}
        <section className="viewer-summary"><div className="viewer-section-heading"><h2><BarChart3 aria-hidden="true" />Tổng hợp lựa chọn</h2><Button variant="ghost" size="icon" aria-label={summaryOpen ? 'Ẩn tổng hợp lựa chọn' : 'Mở tổng hợp lựa chọn'} aria-expanded={summaryOpen} onClick={() => setSummaryOpen(value => !value)}><ChevronDown aria-hidden="true" className={summaryOpen ? 'viewer-chevron-open' : ''}/></Button></div>{summaryOpen && <><p className="muted viewer-result-count" aria-live="polite">Đang hiển thị {model.rows.length} kết quả</p><div className="viewer-day-grid">{data.days.filter(day => (filters.day === ALL || filters.day === day.day) && day.meals.some(meal => filters.meal === ALL || meal.toLocaleLowerCase().includes(filters.meal.toLocaleLowerCase()))).map(day => { const index = data.days.indexOf(day); return <Card key={day.day} className="viewer-day-card"><h3>{day.day}</h3><dl>{day.meals.filter(meal => filters.meal === ALL || meal.toLocaleLowerCase().includes(filters.meal.toLocaleLowerCase())).map(meal => <div key={meal}><dt>{meal}</dt><dd><Badge variant="secondary">{model.sourceRows.filter(row => row[2 + index] === meal).length} lượt</Badge></dd></div>)}</dl></Card>; })}</div></>}
        </section>
        <section className="viewer-details"><div className="viewer-section-heading"><h2><Users aria-hidden="true" />Chi tiết lựa chọn</h2><label className="viewer-sort">Sắp xếp<ComboSelect onSelect={undefined} placeholder={undefined} id="viewer-sort" label="Sắp xếp" value={sortLabels[sort]} values={Object.values(sortLabels)} searchable={false} includeAll={false} onChange={(value: string) => setSort((Object.keys(sortLabels) as (keyof typeof sortLabels)[]).find(key => sortLabels[key] === value)!)} /></label></div>
          {model.rows.length === 0 ? <p role="status">Không có kết quả phù hợp. Hãy thử bỏ bộ lọc.</p> : <><div className="viewer-table-wrap"><table><thead><tr>{model.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{model.rows.map((row, i) => <tr key={i}>{row.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div><div className="viewer-response-cards">{model.rows.map((row, i) => { const nameIndex = filters.day !== ALL || filters.meal !== ALL ? 0 : 1; return <Card key={i} className="viewer-response-card"><h3>{row[nameIndex]}</h3><dl>{row.map((cell, index) => index === nameIndex ? null : <div key={index}><dt>{model.headers[index]}</dt><dd>{cell}</dd></div>)}</dl></Card>; })}</div></>}
        </section>
      </>}
      <footer className="viewer-footer">Bản xem thử UI · Bộ lọc và sắp xếp dùng lại logic hiện có.</footer>
    </main>
    <Sheet open={commands} onOpenChange={setCommands}><SheetContent side="right" className={`theme-${appearance} quick-view`}><SheetHeader><SheetTitle>Lệnh nhanh</SheetTitle><SheetDescription>Chỉ mở trang. Không thực hiện thao tác xóa.</SheetDescription></SheetHeader><div className="viewer-command-list"><label><Search aria-hidden="true" size={18}/><input aria-label="Tìm lệnh" value={commandQuery} onChange={event => setCommandQuery(event.target.value)} placeholder="Tìm tuần hoặc trang…"/></label>{(['current', 'next', 'history'] as const).filter(key => titles[key].toLocaleLowerCase().includes(commandQuery.toLocaleLowerCase())).map(key => <Button variant="ghost" key={key} onClick={() => { navigate(key); setCommands(false); }}>{titles[key]}</Button>)}</div></SheetContent></Sheet>
  </div>;
}
