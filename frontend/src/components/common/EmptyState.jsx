import React from 'react';
import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

const EmptyState = ({ message = 'Không có dữ liệu', icon }) => (
  <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
    {icon || <InboxIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />}
    <Typography variant="body1">{message}</Typography>
  </Box>
);

export default EmptyState;
