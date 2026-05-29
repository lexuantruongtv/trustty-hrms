import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../api/departments';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';

const DeptForm = ({ open, onClose, onSave, initial }) => {
  const { control, handleSubmit, reset } = useForm({ defaultValues: initial || {} });
  useEffect(() => { reset(initial || {}); }, [initial]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.MaPB ? 'Cập nhật phòng ban' : 'Thêm phòng ban'}</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Controller name="MaPB" control={control} rules={{ required: true }}
            render={({ field }) => <TextField {...field} label="Mã phòng ban" fullWidth disabled={!!initial?.MaPB} />}
          />
          <Controller name="TenPB" control={control} rules={{ required: true }}
            render={({ field }) => <TextField {...field} label="Tên phòng ban" fullWidth />}
          />
          <Controller name="MoTa" control={control}
            render={({ field }) => <TextField {...field} label="Mô tả" fullWidth multiline rows={3} />}
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

const Departments = () => {
  const toast = useToast();
  const [depts, setDepts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchData = () => getDepartments().then((r) => setDepts(r.data.data || []));
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (data) => {
    try {
      if (editItem) await updateDepartment(editItem.MaPB, data);
      else await createDepartment(data);
      toast.success('Lưu thành công');
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    const r = await toast.confirm('Xóa phòng ban?', 'Hành động này không thể hoàn tác.');
    if (r.isConfirmed) {
      try { await deleteDepartment(id); toast.success('Đã xóa'); fetchData(); }
      catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    }
  };

  return (
    <Box>
      <PageHeader title="Quản lý phòng ban" subtitle={`${depts.length} phòng ban`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditItem(null); setDialogOpen(true); }}>Thêm phòng ban</Button>}
      />
      {depts.length === 0 ? <EmptyState message="Chưa có phòng ban nào" /> : (
        <Grid container spacing={3}>
          {depts.map((d, i) => (
            <Grid item xs={12} sm={6} md={4} key={d.MaPB}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#6366f118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BusinessIcon sx={{ color: '#6366f1' }} />
                      </Box>
                      <Box>
                        <Tooltip title="Sửa"><IconButton size="small" onClick={() => { setEditItem(d); setDialogOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={() => handleDelete(d.MaPB)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </Box>
                    </Box>
                    <Typography variant="h6" fontWeight={700}>{d.TenPB}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{d.MaPB}</Typography>
                    {d.MoTa && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{d.MoTa}</Typography>}
                    <Box sx={{ mt: 2 }}>
                      <Chip label={`${d.nhanViens?.length || 0} nhân viên`} size="small" color="primary" variant="outlined" />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
      <DeptForm open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} initial={editItem} />
    </Box>
  );
};

export default Departments;
