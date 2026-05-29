import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import api from '../api/axios';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';
import useAuthStore from '../store/authStore';

const EduForm = ({ open, onClose, onSave, initial }) => {
  const { control, handleSubmit, reset } = useForm({ defaultValues: initial || {} });
  useEffect(() => { reset(initial || {}); }, [initial]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.MaTD ? 'Cập nhật trình độ' : 'Thêm trình độ học vấn'}</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[
              { name: 'TenBangCap', label: 'Tên bằng cấp' },
              { name: 'ChuyenNganh', label: 'Chuyên ngành' },
              { name: 'NoiDaoTao', label: 'Nơi đào tạo' },
              { name: 'NamHoanThanh', label: 'Năm hoàn thành', type: 'number' },
            ].map(({ name, label, type }) => (
              <Grid item xs={12} sm={6} key={name}>
                <Controller name={name} control={control}
                  render={({ field }) => <TextField {...field} label={label} type={type || 'text'} fullWidth />}
                />
              </Grid>
            ))}
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

const Education = () => {
  const toast = useToast();
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const params = user?.PhanQuyen === 'Employee' ? { MaNV1: user.MaNV1 } : {};
      const res = await api.get('/education', { params });
      setItems(res.data.data || []);
    } catch { }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (formData) => {
    const payload = { ...formData, MaNV1: formData.MaNV1 || user.MaNV1 };
    try {
      if (editItem) await api.put(`/education/${editItem.MaTD}`, payload);
      else await api.post('/education', payload);
      toast.success('Lưu thành công');
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    const r = await toast.confirm('Xóa trình độ?', '');
    if (r.isConfirmed) {
      try { await api.delete(`/education/${id}`); toast.success('Đã xóa'); fetchData(); }
      catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    }
  };

  return (
    <Box>
      <PageHeader title="Trình độ học vấn" subtitle={`${items.length} bản ghi`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditItem(null); setDialogOpen(true); }}>Thêm</Button>}
      />
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Bằng cấp</TableCell>
                <TableCell>Chuyên ngành</TableCell>
                <TableCell>Nơi đào tạo</TableCell>
                <TableCell>Năm HT</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={6}><EmptyState message="Chưa có dữ liệu" /></TableCell></TableRow>
              ) : items.map((td) => (
                <TableRow key={td.MaTD} hover>
                  <TableCell>{td.nhanVien?.TenNV}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{td.TenBangCap}</TableCell>
                  <TableCell>{td.ChuyenNganh}</TableCell>
                  <TableCell>{td.NoiDaoTao}</TableCell>
                  <TableCell>{td.NamHoanThanh}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Sửa"><IconButton size="small" onClick={() => { setEditItem(td); setDialogOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={() => handleDelete(td.MaTD)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <EduForm open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} initial={editItem} />
    </Box>
  );
};

export default Education;
