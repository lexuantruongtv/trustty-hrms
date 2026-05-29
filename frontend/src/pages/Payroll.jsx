import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Avatar, MenuItem, Select, FormControl, InputLabel, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useForm, Controller } from 'react-hook-form';
import { getPayroll, calculatePayroll } from '../api/payroll';
import { getEmployees } from '../api/employees';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';
import useAuthStore from '../store/authStore';
import { formatCurrency, formatDate, getInitials } from '../utils/format';

const PayrollForm = ({ open, onClose, onSave, employees }) => {
  const { control, handleSubmit, reset } = useForm();
  useEffect(() => { if (open) reset({}); }, [open]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tính lương nhân viên</DialogTitle>
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
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name="Thang" control={control} rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Tháng" type="number" fullWidth inputProps={{ min: 1, max: 12 }} />}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name="Nam" control={control} rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Năm" type="number" fullWidth defaultValue={new Date().getFullYear()} />}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name="LuongCB" control={control} rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Lương cơ bản (VNĐ)" type="number" fullWidth />}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name="PhuCap" control={control}
                render={({ field }) => <TextField {...field} label="Phụ cấp (VNĐ)" type="number" fullWidth defaultValue={0} />}
              />
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            * Thuế TNCN tự động tính 10% lương cơ bản
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined">Hủy</Button>
          <Button type="submit" variant="contained">Tính lương</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Payroll = () => {
  const toast = useToast();
  const { user } = useAuthStore();
  const [data, setData] = useState({ items: [], total: 0 });
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const canManage = ['Admin', 'HR'].includes(user?.PhanQuyen);

  const fetchData = useCallback(async () => {
    try {
      const params = { page: page + 1, limit: 10 };
      if (user?.PhanQuyen === 'Employee') params.MaNV1 = user.MaNV1;
      const res = await getPayroll(params);
      setData(res.data.data);
    } catch { }
  }, [page, user]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (canManage) getEmployees({ limit: 100 }).then((r) => setEmployees(r.data.data?.items || []));
  }, [canManage]);

  const handleCalculate = async (formData) => {
    try {
      await calculatePayroll({ ...formData, LuongCB: +formData.LuongCB, PhuCap: +(formData.PhuCap || 0), Thang: +formData.Thang, Nam: +formData.Nam });
      toast.success('Tính lương thành công');
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  return (
    <Box>
      <PageHeader title="Bảng lương" subtitle={`${data.total} bản ghi`}
        action={canManage && <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>Tính lương</Button>}
      />
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Tháng/Năm</TableCell>
                <TableCell align="right">Lương CB</TableCell>
                <TableCell align="right">Phụ cấp</TableCell>
                <TableCell align="right">Thuế TNCN</TableCell>
                <TableCell align="right">Thực lĩnh</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow><TableCell colSpan={6}><EmptyState message="Chưa có bảng lương" /></TableCell></TableRow>
              ) : data.items.map((bl) => (
                <TableRow key={bl.MaBL} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981', fontSize: 12 }}>
                        {getInitials(bl.nhanVien?.TenNV)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{bl.nhanVien?.TenNV}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>T{bl.Thang}/{bl.Nam}</TableCell>
                  <TableCell align="right">{formatCurrency(bl.LuongCB)}</TableCell>
                  <TableCell align="right">{formatCurrency(bl.PhuCap)}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>-{formatCurrency(bl.ThueTNCN)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatCurrency(bl.ThucLinh)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={data.total} page={page} rowsPerPage={10}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} labelRowsPerPage="Hàng/trang" />
      </Card>
      <PayrollForm open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleCalculate} employees={employees} />
    </Box>
  );
};

export default Payroll;
