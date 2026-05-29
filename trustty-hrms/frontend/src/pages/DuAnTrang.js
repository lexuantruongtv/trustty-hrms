import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, Chip, Tooltip, Grid, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import apiClient from '../services/apiClient';
import XacNhanXoaDialog from '../components/XacNhanXoaDialog';

const FORM_BAN_DAU = {
  maDA: '', tenDA: '', moTa: '', trangThai: 'Đang chạy',
  ngayBD: '', ngayKT: '', chiPhiDuKien: '', chiPhiThucTe: '',
};

const DANH_SACH_TRANG_THAI = ['Đang chạy', 'Hoàn thành', 'Tạm dừng', 'Hủy'];

const MAU_TRANG_THAI = {
  'Đang chạy': 'primary',
  'Hoàn thành': 'success',
  'Tạm dừng': 'warning',
  'Hủy': 'error',
};

export default function DuAnTrang() {
  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState('');
  const [thongBao, setThongBao] = useState('');
  const [moDialog, setMoDialog] = useState(false);
  const [dangChinhSua, setDangChinhSua] = useState(false);
  const [duLieuForm, setDuLieuForm] = useState(FORM_BAN_DAU);
  const [loiForm, setLoiForm] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const [xoaItem, setXoaItem] = useState(null);
  const [dangXoa, setDangXoa] = useState(false);
  const [chiTietDA, setChiTietDA] = useState(null);
  const [moDialogChiTiet, setMoDialogChiTiet] = useState(false);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const res = await apiClient.get('/du-an');
      setDanhSach(res.data);
    } catch {
      setLoi('Không thể tải danh sách dự án');
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => { taiDuLieu(); }, [taiDuLieu]);

  function moDialogThem() {
    setDuLieuForm(FORM_BAN_DAU);
    setDangChinhSua(false);
    setLoiForm('');
    setMoDialog(true);
  }

  function moDialogSua(item) {
    setDuLieuForm({
      maDA: item.MaDA, tenDA: item.TenDA, moTa: item.MoTa || '',
      trangThai: item.TrangThai || 'Đang chạy',
      ngayBD: item.NgayBD ? item.NgayBD.split('T')[0] : '',
      ngayKT: item.NgayKT ? item.NgayKT.split('T')[0] : '',
      chiPhiDuKien: item.ChiPhiDuKien || '',
      chiPhiThucTe: item.ChiPhiThucTe || '',
    });
    setDangChinhSua(true);
    setLoiForm('');
    setMoDialog(true);
  }

  async function xemChiTiet(maDA) {
    try {
      const res = await apiClient.get(`/du-an/${maDA}`);
      setChiTietDA(res.data);
      setMoDialogChiTiet(true);
    } catch {
      setLoi('Không thể tải chi tiết dự án');
    }
  }

  async function xuLyLuu() {
    if (!duLieuForm.maDA || !duLieuForm.tenDA) {
      setLoiForm('Mã dự án và tên dự án là bắt buộc');
      return;
    }
    setDangLuu(true);
    try {
      if (dangChinhSua) {
        await apiClient.put(`/du-an/${duLieuForm.maDA}`, duLieuForm);
        setThongBao('Cập nhật dự án thành công');
      } else {
        await apiClient.post('/du-an', duLieuForm);
        setThongBao('Thêm dự án thành công');
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
      await apiClient.delete(`/du-an/${xoaItem.MaDA}`);
      setThongBao('Xóa dự án thành công');
      setXoaItem(null);
      taiDuLieu();
    } catch (error) {
      setLoi(error.response?.data?.message || 'Không thể xóa dự án');
      setXoaItem(null);
    } finally {
      setDangXoa(false);
    }
  }

  function dinhDangTien(so) {
    if (!so) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(so);
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Quản lý Dự án</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={moDialogThem}>
          Thêm dự án
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
                    <TableCell><strong>Mã DA</strong></TableCell>
                    <TableCell><strong>Tên dự án</strong></TableCell>
                    <TableCell align="center"><strong>Trạng thái</strong></TableCell>
                    <TableCell><strong>Ngày bắt đầu</strong></TableCell>
                    <TableCell><strong>Ngày kết thúc</strong></TableCell>
                    <TableCell><strong>Chi phí dự kiến</strong></TableCell>
                    <TableCell align="center"><strong>Nhân sự</strong></TableCell>
                    <TableCell align="center"><strong>Thao tác</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {danhSach.map((item) => (
                    <TableRow key={item.MaDA} hover>
                      <TableCell><Chip label={item.MaDA} size="small" variant="outlined" /></TableCell>
                      <TableCell><strong>{item.TenDA}</strong></TableCell>
                      <TableCell align="center">
                        <Chip label={item.TrangThai} size="small" color={MAU_TRANG_THAI[item.TrangThai] || 'default'} />
                      </TableCell>
                      <TableCell>{item.NgayBD ? item.NgayBD.split('T')[0] : '—'}</TableCell>
                      <TableCell>{item.NgayKT ? item.NgayKT.split('T')[0] : '—'}</TableCell>
                      <TableCell>{dinhDangTien(item.ChiPhiDuKien)}</TableCell>
                      <TableCell align="center">
                        <Chip label={item.soNhanVien} size="small" color="info" />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Xem thành viên">
                          <IconButton size="small" color="info" onClick={() => xemChiTiet(item.MaDA)}>
                            <PeopleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Chưa có dự án nào
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
      <Dialog open={moDialog} onClose={() => setMoDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{dangChinhSua ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}</DialogTitle>
        <DialogContent>
          {loiForm && <Alert severity="error" sx={{ mb: 2 }}>{loiForm}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Mã dự án" value={duLieuForm.maDA}
                onChange={(e) => setDuLieuForm({ ...duLieuForm, maDA: e.target.value })}
                required disabled={dangChinhSua} />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField fullWidth label="Tên dự án" value={duLieuForm.tenDA}
                onChange={(e) => setDuLieuForm({ ...duLieuForm, tenDA: e.target.value })} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Mô tả" value={duLieuForm.moTa}
                onChange={(e) => setDuLieuForm({ ...duLieuForm, moTa: e.target.value })}
                multiline rows={2} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth select label="Trạng thái" value={duLieuForm.trangThai}
                onChange={(e) => setDuLieuForm({ ...duLieuForm, trangThai: e.target.value })}>
                {DANH_SACH_TRANG_THAI.map((tt) => (
                  <MenuItem key={tt} value={tt}>{tt}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Ngày bắt đầu" type="date" value={duLieuForm.ngayBD}
                onChange={(e) => setDuLieuForm({ ...duLieuForm, ngayBD: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Ngày kết thúc" type="date" value={duLieuForm.ngayKT}
                onChange={(e) => setDuLieuForm({ ...duLieuForm, ngayKT: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Chi phí dự kiến (VNĐ)" type="number" value={duLieuForm.chiPhiDuKien}
                onChange={(e) => setDuLieuForm({ ...duLieuForm, chiPhiDuKien: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Chi phí thực tế (VNĐ)" type="number" value={duLieuForm.chiPhiThucTe}
                onChange={(e) => setDuLieuForm({ ...duLieuForm, chiPhiThucTe: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoDialog(false)} disabled={dangLuu}>Hủy</Button>
          <Button onClick={xuLyLuu} variant="contained" disabled={dangLuu}>
            {dangLuu ? <CircularProgress size={20} color="inherit" /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chi tiết thành viên */}
      <Dialog open={moDialogChiTiet} onClose={() => setMoDialogChiTiet(false)} maxWidth="md" fullWidth>
        <DialogTitle>Thành viên dự án: {chiTietDA?.TenDA}</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Mã NV</strong></TableCell>
                  <TableCell><strong>Họ tên</strong></TableCell>
                  <TableCell><strong>Phòng ban</strong></TableCell>
                  <TableCell><strong>Vai trò</strong></TableCell>
                  <TableCell><strong>Ngày tham gia</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chiTietDA?.thanhVien?.map((tv) => (
                  <TableRow key={tv.MaNV} hover>
                    <TableCell>{tv.MaNV}</TableCell>
                    <TableCell>{tv.TenNV}</TableCell>
                    <TableCell>{tv.TenPB || '—'}</TableCell>
                    <TableCell><Chip label={tv.VaiTro} size="small" color="primary" /></TableCell>
                    <TableCell>{tv.ThoiGianTG ? tv.ThoiGianTG.split('T')[0] : '—'}</TableCell>
                  </TableRow>
                ))}
                {(!chiTietDA?.thanhVien || chiTietDA.thanhVien.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      Chưa có thành viên nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoDialogChiTiet(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <XacNhanXoaDialog
        mo={Boolean(xoaItem)}
        tieuDe="Xóa dự án"
        noiDung={`Bạn có chắc muốn xóa dự án "${xoaItem?.TenDA}"?`}
        dangXuLy={dangXoa}
        onXacNhan={xuLyXoa}
        onDong={() => setXoaItem(null)}
      />
    </Box>
  );
}
