import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, Chip, Tooltip, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

const MAU_TRANG_THAI = {
  'Chờ duyệt': 'warning',
  'Đã duyệt': 'success',
  'Từ chối': 'error',
};

export default function NghiPhepTrang() {
  const { nguoiDung } = useAuth();
  const laNhanVien = nguoiDung?.phanQuyen === 'Employee';

  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState('');
  const [thongBao, setThongBao] = useState('');
  const [moDialog, setMoDialog] = useState(false);
  const [duLieuForm, setDuLieuForm] = useState({ ngayBD: '', ngayKT: '', lyDo: '' });
  const [loiForm, setLoiForm] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const endpoint = laNhanVien ? '/nghi-phep/ca-nhan' : '/nghi-phep';
      const res = await apiClient.get(endpoint);
      setDanhSach(res.data);
    } catch {
      setLoi('Không thể tải danh sách nghỉ phép');
    } finally {
      setDangTai(false);
    }
  }, [laNhanVien]);

  useEffect(() => { taiDuLieu(); }, [taiDuLieu]);

  async function xuLyGuiDon() {
    if (!duLieuForm.ngayBD || !duLieuForm.ngayKT) {
      setLoiForm('Ngày bắt đầu và ngày kết thúc là bắt buộc');
      return;
    }
    setDangLuu(true);
    try {
      await apiClient.post('/nghi-phep', duLieuForm);
      setThongBao('Gửi đơn xin nghỉ phép thành công');
      setMoDialog(false);
      setDuLieuForm({ ngayBD: '', ngayKT: '', lyDo: '' });
      taiDuLieu();
    } catch (error) {
      setLoiForm(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setDangLuu(false);
    }
  }

  async function xuLyDuyet(maDon, trangThai) {
    try {
      await apiClient.put(`/nghi-phep/${maDon}/duyet`, { trangThai });
      setThongBao(`${trangThai === 'Đã duyệt' ? 'Duyệt' : 'Từ chối'} đơn thành công`);
      taiDuLieu();
    } catch (error) {
      setLoi(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }

  async function xuLyHuy(maDon) {
    try {
      await apiClient.delete(`/nghi-phep/${maDon}`);
      setThongBao('Hủy đơn nghỉ phép thành công');
      taiDuLieu();
    } catch (error) {
      setLoi(error.response?.data?.message || 'Không thể hủy đơn');
    }
  }

  function tinhSoNgay(ngayBD, ngayKT) {
    if (!ngayBD || !ngayKT) return 0;
    const ms = new Date(ngayKT) - new Date(ngayBD);
    return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Quản lý Nghỉ phép</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setLoiForm(''); setMoDialog(true); }}>
          Xin nghỉ phép
        </Button>
      </Box>

      {thongBao && <Alert severity="success" onClose={() => setThongBao('')} sx={{ mb: 2 }}>{thongBao}</Alert>}
      {loi && <Alert severity="error" onClose={() => setLoi('')} sx={{ mb: 2 }}>{loi}</Alert>}

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
                    <TableCell><strong>Từ ngày</strong></TableCell>
                    <TableCell><strong>Đến ngày</strong></TableCell>
                    <TableCell align="center"><strong>Số ngày</strong></TableCell>
                    <TableCell><strong>Lý do</strong></TableCell>
                    <TableCell align="center"><strong>Trạng thái</strong></TableCell>
                    <TableCell align="center"><strong>Thao tác</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {danhSach.map((item) => (
                    <TableRow key={item.MaDon} hover>
                      {!laNhanVien && <TableCell>{item.TenNV}</TableCell>}
                      {!laNhanVien && <TableCell>{item.TenPB || '—'}</TableCell>}
                      <TableCell>{item.NgayBD?.split('T')[0]}</TableCell>
                      <TableCell>{item.NgayKT?.split('T')[0]}</TableCell>
                      <TableCell align="center">
                        <Chip label={tinhSoNgay(item.NgayBD, item.NgayKT)} size="small" />
                      </TableCell>
                      <TableCell>{item.LyDo || '—'}</TableCell>
                      <TableCell align="center">
                        <Chip label={item.TrangThai} size="small" color={MAU_TRANG_THAI[item.TrangThai] || 'default'} />
                      </TableCell>
                      <TableCell align="center">
                        {!laNhanVien && item.TrangThai === 'Chờ duyệt' && (
                          <>
                            <Tooltip title="Duyệt">
                              <IconButton size="small" color="success" onClick={() => xuLyDuyet(item.MaDon, 'Đã duyệt')}>
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Từ chối">
                              <IconButton size="small" color="error" onClick={() => xuLyDuyet(item.MaDon, 'Từ chối')}>
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {laNhanVien && item.TrangThai === 'Chờ duyệt' && (
                          <Tooltip title="Hủy đơn">
                            <IconButton size="small" color="error" onClick={() => xuLyHuy(item.MaDon)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {danhSach.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Không có đơn nghỉ phép nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={moDialog} onClose={() => setMoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đơn xin nghỉ phép</DialogTitle>
        <DialogContent>
          {loiForm && <Alert severity="error" sx={{ mb: 2 }}>{loiForm}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Từ ngày" type="date" value={duLieuForm.ngayBD}
                onChange={(e) => setDuLieuForm({ ...duLieuForm, ngayBD: e.target.value })}
                InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Đến ngày" type="date" value={duLieuForm.ngayKT}
                onChange={(e) => setDuLieuForm({ ...duLieuForm, ngayKT: e.target.value })}
                InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Lý do nghỉ phép" value={duLieuForm.lyDo}
                onChange={(e) => setDuLieuForm({ ...duLieuForm, lyDo: e.target.value })}
                multiline rows={3} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoDialog(false)} disabled={dangLuu}>Hủy</Button>
          <Button onClick={xuLyGuiDon} variant="contained" disabled={dangLuu}>
            {dangLuu ? <CircularProgress size={20} color="inherit" /> : 'Gửi đơn'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
