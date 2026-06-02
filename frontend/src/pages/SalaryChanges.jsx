import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Button, IconButton, Tooltip, Typography, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Grid, MenuItem, Select, FormControl, InputLabel, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { getSalaryChanges, createSalaryChange, deleteSalaryChange } from '../api/salaryChanges';
import { getEmployees } from '../api/employees';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';
import useAuthStore from '../store/authStore';
import { formatDate, formatCurrency, getInitials } from '../utils/format';

const HINH_THUC = ['Tăng lương', 'Giảm lương', 'Thưởng', 'Phụ cấp', 'Điều chỉnh khác'];

const SalaryChangeForm = ({ open, onClose, onSave, employees }) => {
  const { control, handleSubmit, reset } = useForm();
  useEffect(() => { if (open) reset({}); }, [open]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Thêm biến động lương</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Controller name="MaNV1" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Nhân viên</InputLabel>
                    <Select {...field} label="Nhân viên">
                      {employees.map((e) => <MenuItem key={e.MaNV1} value={e.MaNV1}>{e.TenNV}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="HinhThuc" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Hình thức</InputLabel>
                    <Select {...field} label="Hình thức">
                      {HINH_THUC.map((h) => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="NgayQuyetDinh" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <TextField {...field} label="Ngày quyết định" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                )} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="NoiDung" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <TextField {...field} label="Nội dung" fullWidth multiline rows={2} />
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="GiaTien" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <TextField {...field} label="Giá trị (VNĐ, âm = giảm)" type="number" fullWidth
                    helperText="Dương: tăng/thưởng — Âm: giảm/phạt" />
                )} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined">Hủy</Button>
          <Button type="submit" variant="contained">Lưu</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const SalaryChanges = () => {
  const toast = useToast();
  const { user } = useAuthStore();
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employees, setEmployees] = useState([]);

  const canManage = user?.PhanQuyen === 'Admin';
  const canViewAll = ['Admin', 'Ketoan'].includes(user?.PhanQuyen);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit: 10 };
      if (!canViewAll) params.MaNV1 = user.MaNV1;
      const res = await getSalaryChanges(params);
      setData(res.data.data);
    } catch { }
    finally { setLoading(false); }
  }, [page, user, canViewAll]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (canManage) getEmployees({ limit: 200 }).then((r) => setEmployees(r.data.data?.items || []));
  }, [canManage]);

  const handleSave = async (formData) => {
    try {
      await createSalaryChange(formData);
      toast.success('Thêm thành công');
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    const r = await toast.confirm('Xóa biến động lương này?', '');
    if (r.isConfirmed) {
      try { await deleteSalaryChange(id); toast.success('Đã xóa'); fetchData(); }
      catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    }
  };

  return (
    <Box>
      <PageHeader title="Biến động lương" subtitle={`${data.total} bản ghi`}
        action={canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Thêm
          </Button>
        )}
      />
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Hình thức</TableCell>
                <TableCell>Nội dung</TableCell>
                <TableCell align="right">Giá trị</TableCell>
                <TableCell>Ngày quyết định</TableCell>
                {canManage && <TableCell align="center">Thao tác</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell></TableRow>
              ) : data.items.length === 0 ? (
                <TableRow><TableCell colSpan={5}><EmptyState message="Chưa có biến động lương" /></TableCell></TableRow>
              ) : data.items.map((bd) => (
                <TableRow key={bd.MaBD} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#0ea5e9', fontSize: 12 }}>
                        {getInitials(bd.nhanVien?.TenNV)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{bd.nhanVien?.TenNV}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{
                      px: 1, py: 0.25, borderRadius: 1, display: 'inline-block', fontSize: 12,
                      bgcolor: bd.HinhThuc?.includes('Tăng') || bd.HinhThuc?.includes('Thưởng') ? '#dcfce7' : '#fee2e2',
                      color: bd.HinhThuc?.includes('Tăng') || bd.HinhThuc?.includes('Thưởng') ? '#16a34a' : '#dc2626',
                    }}>
                      {bd.HinhThuc}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap>{bd.NoiDung}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}
                      sx={{ color: +bd.GiaTien >= 0 ? 'success.main' : 'error.main' }}>
                      {+bd.GiaTien >= 0 ? '+' : ''}{formatCurrency(bd.GiaTien)}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(bd.NgayQuyetDinh)}</TableCell>
                  {canManage && (
                    <TableCell align="center">
                      <Tooltip title="Xóa">
                        <IconButton size="small" color="error" onClick={() => handleDelete(bd.MaBD)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={data.total} page={page} rowsPerPage={10}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} labelRowsPerPage="Hàng/trang" />
      </Card>

      <SalaryChangeForm open={dialogOpen} onClose={() => setDialogOpen(false)}
        onSave={handleSave} employees={employees} />
    </Box>
  );
};

export default SalaryChanges;
