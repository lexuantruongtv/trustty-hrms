import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Topbar sidebarOpen={sidebarOpen} />
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((p) => !p)} />
      <Box
        component="main"
        sx={{
          flex: 1,
          p: 3,
          overflow: 'auto',
          bgcolor: 'background.default',
          transition: 'margin 0.3s ease',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
