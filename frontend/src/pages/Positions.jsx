import React, { useState, useEffect } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import api from '../api/axios';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';

const PosForm = ({ open, onClose, onSave, initial }) => {
  const { control, handleSubmit, reset } = useForm({ defaultValues: initial || {} });
  useEffect(() => { reset(initial || {}); }, [initial]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{initial?.MaCV ? 'Cập nhật chức vụ' : 'Thêm chức vụ'}</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Controller name="MaCV" control={control} rules={{ required: true }}
            render={({ field }) => <TextField {...field} label="Mã chức vụ" fullWidth disabled={!!initial?.MaCV} />}
          />
          <Controller name="TenCV" control={control} rules={{ required: true }}
            render={({ field }) => <TextField {...field} label="Tên chức vụ" fullWidth />}
          />
          <Controller name="CapBac" control={control}
            render={({ field }) => <TextField {...field} label="Cấp bậc" type="number" fullWidth />}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined">Hủy</Button>
          <Button type="submit" variant="contained">Lưu</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Positions = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchData = () => api.get('/positions').then((r) => setItems(r.data.data || []));
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (data) => {
    try {
      if (editItem) await api.put(`/positions/${editItem.MaCV}`, data);
      else await api.post('/positions', data);
      toast.success('Lưu thành công');
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    const r = await toast.confirm('Xóa chức vụ?', '');
    if (r.isConfirmed) {
      try { await api.delete(`/positions/${id}`); toast.success('Đã xóa'); fetchData(); }
      catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    }
  };

  return (
    <Box>
      <PageHeader title="Quản lý chức vụ" subtitle={`${items.length} chức vụ`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditItem(null); setDialogOpen(true); }}>Thêm chức vụ</Button>}
      />
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                <TableCell>Mã CV</TableCell>
                <TableCell>Tên chức vụ</TableCell>
                <TableCell>Cấp bậc</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={4}><EmptyState /></TableCell></TableRow>
              ) : items.map((cv) => (
                <TableRow key={cv.MaCV} hover>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{cv.MaCV}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{cv.TenCV}</TableCell>
                  <TableCell>{cv.CapBac}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Sửa"><IconButton size="small" onClick={() => { setEditItem(cv); setDialogOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={() => handleDelete(cv.MaCV)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <PosForm open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} initial={editItem} />
    </Box>
  );
};

export default Positions;
