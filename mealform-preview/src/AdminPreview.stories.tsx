import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminPreview } from './AdminPreview';

const figma = (node: string) => ({ type: 'link', name: 'Figma', url: `https://www.figma.com/design/9gbz6BuArX7kyBTlbKMzuR/MealForm?node-id=${node}` });
const meta = { title: 'MealForm/Dashboard', component: AdminPreview,
  render: (args, context) => <AdminPreview key={context.globals.theme} {...args} initialTheme={context.globals.theme === 'dark' ? 'dark' : 'light'} />,
  parameters: { design: figma('7-2') } } satisfies Meta<typeof AdminPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DesktopLight: Story = { args: { initialTheme: 'light' }, parameters: { chromatic: { viewports: [1440] } } };
export const MobileLight: Story = { args: { initialTheme: 'light' }, globals: { viewport: { value: 'phone', isRotated: false } }, parameters: { chromatic: { viewports: [390] }, design: figma('7-3') } };
export const DesktopDark: Story = { args: { initialTheme: 'dark' }, globals: { theme: 'dark' }, parameters: { chromatic: { viewports: [1440] }, design: figma('7-4') } };
export const MobileDark: Story = { args: { initialTheme: 'dark' }, globals: { theme: 'dark', viewport: { value: 'phone', isRotated: false } }, parameters: { chromatic: { viewports: [390] }, design: figma('7-5') } };
export const MobileMore: Story = { args: { initialSection: 'more' }, globals: { viewport: { value: 'phone', isRotated: false } }, parameters: { chromatic: { viewports: [390] }, design: figma('7-6') } };
export const MobileSubmissions: Story = { args: { initialSection: 'submissions' }, globals: { viewport: { value: 'phone', isRotated: false } }, parameters: { chromatic: { viewports: [390] }, design: figma('7-7') } };
export const EmptyWeek: Story = { args: { state: 'empty' }, parameters: { chromatic: { viewports: [390, 1440] } } };
export const LoadingWeek: Story = { args: { state: 'loading' }, parameters: { chromatic: { viewports: [390, 1440] } } };
export const Upload: Story = { args: { initialSection: 'ocr' }, parameters: { chromatic: { viewports: [390, 1440] } } };
