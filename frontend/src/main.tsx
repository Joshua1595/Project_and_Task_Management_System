import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Silence benign development environment WebSocket / HMR connection errors in AI Studio iframe
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || String(event.reason || '');
  if (
    reason.includes('WebSocket') || 
    reason.includes('websocket') || 
    reason.includes('vite') || 
    reason.includes('HMR')
  ) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const message = event.message || '';
  if (
    message.includes('WebSocket') || 
    message.includes('websocket') || 
    message.includes('vite') || 
    message.includes('HMR')
  ) {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

