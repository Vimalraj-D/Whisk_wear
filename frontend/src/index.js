import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Suppress ResizeObserver loop warning overlays in development
if (process.env.NODE_ENV === 'development') {
  const isResizeObserverError = (msg) => {
    return msg && (
      msg.includes('ResizeObserver') ||
      msg.includes('loop completed with undelivered notifications') ||
      msg.includes('loop limit exceeded')
    );
  };

  const suppressOverlay = () => {
    setTimeout(() => {
      const ids = [
        'webpack-dev-server-client-overlay',
        'webpack-dev-server-client-overlay-div'
      ];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.style.display = 'none';
          el.remove();
        }
      });
      const customEl = document.querySelector('webpack-dev-server-client-overlay');
      if (customEl) {
        customEl.style.display = 'none';
        customEl.remove();
      }
    }, 50);
  };

  window.addEventListener('error', (e) => {
    const msg = e.message || (e.error && e.error.message);
    if (isResizeObserverError(msg)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      suppressOverlay();
    }
  }, true); // useCapture = true to run before Webpack's error overlay listener

  window.addEventListener('unhandledrejection', (e) => {
    const msg = e.reason && e.reason.message;
    if (isResizeObserverError(msg)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      suppressOverlay();
    }
  }, true);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
