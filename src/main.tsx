
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminApp from './AdminApp';
import './index.css';

// Determine which app to render based on URL
const isAdminInterface = window.location.pathname.startsWith('/admin');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {isAdminInterface ? <AdminApp /> : <App />}
  </React.StrictMode>,
);
