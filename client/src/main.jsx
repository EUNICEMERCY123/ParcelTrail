// React application entry point (Module 4)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/base.css';
import './css/layout.css';
import './css/components.css';
import './css/records.css';
import './css/home.css';
import './css/journey.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
