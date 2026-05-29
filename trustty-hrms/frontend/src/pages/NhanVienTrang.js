import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, Chip, Tooltip, Grid, MenuItem,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import apiClient from '../services/apiClient';
import XacNhanXoaDialog from '../components/XacNhanXoaDialog';

const FORM_BAN_DAU = {
  maNV: '', tenNV: '', ngaySinh: '', diaChi: '', soCCCD: '',
  email: '', sDT: '', trangThai: 'Đang làm', soTaiKhoanNH: '',
  maPB: '', maCV: '', tenTaiKhoan: '', matKhau: '', phanQuyen: 'Employee',
};

const DANH_SACH_QUYEN = ['Admin', 'HR', 'Manager', 'Employee'];
const DANH_SACH_TRANG_THAI = ['Đang làm', 'Đã nghỉ', 'Tạm nghỉ'];

export default function NhanVienTrang() {
  const [danhSach, setDanhSach] = useState([]);
  const [phongBans, setPhongBans] = useState([]);
  const [chucVus, setChucVus] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState('');
  const [thongBao, setThongBao] = useState('');
  const [tuKhoa, setTuKhoa] = useState('');
  const [locPhongBan, setLocPhongBan] = useState('');
  const [moDialog, setMoDialog] = useState(false);
  const [dangChinhSua, setDangChinhSua] = useState(false);
  const [duLieuForm, setDuLieuForm] = useState(FORM_BAN_DAU);
  const [loiForm, setLoiForm] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const [xoaItem, setXoaItem] = useState(null);
  const [dangXoa, setDangXoa] = useState(false);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const params = {};
      if (tuKhoa) params.tuKhoa = tuKhoa;
      if (locPhongBan) params.maPB = locPhongBan;
      const res = await apiClient.get('/nhan-vien', { params });
      setDanhSach(res.data);
    } catch {
      setLoi('Không thể tải danh sách nhân viên');
    } finally {
      setDangTai(false);
    }
  }, [tuKhoa, locPhongBan]);

  useEffect(() => { taiDuLieu(); }, [taiDuLieu]);

  useEffect(() => {
    async function taiDanhMuc() {
      const [resPB, resCV] = await Promise.all([
        apiClient.get('/phong-ban'),
        apiClient.get('/chuc-vu'),
      ]);
      setPhongBans(resPB.data);
      setChucVus(resCV.data);
    }
    taiDanhMuc();
  }, []);

  function moDialogThem() {
    setDuLieuForm(FORM_BAN_DAU);
    setDangChinhSua(false);
    setLoiForm('');
    setMoDialog(true);
  }

  function moDialogSua(item) {
    setDuLieuForm({
      maNV: item.MaNV, tenNV: item.TenNV,
      ngaySinh: item.NgaySinh ? item.NgaySinh.split('T')[0] : '',
      diaChi: item.DiaChi || '', soCCCD: item.SoCCCD || '',
      email: item.Email || '', sDT: item.SDT || '',
      trangThai: item.TrangThai || 'Đang làm',
      soTaiKhoanNH: item.SoTaiKhoanNH || '',
      maPB: item.MaPB || '', maCV: item.MaCV || '',
      tenTaiKhoan: '', matKhau: '', phanQuyen: 'Employee',
    });
    setDangChinhSua(true);
    setLoiForm('');
    setMoDialog(true);
  }

  function thayDoiForm(truong, giaTri) {
    setDuLieuForm((truoc) => ({ ...truoc, [truong]: giaTri }));
  }

  async function xuLyLuu() {
    if (!duLieuForm.maNV || !duLieuForm.tenNV) {
      setLoiForm('Mã nhân viên và tên nhân viên là bắt buộc');
      return;
    }
    if (!dangChinhSua && (!duLieuForm.tenTaiKhoan || !duLieuForm.matKhau)) {
      setLoiForm('Tên tài khoản và mật khẩu là bắt buộc khi tạo mới');
      return;
    }
    setDangLuu(true);
    try {
      if (dangChinhSua) {
        await apiClient.put(`/nhan-vien/${duLieuForm.maNV}`, duLieuForm);
        setThongBao('Cập nhật nhân viên thành công');
      } else {
        await apiClient.post('/nhan-vien', duLieuForm);
        setThongBao('Thêm nhân viên thành công');
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
      await apiClient.delete(`/nhan-vien/${xoaItem.MaNV}`);
      setThongBao('Xóa nhân viên thành công');
      setXoaItem(null);
      taiDuLieu();
    } catch (error) {
      setLoi(error.response?.data?.message || 'Không thể xóa nhân viên');
      setXoaItem(null);
    } finally {
      setDangXoa(false);
    }
  }

  const mauTrangThai = { 'Đang làm': 'success', 'Đã nghỉ': 'error', 'Tạm nghỉ': 'warning' };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Quản lý Nhân viên</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={moDialogThem}>
          Thêm nhân viên
        </Button>
      </Box>

      {thongBao && <Alert severity="success" onClose={() => setThongBao('')} sx={{ mb: 2 }}>{thongBao}</Alert>}
      {loi && <Alert severity="error" onClose={() => setLoi('')} sx={{ mb: 2 }}>{loi}</Alert>}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" placeholder="Tìm theo tên, mã NV, email, SĐT..."
                value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth select size="small" label="Phòng ban"
                value={locPhongBan} onChange={(e) => setLocPhongBan(e.target.value)}
              >
                <MenuItem value="">Tất cả phòng ban</MenuItem>
                {phongBans.map((pb) => (
                  <MenuItem key={pb.MaPB} value={pb.MaPB}>{pb.TenPB}</MenuItem>
                ))}
              </TextField>
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
                    <TableCell><strong>Mã NV</strong></TableCell>
                    <TableCell><strong>Họ tên</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>SĐT</strong></TableCell>
                    <TableCell><strong>Phòng ban</strong></TableCell>
                    <TableCell><strong>Chức vụ</strong></TableCell>
                    <TableCell align="center"><strong>Trạng thái</strong></TableCell>
                    <TableCell align="center"><strong>Thao tác</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {danhSach.map((item) => (
                    <TableRow key={item.MaNV} hover>
                      <TableCell><Chip label={item.MaNV} size="small" variant="outlined" /></TableCell>
                      <TableCell><strong>{item.TenNV}</strong></TableCell>
                      <TableCell>{item.Email || '—'}</TableCell>
                      <TableCell>{item.SDT || '—'}</TableCell>
                      <TableCell>{item.TenPB || '—'}</TableCell>
                      <TableCell>{item.TenCV || '—'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.TrangThai}
                          size="small"
                          color={mauTrangThai[item.TrangThai] || 'default'}
                        />
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
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Không tìm thấy nhân viên nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={moDialog} onClose={() => setMoDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{dangChinhSua ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
        <DialogContent>
          {loiForm && <Alert severity="error" sx={{ mb: 2 }}>{loiForm}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Mã nhân viên" value={duLieuForm.maNV}
                onChange={(e) => thayDoiForm('maNV', e.target.value)}
                required disabled={dangChinhSua} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Họ và tên" value={duLieuForm.tenNV}
                onChange={(e) => thayDoiForm('tenNV', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Ngày sinh" type="date" value={duLieuForm.ngaySinh}
                onChange={(e) => thayDoiForm('ngaySinh', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Số CCCD" value={duLieuForm.soCCCD}
                onChange={(e) => thayDoiForm('soCCCD', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" type="email" value={duLieuForm.email}
                onChange={(e) => thayDoiForm('email', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Số điện thoại" value={duLieuForm.sDT}
                onChange={(e) => thayDoiForm('sDT', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Địa chỉ" value={duLieuForm.diaChi}
                onChange={(e) => thayDoiForm('diaChi', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select label="Phòng ban" value={duLieuForm.maPB}
                onChange={(e) => thayDoiForm('maPB', e.target.value)}>
                <MenuItem value="">-- Chọn phòng ban --</MenuItem>
                {phongBans.map((pb) => (
                  <MenuItem key={pb.MaPB} value={pb.MaPB}>{pb.TenPB}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select label="Chức vụ" value={duLieuForm.maCV}
                onChange={(e) => thayDoiForm('maCV', e.target.value)}>
                <MenuItem value="">-- Chọn chức vụ --</MenuItem>
                {chucVus.map((cv) => (
                  <MenuItem key={cv.MaCV} value={cv.MaCV}>{cv.TenCV}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select label="Trạng thái" value={duLieuForm.trangThai}
                onChange={(e) => thayDoiForm('trangThai', e.target.value)}>
                {DANH_SACH_TRANG_THAI.map((tt) => (
                  <MenuItem key={tt} value={tt}>{tt}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Số tài khoản ngân hàng" value={duLieuForm.soTaiKhoanNH}
                onChange={(e) => thayDoiForm('soTaiKhoanNH', e.target.value)} />
            </Grid>
            {!dangChinhSua && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Tên tài khoản" value={duLieuForm.tenTaiKhoan}
                    onChange={(e) => thayDoiForm('tenTaiKhoan', e.target.value)} required />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Mật khẩu" type="password" value={duLieuForm.matKhau}
                    onChange={(e) => thayDoiForm('matKhau', e.target.value)} required />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth select label="Phân quyền" value={duLieuForm.phanQuyen}
                    onChange={(e) => thayDoiForm('phanQuyen', e.target.value)}>
                    {DANH_SACH_QUYEN.map((q) => (
                      <MenuItem key={q} value={q}>{q}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}
          </Grid>
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
        tieuDe="Xóa nhân viên"
        noiDung={`Bạn có chắc muốn xóa nhân viên "${xoaItem?.TenNV}"? Tài khoản đăng nhập cũng sẽ bị xóa.`}
        dangXuLy={dangXoa}
        onXacNhan={xuLyXoa}
        onDong={() => setXoaItem(null)}
      />
    </Box>
  );
}
