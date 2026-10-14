import { useState } from 'react';
import { LayoutDashboard, ScanLine, Users, SlidersHorizontal, Megaphone, GitCompareArrows, Palette, ShieldCheck, Mail, MoreHorizontal, ArrowUpRight, ChevronRight, CalendarDays, RefreshCw, LogOut, Sun, Moon, Upload, X, type LucideIcon } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel } from './components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './components/ui/sheet';

type Section = 'overview' | 'ocr' | 'submissions' | 'form' | 'notice' | 'reconcile' | 'brand' | 'system' | 'access' | 'more';
type Tool = { id: Section; label: string; icon: LucideIcon; description: string };
const tools: Tool[] = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard, description: 'Tuần này và kho tuần' },
  { id: 'ocr', label: 'Tạo tuần bằng OCR', icon: ScanLine, description: 'Đọc ảnh, rà soát rồi tạo tuần' },
  { id: 'submissions', label: 'Lượt gửi & lịch sử', icon: Users, description: 'Xem lượt chọn và thao tác' },
  { id: 'form', label: 'Điều khiển Form', icon: SlidersHorizontal, description: 'Trạng thái và hạn đăng ký' },
  { id: 'notice', label: 'Thông báo tuần', icon: Megaphone, description: 'Ghi chú cho người xem' },
  { id: 'reconcile', label: 'Đối soát', icon: GitCompareArrows, description: 'Kiểm tra Form và Sheet' },
  { id: 'brand', label: 'Thương hiệu', icon: Palette, description: 'Tên trường, logo và màu' },
  { id: 'system', label: 'Hệ thống', icon: ShieldCheck, description: 'Kiểm tra kết nối và cài đặt' },
  { id: 'access', label: 'Quyền Gmail', icon: Mail, description: 'Tài khoản và quyền truy cập' }
];
const sampleMeals = [
  ['Thứ Hai · 12/10', 'XÍU MẠI SỐT TIÊU ĐEN'],
  ['Thứ Ba · 13/10', 'GÀ CHIÊN SỐT XÍ MUỘI'],
  ['Thứ Tư · 14/10', 'CÁ FILE CHIÊN SẢ ỚT'],
  ['Thứ Năm · 15/10', 'ĐẬU HŨ NHỒI THỊT KHO CÀ CHUA'],
  ['Thứ Sáu · 16/10', 'CƠM GÀ HẢI NAM']
];

export function WeekCard({ onView, onControl, onLink }: { onView: () => void; onControl: () => void; onLink: (label: string) => void }) {
  return <Card className="week-card">
    <div className="week-heading"><h2>Tuần này</h2><Badge variant="secondary" className="status-badge">Đã đóng</Badge></div>
    <p className="week-range"><CalendarDays aria-hidden="true" size={22} />12/10/2026 – 16/10/2026</p>
    <p className="muted week-meta">23 lượt gửi <span aria-hidden="true">·</span> 5 ngày phục vụ</p>
    <div className="week-actions"><Button onClick={onView}>Xem lượt gửi</Button><Button variant="outline" onClick={onControl}>Điều khiển Form</Button></div>
    <div className="week-links">{['Form', 'Sheet', 'Thư mục'].map(label => <Button variant="ghost" key={label} onClick={() => onLink(label)}>{label}<ArrowUpRight aria-hidden="true" size={16} /></Button>)}</div>
  </Card>;
}

export function AdminPreview({ initialTheme = 'light', initialSection = 'overview', state = 'ready' }: { initialTheme?: 'light' | 'dark'; initialSection?: Section; state?: 'ready' | 'loading' | 'empty' }) {
  const [theme, setTheme] = useState(initialTheme);
  const [section, setSection] = useState<Section>(initialSection);
  const [message, setMessage] = useState('');
  const [quickView, setQuickView] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [imageName, setImageName] = useState('');
  const current = tools.find(tool => tool.id === section);
  const notify = (action: string) => setMessage(`${action}: chỉ minh họa giao diện, không thao tác dữ liệu thật.`);
  const selectSection = (next: Section) => { setSection(next); setMessage(''); };
  const selectImage = (file?: File) => {
    if (file && !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setMessage('Chỉ chọn ảnh PNG, JPEG hoặc WEBP.');
      return;
    }
    setMessage('');
    setImageName(file?.name || '');
  };
  const people = (sort === 'name' ? ['Hoàng Nam', 'Minh Anh'] : ['Minh Anh', 'Hoàng Nam']).filter(name => name.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')));
  function navItem(tool: Tool) {
    const Icon = tool.icon;
    return <Button key={tool.id} variant="ghost" className={`nav-item ${section === tool.id ? 'is-active' : ''}`} aria-current={section === tool.id ? 'page' : undefined} onClick={() => selectSection(tool.id)}><Icon aria-hidden="true" size={20} />{tool.label}</Button>;
  }
  return <div className={`admin-preview theme-${theme}`}>
    <a className="skip-link" href="#preview-content">Đến nội dung chính</a>
    <aside className="desktop-sidebar">
      <div className="sidebar-brand"><CalendarDays aria-hidden="true" size={24}/><span>MealForm<small>Quản trị thực đơn</small></span></div>
      <nav aria-label="Quản trị"><p className="nav-group">Thực đơn</p>{tools.slice(0, 5).map(navItem)}<p className="nav-group">Quản trị</p>{tools.slice(5).map(navItem)}</nav>
      <div className="sidebar-account"><strong>Chủ sở hữu</strong><small>admin@example.com</small><Button variant="ghost" onClick={() => notify('Đăng xuất')}><LogOut aria-hidden="true" size={18}/>Đăng xuất</Button></div>
    </aside>
    <main id="preview-content" className="dashboard-main">
      <div className="preview-banner"><span>Dữ liệu minh họa <span aria-hidden="true">·</span> Không kết nối production</span><span className="banner-desktop">Màu theo Settings</span></div>
      <header className="dashboard-header"><div><h1>{section === 'overview' ? 'Dashboard quản trị' : section === 'more' ? 'Thêm chức năng' : current?.label}</h1><p className="muted">{section === 'overview' ? 'Quản lý thực đơn và lượt gửi theo tuần.' : section === 'more' ? 'Các công cụ khác và tài khoản.' : current?.description}</p></div>
        <div className="header-actions"><Button variant="outline" className="open-viewer" onClick={() => notify('Mở trang xem')}>Mở trang xem<ArrowUpRight aria-hidden="true" size={16}/></Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Tùy chọn giao diện"><MoreHorizontal aria-hidden="true" size={22}/></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className={`theme-${theme} appearance-menu`}><DropdownMenuLabel>Giao diện preview</DropdownMenuLabel><DropdownMenuRadioGroup value={theme} onValueChange={value => setTheme(value as 'light' | 'dark')}><DropdownMenuRadioItem value="light"><Sun aria-hidden="true" size={16}/>Sáng</DropdownMenuRadioItem><DropdownMenuRadioItem value="dark"><Moon aria-hidden="true" size={16}/>Tối</DropdownMenuRadioItem></DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>
        </div>
      </header>
      <div className="mobile-account"><Badge variant="outline">Chủ sở hữu</Badge><span>admin@example.com</span></div>
      {message && <div role="status" className="preview-notice"><span>{message}</span><Button variant="ghost" size="icon" aria-label="Ẩn thông báo" onClick={() => setMessage('')}><X aria-hidden="true" size={18}/></Button></div>}
      {section === 'overview' && <>
        {state === 'loading' ? <Card className="week-card"><h2>Đang tải tuần</h2><p className="muted" role="status">Trạng thái minh họa — chưa kết nối dữ liệu.</p><div className="skeleton"/><div className="skeleton short"/></Card> : state === 'empty' ? <Card className="week-card"><h2>Chưa có thực đơn tuần này</h2><p className="muted">Tải ảnh thực đơn để bắt đầu. Kiểm tra ngày và món trước khi tạo Form.</p><Button onClick={() => selectSection('ocr')}>Tạo tuần bằng OCR</Button></Card> : <WeekCard onView={() => selectSection('submissions')} onControl={() => selectSection('form')} onLink={notify}/>}
        <section className="next-week"><div><h2>Tuần sau chưa có thực đơn</h2><p className="muted">19/10/2026 – 23/10/2026</p><p>Đọc ảnh và rà soát món trước khi tạo Form.</p></div><Button variant="outline" onClick={() => selectSection('ocr')}><ScanLine aria-hidden="true" size={18}/>Tạo tuần bằng OCR</Button></section>
        <section className="archive-section"><div className="section-heading"><h2>Kho tuần cũ</h2><Button variant="ghost" onClick={() => notify('Chọn tuần khác')}>Chọn tuần khác<ChevronRight aria-hidden="true" size={18}/></Button></div>
          {[['05/10/2026 – 09/10/2026', '22'], ['28/09/2026 – 02/10/2026', '21']].map(([dates, count]) => <div className="archive-row" key={dates}><div><strong>{dates}</strong><p className="muted">{count} lượt gửi <span aria-hidden="true">·</span> Đã đóng</p></div><Button variant="ghost" aria-label={`Xem tuần ${dates}`} onClick={() => { selectSection('submissions'); setMessage(`Đang xem bố cục minh họa tuần ${dates}; không phải dữ liệu tuần thật.`); }}>Xem<ChevronRight aria-hidden="true" size={18}/></Button></div>)}
        </section>
      </>}
      {section === 'more' && <section className="more-tools"><h2>Công cụ quản trị</h2>{tools.slice(3).map(tool => { const Icon = tool.icon; return <Button variant="ghost" className="more-row" key={tool.id} onClick={() => selectSection(tool.id)}><Icon aria-hidden="true" size={22}/><span>{tool.label}<small>{tool.description}</small></span><ChevronRight aria-hidden="true" size={20}/></Button>; })}<h2>Tài khoản chủ</h2>{['Mở trang xem', 'Cấp quyền Apps Script', 'Cài đặt / hướng dẫn', 'Đăng xuất'].map(label => <Button variant="outline" key={label} onClick={() => notify(label)}>{label}</Button>)}</section>}
      {section === 'submissions' && <section className="submissions-section"><div className="section-heading"><div><h2>Lượt chọn trong tuần</h2><p className="muted">12/10/2026 – 16/10/2026</p></div><Button variant="outline" aria-label="Tải lại dữ liệu" onClick={() => notify('Tải lại dữ liệu')}><RefreshCw aria-hidden="true" size={18}/><span>Tải lại</span></Button></div>
        <div className="submission-filters"><label>Tìm họ tên<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Nhập tên cần tìm…"/></label><label>Sắp xếp<select value={sort} onChange={event => setSort(event.target.value)}><option value="newest">Mới nhất</option><option value="name">Tên A–Z</option></select></label></div>
        <p className="muted sample-note">Lượt gửi minh họa, không phải thông tin học sinh thật.</p>
        {people.length === 0 && <p role="status">Không có tên phù hợp. Hãy thử từ khóa khác.</p>}
        {people.map((name, index) => <Card key={name} className="submission-card"><div className="submission-title"><h3>{name}</h3><time dateTime={index === 0 ? '2026-10-08T20:35:48+07:00' : '2026-10-08T20:29:38+07:00'}>08/10/2026 · {index === 0 ? '20:35' : '20:29'}</time></div><dl className="meal-list">{sampleMeals.slice(0, 2).map(([day, meal]) => <div key={day}><dt>{day}</dt><dd>{meal}</dd></div>)}</dl><p className="muted">3 ngày còn lại trong Xem nhanh</p><div className="submission-actions"><Button variant="outline" aria-label={`Xem nhanh lượt của ${name}`} onClick={() => setQuickView(name)}>Xem nhanh</Button><Button variant="ghost" onClick={() => notify(`Thao tác lượt của ${name}`)}>Thao tác<MoreHorizontal aria-hidden="true" size={18}/></Button></div></Card>)}
      </section>}
      {section === 'ocr' && <section className="ocr-preview"><h2>Tạo tuần từ ảnh thực đơn</h2><p className="muted">Xem sửa rồi tạo Form. Bản này chỉ thử bố cục nhập ảnh.</p><label className="upload-area" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); selectImage(event.dataTransfer.files[0]); }}><span className="upload-icon"><Upload aria-hidden="true" size={26}/></span><strong>Chọn ảnh thực đơn</strong><span>Kéo thả hoặc <span className="upload-browse">Duyệt ảnh</span></span><small>PNG, JPEG, WEBP · dữ liệu minh họa</small><input type="file" accept="image/png,image/jpeg,image/webp" aria-label="Chọn ảnh thực đơn" onChange={event => selectImage(event.target.files?.[0])}/></label>{imageName && <p role="status">Đã chọn: {imageName} — không tải lên dịch vụ.</p>}<Button disabled>Đọc thực đơn · chưa kết nối OCR</Button></section>}
      {!['overview', 'more', 'submissions', 'ocr'].includes(section) && <section className="tool-preview"><h2>{current?.description}</h2><p>Bản xem bố cục — không kết nối dữ liệu thật.</p><p className="muted">Chức năng hiện có trên web thật vẫn giữ nguyên. Preview này không cấp quyền, đổi hạn hay xóa lượt gửi.</p><Button variant="outline" onClick={() => selectSection('overview')}>Về Tổng quan</Button></section>}
      <footer className="preview-footer">Preview UI <span aria-hidden="true">·</span> Chưa triển khai lên web thật</footer>
    </main>
    <nav className="mobile-bottom-nav" aria-label="Điều hướng điện thoại">{[
      { id: 'overview' as Section, label: 'Tổng quan', icon: LayoutDashboard }, { id: 'ocr' as Section, label: 'Tạo tuần', icon: ScanLine }, { id: 'submissions' as Section, label: 'Lượt gửi', icon: Users }, { id: 'more' as Section, label: 'Thêm', icon: MoreHorizontal }
    ].map(item => { const Icon = item.icon; return <Button key={item.id} variant="ghost" aria-current={section === item.id ? 'page' : undefined} className={section === item.id ? 'is-active' : ''} onClick={() => selectSection(item.id)}><Icon aria-hidden="true" size={21}/><span>{item.label}</span></Button>; })}</nav>
    <Sheet open={!!quickView} onOpenChange={open => { if (!open) setQuickView(''); }}><SheetContent className={`theme-${theme} quick-view`}><SheetHeader><SheetTitle>{quickView}</SheetTitle><SheetDescription>Chỉ xem · dữ liệu minh họa</SheetDescription></SheetHeader><dl className="meal-list quick-meals">{sampleMeals.map(([day, meal]) => <div key={day}><dt>{day}</dt><dd>{meal}</dd></div>)}</dl></SheetContent></Sheet>
  </div>;
}
