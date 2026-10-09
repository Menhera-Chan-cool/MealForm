import React from 'react';
import { createRoot } from 'react-dom/client';
import { rootRedirectTarget } from './viewer-model.mjs';
import './styles.css';
import './mobile-cards.css';
import App from './App.jsx';
import BrandingProvider from './BrandingProvider.jsx';
import './branding.css';

const redirect = rootRedirectTarget(window.location.pathname, window.location.search);
if (window.location.pathname === '/newform') window.location.replace('/dashboard?tab=create');
else if (redirect) window.location.replace(redirect);
else createRoot(document.getElementById('root')).render(<React.StrictMode><BrandingProvider><App /></BrandingProvider></React.StrictMode>);
