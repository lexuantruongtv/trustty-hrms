import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './routes/AppRoutes';

const App = () => (
  <BrowserRouter>
    <AppThemeProvider>
      <AppRoutes />
    </AppThemeProvider>
  </BrowserRouter>
);

export default App;
