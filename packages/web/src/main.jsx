import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from '@/App';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import '@/index.css';
import 'leaflet/dist/leaflet.css';
import 'cropperjs/dist/cropper.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <Router>
        <AppProvider>
          <ScrollToTop />
          <App />
        </AppProvider>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);