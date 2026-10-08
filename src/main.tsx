import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import '@fontsource/atkinson-hyperlegible/latin-400-italic.css';

import { App } from './App';
import { I18nProvider } from './i18n/I18nContext';
import './styles.css';
import './export/print.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

createRoot(container).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
