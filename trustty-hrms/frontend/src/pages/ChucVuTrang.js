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

const TRANG_THAI_BAN_DAU = { maCV: '', tenCV: '', capBac: '' };

export default function ChucVuTrang() {
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
      const res = await apiClient.get('/chuc-vu');
      setDanhSach(res.data);
    } catch {
      setLoi('Không thể tải danh sách chức vụ');
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
    setDuLieuForm({ maCV: item.MaCV, tenCV: item.TenCV, capBac: item.CapBac || '' });
    setDangChinhSua(true);
    setLoiForm('');
    setMoDialog(true);
  }

  async function xuLyLuu() {
    if (!duLieuForm.maCV || !duLieuForm.tenCV) {
      setLoiForm('Mã chức vụ và tên chức vụ là bắt buộc');
      return;
    }
    setDangLuu(true);
    try {
      if (dangChinhSua) {
        await apiClient.put(`/chuc-vu/${duLieuForm.maCV}`, {
          tenCV: duLieuForm.tenCV,
          capBac: duLieuForm.capBac || null,
        });
        setThongBao('Cập nhật chức vụ thành công');
      } else {
        await apiClient.post('/chuc-vu', {
          maCV: duLieuForm.maCV,
          tenCV: duLieuForm.tenCV,
          capBac: duLieuForm.capBac || null,
        });
        setThongBao('Thêm chức vụ thành công');
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
      await apiClient.delete(`/chuc-vu/${xoaItem.MaCV}`);
      setThongBao('Xóa chức vụ thành công');
      setXoaItem(null);
      taiDuLieu();
    } catch (error) {
      setLoi(error.response?.data?.message || 'Không thể xóa chức vụ');
      setXoaItem(null);
    } finally {
      setDangXoa(false);
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Quản lý Chức vụ</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={moDialogThem}>
          Thêm chức vụ
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
                    <TableCell><strong>Mã CV</strong></TableCell>
                    <TableCell><strong>Tên chức vụ</strong></TableCell>
                    <TableCell align="center"><strong>Cấp bậc</strong></TableCell>
                    <TableCell align="center"><strong>Thao tác</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {danhSach.map((item) => (
                    <TableRow key={item.MaCV} hover>
                      <TableCell>
                        <Chip label={item.MaCV} size="small" color="secondary" variant="outlined" />
                      </TableCell>
                      <TableCell>{item.TenCV}</TableCell>
                      <TableCell align="center">
                        {item.CapBac ? (
                          <Chip label={`Cấp ${item.CapBac}`} size="small" />
                        ) : '—'}
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
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Chưa có chức vụ nào
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
        <DialogTitle>{dangChinhSua ? 'Chỉnh sửa chức vụ' : 'Thêm chức vụ mới'}</DialogTitle>
        <DialogContent>
          {loiForm && <Alert severity="error" sx={{ mb: 2 }}>{loiForm}</Alert>}
          <TextField
            fullWidth label="Mã chức vụ" value={duLieuForm.maCV}
            onChange={(e) => setDuLieuForm({ ...duLieuForm, maCV: e.target.value })}
            margin="normal" required disabled={dangChinhSua}
          />
          <TextField
            fullWidth label="Tên chức vụ" value={duLieuForm.tenCV}
            onChange={(e) => setDuLieuForm({ ...duLieuForm, tenCV: e.target.value })}
            margin="normal" required
          />
          <TextField
            fullWidth label="Cấp bậc" type="number" value={duLieuForm.capBac}
            onChange={(e) => setDuLieuForm({ ...duLieuForm, capBac: e.target.value })}
            margin="normal" inputProps={{ min: 1 }}
            helperText="Số nhỏ hơn = cấp bậc cao hơn (1 = cao nhất)"
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
        tieuDe="Xóa chức vụ"
        noiDung={`Bạn có chắc muốn xóa chức vụ "${xoaItem?.TenCV}"?`}
        dangXuLy={dangXoa}
        onXacNhan={xuLyXoa}
        onDong={() => setXoaItem(null)}
      />
    </Box>
  );
}
