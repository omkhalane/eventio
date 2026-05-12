import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initializeObservability } from './lib/observability';

console.log('Eventio: Initializing main application entry...');

try {
  initializeObservability();
} catch (error) {
  console.error('Error initializing observability:', error);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found in HTML');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
