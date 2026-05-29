import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen = ({ message = 'Đang tải...' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
    <CircularProgress size={48} sx={{ color: '#6366f1' }} />
    <Typography color="text.secondary">{message}</Typography>
  </Box>
);

export default LoadingScreen;
