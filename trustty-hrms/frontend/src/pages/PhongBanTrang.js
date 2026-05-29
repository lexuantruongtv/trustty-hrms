import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, Chip, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../services/apiClient';
import XacNhanXoaDialog from '../components/XacNhanXoaDialog';

const TRANG_THAI_BAN_DAU = { maPB: '', tenPB: '', moTa: '' };

export default function PhongBanTrang() {
  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState('');
  const [thongBao, setThongBao] = useState('');

  const [moDialog, setMoDialog] = useState(false);
  const [dangChinhSua, setDangChinhSua] = useState(false);
  const [duLieuForm, setDuLieuForm] = useState(TRANG_THAI_BAN_DAU);
  const [loiForm, setLoiForm] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  const [xoaItem, setXoaItem] = useState(null);
  const [dangXoa, setDangXoa] = useState(false);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const res = await apiClient.get('/phong-ban');
      setDanhSach(res.data);
    } catch {
      setLoi('Không thể tải danh sách phòng ban');
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => { taiDuLieu(); }, [taiDuLieu]);

  function moDialogThem() {
    setDuLieuForm(TRANG_THAI_BAN_DAU);
    setDangChinhSua(false);
    setLoiForm('');
    setMoDialog(true);
  }

  function moDialogSua(item) {
    setDuLieuForm({ maPB: item.MaPB, tenPB: item.TenPB, moTa: item.MoTa || '' });
    setDangChinhSua(true);
    setLoiForm('');
    setMoDialog(true);
  }

  async function xuLyLuu() {
    if (!duLieuForm.maPB || !duLieuForm.tenPB) {
      setLoiForm('Mã phòng ban và tên phòng ban là bắt buộc');
      return;
    }
    setDangLuu(true);
    try {
      if (dangChinhSua) {
        await apiClient.put(`/phong-ban/${duLieuForm.maPB}`, {
          tenPB: duLieuForm.tenPB,
          moTa: duLieuForm.moTa,
        });
        setThongBao('Cập nhật phòng ban thành công');
      } else {
        await apiClient.post('/phong-ban', duLieuForm);
        setThongBao('Thêm phòng ban thành công');
      }
      setMoDialog(false);
      taiDuLieu();
    } catch (error) {
      setLoiForm(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setDangLuu(false);
    }
  }

  async function xuLyXoa() {
    setDangXoa(true);
    try {
      await apiClient.delete(`/phong-ban/${xoaItem.MaPB}`);
      setThongBao('Xóa phòng ban thành công');
      setXoaItem(null);
      taiDuLieu();
    } catch (error) {
      setLoi(error.response?.data?.message || 'Không thể xóa phòng ban');
      setXoaItem(null);
    } finally {
      setDangXoa(false);
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Quản lý Phòng ban</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={moDialogThem}>
          Thêm phòng ban
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
                    <TableCell><strong>Mã PB</strong></TableCell>
                    <TableCell><strong>Tên phòng ban</strong></TableCell>
                    <TableCell><strong>Mô tả</strong></TableCell>
                    <TableCell align="center"><strong>Số NV</strong></TableCell>
                    <TableCell align="center"><strong>Thao tác</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {danhSach.map((item) => (
                    <TableRow key={item.MaPB} hover>
                      <TableCell>
                        <Chip label={item.MaPB} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>{item.TenPB}</TableCell>
                      <TableCell>{item.MoTa || '—'}</TableCell>
                      <TableCell align="center">
                        <Chip label={item.soNhanVien} size="small" color="success" />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" color="primary" onClick={() => moDialogSua(item)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={() => setXoaItem(item)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {danhSach.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Chưa có phòng ban nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog thêm/sửa */}
      <Dialog open={moDialog} onClose={() => setMoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{dangChinhSua ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}</DialogTitle>
        <DialogContent>
          {loiForm && <Alert severity="error" sx={{ mb: 2 }}>{loiForm}</Alert>}
          <TextField
            fullWidth label="Mã phòng ban" value={duLieuForm.maPB}
            onChange={(e) => setDuLieuForm({ ...duLieuForm, maPB: e.target.value })}
            margin="normal" required disabled={dangChinhSua}
          />
          <TextField
            fullWidth label="Tên phòng ban" value={duLieuForm.tenPB}
            onChange={(e) => setDuLieuForm({ ...duLieuForm, tenPB: e.target.value })}
            margin="normal" required
          />
          <TextField
            fullWidth label="Mô tả" value={duLieuForm.moTa}
            onChange={(e) => setDuLieuForm({ ...duLieuForm, moTa: e.target.value })}
            margin="normal" multiline rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoDialog(false)} disabled={dangLuu}>Hủy</Button>
          <Button onClick={xuLyLuu} variant="contained" disabled={dangLuu}>
            {dangLuu ? <CircularProgress size={20} color="inherit" /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      <XacNhanXoaDialog
        mo={Boolean(xoaItem)}
        tieuDe="Xóa phòng ban"
        noiDung={`Bạn có chắc muốn xóa phòng ban "${xoaItem?.TenPB}"?`}
        dangXuLy={dangXoa}
        onXacNhan={xuLyXoa}
        onDong={() => setXoaItem(null)}
      />
    </Box>
  );
}
