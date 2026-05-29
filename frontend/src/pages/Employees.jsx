import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Button, TextField, InputAdornment, Avatar, IconButton,
  Tooltip, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, MenuItem, Select, FormControl, InputLabel, CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../api/employees';
import { getDepartments } from '../api/departments';
import api from '../api/axios';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';
import useDebounce from '../hooks/useDebounce';
import { formatDate, getInitials } from '../utils/format';
import { TRANG_THAI_NV } from '../constants';

const EmployeeForm = ({ open, onClose, onSave, initial, departments, positions }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initial || {} });
  useEffect(() => { reset(initial || {}); }, [initial]);

  const onSubmit = (data) => onSave(data);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initial?.MaNV1 ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[
              { name: 'MaNV1', label: 'Mã NV', required: true, disabled: !!initial?.MaNV1 },
              { name: 'TenNV', label: 'Họ tên', required: true },
              { name: 'Email', label: 'Email' },
              { name: 'SDT', label: 'Số điện thoại' },
              { name: 'NgaySinh', label: 'Ngày sinh', type: 'date' },
              { name: 'DiaChi', label: 'Địa chỉ' },
              { name: 'SoCCCD', label: 'CCCD' },
              { name: 'SoTaiKhoanNN', label: 'Số TK ngân hàng' },
            ].map(({ name, label, required, disabled, type }) => (
              <Grid item xs={12} sm={6} key={name}>
                <Controller name={name} control={control} rules={required ? { required: `${label} là bắt buộc` } : {}}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label={label} type={type || 'text'}
                      disabled={disabled} error={!!errors[name]}
                      helperText={errors[name]?.message}
                      InputLabelProps={type === 'date' ? { shrink: true } : undefined}
                    />
                  )}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6}>
              <Controller name="MaPB" control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Phòng ban</InputLabel>
                    <Select {...field} label="Phòng ban">
                      {departments.map((d) => <MenuItem key={d.MaPB} value={d.MaPB}>{d.TenPB}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="MaCV" control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Chức vụ</InputLabel>
                    <Select {...field} label="Chức vụ">
                      {positions.map((p) => <MenuItem key={p.MaCV} value={p.MaCV}>{p.TenCV}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="TrangThai" control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select {...field} label="Trạng thái">
                      {TRANG_THAI_NV.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
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

const Employees = () => {
  const toast = useToast();
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filterPB, setFilterPB] = useState('');
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const debouncedSearch = useDebounce(search);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployees({ page: page + 1, limit: rowsPerPage, search: debouncedSearch, MaPB: filterPB });
      setData(res.data.data);
    } catch { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  }, [page, rowsPerPage, debouncedSearch, filterPB]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    getDepartments().then((r) => setDepartments(r.data.data || []));
    api.get('/positions').then((r) => setPositions(r.data.data || []));
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editItem) await updateEmployee(editItem.MaNV1, formData);
      else await createEmployee(formData);
      toast.success(editItem ? 'Cập nhật thành công' : 'Thêm thành công');
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    const result = await toast.confirm('Xóa nhân viên?', 'Hành động này không thể hoàn tác.');
    if (result.isConfirmed) {
      try {
        await deleteEmployee(id);
        toast.success('Đã xóa');
        fetchData();
      } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    }
  };

  return (
    <Box>
      <PageHeader
        title="Quản lý nhân viên"
        subtitle={`${data.total} nhân viên`}
        action={
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => { setEditItem(null); setDialogOpen(true); }}>
            Thêm nhân viên
          </Button>
        }
      />

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Tìm kiếm..." size="small" sx={{ minWidth: 240 }}
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Phòng ban</InputLabel>
            <Select value={filterPB} onChange={(e) => setFilterPB(e.target.value)} label="Phòng ban">
              <MenuItem value="">Tất cả</MenuItem>
              {departments.map((d) => <MenuItem key={d.MaPB} value={d.MaPB}>{d.TenPB}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Mã NV</TableCell>
                <TableCell>Phòng ban</TableCell>
                <TableCell>Chức vụ</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell></TableRow>
              ) : data.items.length === 0 ? (
                <TableRow><TableCell colSpan={7}><EmptyState message="Không có nhân viên nào" /></TableCell></TableRow>
              ) : data.items.map((nv, i) => (
                <motion.tr key={nv.MaNV1} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  style={{ display: 'table-row' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={nv.Avatar} sx={{ width: 36, height: 36, bgcolor: '#6366f1', fontSize: 13 }}>
                        {getInitials(nv.TenNV)}
                      </Avatar>
                      <Box>
                        <Box sx={{ fontWeight: 600, fontSize: 14 }}>{nv.TenNV}</Box>
                        <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{nv.SDT}</Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{nv.MaNV1}</TableCell>
                  <TableCell>{nv.phongBan?.TenPB || '—'}</TableCell>
                  <TableCell>{nv.chucVu?.TenCV || '—'}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{nv.Email}</TableCell>
                  <TableCell><StatusChip status={nv.TrangThai} /></TableCell>
                  <TableCell align="center">
                    <Tooltip title="Sửa">
                      <IconButton size="small" onClick={() => { setEditItem(nv); setDialogOpen(true); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" color="error" onClick={() => handleDelete(nv.MaNV1)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={data.total} page={page} rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Hàng/trang"
        />
      </Card>

      <EmployeeForm
        open={dialogOpen} onClose={() => setDialogOpen(false)}
        onSave={handleSave} initial={editItem}
        departments={departments} positions={positions}
      />
    </Box>
  );
};

export default Employees;
