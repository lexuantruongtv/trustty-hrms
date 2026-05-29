import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton,
  Avatar, Menu, MenuItem, Divider, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PaymentsIcon from '@mui/icons-material/Payments';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

const CHIEU_RONG_MENU = 240;

const danhSachMenu = [
  { nhan: 'Dashboard', duongDan: '/dashboard', bieu_tuong: <DashboardIcon />, quyen: ['Admin', 'HR', 'Manager', 'Employee'] },
  { nhan: 'Nhân viên', duongDan: '/nhan-vien', bieu_tuong: <PeopleIcon />, quyen: ['Admin', 'HR', 'Manager'] },
  { nhan: 'Phòng ban', duongDan: '/phong-ban', bieu_tuong: <BusinessIcon />, quyen: ['Admin', 'HR'] },
  { nhan: 'Chức vụ', duongDan: '/chuc-vu', bieu_tuong: <WorkIcon />, quyen: ['Admin', 'HR'] },
  { nhan: 'Dự án', duongDan: '/du-an', bieu_tuong: <FolderSpecialIcon />, quyen: ['Admin', 'HR', 'Manager'] },
  { nhan: 'Chấm công', duongDan: '/cham-cong', bieu_tuong: <AccessTimeIcon />, quyen: ['Admin', 'HR', 'Manager', 'Employee'] },
  { nhan: 'Nghỉ phép', duongDan: '/nghi-phep', bieu_tuong: <EventBusyIcon />, quyen: ['Admin', 'HR', 'Manager', 'Employee'] },
  { nhan: 'Bảng lương', duongDan: '/bang-luong', bieu_tuong: <PaymentsIcon />, quyen: ['Admin', 'HR', 'Manager', 'Employee'] },
  { nhan: 'Thống kê', duongDan: '/thong-ke', bieu_tuong: <BarChartIcon />, quyen: ['Admin', 'HR', 'Manager'] },
];

export default function Layout() {
  const { nguoiDung, dangXuat } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [menuMoTrenMobile, setMenuMoTrenMobile] = useState(false);
  const [anchorNguoiDung, setAnchorNguoiDung] = useState(null);

  const menuHienThi = danhSachMenu.filter((item) =>
    item.quyen.includes(nguoiDung?.phanQuyen)
  );

  function xuLyDangXuat() {
    dangXuat();
    navigate('/dang-nhap');
  }

  const noiDungMenu = (
    <Box>
      <Toolbar sx={{ bgcolor: 'primary.main' }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          TrustTY HRMS
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuHienThi.map((item) => (
          <ListItem key={item.duongDan} disablePadding>
            <ListItemButton
              selected={location.pathname === item.duongDan}
              onClick={() => {
                navigate(item.duongDan);
                if (isMobile) setMenuMoTrenMobile(false);
              }}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                },
              }}
            >
              <ListItemIcon>{item.bieu_tuong}</ListItemIcon>
              <ListItemText primary={item.nhan} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMenuMoTrenMobile(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Hệ thống Quản lý Nhân sự
          </Typography>
          <Tooltip title="Tài khoản">
            <IconButton onClick={(e) => setAnchorNguoiDung(e.currentTarget)} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {nguoiDung?.tenNV?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorNguoiDung}
            open={Boolean(anchorNguoiDung)}
            onClose={() => setAnchorNguoiDung(null)}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {nguoiDung?.tenNV} ({nguoiDung?.phanQuyen})
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { navigate('/ho-so-ca-nhan'); setAnchorNguoiDung(null); }}>
              <AccountCircleIcon sx={{ mr: 1 }} fontSize="small" />
              Hồ sơ cá nhân
            </MenuItem>
            <MenuItem onClick={xuLyDangXuat}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Menu trên desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: CHIEU_RONG_MENU,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: CHIEU_RONG_MENU, boxSizing: 'border-box' },
          }}
        >
          {noiDungMenu}
        </Drawer>
      )}

      {/* Menu trên mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={menuMoTrenMobile}
          onClose={() => setMenuMoTrenMobile(false)}
          sx={{ '& .MuiDrawer-paper': { width: CHIEU_RONG_MENU } }}
        >
          {noiDungMenu}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
