import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, Grid, MenuItem,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

function dinhDangTien(so) {
  if (so === null || so === undefined) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(so);
}

export default function BangLuongTrang() {
  const { nguoiDung } = useAuth();
  const laNhanVien = nguoiDung?.phanQuyen === 'Employee';

  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState('');
  const [thongBao, setThongBao] = useState('');

  const thangHienTai = new Date().getMonth() + 1;
  const namHienTai = new Date().getFullYear();

  const [locThang, setLocThang] = useState(thangHienTai);
  const [locNam, setLocNam] = useState(namHienTai);
  const [moDialogTinhLuong, setMoDialogTinhLuong] = useState(false);
  const [thangTinh, setThangTinh] = useState(thangHienTai);
  const [namTinh, setNamTinh] = useState(namHienTai);
  const [dangTinh, setDangTinh] = useState(false);
  const [ketQuaTinh, setKetQuaTinh] = useState(null);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const endpoint = laNhanVien ? '/bang-luong/ca-nhan' : '/bang-luong';
      const params = laNhanVien ? {} : { thang: locThang, nam: locNam };
      const res = await apiClient.get(endpoint, { params });
      setDanhSach(res.data);
    } catch {
      setLoi('Không thể tải dữ liệu bảng lương');
    } finally {
      setDangTai(false);
    }
  }, [laNhanVien, locThang, locNam]);

  useEffect(() => { taiDuLieu(); }, [taiDuLieu]);

  async function xuLyTinhLuong() {
    setDangTinh(true);
    setKetQuaTinh(null);
    try {
      const res = await apiClient.post('/bang-luong/tinh-luong', {
        thang: thangTinh,
        nam: namTinh,
      });
      setKetQuaTinh(res.data);
      setThongBao(`Tính lương tháng ${thangTinh}/${namTinh} thành công cho ${res.data.soLuong} nhân viên`);
      taiDuLieu();
    } catch (error) {
      setLoi(error.response?.data?.message || 'Tính lương thất bại');
    } finally {
      setDangTinh(false);
    }
  }

  const tongThucLinh = danhSach.reduce((tong, bl) => tong + (Number(bl.ThucLinh) || 0), 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Bảng lương</Typography>
        {!laNhanVien && (
          <Button variant="contained" startIcon={<CalculateIcon />} onClick={() => setMoDialogTinhLuong(true)}>
            Tính lương tháng
          </Button>
        )}
      </Box>

      {thongBao && <Alert severity="success" onClose={() => setThongBao('')} sx={{ mb: 2 }}>{thongBao}</Alert>}
      {loi && <Alert severity="error" onClose={() => setLoi('')} sx={{ mb: 2 }}>{loi}</Alert>}

      {!laNhanVien && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6} md={2}>
                <TextField fullWidth select size="small" label="Tháng" value={locThang}
                  onChange={(e) => setLocThang(e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((t) => (
                    <MenuItem key={t} value={t}>Tháng {t}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField fullWidth size="small" label="Năm" type="number" value={locNam}
                  onChange={(e) => setLocNam(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Tổng chi phí lương: <strong style={{ color: '#1565c0' }}>{dinhDangTien(tongThucLinh)}</strong>
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

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
                    <TableCell align="center"><strong>Tháng/Năm</strong></TableCell>
                    <TableCell align="right"><strong>Lương cơ bản</strong></TableCell>
                    <TableCell align="right"><strong>Phụ cấp</strong></TableCell>
                    <TableCell align="right"><strong>Thuế TNCN</strong></TableCell>
                    <TableCell align="right"><strong>Thực lĩnh</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {danhSach.map((item) => (
                    <TableRow key={item.MaBL} hover>
                      {!laNhanVien && <TableCell>{item.TenNV}</TableCell>}
                      {!laNhanVien && <TableCell>{item.TenPB || '—'}</TableCell>}
                      <TableCell align="center">{item.Thang}/{item.Nam}</TableCell>
                      <TableCell align="right">{dinhDangTien(item.LuongCB)}</TableCell>
                      <TableCell align="right">{dinhDangTien(item.PhuCap)}</TableCell>
                      <TableCell align="right">{dinhDangTien(item.ThueTNCN)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {dinhDangTien(item.ThucLinh)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {danhSach.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Không có dữ liệu bảng lương
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={moDialogTinhLuong} onClose={() => { setMoDialogTinhLuong(false); setKetQuaTinh(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Tính lương tự động</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField fullWidth select label="Tháng" value={thangTinh}
                onChange={(e) => setThangTinh(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((t) => (
                  <MenuItem key={t} value={t}>Tháng {t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Năm" type="number" value={namTinh}
                onChange={(e) => setNamTinh(e.target.value)} />
            </Grid>
          </Grid>
          {ketQuaTinh && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Đã tính lương cho <strong>{ketQuaTinh.soLuong}</strong> nhân viên.
              Hệ thống tự động tính dựa trên ngày công thực tế, BHXH (8%), BHYT (1.5%), BHTN (1%) và thuế TNCN.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setMoDialogTinhLuong(false); setKetQuaTinh(null); }}>Đóng</Button>
          <Button onClick={xuLyTinhLuong} variant="contained" disabled={dangTinh}>
            {dangTinh ? <CircularProgress size={20} color="inherit" /> : 'Tính lương'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
