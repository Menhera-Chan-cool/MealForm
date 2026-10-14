import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './components/ui/button';
import { WeekCard } from './AdminPreview';
import { RefreshCw } from 'lucide-react';

const meta = { title: 'MealForm/Components', parameters: { design: { type: 'link', name: 'Figma', url: 'https://www.figma.com/design/9gbz6BuArX7kyBTlbKMzuR/MealForm?node-id=8-212' } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const ButtonStates: Story = { render: () => <div className="component-demo"><Button>Tạo tuần</Button><Button variant="outline">Tải lại</Button><Button variant="ghost">Mở Sheet</Button><Button disabled>Chưa chọn ảnh</Button><Button disabled><RefreshCw aria-hidden="true" size={18}/>Đang đọc…</Button></div> };
export const ButtonStatesDark: Story = { ...ButtonStates, globals: { theme: 'dark' } };
export const CurrentWeek: Story = { render: () => <div className="admin-preview" style={{ display: 'block', padding: 24 }}><WeekCard onView={() => {}} onControl={() => {}} onLink={() => {}}/></div>, parameters: { chromatic: { viewports: [390, 1440] } } };
