import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ThemeProvider from './components/ThemeProvider.tsx';
import { MotionConfig } from 'framer-motion';
import './utils/pwaInstall';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </ThemeProvider>
  </React.StrictMode>
);
