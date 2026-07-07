import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, Grid, Tooltip,
  InputAdornment, Stack,
} from '@mui/material';
import SearchableEmployeeSelect from '../components/common/SearchableEmployeeSelect';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useForm, Controller } from 'react-hook-form';
import api from '../api/axios';
import { getEmployees } from '../api/employees';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';
import { formatDate } from '../utils/format';
import { LOAI_HD } from '../constants';

const ContractForm = ({ open, onClose, onSave, initial, employees }) => {
  const { control, handleSubmit, reset } = useForm({ defaultValues: initial || {} });
  useEffect(() => { reset(initial || {}); }, [initial]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.SoHD ? 'Cập nhật hợp đồng' : 'Thêm hợp đồng'}</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Controller name="SoHD" control={control} rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Số hợp đồng" fullWidth disabled={!!initial?.SoHD} />}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller name="MaNV1" control={control} rules={{ required: true }}
                render={({ field }) => (
                  <SearchableEmployeeSelect
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    employees={employees}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller name="LoaiHD" control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Loại hợp đồng</InputLabel>
                    <Select {...field} label="Loại hợp đồng">
                      {LOAI_HD.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name="NgayKy" control={control}
                render={({ field }) => <TextField {...field} label="Ngày ký" type="date" fullWidth InputLabelProps={{ shrink: true }} />}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name="NgayHH" control={control}
                render={({ field }) => <TextField {...field} label="Ngày hết hạn" type="date" fullWidth InputLabelProps={{ shrink: true }} />}
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

const Contracts = () => {
  const toast = useToast();
  const [data, setData] = useState({ items: [], total: 0 });
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [filterLoai, setFilterLoai] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/contracts', {
        params: { page: page + 1, limit: 10, search: search || undefined, LoaiHD: filterLoai || undefined },
      });
      setData(res.data.data);
    } catch { }
  }, [page, search, filterLoai]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { getEmployees({ limit: 100 }).then((r) => setEmployees(r.data.data?.items || [])); }, []);
  useEffect(() => { setPage(0); }, [search, filterLoai]);

  const handleSave = async (formData) => {
    try {
      if (editItem) await api.put(`/contracts/${editItem.SoHD}`, formData);
      else await api.post('/contracts', formData);
      toast.success('Lưu thành công');
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    const r = await toast.confirm('Xóa hợp đồng?', '');
    if (r.isConfirmed) {
      try { await api.delete(`/contracts/${id}`); toast.success('Đã xóa'); fetchData(); }
      catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    }
  };

  return (
    <Box>
      <PageHeader title="Hợp đồng lao động" subtitle={`${data.total} hợp đồng`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditItem(null); setDialogOpen(true); }}>Thêm hợp đồng</Button>}
      />
      <Card>
        <Stack direction="row" spacing={2} sx={{ p: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Tìm theo tên nhân viên..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 240 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Loại hợp đồng</InputLabel>
            <Select value={filterLoai} label="Loại hợp đồng" onChange={(e) => setFilterLoai(e.target.value)}>
              <MenuItem value="">Tất cả</MenuItem>
              {LOAI_HD.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                <TableCell>Số HĐ</TableCell>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Loại hợp đồng</TableCell>
                <TableCell>Ngày ký</TableCell>
                <TableCell>Ngày hết hạn</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow><TableCell colSpan={6}><EmptyState message="Chưa có hợp đồng" /></TableCell></TableRow>
              ) : data.items.map((hd) => (
                <TableRow key={hd.SoHD} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{hd.SoHD}</TableCell>
                  <TableCell>{hd.nhanVien?.TenNV}</TableCell>
                  <TableCell>{hd.LoaiHD}</TableCell>
                  <TableCell>{formatDate(hd.NgayKy)}</TableCell>
                  <TableCell>{formatDate(hd.NgayHH)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Sửa"><IconButton size="small" onClick={() => { setEditItem(hd); setDialogOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={() => handleDelete(hd.SoHD)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={data.total} page={page} rowsPerPage={10}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} labelRowsPerPage="Hàng/trang" />
      </Card>
      <ContractForm open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} initial={editItem} employees={employees} />
    </Box>
  );
};

export default Contracts;
