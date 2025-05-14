import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Add CSRF token meta tag for security
const csrfToken = crypto.randomUUID();
const metaTag = document.createElement('meta');
metaTag.name = 'csrf-token';
metaTag.content = csrfToken;
document.head.appendChild(metaTag);

// Initialize the app
const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error('Root element not found. Cannot mount React application.');
}
