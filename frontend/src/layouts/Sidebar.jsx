import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, IconButton, Tooltip, Collapse,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import FolderIcon from '@mui/icons-material/Folder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PaymentsIcon from '@mui/icons-material/Payments';
import DescriptionIcon from '@mui/icons-material/Description';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SchoolIcon from '@mui/icons-material/School';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import useAuthStore from '../store/authStore';
import { getInitials } from '../utils/format';
import { ROLES } from '../constants';

const DRAWER_WIDTH = 260;
const MINI_WIDTH = 72;

const getMenuItems = (role) => {
  const all = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['Admin', 'HR', 'Manager', 'Employee'] },
    { label: 'Nhân viên', icon: <PeopleIcon />, path: '/employees', roles: ['Admin', 'HR', 'Manager'] },
    { label: 'Phòng ban', icon: <BusinessIcon />, path: '/departments', roles: ['Admin', 'HR'] },
    { label: 'Chức vụ', icon: <WorkIcon />, path: '/positions', roles: ['Admin', 'HR'] },
    { label: 'Dự án', icon: <FolderIcon />, path: '/projects', roles: ['Admin', 'HR', 'Manager'] },
    { label: 'Chấm công', icon: <AccessTimeIcon />, path: '/attendance', roles: ['Admin', 'HR', 'Manager', 'Employee'] },
    { label: 'Nghỉ phép', icon: <EventBusyIcon />, path: '/leave', roles: ['Admin', 'HR', 'Manager', 'Employee'] },
    { label: 'Bảng lương', icon: <PaymentsIcon />, path: '/payroll', roles: ['Admin', 'HR', 'Employee'] },
    { label: 'Hợp đồng', icon: <DescriptionIcon />, path: '/contracts', roles: ['Admin', 'HR'] },
    { label: 'Bảo hiểm', icon: <HealthAndSafetyIcon />, path: '/insurance', roles: ['Admin', 'HR'] },
    { label: 'Trình độ', icon: <SchoolIcon />, path: '/education', roles: ['Admin', 'HR', 'Employee'] },
    { label: 'Thông báo', icon: <NotificationsIcon />, path: '/notifications', roles: ['Admin', 'HR', 'Manager', 'Employee'] },
  ];
  return all.filter((m) => m.roles.includes(role));
};

const Sidebar = ({ open, onToggle }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = getMenuItems(user?.PhanQuyen);

  const roleColors = {
    Admin: '#6366f1', HR: '#ec4899', Manager: '#f59e0b', Employee: '#10b981',
  };
  const roleColor = roleColors[user?.PhanQuyen] || '#6366f1';

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? DRAWER_WIDTH : MINI_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : MINI_WIDTH,
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          borderRight: '1px solid',
          borderColor: 'divider',
          background: (t) => t.palette.background.paper,
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', minHeight: 64 }}>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#6366f1', letterSpacing: -0.5 }}>
                TrustTY
              </Typography>
              <Typography variant="caption" color="text.secondary">HRMS</Typography>
            </motion.div>
          )}
        </AnimatePresence>
        <IconButton onClick={onToggle} size="small">
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* User info */}
      <Box sx={{ p: open ? 2 : 1, display: 'flex', alignItems: 'center', gap: 1.5, my: 1 }}>
        <Avatar sx={{ bgcolor: roleColor, width: 40, height: 40, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
          {getInitials(user?.TenNV)}
        </Avatar>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>{user?.TenNV}</Typography>
              <Typography variant="caption" sx={{ color: roleColor, fontWeight: 600 }}>{user?.PhanQuyen}</Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <Divider />

      {/* Menu */}
      <List sx={{ px: 1, py: 1, flex: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Tooltip key={item.path} title={!open ? item.label : ''} placement="right">
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    px: open ? 2 : 1.5,
                    justifyContent: open ? 'flex-start' : 'center',
                    bgcolor: active ? '#6366f118' : 'transparent',
                    color: active ? '#6366f1' : 'text.secondary',
                    '&:hover': { bgcolor: '#6366f110' },
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: open ? 36 : 'auto', color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <AnimatePresence>
                    {open && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
