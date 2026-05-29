import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Alert, TextField, Button, Divider, Avatar, Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

export default function HoSoCaNhanTrang() {
  const { nguoiDung } = useAuth();
  const [thongTin, setThongTin] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState('');
  const [thongBao, setThongBao] = useState('');

  const [matKhauCu, setMatKhauCu] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [loiMatKhau, setLoiMatKhau] = useState('');
  const [dangDoiMatKhau, setDangDoiMatKhau] = useState(false);

  useEffect(() => {
    async function taiThongTin() {
      try {
        const res = await apiClient.get('/auth/thong-tin-ca-nhan');
        setThongTin(res.data);
      } catch {
        setLoi('Không thể tải thông tin cá nhân');
      } finally {
        setDangTai(false);
      }
    }
    taiThongTin();
  }, []);

  async function xuLyDoiMatKhau() {
    setLoiMatKhau('');
    if (!matKhauCu || !matKhauMoi) {
      setLoiMatKhau('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (matKhauMoi !== xacNhanMatKhau) {
      setLoiMatKhau('Mật khẩu mới và xác nhận không khớp');
      return;
    }
    if (matKhauMoi.length < 6) {
      setLoiMatKhau('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    setDangDoiMatKhau(true);
    try {
      await apiClient.put('/auth/doi-mat-khau', { matKhauCu, matKhauMoi });
      setThongBao('Đổi mật khẩu thành công');
      setMatKhauCu('');
      setMatKhauMoi('');
      setXacNhanMatKhau('');
    } catch (error) {
      setLoiMatKhau(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setDangDoiMatKhau(false);
    }
  }

  if (dangTai) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Hồ sơ cá nhân
      </Typography>

      {thongBao && <Alert severity="success" onClose={() => setThongBao('')} sx={{ mb: 2 }}>{thongBao}</Alert>}
      {loi && <Alert severity="error" onClose={() => setLoi('')} sx={{ mb: 2 }}>{loi}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 28 }}>
                  {thongTin?.TenNV?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6">{thongTin?.TenNV}</Typography>
                  <Chip label={thongTin?.PhanQuyen} size="small" color="primary" />
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Mã nhân viên" value={thongTin?.MaNV || ''} InputProps={{ readOnly: true }} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Họ và tên" value={thongTin?.TenNV || ''} InputProps={{ readOnly: true }} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Email" value={thongTin?.Email || ''} InputProps={{ readOnly: true }} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Số điện thoại" value={thongTin?.SDT || ''} InputProps={{ readOnly: true }} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Phòng ban" value={thongTin?.TenPB || '—'} InputProps={{ readOnly: true }} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Chức vụ" value={thongTin?.TenCV || '—'} InputProps={{ readOnly: true }} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Ngày sinh"
                    value={thongTin?.NgaySinh ? thongTin.NgaySinh.split('T')[0] : '—'}
                    InputProps={{ readOnly: true }} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Số CCCD" value={thongTin?.SoCCCD || '—'} InputProps={{ readOnly: true }} size="small" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Địa chỉ" value={thongTin?.DiaChi || '—'} InputProps={{ readOnly: true }} size="small" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Đổi mật khẩu</Typography>
              {loiMatKhau && <Alert severity="error" sx={{ mb: 2 }}>{loiMatKhau}</Alert>}
              <TextField
                fullWidth label="Mật khẩu hiện tại" type="password"
                value={matKhauCu} onChange={(e) => setMatKhauCu(e.target.value)}
                margin="normal" size="small"
              />
              <TextField
                fullWidth label="Mật khẩu mới" type="password"
                value={matKhauMoi} onChange={(e) => setMatKhauMoi(e.target.value)}
                margin="normal" size="small"
              />
              <TextField
                fullWidth label="Xác nhận mật khẩu mới" type="password"
                value={xacNhanMatKhau} onChange={(e) => setXacNhanMatKhau(e.target.value)}
                margin="normal" size="small"
              />
              <Button
                fullWidth variant="contained" startIcon={<SaveIcon />}
                onClick={xuLyDoiMatKhau} disabled={dangDoiMatKhau} sx={{ mt: 2 }}
              >
                {dangDoiMatKhau ? <CircularProgress size={20} color="inherit" /> : 'Đổi mật khẩu'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
