import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Alert,
  CircularProgress, Chip, Grid, TextField, MenuItem,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

export default function ChamCongTrang() {
  const { nguoiDung } = useAuth();
  const laNhanVien = nguoiDung?.phanQuyen === 'Employee';

  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState('');
  const [thongBao, setThongBao] = useState('');
  const [dangXuLy, setDangXuLy] = useState(false);
  const [banGhiHomNay, setBanGhiHomNay] = useState(null);

  const [tuNgay, setTuNgay] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [denNgay, setDenNgay] = useState(() => new Date().toISOString().split('T')[0]);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const endpoint = laNhanVien ? '/cham-cong/ca-nhan' : '/cham-cong';
      const res = await apiClient.get(endpoint, { params: { tuNgay, denNgay } });
      setDanhSach(res.data);

      if (laNhanVien) {
        const homNay = new Date().toISOString().split('T')[0];
        const bgHomNay = res.data.find((cc) => cc.Ngay?.split('T')[0] === homNay);
        setBanGhiHomNay(bgHomNay || null);
      }
    } catch {
      setLoi('Không thể tải dữ liệu chấm công');
    } finally {
      setDangTai(false);
    }
  }, [laNhanVien, tuNgay, denNgay]);

  useEffect(() => { taiDuLieu(); }, [taiDuLieu]);

  async function xuLyCheckIn() {
    setDangXuLy(true);
    try {
      const res = await apiClient.post('/cham-cong/check-in');
      setThongBao(`Check-in thành công lúc ${res.data.gioVao}`);
      taiDuLieu();
    } catch (error) {
      setLoi(error.response?.data?.message || 'Check-in thất bại');
    } finally {
      setDangXuLy(false);
    }
  }

  async function xuLyCheckOut() {
    if (!banGhiHomNay) return;
    setDangXuLy(true);
    try {
      const res = await apiClient.put(`/cham-cong/check-out/${banGhiHomNay.MaCC}`);
      setThongBao(`Check-out thành công lúc ${res.data.gioRa}. Tổng: ${res.data.soGioLam} giờ`);
      taiDuLieu();
    } catch (error) {
      setLoi(error.response?.data?.message || 'Check-out thất bại');
    } finally {
      setDangXuLy(false);
    }
  }

  const tongGioLam = danhSach.reduce((tong, cc) => tong + (cc.SoGioLam || 0), 0);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Chấm công
      </Typography>

      {thongBao && <Alert severity="success" onClose={() => setThongBao('')} sx={{ mb: 2 }}>{thongBao}</Alert>}
      {loi && <Alert severity="error" onClose={() => setLoi('')} sx={{ mb: 2 }}>{loi}</Alert>}

      {laNhanVien && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Điểm danh hôm nay</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained" color="success" startIcon={<LoginIcon />}
                onClick={xuLyCheckIn} disabled={dangXuLy || Boolean(banGhiHomNay)}
              >
                Check-in
              </Button>
              <Button
                variant="contained" color="warning" startIcon={<LogoutIcon />}
                onClick={xuLyCheckOut}
                disabled={dangXuLy || !banGhiHomNay || Boolean(banGhiHomNay?.GioRa)}
              >
                Check-out
              </Button>
              {banGhiHomNay && (
                <Typography variant="body2" color="text.secondary">
                  Vào: <strong>{banGhiHomNay.GioVao || '—'}</strong>
                  {banGhiHomNay.GioRa && <> | Ra: <strong>{banGhiHomNay.GioRa}</strong></>}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField fullWidth size="small" label="Từ ngày" type="date"
                value={tuNgay} onChange={(e) => setTuNgay(e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth size="small" label="Đến ngày" type="date"
                value={denNgay} onChange={(e) => setDenNgay(e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Tổng số ngày: <strong>{danhSach.length}</strong> |
                Tổng giờ làm: <strong>{tongGioLam.toFixed(1)}</strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {dangTai ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    {!laNhanVien && <TableCell><strong>Nhân viên</strong></TableCell>}
                    {!laNhanVien && <TableCell><strong>Phòng ban</strong></TableCell>}
                    <TableCell><strong>Ngày</strong></TableCell>
                    <TableCell align="center"><strong>Giờ vào</strong></TableCell>
                    <TableCell align="center"><strong>Giờ ra</strong></TableCell>
                    <TableCell align="center"><strong>Số giờ làm</strong></TableCell>
                    <TableCell align="center"><strong>Trạng thái</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {danhSach.map((item) => (
                    <TableRow key={item.MaCC} hover>
                      {!laNhanVien && <TableCell>{item.TenNV}</TableCell>}
                      {!laNhanVien && <TableCell>{item.TenPB || '—'}</TableCell>}
                      <TableCell>{item.Ngay?.split('T')[0]}</TableCell>
                      <TableCell align="center">{item.GioVao || '—'}</TableCell>
                      <TableCell align="center">{item.GioRa || '—'}</TableCell>
                      <TableCell align="center">
                        {item.SoGioLam ? `${Number(item.SoGioLam).toFixed(1)}h` : '—'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.GioRa ? 'Đủ công' : 'Chưa ra'}
                          size="small"
                          color={item.GioRa ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {danhSach.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Không có dữ liệu chấm công trong khoảng thời gian này
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
