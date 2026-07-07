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
import { LOAI_BH } from '../constants';

const InsuranceForm = ({ open, onClose, onSave, initial, employees }) => {
  const { control, handleSubmit, reset } = useForm({ defaultValues: initial || {} });
  useEffect(() => { reset(initial || {}); }, [initial]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.MaBH ? 'Cập nhật bảo hiểm' : 'Thêm bảo hiểm'}</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Controller name="MaBH" control={control} rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Mã bảo hiểm" fullWidth disabled={!!initial?.MaBH} />}
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
              <Controller name="TenBH" control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Loại bảo hiểm</InputLabel>
                    <Select {...field} label="Loại bảo hiểm">
                      {LOAI_BH.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller name="NgayHetHan" control={control}
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

const Insurance = () => {
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
      const res = await api.get('/insurance', {
        params: { page: page + 1, limit: 10, search: search || undefined, TenBH: filterLoai || undefined },
      });
      setData(res.data.data);
    } catch { }
  }, [page, search, filterLoai]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { getEmployees({ limit: 100 }).then((r) => setEmployees(r.data.data?.items || [])); }, []);
  useEffect(() => { setPage(0); }, [search, filterLoai]);

  const handleSave = async (formData) => {
    try {
      if (editItem) await api.put(`/insurance/${editItem.MaBH}`, formData);
      else await api.post('/insurance', formData);
      toast.success('Lưu thành công');
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    const r = await toast.confirm('Xóa bảo hiểm?', '');
    if (r.isConfirmed) {
      try { await api.delete(`/insurance/${id}`); toast.success('Đã xóa'); fetchData(); }
      catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    }
  };

  return (
    <Box>
      <PageHeader title="Bảo hiểm" subtitle={`${data.total} bản ghi`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditItem(null); setDialogOpen(true); }}>Thêm bảo hiểm</Button>}
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
            <InputLabel>Loại bảo hiểm</InputLabel>
            <Select value={filterLoai} label="Loại bảo hiểm" onChange={(e) => setFilterLoai(e.target.value)}>
              <MenuItem value="">Tất cả</MenuItem>
              {LOAI_BH.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                <TableCell>Mã BH</TableCell>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Loại bảo hiểm</TableCell>
                <TableCell>Ngày hết hạn</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow><TableCell colSpan={5}><EmptyState message="Chưa có dữ liệu bảo hiểm" /></TableCell></TableRow>
              ) : data.items.map((bh) => (
                <TableRow key={bh.MaBH} hover>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{bh.MaBH}</TableCell>
                  <TableCell>{bh.nhanVien?.TenNV}</TableCell>
                  <TableCell>{bh.TenBH}</TableCell>
                  <TableCell>{formatDate(bh.NgayHetHan)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Sửa"><IconButton size="small" onClick={() => { setEditItem(bh); setDialogOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={() => handleDelete(bh.MaBH)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={data.total} page={page} rowsPerPage={10}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} labelRowsPerPage="Hàng/trang" />
      </Card>
      <InsuranceForm open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} initial={editItem} employees={employees} />
    </Box>
  );
};

export default Insurance;
