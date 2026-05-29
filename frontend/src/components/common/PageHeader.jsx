import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle, action, breadcrumbs = [] }) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    <Box sx={{ mb: 3 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 1 }}>
          {breadcrumbs.map((b, i) => (
            <Link key={i} underline="hover" color="inherit" href={b.href} sx={{ fontSize: 13 }}>
              {b.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{title}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
    </Box>
  </motion.div>
);

export default PageHeader;
