import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import './styles.css';
import './export/print.css';

const container = document.getElementById('root');
if (!container) throw new Error('Wurzelelement nicht gefunden');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
