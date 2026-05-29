import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeCtx = createContext();

export const useThemeMode = () => useContext(ThemeCtx);

export const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');

  const toggle = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('themeMode', next);
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#6366f1' },
      secondary: { main: '#ec4899' },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0f172a',
        paper: mode === 'light' ? '#ffffff' : '#1e293b',
      },
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 16, boxShadow: mode === 'light'
            ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)'
            : '0 1px 3px rgba(0,0,0,0.3)' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 16 },
        },
      },
    },
  }), [mode]);

  return (
    <ThemeCtx.Provider value={{ mode, toggle }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeCtx.Provider>
  );
};
