import { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Select, FormControl, InputLabel, LinearProgress, Tooltip, Divider,
  Avatar, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
  Slider, CircularProgress, Collapse, InputAdornment, Stack,
} from '@mui/material';
import SearchableEmployeeSelect from '../components/common/SearchableEmployeeSelect';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { getProjects, createProject, updateProject, deleteProject, assignMember, checkMemberBusy, removeAssign, getNotes, addNote, getNvChuaThamGia } from '../api/projects';
import { getEmployees } from '../api/employees';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import ChatNotes from '../components/common/ChatNotes';
import useToast from '../hooks/useToast';
import useAuthStore from '../store/authStore';
import { formatDate, formatCurrency, getInitials } from '../utils/format';
import { TRANG_THAI_DA } from '../constants';

const VAI_TRO = ['Quản lý dự án', 'Lập trình viên', 'Thiết kế', 'Kiểm thử', 'Phân tích', 'Tư vấn'];

// ── Form tạo/sửa dự án ────────────────────────────────────────────────────────
const ProjectForm = ({ open, onClose, onSave, initial }) => {
  const { control, handleSubmit, reset } = useForm({ defaultValues: initial || {} });
  useEffect(() => { reset(initial || {}); }, [initial]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.MaDOAN ? 'Cập nhật dự án' : 'Tạo dự án mới'}</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <Controller name="MaDOAN" control={control} rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Mã dự án" fullWidth disabled={!!initial?.MaDOAN} />} />
            </Grid>
            <Grid item xs={6}>
              <Controller name="TenDA" control={control} rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Tên dự án" fullWidth />} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="MoTa" control={control}
                render={({ field }) => <TextField {...field} label="Mô tả" fullWidth multiline rows={2} />} />
            </Grid>
            <Grid item xs={6}>
              <Controller name="NgayBD" control={control}
                render={({ field }) => <TextField {...field} label="Ngày bắt đầu" type="date" fullWidth InputLabelProps={{ shrink: true }} />} />
            </Grid>
            <Grid item xs={6}>
              <Controller name="NgayKT" control={control}
                render={({ field }) => <TextField {...field} label="Ngày kết thúc" type="date" fullWidth InputLabelProps={{ shrink: true }} />} />
            </Grid>
            <Grid item xs={6}>
              <Controller name="ChiPhiDuKien" control={control}
                render={({ field }) => <TextField {...field} label="Chi phí dự kiến" type="number" fullWidth />} />
            </Grid>
            <Grid item xs={6}>
              <Controller name="ChiPhiThucTe" control={control}
                render={({ field }) => <TextField {...field} label="Chi phí thực tế" type="number" fullWidth />} />
            </Grid>
            <Grid item xs={6}>
              <Controller name="DoanhThu" control={control}
                render={({ field }) => <TextField {...field} label="Doanh thu" type="number" fullWidth />} />
            </Grid>
            <Grid item xs={6}>
              <Controller name="TrangThai" control={control}
                render={({ field }) => (
                  <FormControl fullWidth><InputLabel>Trạng thái</InputLabel>
                    <Select {...field} label="Trạng thái">
                      {TRANG_THAI_DA.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
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

// ── Dialog chi tiết dự án (thành viên + tiến độ) ────────────────────────────
const ProjectDetail = ({ open, onClose, project, onUpdated }) => {
  const toast = useToast();
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState([]);
  const [members, setMembers] = useState([]);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const { control, handleSubmit, reset } = useForm({ defaultValues: { MaNV1: '', VaiTro: '', ThoiGianTG: '' } });

  const reloadNotes = (id) => getNotes(id).then((r) => setNotes(r.data.data ?? [])).catch(() => {});

  useEffect(() => {
    if (!open) return;
    // Chỉ lấy nhân viên Phòng Kỹ Thuật (PB002) cho dự án
    getEmployees({ limit: 200, MaPB: 'PB002', TrangThai: 'Đang làm việc' })
      .then((r) => setEmployees(r.data.data?.items ?? []))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (project) {
      setMembers(project.nhanViens ?? []);
      setProgress(project.TienDo ?? calcProgress(project));
      reloadNotes(project.MaDOAN);
    }
  }, [project]);

  const calcProgress = (da) => {
    if (!da?.NgayBD || !da?.NgayKT) return 0;
    const start = new Date(da.NgayBD), end = new Date(da.NgayKT), now = new Date();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const handleAssign = async (data) => {
    if (!data.MaNV1) return;
    try {
      // Kiểm tra NV có đang bận dự án nào không
      const checkRes = await checkMemberBusy(project.MaDOAN, data.MaNV1);
      const { busy, TenNV, duAnDangTham } = checkRes.data.data;

      if (busy) {
        const danhSach = duAnDangTham.map(da =>
          `<li style="text-align:left;margin-bottom:4px"><b>${da.TenDA}</b> - ${da.VaiTro} </br>(${new Date(da.NgayBD).toLocaleDateString('vi-VN')} → ${new Date(da.NgayKT).toLocaleDateString('vi-VN')})</li>`
        ).join('');

        const confirmed = await toast.confirm(
          `${TenNV} đang tham gia dự án khác`,
          `<ul style="padding-left:16px;margin:8px 0">${danhSach}</ul><div style="margin-top:10px"></br>Bạn vẫn muốn thêm vào dự án này không?</div>`,
          true
        );
        if (!confirmed.isConfirmed) return;
      }

      await assignMember(project.MaDOAN, { MaNV1: data.MaNV1, VaiTro: data.VaiTro, ThoiGianTG: data.ThoiGianTG });
      toast.success('Đã thêm thành viên');
      reset({ MaNV1: '', VaiTro: '', ThoiGianTG: '' });
      onUpdated();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const handleRemove = async (maNV1) => {
    const ok = await toast.confirm('Xóa thành viên khỏi dự án?', '');
    if (!ok.isConfirmed) return;
    try {
      await removeAssign(project.MaDOAN, maNV1);
      toast.success('Đã xóa');
      onUpdated();
    } catch { toast.error('Lỗi'); }
  };

  const handleProgressSave = async () => {
    try {
      await updateProject(project.MaDOAN, { TienDo: progress });
      toast.success('Cập nhật tiến độ thành công');
      onUpdated();
    } catch { toast.error('Lỗi cập nhật tiến độ'); }
  };

  const handleSendNote = async () => {
    if (!note.trim()) return;
    setSending(true);
    try {
      await addNote(project.MaDOAN, { NoiDung: note });
      setNote('');
      reloadNotes(project.MaDOAN);
    } catch { toast.error('Lỗi gửi ghi chú'); }
    finally { setSending(false); }
  };

  // Lọc nhân viên chưa có trong dự án
  const memberIds = members.map((m) => m.MaNV1);
  const available = employees.filter((e) => !memberIds.includes(e.MaNV1));

  if (!project) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { maxHeight: '90vh' } }}>
      <DialogTitle>
        <Typography fontWeight={700}>{project.TenDA}</Typography>
        <Typography variant="caption" color="text.secondary">{project.MaDOAN}</Typography>
      </DialogTitle>
      <DialogContent dividers>

        {/* Tiến độ */}
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
          Cập nhật tiến độ
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5, px: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Slider
              value={progress}
              onChange={(_, val) => setProgress(val)}
              min={0} max={100} step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
              sx={{ color: progress === 100 ? '#10b981' : '#6366f1' }}
            />
          </Box>
          <Typography variant="body1" fontWeight={700} sx={{ minWidth: 42, textAlign: 'right' }}>
            {progress}%
          </Typography>
        </Box>
        <Button size="small" variant="outlined" onClick={handleProgressSave} sx={{ mb: 2 }}>
          Lưu tiến độ
        </Button>

        <Divider sx={{ mb: 2 }} />

        {/* Thêm thành viên */}
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          <PersonAddIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
          Thêm thành viên
        </Typography>
        <form onSubmit={handleSubmit(handleAssign)}>
          <Grid container spacing={1.5} alignItems="flex-start">
            <Grid item xs={12} sm={5}>
              <Controller name="MaNV1" control={control} render={({ field }) => (
                <SearchableEmployeeSelect
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  employees={available}
                  size="small"
                />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="VaiTro" control={control} render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Vai trò</InputLabel>
                  <Select {...field} label="Vai trò">
                    {VAI_TRO.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </Select>
                </FormControl>
              )} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller name="ThoiGianTG" control={control} render={({ field }) => (
                <TextField {...field} size="small" fullWidth type="date" label="Ngày tham gia"
                  InputLabelProps={{ shrink: true }} />
              )} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" size="small" variant="contained" startIcon={<AddIcon />}>
                Thêm vào dự án
              </Button>
            </Grid>
          </Grid>
        </form>

        <Divider sx={{ my: 2 }} />

        {/* Danh sách thành viên */}
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          <PeopleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
          Thành viên ({members.length})
        </Typography>
        {members.length === 0 ? (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">Chưa có thành viên</Typography>
        ) : (
          <List disablePadding>
            {members.map((nv) => {
              const pc = nv.PhanCong ?? nv.phanCong ?? {};
              return (
              <ListItem key={nv.MaNV1} disablePadding
                sx={{ py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <ListItemAvatar sx={{ minWidth: 44 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: 12 }}>
                    {getInitials(nv.TenNV)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="body2" fontWeight={600}>{nv.TenNV}</Typography>}
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {pc.VaiTro ?? nv.PhanCong?.VaiTro ?? nv.phanCong?.VaiTro ?? '—'}
                      {(nv.PhanCong?.ThoiGianTG ?? nv.phanCong?.ThoiGianTG)
                        ? ` · Từ ${formatDate(nv.PhanCong?.ThoiGianTG ?? nv.phanCong?.ThoiGianTG)}`
                        : ''}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Xóa khỏi dự án">
                    <IconButton size="small" color="error" onClick={() => handleRemove(nv.MaNV1)}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
              );
            })}
          </List>
        )}
        {/* Ghi chú từ nhân viên */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
          📝 Lịch sử ghi chú
        </Typography>
        <Box sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5, mb: 1.5 }}>
          <ChatNotes notes={notes} currentName={user?.TenNV} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <TextField
            fullWidth multiline maxRows={4} rows={1} size="small"
            placeholder="Phản hồi ghi chú..."
            value={note} onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendNote(); } }}
          />
          <IconButton onClick={handleSendNote} disabled={!note.trim() || sending}
            sx={{ bgcolor: '#6366f1', color: '#fff', flexShrink: 0, '&:hover': { bgcolor: '#4f46e5' }, '&:disabled': { bgcolor: 'action.disabledBackground' } }}>
            {sending ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SendIcon fontSize="small" />}
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const Projects = () => {
  const toast = useToast();
  const [data, setData] = useState({ items: [], total: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProject, setDetailProject] = useState(null);
  const [nvChuaThamGia, setNvChuaThamGia] = useState([]);
  const [showNvRanh, setShowNvRanh] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await getProjects({ limit: 50, search: search || undefined, TrangThai: filterTrangThai || undefined });
      setData(res.data.data);
    } catch { }
  }, [search, filterTrangThai]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { getNvChuaThamGia().then((r) => setNvChuaThamGia(r.data.data || [])).catch(() => {}); }, []);

  // Refresh detail project sau khi update
  const handleUpdated = async () => {
    await fetchData();
    if (detailProject) {
      const res = await getProjects({ limit: 50, search: search || undefined, TrangThai: filterTrangThai || undefined });
      const updated = res.data.data.items?.find((p) => p.MaDOAN === detailProject.MaDOAN);
      if (updated) setDetailProject(updated);
    }
  };

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
    if (da.TienDo != null) return da.TienDo;
    if (!da.NgayBD || !da.NgayKT) return 0;
    const start = new Date(da.NgayBD), end = new Date(da.NgayKT), now = new Date();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const openDetail = (da) => { setDetailProject(da); setDetailOpen(true); };

  return (
    <Box>
      <PageHeader title="Quản lý dự án" subtitle={`${data.total} dự án`}
        action={<Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setEditItem(null); setDialogOpen(true); }}>Tạo dự án</Button>}
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Tìm tên dự án..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 240 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select value={filterTrangThai} label="Trạng thái" onChange={(e) => setFilterTrangThai(e.target.value)}>
            <MenuItem value="">Tất cả</MenuItem>
            {TRANG_THAI_DA.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {/* Panel NV Phòng KT chưa tham gia dự án */}
      <Card sx={{ mb: 3, borderLeft: '4px solid #f59e0b' }}>
        <CardContent sx={{ p: 2, pb: '12px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => setShowNvRanh((v) => !v)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
              <Typography fontWeight={700} variant="body1">
                Nhân viên Phòng Kỹ Thuật chưa tham gia dự án nào
              </Typography>
              <Chip label={nvChuaThamGia.length} size="small" sx={{ bgcolor: '#f59e0b', color: '#fff', fontWeight: 700 }} />
            </Box>
            {showNvRanh ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
          <Collapse in={showNvRanh}>
            <Divider sx={{ my: 1.5 }} />
            {nvChuaThamGia.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Tất cả nhân viên đã tham gia dự án</Typography>
            ) : (
              <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                {nvChuaThamGia.map((nv) => (
                  <Grid item xs={12} sm={6} md={4} key={nv.MaNV1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#6366f1', fontSize: 13, fontWeight: 700 }}>
                        {getInitials(nv.TenNV)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{nv.TenNV}</Typography>
                        <Typography variant="caption" color="text.secondary">{nv.chucVu?.TenCV || nv.MaNV1}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Collapse>
        </CardContent>
      </Card>

      {data.items.length === 0 ? <EmptyState message="Chưa có dự án nào" /> : (
        <Grid container spacing={3}>
          {data.items.map((da, i) => (
            <Grid item xs={12} md={6} lg={4} key={da.MaDOAN}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}
                  onClick={() => openDetail(da)}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <StatusChip status={da.TrangThai} />
                      <Box onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Sửa">
                          <IconButton size="small" onClick={() => { setEditItem(da); setDialogOpen(true); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={() => handleDelete(da.MaDOAN)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography variant="h6" fontWeight={700} gutterBottom>{da.TenDA}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>{da.MoTa}</Typography>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Tiến độ</Typography>
                        <Typography variant="caption" fontWeight={700}>{getProgress(da)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={getProgress(da)}
                        sx={{ borderRadius: 4, height: 6 }} />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Thời gian</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatDate(da.NgayBD)} → {formatDate(da.NgayKT)}
                        </Typography>
                      </Box>
                      <Chip icon={<PeopleIcon />} label={`${da.nhanViens?.length || 0} thành viên`}
                        size="small" variant="outlined" />
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

      <ProjectForm open={dialogOpen} onClose={() => setDialogOpen(false)}
        onSave={handleSave} initial={editItem} />

      <ProjectDetail open={detailOpen} onClose={() => setDetailOpen(false)}
        project={detailProject} onUpdated={handleUpdated} />
    </Box>
  );
};

export default Projects;
