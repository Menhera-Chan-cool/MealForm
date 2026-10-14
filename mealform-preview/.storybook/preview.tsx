import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';

const preview: Preview = {
  parameters: { layout: 'fullscreen', chromatic: { pauseAnimationAtEnd: true, diffThreshold: 0 }, viewport: { options: {
    phone: { name: 'Điện thoại · 390 × 960', styles: { width: '390px', height: '960px' }, type: 'mobile' },
    desktop: { name: 'PC · 1440 × 960', styles: { width: '1440px', height: '960px' }, type: 'desktop' }
  } } },
  globalTypes: { theme: { description: 'Giao diện', toolbar: { icon: 'circlehollow', items: ['light', 'dark'] } } },
  initialGlobals: { theme: 'light' },
  decorators: [(Story, context) => <div className={`preview-root theme-${context.globals.theme}`}><Story /></div>]
};
export default preview;
