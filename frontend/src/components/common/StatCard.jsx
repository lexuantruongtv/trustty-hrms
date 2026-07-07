import React from 'react';
import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color = '#6366f1', trend, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    style={{ height: '100%' }}
  >
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3, minHeight: 120 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
              {title}
            </Typography>
            <Typography fontWeight={700} sx={{ color, fontSize: 'clamp(1.0rem, 2vw, 2.5rem)', lineHeight: 1.15}}>
              {value}
            </Typography>
            {trend && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {trend}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}18`, width: 52, height: 52 }}>
            <Box sx={{ color, display: 'flex' }}>{icon}</Box>
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

export default StatCard;
