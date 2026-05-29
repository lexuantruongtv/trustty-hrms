import React, { useState, useEffect } from 'react';
import {
  IconButton, Typography, Box, Badge, Avatar, Menu, MenuItem,
  Divider, Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useThemeMode } from '../contexts/ThemeContext';
import { getNotifications, markAllRead } from '../api/notifications';
import { getInitials } from '../utils/format';

const Topbar = ({ sidebarOpen }) => {
  const { user, logout } = useAuthStore();
  const { mode, toggle } = useThemeMode();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const unread = notifications.filter((n) => !n.DaDoc).length;

  useEffect(() => {
    getNotifications().then((r) => setNotifications(r.data.data || [])).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotifOpen = async (e) => {
    setNotifAnchor(e.currentTarget);
    if (unread > 0) {
      await markAllRead().catch(() => {});
      setNotifications((prev) => prev.map((n) => ({ ...n, DaDoc: true })));
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        height: 64,
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: 1,
      }}
    >
      <Box sx={{ flex: 1 }} />

        {/* Dark mode toggle */}
        <Tooltip title={mode === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}>
          <IconButton onClick={toggle} size="small">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Thông báo">
          <IconButton onClick={handleNotifOpen} size="small">
            <Badge badgeContent={unread} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { width: 320, maxHeight: 400, mt: 1 } }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>Thông báo</Typography>
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <MenuItem disabled><Typography variant="body2">Không có thông báo</Typography></MenuItem>
          ) : notifications.map((n) => (
            <MenuItem key={n.MaTB} sx={{ whiteSpace: 'normal', py: 1.5 }}>
              <Box>
                <Typography variant="body2" fontWeight={n.DaDoc ? 400 : 600}>{n.TieuDe}</Typography>
                <Typography variant="caption" color="text.secondary">{n.NoiDung}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* User menu */}
        <Tooltip title="Tài khoản">
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
            <Avatar sx={{ width: 34, height: 34, bgcolor: '#6366f1', fontSize: 13, fontWeight: 700 }}>
              {getInitials(user?.TenNV)}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { mt: 1 } }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>{user?.TenNV}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.PhanQuyen}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Hồ sơ cá nhân
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Đăng xuất
          </MenuItem>
        </Menu>
    </Box>
  );
};

export default Topbar;
