import './index.css';

import { Analytics } from '@vercel/analytics/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { initializeObservability } from './lib/observability';

console.log('Eventio: Initializing main application entry...');
initializeObservability();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);
