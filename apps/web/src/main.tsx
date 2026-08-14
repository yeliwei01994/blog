import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { restoreGitHubPagesPath } from './app/restore-path';
import './styles/global.css';
import './styles/editorial.css';

restoreGitHubPagesPath();

const root = document.getElementById('root');
if (!root) throw new Error('Missing React root element.');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
