import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Select, FormControl, InputLabel, LinearProgress, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { getProjects, createProject, updateProject, deleteProject } from '../api/projects';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import useToast from '../hooks/useToast';
import { formatDate, formatCurrency } from '../utils/format';
import { TRANG_THAI_DA } from '../constants';

const ProjectForm = ({ open, onClose, onSave, initial }) => {
  const { control, handleSubmit, reset } = useForm({ defaultValues: initial || {} });
  useEffect(() => { reset(initial || {}); }, [initial]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.MaDOAN ? 'Cập nhật dự án' : 'Tạo dự án mới'}</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <Controller name="MaDOAN" control={control} rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Mã dự án" fullWidth disabled={!!initial?.MaDOAN} />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="TenDA" control={control} rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Tên dự án" fullWidth />}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller name="MoTa" control={control}
                render={({ field }) => <TextField {...field} label="Mô tả" fullWidth multiline rows={2} />}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name="NgayBD" control={control}
                render={({ field }) => <TextField {...field} label="Ngày bắt đầu" type="date" fullWidth InputLabelProps={{ shrink: true }} />}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name="NgayKT" control={control}
                render={({ field }) => <TextField {...field} label="Ngày kết thúc" type="date" fullWidth InputLabelProps={{ shrink: true }} />}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name="ChiPhiDuKien" control={control}
                render={({ field }) => <TextField {...field} label="Chi phí dự kiến" type="number" fullWidth />}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name="TrangThai" control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select {...field} label="Trạng thái">
                      {TRANG_THAI_DA.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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

const Projects = () => {
  const toast = useToast();
  const [data, setData] = useState({ items: [], total: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchData = useCallback(async () => {
    try { const res = await getProjects({ limit: 50 }); setData(res.data.data); } catch { }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (formData) => {
    try {
      if (editItem) await updateProject(editItem.MaDOAN, formData);
      else await createProject(formData);
      toast.success('Lưu thành công');
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    const r = await toast.confirm('Xóa dự án?', '');
    if (r.isConfirmed) {
      try { await deleteProject(id); toast.success('Đã xóa'); fetchData(); }
      catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    }
  };

  const getProgress = (da) => {
    if (!da.NgayBD || !da.NgayKT) return 0;
    const start = new Date(da.NgayBD), end = new Date(da.NgayKT), now = new Date();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  return (
    <Box>
      <PageHeader title="Quản lý dự án" subtitle={`${data.total} dự án`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditItem(null); setDialogOpen(true); }}>Tạo dự án</Button>}
      />
      {data.items.length === 0 ? <EmptyState message="Chưa có dự án nào" /> : (
        <Grid container spacing={3}>
          {data.items.map((da, i) => (
            <Grid item xs={12} md={6} lg={4} key={da.MaDOAN}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <StatusChip status={da.TrangThai} />
                      <Box>
                        <Tooltip title="Sửa"><IconButton size="small" onClick={() => { setEditItem(da); setDialogOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={() => handleDelete(da.MaDOAN)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </Box>
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>{da.TenDA}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>{da.MoTa}</Typography>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Tiến độ</Typography>
                        <Typography variant="caption" fontWeight={600}>{getProgress(da)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={getProgress(da)} sx={{ borderRadius: 4, height: 6 }} />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Thời gian</Typography>
                        <Typography variant="body2" fontWeight={600}>{formatDate(da.NgayBD)} → {formatDate(da.NgayKT)}</Typography>
                      </Box>
                      <Chip icon={<PeopleIcon />} label={`${da.nhanViens?.length || 0} thành viên`} size="small" variant="outlined" />
                    </Box>

                    {da.ChiPhiDuKien && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Chi phí: {formatCurrency(da.ChiPhiDuKien)}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
      <ProjectForm open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} initial={editItem} />
    </Box>
  );
};

export default Projects;
