// src/main.jsx
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Ensure full-width, dark theme
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.backgroundColor = '#121212'; 
document.body.style.color = '#e0e0e0';

createRoot(document.getElementById('root')).render(
  <App />
);