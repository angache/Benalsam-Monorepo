import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from '@/App';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import '@/index.css';
import 'leaflet/dist/leaflet.css';
import 'cropperjs/dist/cropper.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <Router>
      <ScrollToTop />
      <App />
    </Router>
  </ThemeProvider>
);