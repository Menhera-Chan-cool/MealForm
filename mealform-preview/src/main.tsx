import { createRoot } from 'react-dom/client';
import { AdminPreview } from './AdminPreview';
import { ViewerPreview } from './ViewerPreview';
import './styles.css';
createRoot(document.getElementById('root')!).render(window.location.pathname.startsWith('/viewer') ? <ViewerPreview /> : <AdminPreview />);
