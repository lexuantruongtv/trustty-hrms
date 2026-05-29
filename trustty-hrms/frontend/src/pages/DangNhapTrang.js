import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../contexts/AuthContext';

export default function DangNhapTrang() {
  const { dangNhap } = useAuth();
  const navigate = useNavigate();

  const [tenTaiKhoan, setTenTaiKhoan] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState('');

  async function xuLyDangNhap(event) {
    event.preventDefault();
    setLoi('');
    setDangXuLy(true);
    try {
      await dangNhap(tenTaiKhoan, matKhau);
      navigate('/dashboard');
    } catch (error) {
      setLoi(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setDangXuLy(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.main',
        backgroundImage: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, mx: 2, borderRadius: 3, boxShadow: 10 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 56, height: 56, borderRadius: '50%',
                bgcolor: 'primary.main', display: 'flex',
                alignItems: 'center', justifyContent: 'center', mb: 2,
              }}
            >
              <LockOutlinedIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" color="primary">
              TrustTY HRMS
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Hệ thống Quản lý Nhân sự
            </Typography>
          </Box>

          {loi && <Alert severity="error" sx={{ mb: 2 }}>{loi}</Alert>}

          <Box component="form" onSubmit={xuLyDangNhap}>
            <TextField
              fullWidth
              label="Tên tài khoản"
              value={tenTaiKhoan}
              onChange={(e) => setTenTaiKhoan(e.target.value)}
              margin="normal"
              required
              autoFocus
              autoComplete="username"
            />
            <TextField
              fullWidth
              label="Mật khẩu"
              type={hienMatKhau ? 'text' : 'password'}
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setHienMatKhau(!hienMatKhau)} edge="end">
                      {hienMatKhau ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={dangXuLy}
              sx={{ mt: 3, mb: 1, py: 1.5, borderRadius: 2 }}
            >
              {dangXuLy ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
            Tài khoản mặc định: admin / TrustTY@2024
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
